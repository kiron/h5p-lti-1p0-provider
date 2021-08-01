const cacheManager = require("cache-manager");
const redisStore = require("cache-manager-redis-store");
const H5P = require("@lumieducation/h5p-server");
const dbImplementations = require("@lumieducation/h5p-mongos3");
const path = require("path");
const i18next = require("i18next");
const i18nextHttpMiddleware = require("i18next-http-middleware");
const i18nextFsBackend = require("i18next-fs-backend");

const Permission = H5P.Permission;

const learnerPermissions = [Permission.View];
const tutorPermissions = [
  Permission.Delete,
  Permission.Download,
  Permission.Edit,
  Permission.Embed,
  Permission.List,
  Permission.View,
];

const createH5PEditor = async (
  config,
  localLibraryPath,
  localContentPath,
  localTemporaryPath,
  translationCallback,
) => {
  let cache;
  if (process.env.CACHE === "in-memory") {
    cache = cacheManager.caching({
      store: "memory",
      ttl: 60 * 60 * 24,
      max: 2 ** 10,
    });
  } else if (process.env.CACHE === "redis") {
    cache = cacheManager.caching({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_AUTH_PASS,
      db: process.env.REDIS_DB,
      ttl: 60 * 60 * 24,
    });
  } else {
    // using no cache
  }

  let libraryStorage;
  if (process.env.LIBRARYSTORAGE === "mongo") {
    const mongoLibraryStorage = new dbImplementations.MongoLibraryStorage(
      (await dbImplementations.initMongo()).collection(process.env.LIBRARY_MONGO_COLLECTION),
    );
    await mongoLibraryStorage.createIndexes();
    libraryStorage = mongoLibraryStorage;
  } else if (process.env.LIBRARYSTORAGE === "mongos3") {
    const mongoS3LibraryStorage = new dbImplementations.MongoS3LibraryStorage(
      dbImplementations.initS3({
        s3ForcePathStyle: true,
        signatureVersion: "v4",
      }),
      (await dbImplementations.initMongo()).collection(process.env.LIBRARY_MONGO_COLLECTION),
      {
        s3Bucket: process.env.LIBRARY_AWS_S3_BUCKET,
        maxKeyLength: process.env.AWS_S3_MAX_FILE_LENGTH
          ? Number.parseInt(process.env.AWS_S3_MAX_FILE_LENGTH, 10)
          : undefined,
      },
    );
    await mongoS3LibraryStorage.createIndexes();
    libraryStorage = mongoS3LibraryStorage;
  } else {
    libraryStorage = new H5P.fsImplementations.FileLibraryStorage(localLibraryPath);
  }

  const h5pEditor = new H5P.H5PEditor(
    new H5P.cacheImplementations.CachedKeyValueStorage("kvcache", cache),
    config,
    process.env.CACHE
      ? new H5P.cacheImplementations.CachedLibraryStorage(libraryStorage, cache)
      : libraryStorage,
    process.env.CONTENTSTORAGE !== "mongos3"
      ? new H5P.fsImplementations.FileContentStorage(localContentPath)
      : new dbImplementations.MongoS3ContentStorage(
          dbImplementations.initS3({
            s3ForcePathStyle: true,
            signatureVersion: "v4",
          }),
          (await dbImplementations.initMongo()).collection(process.env.CONTENT_MONGO_COLLECTION),
          {
            s3Bucket: process.env.CONTENT_AWS_S3_BUCKET,
            maxKeyLength: process.env.AWS_S3_MAX_FILE_LENGTH
              ? Number.parseInt(process.env.AWS_S3_MAX_FILE_LENGTH, 10)
              : undefined,
            getPermissions: (contentId, user) => {
              if (user && user.isTutor) {
                return tutorPermissions;
              }
              return learnerPermissions;
            },
          },
        ),
    process.env.TEMPORARYSTORAGE === "s3"
      ? new dbImplementations.S3TemporaryFileStorage(
          dbImplementations.initS3({
            s3ForcePathStyle: true,
            signatureVersion: "v4",
          }),
          {
            s3Bucket: process.env.TEMPORARY_AWS_S3_BUCKET,
            maxKeyLength: process.env.AWS_S3_MAX_FILE_LENGTH
              ? Number.parseInt(process.env.AWS_S3_MAX_FILE_LENGTH, 10)
              : undefined,
          },
        )
      : new H5P.fsImplementations.DirectoryTemporaryFileStorage(localTemporaryPath),
    translationCallback,
    undefined,
    {
      enableHubLocalization: true,
      enableLibraryNameLocalization: true,
    },
  );
  // Set bucket lifecycle configuration for S3 temporary storage to make
  // sure temporary files expire.
  if (h5pEditor.temporaryStorage instanceof dbImplementations.S3TemporaryFileStorage) {
    await h5pEditor.temporaryStorage.setBucketLifecycleConfiguration(h5pEditor.config);
  }

  return h5pEditor;
};

exports.getH5PStuff = async () => {
  const translationFunction = await i18next
    .use(i18nextFsBackend)
    .use(i18nextHttpMiddleware.LanguageDetector)
    .init({
      backend: {
        loadPath: "../assets/translations/{{ns}}/{{lng}}.json",
      },
      debug: process.env.DEBUG && process.env.DEBUG.includes("i18n"),
      defaultNS: "server",
      fallbackLng: "en",
      ns: [
        "client",
        "copyright-semantics",
        "metadata-semantics",
        "mongo-s3-content-storage",
        "s3-temporary-storage",
        "server",
        "storage-file-implementations",
      ],
      preload: ["en", "de"],
    });

  const h5pConfig = await new H5P.H5PConfig(
    new H5P.fsImplementations.JsonStorage(path.resolve("h5p-config.json")),
    { maxFileSize: 200000000 },
  ).load();

  const h5pEditor = await createH5PEditor(
    h5pConfig,
    path.resolve("h5p/libraries"), // the path on the local disc where libraries should be stored)
    path.resolve("h5p/content"), // the path on the local disc where content is stored. Only used / necessary if you use the local filesystem content storage class.
    path.resolve("h5p/temporary-storage"), // the path on the local disc where temporary files (uploads) should be stored. Only used / necessary if you use the local filesystem temporary storage class.
    (key, language) => {
      return translationFunction(key, { lng: language });
    },
  );
  return { h5pConfig, h5pEditor };
};

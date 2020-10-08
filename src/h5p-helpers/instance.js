const H5P = require("h5p-nodejs-library");
const dbImplementations = require('h5p-nodejs-library/build/src/implementation/db').default;
const path = require("path");
const i18next = require("i18next");
const i18nextHttpMiddleware = require("i18next-http-middleware");
const i18nextFsBackend = require("i18next-fs-backend");

const createH5PEditor = async (
  config,
  localLibraryPath,
  localContentPath,
  localTemporaryPath,
  translationCallback
) => {
  const h5pEditor = new H5P.H5PEditor(
    new H5P.fsImplementations.InMemoryStorage(),
    config,
    new H5P.fsImplementations.FileLibraryStorage(localLibraryPath),
    process.env.CONTENTSTORAGE !== "mongos3"
      ? new H5P.fsImplementations.FileContentStorage(localContentPath)
      : new dbImplementations.MongoS3ContentStorage(
          dbImplementations.initS3({
            s3ForcePathStyle: true,
            signatureVersion: "v4",
          }),
          (await dbImplementations.initMongo()).collection(
            process.env.CONTENT_MONGO_COLLECTION
          ),
          {
            s3Bucket: process.env.CONTENT_AWS_S3_BUCKET,
            maxKeyLength: process.env.AWS_S3_MAX_FILE_LENGTH
              ? Number.parseInt(process.env.AWS_S3_MAX_FILE_LENGTH, 10)
              : undefined,
          }
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
          }
        )
      : new H5P.fsImplementations.DirectoryTemporaryFileStorage(
          localTemporaryPath
        ),
    translationCallback
  );
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
    { maxFileSize: 200000000 }
  ).load();

  const h5pEditor = await createH5PEditor(
    h5pConfig,
    path.resolve("h5p/libraries"), // the path on the local disc where libraries should be stored)
    path.resolve("h5p/content"), // the path on the local disc where content is stored. Only used / necessary if you use the local filesystem content storage class.
    path.resolve("h5p/temporary-storage"), // the path on the local disc where temporary files (uploads) should be stored. Only used / necessary if you use the local filesystem temporary storage class.
    (key, language) => {
      return translationFunction(key, { lng: language });
    }
  );
  return { h5pConfig, h5pEditor };
};

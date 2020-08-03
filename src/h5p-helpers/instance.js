const H5P = require("h5p-nodejs-library");
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
    new H5P.fsImplementations.FileContentStorage(localContentPath),
    new H5P.fsImplementations.DirectoryTemporaryFileStorage(localTemporaryPath),
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
        loadPath: "../assets/translations/{{ns}}/{{lng}}.json"
      },
      debug: process.env.DEBUG && process.env.DEBUG.includes("i18n"),
      defaultNS: "server",
      fallbackLng: "en",
      ns: [
        "client",
        "copyright-semantics",
        "metadata-semantics",
        "server",
        "storage-file-implementations"
      ],
      preload: ["en", "de"]
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

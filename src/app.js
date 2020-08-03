// H5P LTIv1p0 Provider Application - Kiron 2020

require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const H5P = require("h5p-nodejs-library");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const i18next = require("i18next");
const i18nextHttpMiddleware = require("i18next-http-middleware");

const router = require("./routes");
const redisInstance = require("./redis");
const h5pInstance = require("./h5p-helpers/instance");
const h5pRender = require("./h5p-helpers/render");
const streaming = require("./streaming/middleware");

//initialize our app
const app = express();

// use helmet to disable caching, sniffing, X-Powered-By, and a bunch of other stuff
app.use(helmet());

// Use pug for templates
app.set("view engine", "pug");

// parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("json spaces", 2);
app.enable("trust proxy");

// set max file size
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: false }));

const redisStore = redisInstance.getRedisSessionStore();
// Initialized session info
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET || "development",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true, sameSite: "none" }
  })
);

// allow so that the server can access /.well-known
app.use(express.static(__dirname, [".well-known", "assets"]));

// Set up all our h5p things...
h5pInstance.getH5PStuff().then(({ h5pConfig, h5pEditor }) => {
  const h5pPlayer = new H5P.H5PPlayer(
    h5pEditor.libraryStorage,
    h5pEditor.contentStorage,
    h5pConfig,
    null,
    ["/assets/js/xapi-send.js"]
  );
  app.use(
    fileUpload({
      limits: { fileSize: h5pEditor.config.maxFileSize }
    })
  );

  app.use(i18nextHttpMiddleware.handle(i18next));

  // The Express adapter handles GET and POST requests to various H5P
  // endpoints. You can add an options object as a last parameter to configure
  // which endpoints you want to use. In this case we don't pass an options
  // object, which means we get all of them.
  app.use(
    h5pEditor.config.baseUrl,
    H5P.adapters.express(
      h5pEditor,
      path.resolve("h5p/core"),
      path.resolve("h5p/editor"),
      undefined,
      "auto"
    )
  );

  // The expressRoutes are routes that create pages for these actions:
  app.use(
    h5pEditor.config.baseUrl,
    router.h5pRoutes(h5pEditor, h5pPlayer, "auto")
  );

  app.get("/h5p", h5pRender.render(h5pEditor));
});

// handle videos differentlly...
app.use((req, res, next) => {
  if (req.path.match("/h5p/content/.*/videos/.*")) {
    return streaming(req, res);
  }
  next();
});

module.exports = app;

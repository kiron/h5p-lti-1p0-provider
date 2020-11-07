const https = require("https");
const fs = require("fs");
const app = require("./app");
const router = require("./routes");

const matchesDisallowedStudentPaths = path => {
  return (
    path.match("/h5p/edit/.*") ||
    path.match("/h5p/delete/.*") ||
    path === "/adminstart" ||
    path === "/adminstart/" ||
    path === "/h5p/new" ||
    path === "/h5p/new/" ||
    path === "/h5p" ||
    path === "/h5p/" ||
    path === "/"
  );
};

// regular & lti routes
app.use("/", router.routes());
// api routes
app.use("/api/", router.apiroutes());

// Set user permissions for H5P
app.use((req, res, next) => {
  if (req.session.userId || process.env.NODE_ENV === "development") {
    req.user = {
      id: process.env.NODE_ENV === "development" ? 1 : req.session.userId,
      name: "No name required",
      canInstallRecommended:
        process.env.NODE_ENV === "development" ? true : req.session.isTutor,
      canUpdateAndInstallLibraries:
        process.env.NODE_ENV === "development" ? true : req.session.isTutor,
      canCreateRestricted:
        process.env.NODE_ENV === "development" ? true : req.session.isTutor,
      type: "internet"
    };

    // If they aren't a tutor but they are logged in,
    // just keep sending them back to the same exercise...
    if (
      req.session.exercise &&
      !req.session.isTutor &&
      matchesDisallowedStudentPaths(req.path)
    ) {
      return res.redirect(`/h5p/play/${req.session.exercise}`);
    }
  } else {
    return res.redirect("/application");
  }
  next();
});

if (process.env.NODE_ENV === "development") {
  // Start the app
  const port = process.env.PORT || 3003;
  app.listen(port, () => console.log(`App listening on port ${port}!`));
} else {
  // Certificate
  const privateKey = fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`,
    "utf8"
  );
  const certificate = fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/cert.pem`,
    "utf8"
  );
  const ca = fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/chain.pem`,
    "utf8"
  );

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
  const httpsServer = https.createServer(credentials, app);

  httpsServer.setTimeout(5 * 60 * 1000);
  httpsServer.keepAliveTimeout = 5 * 60 * 1000;
  httpsServer.headersTimeout = 5 * 61 * 1000;
  httpsServer.listen(443, () => {
    console.log("HTTPS Server running on port 443");
  });
}

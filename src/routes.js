const express = require("express");
const { ltiProvider, ltiApi } = require("./lti");
const player = require("./renderers/player");
const editor = require("./renderers/editor");

exports.routes = () => {
  const router = express.Router();

  // Basic up page
  router.get("/", async (req, res) => {
    return res.json({ status: "Up" });
  });

  // Application page that shows the shizz
  router.get("/application", async (req, res) => {
    if (req.session.userId) {
      return res.render("index", {
        email: req.session.email,
        username: req.session.username,
        ltiConsumer: req.session.ltiConsumer,
        userId: req.session.userId,
        isTutor: req.session.isTutor,
        context_id: req.session.context_id
      });
    } else {
      const error =
        "Session invalid. Please login via LTI to use this application.";
      console.log(error);
      res.status(403).send(error);
      return;
    }
  });

  // Route for launching LTI authentication and creating the provider instance
  router.post("/launch_lti", ltiProvider.launch);
  return router;
};

exports.h5pRoutes = (h5pEditor, h5pPlayer, languageOverride) => {
  const router = express.Router();

  router.get(`${h5pEditor.config.playUrl}/:contentId`, async (req, res) => {
    try {
      const h5pPage = await h5pPlayer
        .setRenderer(player.model(req.session))
        .render(req.params.contentId);
      res.send(h5pPage);
      res.status(200).end();
    } catch (error) {
      res.status(500).end(error.message);
    }
  });

  router.get("/edit/:contentId", async (req, res) => {
    const metadata = await h5pEditor.contentManager.getContentMetadata(
      req.params.contentId,
      req.user
    );
    if (metadata.lti_context_id !== req.session.context_id) {
      res.send(
        `Sorry! You don't have permission to edit this content<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
      );
      res.status(500).end();
      return;
    }
    const page = await h5pEditor
      .setRenderer(editor.model)
      .render(
        req.params.contentId,
        languageOverride === "auto" ? req.language ?? "en" : languageOverride
      );
    res.send(page);
    res.status(200).end();
  });

  router.post("/edit/:contentId", async (req, res) => {
    // add a unique identifier for the course to the h5p.json
    const metadata = req.body.params.metadata;
    if (req.session.context_id) {
      metadata.lti_context_id = req.session.context_id;
    }
    const contentId = await h5pEditor.saveOrUpdateContent(
      req.params.contentId.toString(),
      req.body.params.params,
      metadata,
      req.body.library,
      req.user
    );

    res.send(JSON.stringify({ contentId }));
    res.status(200).end();
  });

  router.get("/new", async (req, res) => {
    const page = await h5pEditor
      .setRenderer(editor.model)
      .render(
        undefined,
        languageOverride === "auto" ? req.language ?? "en" : languageOverride
      );
    res.send(page);
    res.status(200).end();
  });

  router.post("/new", async (req, res) => {
    if (
      !req.body.params ||
      !req.body.params.params ||
      !req.body.params.metadata ||
      !req.body.library ||
      !req.user
    ) {
      res.status(400).send("Malformed request").end();
      return;
    }

    // add a unique identifier for the course to the h5p.json
    const metadata = req.body.params.metadata;
    if (req.session.context_id) {
      metadata.lti_context_id = req.session.context_id;
    }

    const contentId = await h5pEditor.saveOrUpdateContent(
      undefined,
      req.body.params.params,
      metadata,
      req.body.library,
      req.user
    );

    res.send(JSON.stringify({ contentId }));
    res.status(200).end();
  });

  router.get("/delete/:contentId", async (req, res) => {
    try {
      const metadata = await h5pEditor.contentManager.getContentMetadata(
        req.params.contentId,
        req.user
      );
      if (metadata.lti_context_id !== req.session.context_id) {
        res.send(
          `Sorry! You don't have permission to delete this content<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
        );
        res.status(500).end();
        return;
      }
      await h5pEditor.deleteContent(req.params.contentId, req.user);
    } catch (error) {
      res.send(
        `Error deleting content with id ${req.params.contentId}: ${error.message}<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
      );
      res.status(500).end();
      return;
    }

    res.send(
      `Content ${req.params.contentId} successfully deleted.<br/><a href="javascript:window.location=document.referrer">Go Back</a>`
    );
    res.status(200).end();
  });

  return router;
};

// everything under /api/* goes here
exports.apiroutes = () => {
  const router = express.Router();
  // api route for sending outcomes back to LTI Consumer
  router.get("/outcome", ltiApi.sendOutcome);
  return router;
};

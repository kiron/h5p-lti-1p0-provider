// LTI Provider Initialisation
const lti = require("ims-lti");
const providers = require("./get-providers");
const redisInstance = require("../redis");

exports.launch = async (req, res) => {
  // Grab consumer key from request and oauth secret from envvars and use them to create a new LTI Provider instance
  const consumerKey = req.body.oauth_consumer_key;

  if (!consumerKey || consumerKey !== process.env.OAUTH_CONSUMER_KEY) {
    const error = `Invalid consumer key`;
    console.log(error);
    res.status(403).send(error);
    return;
  }

  const secret = process.env.OAUTH_SECRET;
  if (!secret) {
    const error = `Missing OAUTH_SECRET in env variables`;
    console.log(error);
    res.status(403).send(error);
    return;
  }

  const provider = new lti.Provider(
    consumerKey,
    secret,
    redisInstance.getRedisNonceStore(lti.Stores.RedisStore),
    lti.HMAC_SHA1
  );

  // Now initialise the provider by validating the request
  provider.valid_request(req, (err, isValid) => {
    if (err) {
      const error = `Something went wrong: ${err}`;
      console.log(error);
      res.status(403).send(error);
      return;
    }
    if (isValid) {
      req.session.regenerate(err => {
        if (err) {
          const error = `Something went wrong: ${err}`;
          console.log(error);
          res.status(403).send(error);
          return;
        }
        // Same some LTI Provider variables to the session
        req.session.userId = provider.userId;
        req.session.context_id = provider.context_id;
        req.session.context_title = provider.context_title;
        req.session.resource_link_title = req.body.resource_link_title;
        req.session.exercise = req.body.custom_exercise;
        req.session.language = req.body.custom_language || "en";
        req.session.isTutor =
          provider.instructor === true ||
          provider.admin === true ||
          provider.manager === true ||
          provider.ta === true;
        req.session.custom_message = req.body.custom_message;
        req.session.custom_consumer = req.body.custom_consumer;
        req.session.has_outcome_service = !!provider.outcome_service;
        req.session.has_ext_content = !!provider.ext_content;
        req.session.custom_style_url = req.body.custom_style_url;
        // store provider in an object, we'll need it later for sending outcomes back to the consumer
        providers[req.session.id] = provider;
        // redirect
        if (req.body.custom_exercise) {
          return res.redirect(`/h5p/play/${req.body.custom_exercise}`);
        }
        if (req.session.isTutor && !req.body.custom_exercise) {
          return res.redirect("/adminstart");
        }
        return res.redirect("/application");
      });
    } else {
      const error = `Invalid request`;
      console.log(error);
      res.status(403).send(error);
      return;
    }
  });
};

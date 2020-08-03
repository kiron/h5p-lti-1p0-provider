// API functions for LTI
const providers = require("./get-providers");

// Send outcomes function
// Takes a score from the query params (e.g. "?score=0.5")
// Sends it back to the LTI Consumer
// Returns json {"success": boolean, "error": string, "result": boolean, "score": float}
// The LTI Consumer is probably expecting a floating point number between 0 and 1.
exports.sendOutcome = async (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, error: "Invalid session" });
  }
  const provider = providers[req.session.id];
  if (!provider) {
    return res.json({
      success: false,
      error: "Provider not found"
    });
  }
  const score = parseFloat(req.query.score) || 0;
  if (provider.outcome_service) {
    provider.outcome_service.send_replace_result(score, (err, result) => {
      if (err) {
        return res.json({ success: false, error: err });
      } else {
        return res.json({ success: true, result, score });
      }
    });
  } else {
    return res.json({
      success: false,
      error: "No outcome service available for this provider"
    });
  }
};

// If the Consumer has the ext_content extension, we can add an api to use it here
// But we don't need it for current purposes so this is left unimplemented.
// example:
exports.send_file = () => {
  // Not implemented
};

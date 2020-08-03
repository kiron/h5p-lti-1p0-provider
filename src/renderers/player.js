const session = require("express-session");

exports.model = session => model => `<!doctype html>
<html class="h5p-iframe">
<head>
    <meta charset="utf-8">
    ${model.styles
      .map(style => `<link rel="stylesheet" href="${style}"/>`)
      .join("\n    ")}
    ${model.scripts
      .map(script => `<script src="${script}"></script>`)
      .join("\n    ")}
    <script>
        H5PIntegration = ${JSON.stringify(model.integration, null, 2)};
    </script>
    <title>${
      session.resource_link_title || session.context_title || "H5P Exercise"
    }</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${model.customScripts}
    ${
      session.custom_style_url
        ? `<link rel="stylesheet" href="${session.custom_style_url}" />`
        : ""
    }
</head>
<body>
    <div class="kiron-h5p-container" style="max-width:900px; margin:0 auto; padding:40px 10px; position:relative;">
      <div class="h5p-content" data-content-id="${model.contentId}"></div>
      ${
        session.custom_message
          ? `<div class='h5p-confirmation-dialog-body' style='margin:20px auto;'>${session.custom_message}</div>`
          : ""
      }
      ${
        session.isTutor
          ? `<div class='h5p-confirmation-dialog-body' style='margin:20px auto;'>
          <p>You are seeing this message because you are logged in as an instructor</p>
          ${
            session.custom_consumer == "HPI" &&
            `<p>To embed insert this into your
          KI Campus course, edit the "Additional parameters for this exercise" to contain this:</p>
          <code>exercise=${model.contentId}</code>`
          }
          <p><a href="/h5p/edit/${
            model.contentId
          }">Edit</a> | <a href="/h5p/">Create new H5P</a></p>
          </div>`
          : ""
      }
    </div>
</body>
</html>`;

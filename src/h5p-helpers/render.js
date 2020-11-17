exports.render = editor => {
  return async (req, res) => {
    const contentIds = await editor.contentManager.listContent();
    const contentObjects = await Promise.all(
      contentIds.map(async id => ({
        content: await editor.contentManager.getContentMetadata(id, req.user),
        id
      }))
    );
    const filteredContentObjects = contentObjects.filter(
      content => content.content.lti_context_id === req.session.context_id
    );
    res.send(`
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css" crossorigin="anonymous">
            <title>Course H5P Library</title>
        </head>
        <body>
            <div class="container" style="margin-top:60px;">
                <h1>Course H5P Library</h1>
                ${
                  req.session.context_title
                    ? `<div class="alert alert-warning">
                      Content shown only for the course: 
                      ${req.session.context_title}
                    </div>`
                    : ""
                }
                <a class="btn btn-primary my-2" href="${
                  editor.config.baseUrl
                }/new" target="_blank"><span class="fa fa-plus-circle m-2"></span>Create new content</a>
                ${
                  filteredContentObjects.length == 0
                    ? "<h4 style='margin:30px 0'>There's no H5P content for this course yet</h4>"
                    : "<h2 style='margin: 30px 0'>Existing content</h2>"
                }
                <div class="list-group">
                ${filteredContentObjects
                  .map(
                    content =>
                      `<div class="list-group-item">
                                <div class="d-flex w-10">
                                    <div class="mr-auto p-2 align-self-center">
                                        <a href="${editor.config.baseUrl}${editor.config.playUrl}/${content.id}">
                                            <h5>${content.content.title || "Untitled"}</h5>
                                        </a>
                                        <div class="small d-flex">                                            
                                            <div class="mr-2">
                                                <span class="fa fa-book-open"></span>
                                                ${content.content.mainLibrary}
                                            </div>
                                            <div class="mr-2">
                                                <span class="fa fa-fingerprint"></span>
                                                ${content.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-2">                                        
                                        <a class="btn btn-secondary" href="${editor.config.baseUrl}/edit/${content.id}" target="_blank">
                                            <span class="fa fa-pencil-alt m-1"></span>
                                            edit
                                        </a>
                                    </div>
                                    <div class="p-2">
                                        <a class="btn btn-info" href="${editor.config.baseUrl}${editor.config.downloadUrl}/${content.id}">
                                            <span class="fa fa-file-download m-1"></span>
                                            download
                                        </a>
                                    </div>
                                    <div class="p-2">
                                        <a class="btn btn-danger" href="${editor.config.baseUrl}/delete/${content.id}">
                                            <span class="fa fa-trash-alt m-1"></span>
                                            delete
                                        </a>
                                    </div>
                                </div>                                
                            </div>`
                  )
                  .join("")}
                </div>
            </div>
        </body>
        `);
  };
};

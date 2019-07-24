const path = require("path");

exports.handler = (event, _, callback) => {
  const { request } = event.Records[0].cf;

  if (!path.extname(request.uri)) {
    request.uri = "/index.html";
  }

  callback(null, request);
};

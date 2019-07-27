const path = require("path");
const https = require("https");

const keepAliveAgent = new https.Agent({ keepAlive: true });
const ssrServiceUrl =
  process.env.SSR_SERVICE_URL || "https://render-tron.appspot.com/render/";

exports.handler = async (event, _, callback) => {
  const { request } = event.Records[0].cf;

  if (needSSR(request)) {
    const response = await ssrResponse(getRenderUrl(request));
    callback(null, response);
  }

  if (!path.extname(request.uri)) {
    request.uri = "/index.html";
  }
  callback(null, request);
};

const needSSR = request => request.headers["user-agent"][0]["value"] === "SSR";

const getRenderUrl = request => {
  const host = request.headers["x-forwarded-host"][0].value;
  const url = `https://${host}${request.uri}`;
  return `${ssrServiceUrl}${encodeURIComponent(url)}`;
};

const ssrResponse = url => {
  return new Promise((resolve, reject) => {
    const options = {
      agent: keepAliveAgent,
      headers: {
        "Content-Type": "application/html"
      }
    };
    https
      .get(url, options, response => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", chunk => (body += chunk));
        response.on("end", () => {
          resolve({
            status: "200",
            statusDescription: "OK",
            body
          });
        });
      })
      .on("error", reject);
  });
};

exports.handler = (event, _, callback) => {
  const { response } = event.Records[0].cf;

  if (response.status === "200") {
    response.headers["cache-control"] = [
      {
        key: "Cache-Control",
        value: "public,max-age=86400,s-maxage=86400"
      }
    ];
  }

  callback(null, response);
};

const path = require("path");

const botUserAgents = [
  "Baiduspider",
  "bingbot",
  "Embedly",
  "facebookexternalhit",
  "LinkedInBot",
  "outbrain",
  "pinterest",
  "quora link preview",
  "rogerbot",
  "showyoubot",
  "Slackbot",
  "TelegramBot",
  "Twitterbot",
  "vkShare",
  "W3C_Validator",
  "WhatsApp"
];

exports.handler = (event, _, callback) => {
  const { request } = event.Records[0].cf;

  const botUserAgentPattern = new RegExp(botUserAgents.join("|"), "i");
  const userAgent = request.headers["user-agent"][0]["value"];
  const originUserAgent =
    botUserAgentPattern.test(userAgent) && !path.extname(request.uri)
      ? "SSR"
      : "CloudFront";

  request.headers["user-agent"][0]["value"] = originUserAgent;
  request.headers["x-forwarded-host"] = [
    { key: "X-Forwarded-Host", value: request.headers.host[0].value }
  ];

  callback(null, request);
};

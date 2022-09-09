"use strict";

import staticFiles from "./static.js";

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;

  let uri = request.uri;
  if (!uri.includes(".") && uri.slice(-1) !== "/") {
    uri += "/";
  }
  if (uri.slice(-1) === "/") {
    uri += "index.html";
  }
  if (static_default.includes(uri)) {
    request.uri = uri;
  } else {
    const domainName = request.origin.s3.customHeaders["lambda-domain"][0].value;
    request.headers["host"] = [{ key: "Host", value: domainName }];
    request.origin.custom = {
      domainName: domainName,
      keepaliveTimeout: 5,
      path: "",
      port: 443,
      protocol: "https",
      readTimeout: 30,
      sslProtocols: ["TLSv1", "SSLv3"],
    };

    // Cleanup request origin to only have custom configuration
    delete request.origin.s3;
  }

  callback(null, request);
};

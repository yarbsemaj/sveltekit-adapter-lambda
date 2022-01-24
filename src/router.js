'use strict';

import staticFiles from './static.js'

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;

  //Only senf GET request to S3
  if (request.method !== 'GET') {
    callback(null, request);
    return;
  }

  //For request without a file extention, we should look for index.html
  let uri = request.uri;
  if (!uri.includes(".") && uri.slice(-1) !== "/") {
    uri += "/";
  }
  if (uri.slice(-1) === "/") {
    uri += "index.html";
  }

  //If our path matches a static file, perfrom an origin re-write to S3;
  if (staticFiles.includes(uri)) {
    request.uri = uri;
    //Lambda@edge does not support ENV vars, so instead we have to pass in a customHeaders.
    const domainName = request.origin.custom.customHeaders["s3-host"][0].value;
    request.origin.custom.domainName = domainName;
    request.origin.custom.path = "";
    request.headers["host"] = [{ key: "host", value: domainName }];
  }
  callback(null, request);
};
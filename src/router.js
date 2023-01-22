'use strict';

import staticFiles from './static.js'

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;

  //Only send GET request to S3
  if (request.method !== 'GET') {
    callback(null, request);
    return;
  }

  let uri = request.uri;
  //If our path matches a static file, perfrom an origin re-write to S3;
  if (staticFiles.includes(uri)) {
    callback(null, performReWrite(uri, request));
    return;
  }

  //Remove the leading slash (if any) to normalise the path
  if (uri.slice(-1) === "/") {
    uri = uri.substring(0, uri.length - 1);
  }

  //Pre-rendered pages could be named `/index.html` or `route/name.html` lets try looking for those as well
  if (staticFiles.includes(uri + '/index.html')) {
    callback(null, performReWrite(uri + '/index.html', request));
    return;
  }
  if (staticFiles.includes(uri + '.html')) {
    callback(null, performReWrite(uri + '.html', request));
    return;
  }

  callback(null, request);
};

function performReWrite(uri, request) {
  request.uri = uri;
  //Lambda@edge does not support ENV vars, so instead we have to pass in a customHeaders.
  const domainName = request.origin.custom.customHeaders["s3-host"][0].value;
  request.origin.custom.domainName = domainName;
  request.origin.custom.path = "";
  request.headers["host"] = [{ key: "host", value: domainName }];
  return request;
}
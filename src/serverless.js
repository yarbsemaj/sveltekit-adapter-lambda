import { URLSearchParams } from 'url';
import * as app from '../app.js';

app.init();

export async function handler(event) {
  const { path, headers, rawQuery, body, isBase64Encoded } = event;

  const encoding = isBase64Encoded ? 'base64' : headers['content-encoding'] || 'utf-8';
  const rawBody = typeof body === 'string' ? Buffer.from(body, encoding) : body;

  const query = new URLSearchParams(rawQuery);

  const rendered = await app.render({
    host: event.requestContext.domainName,
    method: event.httpMethod,
    rawBody,
    headers,
    query,
    path,
  })

  if (rendered) {
    const resp = {
      headers: {},
      multiValueHeaders: {},
      body: rendered.body,
      statusCode: rendered.status
    }
    Object.keys(rendered.headers).forEach(k => {
      const v = rendered.headers[k]
      if (v instanceof Array) {
        resp.multiValueHeaders[k] = v
      } else {
        resp.headers[k] = v
      }
    })
    return resp
  }
  return {
    statusCode: 404,
    body: 'Not found.'
  }
}

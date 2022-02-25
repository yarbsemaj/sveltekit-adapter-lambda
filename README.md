# adapter-lambda for SvelteKit

An adapter to build a [SvelteKit](https://kit.svelte.dev/) app into a lambda ready for deployment with lambda proxy via the Serverless framework.

## Installation
```
npm install --save-dev @yarbsemaj/adapter-lambda
```
## Usage

In your `svelte.config.js` configure the adapter as bellow;

```js
import preprocess from 'svelte-preprocess'; //Optional
import serverless from '@yarbsemaj/adapter-lambda';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(), //Optional

  kit: {
    adapter: serverless(),
  },

};

export default config;
```
Copy `serverless.yml` from the root of this repo to the root of your project

After building your app run `sls deploy` to deploy code to AWS using the build tool [serverless](https://www.serverless.com/).

Your app can then be accessed via the CloudFront distribution created as a part of the stack.

## Static Assets and precompiled pages
To server static assets and precompiled pages this adapter makes use of S3. In order to route traffic the correct destination a Lambda@edge fuction is used to perfrom a origin rewrite to redirect traffic to the S3 Bucket.

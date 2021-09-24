# adapter-lambda for SvelteKit

An adapter to build a [SvelteKit](https://kit.svelte.dev/) app into a lambda ready for deployment with lambda proxy.
```
npm install --save-dev @yarbsemaj/adapter-lambda
```

## Usage

In your `svelte.config.cjs` configure the adapter as bellow;

```js
import preprocess from 'svelte-preprocess';
import serverless from '@yarbsemaj/adapter-lambda';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),

  kit: {
    target: '#svelte',
    adapter: serverless(),
  },

};
```
## A note on static assets
Precompiled pages, client and static resources should be served independently of your dynamic content. One solution to this could be to upload the `build/assets/` directory to S3 and using its static site hosting functionality. Then, by using a CDN like CloudFront, requests could be routed to the correct origin.
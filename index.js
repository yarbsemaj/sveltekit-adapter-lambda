const { copyFileSync, unlinkSync} = require('fs');
const { join } = require('path');

const esbuild = require('esbuild');

/**
 * @param {{
 *   out?: string;
 * }} options
 */
module.exports = function ({ out = 'build' } = {}) {
  /** @type {import('@sveltejs/kit').Adapter} */
  const adapter = {
    name: 'adapter-serverless',

    async adapt(builder) {

      const static_directory = join(out, 'assets');
      const server_directory = join(out, 'server');

      builder.utils.log.minor('Copying assets');
      builder.utils.copy_client_files(static_directory);
      builder.utils.copy_static_files(static_directory);


      builder.utils.log.minor('Copying server');
      builder.utils.copy_server_files(out);
      copyFileSync(`${__dirname}/files/serverless.js`, `${server_directory}/_serverless.js`);
      copyFileSync(`${__dirname}/files/shims.js`, `${server_directory}/shims.js`);


      builder.utils.log.minor('Building lambda');
      esbuild.buildSync({
        entryPoints: [`${server_directory}/_serverless.js`],
        outfile: `${server_directory}/serverless.js`,
        inject: [join(`${server_directory}/shims.js`)],
        format: 'cjs',
        bundle: true,
        platform: 'node',
      });

      builder.utils.log.minor('Prerendering static pages');
      await builder.utils.prerender({
        dest: `${static_directory}`,
      });

      builder.utils.log.minor('Cleanup');
      unlinkSync(`${server_directory}/_serverless.js`);
      unlinkSync(`${out}/app.js`);
    },
  };

  return adapter;
};

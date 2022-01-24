const { copyFileSync, unlinkSync, existsSync, mkdirSync, statSync, readdirSync, writeFileSync } = require('fs');
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
      if (!existsSync(static_directory)) {
        mkdirSync(static_directory, { recursive: true });
      }
      const server_directory = join(out, 'server');
      if (!existsSync(server_directory)) {
        mkdirSync(server_directory, { recursive: true });
      }

      const edge_directory = join(out, 'edge');
      if (!existsSync(edge_directory)) {
        mkdirSync(edge_directory, { recursive: true });
      }

      builder.log.minor('Copying assets');
      builder.writeClient(static_directory);
      builder.writeStatic(static_directory);


      builder.log.minor('Copying server');
      builder.writeServer(out);
      copyFileSync(`${__dirname}/files/serverless.js`, `${server_directory}/_serverless.js`);
      copyFileSync(`${__dirname}/files/shims.js`, `${server_directory}/shims.js`);


      builder.log.minor('Building lambda');
      esbuild.buildSync({
        entryPoints: [`${server_directory}/_serverless.js`],
        outfile: `${server_directory}/serverless.js`,
        inject: [join(`${server_directory}/shims.js`)],
        external: ['node:*'],
        format: 'cjs',
        bundle: true,
        platform: 'node',
      });

      builder.log.minor('Prerendering static pages');
      await builder.prerender({
        dest: `${static_directory}`,
      });

      console.log('Building router');
      copyFileSync(`${__dirname}/files/router.js`, `${edge_directory}/_router.js`);
      writeFileSync(`${edge_directory}/static.js`, `export default ${JSON.stringify(getAllFiles(static_directory))}`)

      esbuild.buildSync({
        entryPoints: [`${edge_directory}/_router.js`],
        outfile: `${edge_directory}/router.js`,
        format: 'cjs',
        bundle: true,
        platform: 'node',
      });


      builder.log.minor('Cleanup');
      unlinkSync(`${server_directory}/_serverless.js`);
      unlinkSync(`${edge_directory}/_router.js`);
      unlinkSync(`${out}/app.js`);
    },
  };

  return adapter;
};

const getAllFiles = function (dirPath, basePath, arrayOfFiles) {
  files = readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []
  basePath = basePath || dirPath

  files.forEach(function (file) {
    if (statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, basePath, arrayOfFiles)
    } else {
      arrayOfFiles.push(join("/", dirPath.replace(basePath, ''), "/", file))
    }
  })

  return arrayOfFiles
}

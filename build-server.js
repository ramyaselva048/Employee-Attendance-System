import * as esbuild from 'esbuild';

async function buildServer() {
  try {
    await esbuild.build({
      entryPoints: ['server.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'server.js',
      packages: 'external',
    });
    console.log('Server bundle successfully created: server.js');
  } catch (err) {
    console.error('Failed to build server:', err);
    process.exit(1);
  }
}

buildServer();

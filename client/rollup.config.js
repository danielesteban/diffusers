import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import dotenv from 'dotenv';
import html from '@rollup/plugin-html';
import livereload from 'rollup-plugin-livereload';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { compilerOptions: { paths: aliases } } = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json')));
const codeServer = !!process.env.CODE_SERVER;
const production = !process.env.ROLLUP_WATCH;
const outputPath = path.resolve(__dirname, 'dist');

const basename = process.env.CLIENT_BASENAME || (codeServer ? '/proxy/8080/' : '/');
const server = process.env.SERVER_URL || 'http://localhost:8081/';

export default {
  input: path.join(__dirname, 'src', 'main.ts'),
  output: {
    dir: outputPath,
    entryFileNames: `[name]${production ? '-[hash]' : ''}.js`,
    format: 'iife',
    sourcemap: !production,
  },
  plugins: [
    alias({
      entries: Object.keys(aliases).map((alias) => {
        const find = path.dirname(alias);
        return { find, replacement: path.join(__dirname, 'src', find) };
      }),
    }),
    commonjs(),
    nodeResolve({ extensions: ['.js', '.ts'] }),
    svelte({ preprocess: sveltePreprocess({ sourceMap: !production }) }),
    typescript({ sourceMap: !production, inlineSources: !production }),
    postcss({ extract: true, minimize: production }),
    replace({
      preventAssignment: false,
      __BASENAME__: JSON.stringify(basename),
      __SERVER__: JSON.stringify(server),
    }),
    html({
      template: ({ files }) => (
        fs.readFileSync(path.join(__dirname, 'src', 'index.html'), 'utf8')
          .replace(
            '<link rel="stylesheet">',
            (files.css || [])
              .map(({ fileName }) => `<link rel="stylesheet" href="${basename}${fileName}">`)
          )
          .replace(
            '<script></script>',
            (files.js || [])
              .map(({ fileName }) => `<script defer src="${basename}${fileName}"></script>`)
          )
          .replace(/(  |\n)/g, '')
      ),
    }),
    ...(production ? [
      terser({ format: { comments: false } }),
    ] : [
      serve({
        contentBase: outputPath,
        historyApiFallback: true,
        port: 8080,
      }),
      livereload({
        clientUrl: codeServer && '/proxy/35729/livereload.js?snipver=1&port=443&path=proxy/35729/livereload',
        watch: outputPath,
      }),
    ]),
  ],
  watch: { clearScreen: false },
};

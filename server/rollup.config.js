import fs from 'fs';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { fileURLToPath } from 'url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import run from '@rollup/plugin-run';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { dependencies } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const production = !process.env.ROLLUP_WATCH;

export default {
  input: path.join(__dirname, 'src', 'main.ts'),
  external: Object.keys(dependencies),
  output: {
    dir: path.resolve(__dirname, 'dist'),
    format: 'es',
    sourcemap: !production,
  },
  plugins: [
    commonjs(),
    nodeResolve({ extensions: ['.js', '.ts'] }),
    typescript({ sourceMap: !production }),
    copy({
      targets: [
        { src: 'src/messages.proto', dest: 'dist' },
      ],
    }),
    ...(production ? [
      terser({ format: { comments: false } }),
    ] : [
      run({
        execArgv: ['-r', 'source-map-support/register'],
      })
    ]),
  ],
  watch: { clearScreen: false },
};

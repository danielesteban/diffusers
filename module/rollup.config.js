import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  input: path.join(__dirname, 'src'),
  output: {
    file: path.join(__dirname, 'dist', 'diffusers.js'),
    format: 'esm',
  },
  plugins: [
    nodeResolve({ extensions: ['.js', '.ts'] }),
    typescript({ declaration: true, declarationDir: 'types' }),
    terser({ format: { comments: false } }),
    copy({
      copyOnce: true,
      targets: [
        { src: '../LICENSE', dest: 'dist' },
        { src: '../README.md', dest: 'dist' },
      ],
    }),
    {
      writeBundle() {
        fs.writeFileSync(path.join(__dirname, 'dist', 'package.json'), JSON.stringify({
          name: '@danielesteban/diffusers',
          author: 'Daniel Esteban Nombela',
          license: 'MIT',
          version: '0.0.1',
          module: './diffusers.js',
          type: 'module',
          types: './types',
          homepage: 'https://diffusers.gatunes.com',
          repository: {
            type: 'git',
            url: 'https://github.com/danielesteban/diffusers',
          },
        }, null, '  '));
      },
    },
  ],
};

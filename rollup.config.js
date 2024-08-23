import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/index.js',
  output: [
    {
      format: 'cjs',
      file: 'bin/index.cjs'
    },
    {
      format: 'es',
      file: 'bin/index.mjs'
    }
  ],
  plugins: [json(), resolve(), commonjs()],
  external: [/node_modules/]
}

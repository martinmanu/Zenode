import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts', // Entry point
  output: [
    {
      file: 'dist/zenode.esm.js',
      format: 'esm', // ES Module format
      sourcemap: true,
    },
    {
      file: 'dist/zenode.cjs.js',
      format: 'cjs', // CommonJS format
      sourcemap: true,
    },
    {
      file: 'dist/zenode.umd.js',
      format: 'umd', // UMD format (for browsers)
      name: 'Zenode', // Global variable for browsers
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),   // Resolves dependencies
    commonjs(),      // Converts CommonJS modules to ES6
    typescript(),    // Compiles TypeScript
  ],
  external: ['d3'],  // Exclude D3.js from the bundle (users will install it separately)
};

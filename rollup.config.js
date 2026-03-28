import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['src/index.ts', 'src/config/testConfig.ts'], // Entry points
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),   // Resolves dependencies
    commonjs(),      // Converts CommonJS modules to ES6
    typescript(),    // Compiles TypeScript
  ],
};

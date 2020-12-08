import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
    input: 'dist/src/index.js',
    output: {
        file: 'dist/np-stock-trader.js',
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [commonjs(), nodeResolve(), json()],
};

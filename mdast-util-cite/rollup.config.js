// `rollup.config.js` adapted from the following sources
// https://hackernoon.com/building-and-publishing-a-module-with-typescript-and-rollup-js-faa778c85396
// https://github.com/alexjoverm/typescript-library-starter/blob/master/rollup.config.ts
// https://github.com/landakram/micromark-extension-wiki-link/blob/master/rollup.config.js

// package.json
import pkg from "./package.json"

// rollup plugins
import ts from "rollup-plugin-ts";
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel';

////////////////////////////////////////////////////////////

// configuration shared by esm / cjs / es
const shared = {
	// dependencies will be installed by the consumer,
	// so tell rollup not to bundle them with the package
	external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		...Object.keys(pkg.devDependencies || {}),
		"mdast-util-to-markdown/lib/util/safe",
	],
}

// babel plugin
const babelPlugin = babel({
	babelHelpers: 'runtime',
	exclude: ['node_modules/**']
})

// esm-only configuration
const esm = {
	...shared,
	input: 'src/index.ts',
	output: [
		{
			file: pkg.browser,
			format: 'esm',
			sourcemap: true
		}
	],
	plugins: [
		ts({transpiler: "babel"}),
		commonjs(),
		babelPlugin
	],
}

// cjs/es-only configuration
const cjs_es = {
	...shared,
	input: 'src/index.ts',
	output: [
		{
			file: pkg.main,
			format: 'cjs',
			sourcemap: true
		},{
			file: pkg.module,
			format: 'es',
			sourcemap: true,
		}
	],
	plugins: [
		ts({transpiler: "babel"}),
		commonjs(),
		babelPlugin
	]
}

export default [esm, cjs_es];

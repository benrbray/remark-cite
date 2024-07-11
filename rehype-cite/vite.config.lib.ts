// vite configuration for building the npm package

import { resolve } from 'path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

import pkg from "./package.json";

export default defineConfig({
	plugins: [
		tsConfigPaths(),
		dts({
			rollupTypes: true,
			tsconfigPath: "./tsconfig.json"
		}),
	],
	build: {
		lib: {
			formats: ["es"],
			entry: resolve(__dirname, 'lib/main.ts'),
		},
		rollupOptions: {
      // dependencies will be installed by the consumer,
      // so tell rollup not to bundle them with the package
      external: [
        ...Object.keys(pkg["dependencies"]     || {}),
        ...Object.keys(pkg["peerDependencies"] || {}),
        ...Object.keys(pkg["devDependencies"]  || {}),
      ],
		},
	},
})
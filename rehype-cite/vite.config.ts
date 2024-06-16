import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    solid(),
    tsConfigPaths()
  ],
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__dirname, 'lib/main.ts')
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      external: [],
    },
  },
})

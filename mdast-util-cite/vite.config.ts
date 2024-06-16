// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
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
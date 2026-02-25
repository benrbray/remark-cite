// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///home/ben/projects/remark-cite/node_modules/.pnpm/vite@5.3.1_@types+node@20.14.2/node_modules/vite/dist/node/index.js";
import tsConfigPaths from "file:///home/ben/projects/remark-cite/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.4.5_vite@5.3.1_@types+node@20.14.2_/node_modules/vite-tsconfig-paths/dist/index.mjs";
import dts from "file:///home/ben/projects/remark-cite/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.14.2_rollup@4.18.0_typescript@5.4.5_vite@5.3.1_@types+node@20.14.2_/node_modules/vite-plugin-dts/dist/index.mjs";

// package.json
var package_default = {
  name: "@benrbray/micromark-extension-cite",
  version: "2.0.1-alpha.1",
  license: "MIT",
  private: false,
  description: "Micromark syntax extension for pandoc-style citations.",
  repository: {
    type: "git",
    url: "https://github.com/benrbray/remark-cite.git",
    directory: "micromark-extension-cite"
  },
  keywords: [
    "markdown",
    "pandoc",
    "citations",
    "bibliography",
    "remark",
    "remark-plugin",
    "micromark",
    "micromark-plugin",
    "micromark-extension"
  ],
  author: {
    name: "Benjamin R. Bray",
    url: "https://benrbray.com/"
  },
  type: "module",
  exports: {
    ".": "./dist/micromark-extension-cite.js"
  },
  types: "dist/micromark-extension-cite.d.ts",
  files: [
    "dist",
    "lib"
  ],
  scripts: {
    dev: "vite",
    build: "vite build",
    "check:types": "tsc --noEmit",
    clean: "pnpm del dist",
    prepare: "pnpm run clean; pnpm run build",
    pretest: "pnpm run clean; pnpm run build",
    preview: "vite preview",
    test: "vitest",
    "publish-pnpm": "pnpm publish"
  },
  peerDependencies: {
    micromark: "^4.0.0"
  },
  devDependencies: {
    "del-cli": "^5.1.0",
    "micromark-util-types": "^2.0.0",
    typescript: "^5.2.2",
    vite: "^5.2.0",
    "vite-plugin-dts": "^3.9.1",
    "vite-tsconfig-paths": "^4.3.2",
    vitest: "^1.6.0"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/home/ben/projects/remark-cite/micromark-extension-cite";
var vite_config_default = defineConfig({
  plugins: [
    tsConfigPaths(),
    dts({ rollupTypes: true })
  ],
  build: {
    lib: {
      formats: ["es"],
      entry: resolve(__vite_injected_original_dirname, "lib/main.ts")
    },
    rollupOptions: {
      // dependencies will be installed by the consumer,
      // so tell rollup not to bundle them with the package
      external: [
        // ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(package_default.peerDependencies || {}),
        ...Object.keys(package_default.devDependencies || {})
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvYmVuL3Byb2plY3RzL3JlbWFyay1jaXRlL21pY3JvbWFyay1leHRlbnNpb24tY2l0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvYmVuL3Byb2plY3RzL3JlbWFyay1jaXRlL21pY3JvbWFyay1leHRlbnNpb24tY2l0ZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9iZW4vcHJvamVjdHMvcmVtYXJrLWNpdGUvbWljcm9tYXJrLWV4dGVuc2lvbi1jaXRlL3ZpdGUuY29uZmlnLnRzXCI7Ly8gdml0ZS5jb25maWcuanNcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHNDb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuaW1wb3J0IHBrZyBmcm9tIFwiLi9wYWNrYWdlLmpzb25cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHRzQ29uZmlnUGF0aHMoKSxcbiAgICBkdHMoeyByb2xsdXBUeXBlczogdHJ1ZSB9KSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGZvcm1hdHM6IFtcImVzXCJdLFxuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnbGliL21haW4udHMnKVxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLy8gZGVwZW5kZW5jaWVzIHdpbGwgYmUgaW5zdGFsbGVkIGJ5IHRoZSBjb25zdW1lcixcbiAgICAgIC8vIHNvIHRlbGwgcm9sbHVwIG5vdCB0byBidW5kbGUgdGhlbSB3aXRoIHRoZSBwYWNrYWdlXG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICAvLyAuLi5PYmplY3Qua2V5cyhwa2cuZGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pLFxuICAgICAgICAuLi5PYmplY3Qua2V5cyhwa2cuZGV2RGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbn0pIiwgIntcbiAgXCJuYW1lXCI6IFwiQGJlbnJicmF5L21pY3JvbWFyay1leHRlbnNpb24tY2l0ZVwiLFxuICBcInZlcnNpb25cIjogXCIyLjAuMS1hbHBoYS4xXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcInByaXZhdGVcIjogZmFsc2UsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJNaWNyb21hcmsgc3ludGF4IGV4dGVuc2lvbiBmb3IgcGFuZG9jLXN0eWxlIGNpdGF0aW9ucy5cIixcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW5yYnJheS9yZW1hcmstY2l0ZS5naXRcIixcbiAgICBcImRpcmVjdG9yeVwiOiBcIm1pY3JvbWFyay1leHRlbnNpb24tY2l0ZVwiXG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwibWFya2Rvd25cIixcbiAgICBcInBhbmRvY1wiLFxuICAgIFwiY2l0YXRpb25zXCIsXG4gICAgXCJiaWJsaW9ncmFwaHlcIixcbiAgICBcInJlbWFya1wiLFxuICAgIFwicmVtYXJrLXBsdWdpblwiLFxuICAgIFwibWljcm9tYXJrXCIsXG4gICAgXCJtaWNyb21hcmstcGx1Z2luXCIsXG4gICAgXCJtaWNyb21hcmstZXh0ZW5zaW9uXCJcbiAgXSxcbiAgXCJhdXRob3JcIjoge1xuICAgIFwibmFtZVwiOiBcIkJlbmphbWluIFIuIEJyYXlcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vYmVucmJyYXkuY29tL1wiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcImV4cG9ydHNcIjoge1xuICAgIFwiLlwiOiBcIi4vZGlzdC9taWNyb21hcmstZXh0ZW5zaW9uLWNpdGUuanNcIlxuICB9LFxuICBcInR5cGVzXCI6IFwiZGlzdC9taWNyb21hcmstZXh0ZW5zaW9uLWNpdGUuZC50c1wiLFxuICBcImZpbGVzXCI6IFtcbiAgICBcImRpc3RcIixcbiAgICBcImxpYlwiXG4gIF0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGRcIixcbiAgICBcImNoZWNrOnR5cGVzXCI6IFwidHNjIC0tbm9FbWl0XCIsXG4gICAgXCJjbGVhblwiOiBcInBucG0gZGVsIGRpc3RcIixcbiAgICBcInByZXBhcmVcIjogXCJwbnBtIHJ1biBjbGVhbjsgcG5wbSBydW4gYnVpbGRcIixcbiAgICBcInByZXRlc3RcIjogXCJwbnBtIHJ1biBjbGVhbjsgcG5wbSBydW4gYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInRlc3RcIjogXCJ2aXRlc3RcIixcbiAgICBcInB1Ymxpc2gtcG5wbVwiOiBcInBucG0gcHVibGlzaFwiXG4gIH0sXG4gIFwicGVlckRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJtaWNyb21hcmtcIjogXCJeNC4wLjBcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJkZWwtY2xpXCI6IFwiXjUuMS4wXCIsXG4gICAgXCJtaWNyb21hcmstdXRpbC10eXBlc1wiOiBcIl4yLjAuMFwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjIuMlwiLFxuICAgIFwidml0ZVwiOiBcIl41LjIuMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tZHRzXCI6IFwiXjMuOS4xXCIsXG4gICAgXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI6IFwiXjQuMy4yXCIsXG4gICAgXCJ2aXRlc3RcIjogXCJeMS42LjBcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sU0FBUzs7O0FDSmhCO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxTQUFXO0FBQUEsRUFDWCxTQUFXO0FBQUEsRUFDWCxhQUFlO0FBQUEsRUFDZixZQUFjO0FBQUEsSUFDWixNQUFRO0FBQUEsSUFDUixLQUFPO0FBQUEsSUFDUCxXQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsVUFBWTtBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVU7QUFBQSxJQUNSLE1BQVE7QUFBQSxJQUNSLEtBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsSUFDVCxLQUFLO0FBQUEsRUFDUDtBQUFBLEVBQ0EsT0FBUztBQUFBLEVBQ1QsT0FBUztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBVztBQUFBLElBQ1QsS0FBTztBQUFBLElBQ1AsT0FBUztBQUFBLElBQ1QsZUFBZTtBQUFBLElBQ2YsT0FBUztBQUFBLElBQ1QsU0FBVztBQUFBLElBQ1gsU0FBVztBQUFBLElBQ1gsU0FBVztBQUFBLElBQ1gsTUFBUTtBQUFBLElBQ1IsZ0JBQWdCO0FBQUEsRUFDbEI7QUFBQSxFQUNBLGtCQUFvQjtBQUFBLElBQ2xCLFdBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQSxpQkFBbUI7QUFBQSxJQUNqQixXQUFXO0FBQUEsSUFDWCx3QkFBd0I7QUFBQSxJQUN4QixZQUFjO0FBQUEsSUFDZCxNQUFRO0FBQUEsSUFDUixtQkFBbUI7QUFBQSxJQUNuQix1QkFBdUI7QUFBQSxJQUN2QixRQUFVO0FBQUEsRUFDWjtBQUNGOzs7QUQxREEsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsY0FBYztBQUFBLElBQ2QsSUFBSSxFQUFFLGFBQWEsS0FBSyxDQUFDO0FBQUEsRUFDM0I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQSxNQUNILFNBQVMsQ0FBQyxJQUFJO0FBQUEsTUFDZCxPQUFPLFFBQVEsa0NBQVcsYUFBYTtBQUFBLElBQ3pDO0FBQUEsSUFDQSxlQUFlO0FBQUE7QUFBQTtBQUFBLE1BR2IsVUFBVTtBQUFBO0FBQUEsUUFFUixHQUFHLE9BQU8sS0FBSyxnQkFBSSxvQkFBb0IsQ0FBQyxDQUFDO0FBQUEsUUFDekMsR0FBRyxPQUFPLEtBQUssZ0JBQUksbUJBQW1CLENBQUMsQ0FBQztBQUFBLE1BQzFDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

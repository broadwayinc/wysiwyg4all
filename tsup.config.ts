import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["wysiwyg4all.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    outDir: "dist",
    minify: true,
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".module.js" : ".module.cjs",
      };
    },
  },
  {
    entry: {
      "wysiwyg4all": "wysiwyg4all.browser.ts",
    },
    format: ["iife"],
    sourcemap: true,
    clean: false,
    target: "es2020",
    outDir: "dist",
    minify: true,
    globalName: "Wysiwyg4AllBundle",
    outExtension() {
      return {
        js: ".js",
      };
    },
  },
]);

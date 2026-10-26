import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

const shenaiSdkEntry = fileURLToPath(
  new URL("./node_modules/capacitor-shenai-sdk/dist/esm/index.js", import.meta.url)
)

export default defineConfig({
  root: "./src",
  resolve: {
    alias: {
      "capacitor-shenai-sdk": shenaiSdkEntry
    }
  },
  build: {
    outDir: "../dist",
    minify: false,
    emptyOutDir: true
  }
})

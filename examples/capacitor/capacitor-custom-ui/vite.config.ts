import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

const shenaiSdkEntry = fileURLToPath(
  new URL("./capacitor-shenai-sdk/dist/esm/index.js", import.meta.url)
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

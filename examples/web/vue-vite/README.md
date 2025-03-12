# Shen.AI SDK Vue + Vite minimal web example

This is a minimal web example for Shen.AI SDK using Vue 3 and Vite.

## How to run the app

1. Download the Web SDK from the Developer Portal and extract it in this directory as `shenai-sdk`.
2. Open `src/globalShenaiSDK.ts` and set your API key in the `API_KEY` constant.
3. Install dependencies using `pnpm install` or `npm install`.
4. Run `pnpm dev` (or `npm run dev`) to start the development server.
5. Open the displayed URL (likely `http://localhost:5173`) in a browser—preferably Google Chrome.

## Using the app

When the app is running, you should see:

- A measurement canvas (`<canvas id="mxcanvas">`) displaying the SDK's embedded UI.
- A “Current Heart Rate” tile showing the BPM value when the measurement is in progress.

## Important notes

- We copy the `shenai-sdk` folder into `public/shenai-sdk` so that Vite’s build does not alter its WebAssembly and worker files.
- The `locateFile` option in `globalShenaiSDK.ts` ensures the SDK's files are loaded from `/shenai-sdk/`.
- We use Vue's [provide/inject](https://vuejs.org/guide/components/provide-inject.html) for a minimal global approach, similar to React's context.
- Make sure to enable cross-origin isolation via the `vite.config.ts` settings.

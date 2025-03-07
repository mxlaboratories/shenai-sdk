# Shen.AI SDK React+Vite minimal web example

This is a minimal web example for Shen.AI SDK using React and Vite.

## How to run the app

1. Download the web SDK from the Developer Portal and extract it in this directory as `shenai-sdk`.
2. Open `src/globalShenaiSDK.tsx` in your favorite text editor.
3. Set your API key in [`API_KEY`](./src/globalShenaiSDK.tsx#L6). You can access your API keys in the Developer Portal.
4. Install dependencies using `pnpm install`.
5. Start the example using `pnpm dev`. Open the output URL (probably `http://localhost:5173`) in a browser (Google Chrome preferably).

## Using the app

When the app is running you should see the measurement window and camera stream. Messages on the screen should give you instructions how to take your first measurement.

## Documentation

To understand better the integration with Shen.AI SDK, please see the [Web documentation](https://developer.shen.ai/platforms/web).

---

## Vite-specific issues

Note that the Vite build system does not handle webassembly and js worker files properly.
Therefore the recommended approach is to host the SDK in the 'public' directory, bypassing the build system.
Note that the provided dev/build scripts are copying the SDK to the public directory, and the extra parameter [`locateFile`](./src/globalShenaiSDK.ts#L13) is passed when initializing the SDK in order for SDK's files to be loaded from the public directory.

Worker format is changed to 'es' in `vite.config.ts` file to support directly loading the SDK as an NPM module.
An alternative is to not specify it as an npm dependency at all and dynamically import it from the public directory at runtime (as in the `js-minimal` example).

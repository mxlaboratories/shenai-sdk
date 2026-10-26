import CreateShenaiSDK, { type ShenaiSDK } from "shenai-sdk";

let sdkPromise: Promise<ShenaiSDK> | null = null;
let sdkInstance: ShenaiSDK | null = null;

const API_KEY = "YOUR_API_KEY"; // Replace with your real API key

/**
 * Returns a Promise that resolves to a ShenaiSDK instance,
 * ensuring only one instance is created throughout the app.
 */
export function getShenaiSDK() {
  if (!sdkPromise) {
    sdkPromise = CreateShenaiSDK({
      locateFile: (filename) => "/shenai-sdk/" + filename,
    }).then((shenai) => {
      return new Promise<ShenaiSDK>((resolve, reject) => {
        shenai.initialize(API_KEY, "", {}, (result) => {
          if (result === shenai.InitializationResult.OK) {
            console.log("Shen.AI initialized (license activated)");
            sdkInstance = shenai;
            resolve(shenai);
          } else {
            alert("Shen.AI license activation error " + result.toString());
            shenai.destroyRuntime();
            sdkInstance = null;
            sdkPromise = null;
            reject(new Error("ShenAI init error " + result.toString()));
          }
        });
      });
    });
  }
  return sdkPromise;
}

export function destroyShenaiSDK() {
  if (sdkInstance) {
    sdkInstance.destroyRuntime();
    sdkInstance = null;
    sdkPromise = null;
  }
}

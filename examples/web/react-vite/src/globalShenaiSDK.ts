import CreateShenaiSDK, { ShenaiSDK } from "shenai-sdk";

let sdkPromise: Promise<ShenaiSDK> | null = null;
let sdkInstance: ShenaiSDK | null = null;

const API_KEY = "API_KEY";

// This function returns the same Promise every time
export function getShenaiSDK() {
  if (!sdkPromise) {
    // Start loading only once
    sdkPromise = CreateShenaiSDK({
      locateFile: (filename) => "/shenai-sdk/" + filename,
      // custom locateFile parameter ensures that webassembly and javascript worker code are loaded from the 'public' directory, preventing name mangling
    }).then((shenai) => {
      // Initialize once loaded
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
            // Reset so a future mount can try again
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

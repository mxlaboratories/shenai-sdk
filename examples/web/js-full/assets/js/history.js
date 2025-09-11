import CreateShenaiSDK, { CameraMode } from "../../shenai-sdk/index.mjs";
import { APP_CONFIG } from "../../app-config.js";
import Module from "../../shenai-sdk/shenai_sdk.mjs";

const urlParams = new URLSearchParams(window.location.search);
const API_KEY = urlParams.get("apiKey") || APP_CONFIG.API_KEY;

export function showHistory() {
    // getting history from local memory
    // for more information see: https://developer.shen.ai/video-measurement/local-memory
    const output = document.getElementById("output");
  
    const history = shenai.getMeasurementResultsHistory();

    if (history.length === 0) {
        output.textContent = "Empty history. Perform some scans.";
    } else {
        try {
            output.textContent = JSON.stringify(history, null, 2);
        } catch (e) {
            output.textContent = "Failed to parse history.";
            console.error("JSON parse error:", e);
        }
    }
}
window.showHistory = showHistory;

document.addEventListener("DOMContentLoaded", async () => {
  const shenai = await CreateShenaiSDK({
    enablePreloadDisplay: false,
  });
  shenai.initialize(
    API_KEY,
    APP_CONFIG.USER_ID,

    // camera mode in initialization settings
    // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
    {
      cameraMode: CameraMode.OFF
    },

    // initialization results handling
    // for more information see: https://developer.shen.ai/getting-started/initialization#error-handling
    (result) => {
      if (result === shenai.InitializationResult.OK) {
        console.log("Shen.AI SDK initialized");
      } else {
        alert("Shen.AI license activation error " + result.toString());
      }
    }
  );

    // providing the user interface
    // for more information see: https://developer.shen.ai/getting-started/initialization#providing-the-user-interface
  window.shenai = shenai;
});
  
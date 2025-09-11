import CreateShenaiSDK from "../../shenai-sdk/index.mjs";
import { APP_CONFIG } from "../../app-config.js";
import { ensureCanvasResolution } from "./view-port-resize.js"

const urlParams = new URLSearchParams(window.location.search);
const API_KEY = urlParams.get("apiKey") || APP_CONFIG.API_KEY;

CreateShenaiSDK().then((shenai) => {
    shenai.initialize(
        API_KEY,
        APP_CONFIG.USER_ID,

        // example usage of initialization settings
        // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
        {
            hideShenaiLogo: false,

            // example usage of initialization mode to start calibration
            // for more information see: https://developer.shen.ai/video-measurement/calibration
            initializationMode: shenai.InitializationMode.CALIBRATION,

            // example usage of event callback
            // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
            eventCallback: (event) => {
                console.log("Shen.AI event:", event);
                if (event === "USER_FLOW_FINISHED") {
                    window.location.href = "../../index.html";
                }
            },
            onCameraError: () => console.log("camera error"),
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
    window.shenai = shenai;
});

// providing the user interface
// for more information see: https://developer.shen.ai/getting-started/initialization#providing-the-user-interface
ensureCanvasResolution()
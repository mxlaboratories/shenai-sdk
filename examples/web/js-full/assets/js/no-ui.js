import CreateShenaiSDK from "../../shenai-sdk/index.mjs";
import { APP_CONFIG } from "../../app-config.js";
import { ensureCanvasResolution } from "./view-port-resize.js"

const urlParams = new URLSearchParams(window.location.search);
const API_KEY = urlParams.get("apiKey") || APP_CONFIG.API_KEY;

export function handleStartStopClick() {
    if (shenai.getOperatingMode() != shenai.OperatingMode.MEASURE) {
        shenai.setOperatingMode(shenai.OperatingMode.MEASURE);
    } else {
        shenai.setOperatingMode(shenai.OperatingMode.POSITIONING);
    }
}
window.handleStartStopClick = handleStartStopClick;

CreateShenaiSDK().then((shenai) => {
    shenai.initialize(
        API_KEY,
        APP_CONFIG.USER_ID,

        // example usage of initialization settings
        // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
        {
            
            // set measurement preset
            measurementPreset: shenai.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,

            // white-label usage
            hideShenaiLogo: true,

            // disable health indices
            enableHealthRisks: false,

            // disable summary screen
            enableSummaryScreen: false,

            // disable start after success
            enableStartAfterSuccess: false,

            // hide user interface
            showUserInterface: false,

            // example usage of event callback
            // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
            eventCallback: (event) => {
                console.log("Shen.AI event:", event);
                if (event === "MEASUREMENT_FINISHED") {
                    try {

                        // getting measurement results
                        // for more information see: https://developer.shen.ai/video-measurement/results
                        const results = shenai.getMeasurementResults();
                        sessionStorage.setItem("shenaiResults", JSON.stringify(results));
                        window.location.href = "../../results-page.html";
                    } catch (e) {
                        alert("Could not retrieve results.");
                    }
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
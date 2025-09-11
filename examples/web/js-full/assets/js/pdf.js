import CreateShenaiSDK from "../../shenai-sdk/index.mjs";
import { APP_CONFIG } from "../../app-config.js";
import { ensureCanvasResolution } from "./view-port-resize.js"

const urlParams = new URLSearchParams(window.location.search);
const API_KEY = urlParams.get("apiKey") || APP_CONFIG.API_KEY;;

CreateShenaiSDK().then((shenai) => {
  shenai.initialize(
    API_KEY,
    APP_CONFIG.USER_ID,
    
    // example usage of custom measurement config
    // for more information see: https://developer.shen.ai/getting-started/configuration#custom-measurement-configuration
    {
      hideShenaiLogo: false,
      proVersionLock: false,
      enableHealthIndices: false,
      measurementPreset:
        shenai.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
      eventCallback: (event) => {
        console.log("Shen.AI event:", event);
        if (event === "USER_FLOW_FINISHED") {
          window.location.href = "../../index.html";
        }
      },
      onCameraError: () => console.log("camera error"),
    },
    (result) => {
      if (result === shenai.InitializationResult.OK) {
        console.log("Shen.AI initialized (license activated)");
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

// ---- PDF helpers ----
// for more information see: https://developer.shen.ai/pdf-reports
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const sendPdfBtn = document.getElementById("sendPdfBtn");
  const openPdfBtn = document.getElementById("openPdfBtn");

  sendPdfBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    if (!email) {
      alert("Please enter an email address first.");
      return;
    }
    if (window.shenai?.sendMeasurementResultsPdfToEmail) {
      window.shenai.sendMeasurementResultsPdfToEmail(email, (success) =>
        console.log("PDF sent successfully:", success)
      );
      emailInput.value = "";
    } else {
      console.warn("Shen.AI SDK not ready yet.");
    }
  });

  openPdfBtn.addEventListener("click", () => {
    if (window.shenai?.openMeasurementResultsPdfInBrowser) {
      window.shenai.openMeasurementResultsPdfInBrowser();
    } else {
      console.warn("Shen.AI SDK not ready yet.");
    }
  });
});
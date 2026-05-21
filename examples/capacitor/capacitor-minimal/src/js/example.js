import {
  CameraMode,
  Gender,
  HypertensionTreatment,
  InitializationResult,
  MeasurementPreset,
  OnboardingMode,
  OperatingMode,
  PhysicalActivity,
  PrecisionMode,
  Race,
  FamilyHistory,
  ParentalHistory,
  ShenaiSdkCapacitor,
  UiVersion
} from "capacitor-shenai-sdk";

const shenApiKey = import.meta.env.VITE_SHENAI_API_KEY ?? "";
const missingApiKeyMessage = "Missing VITE_SHENAI_API_KEY. Rebuild the app with your API key.";
const statusEl = document.querySelector("#status");
const toggleButton = document.querySelector("#toggle-sdk");

let initialized = false;

const riskFactors = {
  age: 45,
  cholesterol: 190,
  cholesterolHdl: 52,
  sbp: 128,
  dbp: 82,
  isSmoker: false,
  hypertensionTreatment: HypertensionTreatment.NO,
  hasDiabetes: false,
  bodyHeight: 172,
  bodyWeight: 74,
  waistCircumference: 84,
  neckCircumference: 38,
  hipCircumference: 98,
  gender: Gender.FEMALE,
  physicalActivity: PhysicalActivity.MODERATELY,
  country: "US",
  race: Race.WHITE,
  vegetableFruitDiet: true,
  historyOfHighGlucose: false,
  historyOfHypertension: false,
  triglyceride: 120,
  fastingGlucose: 92,
  familyDiabetes: FamilyHistory.NONE_FIRST_DEGREE,
  parentalHypertension: ParentalHistory.NONE
};

function minimalSettings() {
  return {
    precisionMode: PrecisionMode.RELAXED,
    operatingMode: OperatingMode.MEASURE,
    measurementPreset: MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
    cameraMode: CameraMode.FACING_USER,
    onboardingMode: OnboardingMode.SHOW_ONCE,
    showUserInterface: true,
    showFacePositioningOverlay: true,
    showVisualWarnings: true,
    enableCameraSwap: true,
    showFaceMask: true,
    showBloodFlow: true,
    enableStartAfterSuccess: false,
    enableSummaryScreen: true,
    showResultsFinishButton: true,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: true,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: true,
    showSignalQualityIndicator: true,
    showSignalTile: true,
    showStartStopButton: true,
    showInfoButton: true,
    showDisclaimer: true,
    uiVersion: UiVersion.V2,
    risksFactors: riskFactors
  };
}

function setStatus(message, ready = false) {
  statusEl.textContent = message;
  statusEl.dataset.ready = ready ? "true" : "false";
}

async function initializeSdk() {
  if (!shenApiKey) {
    setStatus(missingApiKeyMessage);
    return;
  }

  setStatus("Initializing SDK...");
  const result = await ShenaiSdkCapacitor.initialize({
    apiKey: shenApiKey,
    userId: "",
    settings: minimalSettings()
  });

  initialized = result.value === InitializationResult.OK;
  if (initialized) {
    await ShenaiSdkCapacitor.setOverlaysWebview({ overlay: false }).catch(() => {});
  }
  setStatus(initialized ? "SDK ready" : `Initialization failed: ${result.value}`, initialized);
}

async function deinitializeSdk() {
  await ShenaiSdkCapacitor.deinitialize();
  initialized = false;
  setStatus("SDK deinitialized");
}

toggleButton.addEventListener("click", async () => {
  try {
    if (initialized) {
      await deinitializeSdk();
      return;
    }
    await initializeSdk();
  } catch (error) {
    setStatus(`SDK error: ${error instanceof Error ? error.message : error}`);
  }
});

document.addEventListener("visibilitychange", async () => {
  if (!initialized) {
    return;
  }
  await ShenaiSdkCapacitor.setCameraMode({
    cameraMode: document.hidden ? CameraMode.OFF : CameraMode.FACING_USER
  });
});

ShenaiSdkCapacitor.addListener("ShenAIEvent", event => {
  console.log("Shen.AI event", event);
});

initializeSdk().catch(error => {
  setStatus(`SDK error: ${error instanceof Error ? error.message : error}`);
});

import {
  CameraMode,
  FamilyHistory,
  Gender,
  HypertensionTreatment,
  InitializationResult,
  MeasurementPreset,
  OnboardingMode,
  OperatingMode,
  ParentalHistory,
  PhysicalActivity,
  PrecisionMode,
  Race,
  Screen,
  ShenaiSdkCapacitor,
  UiVersion
} from "capacitor-shenai-sdk";

const shenApiKey = import.meta.env.VITE_SHENAI_API_KEY ?? "";
const missingApiKeyMessage = "Missing VITE_SHENAI_API_KEY. Rebuild the app with your API key.";

const home = document.querySelector("#home");
const pdfActions = document.querySelector("#pdf-actions");
const statusEl = document.querySelector("#status");
const pdfStatus = document.querySelector("#pdf-status");

let activeFlow = null;
let flowFinished = false;

function delay(ms) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}

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

const dashboardFlow = {
  name: "dashboard",
  dashboardOnly: true,
  resetMeasurement: false,
  showPdfActionsAfterFinish: false,
  screens: [Screen.DASHBOARD]
};

const measurementFlow = {
  name: "measurement",
  dashboardOnly: false,
  resetMeasurement: true,
  showPdfActionsAfterFinish: true,
  screens: [Screen.MEASUREMENT, Screen.RESULTS, Screen.HEALTH_RISKS]
};

function uiFlowSettings(flow) {
  return {
    precisionMode: PrecisionMode.RELAXED,
    operatingMode: OperatingMode.MEASURE,
    measurementPreset: MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
    cameraMode: CameraMode.FACING_USER,
    onboardingMode: OnboardingMode.HIDDEN,
    showUserInterface: true,
    showFacePositioningOverlay: true,
    showVisualWarnings: true,
    enableCameraSwap: true,
    showFaceMask: true,
    showBloodFlow: true,
    enableStartAfterSuccess: false,
    enableSummaryScreen: !flow.dashboardOnly,
    showResultsFinishButton: !flow.dashboardOnly,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: !flow.dashboardOnly,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: true,
    showSignalQualityIndicator: true,
    showSignalTile: true,
    showStartStopButton: !flow.dashboardOnly,
    showInfoButton: !flow.dashboardOnly,
    showDisclaimer: !flow.dashboardOnly,
    uiVersion: UiVersion.V2,
    uiFlowScreens: flow.screens,
    risksFactors: riskFactors
  };
}

async function showHome(message = "") {
  activeFlow = null;
  flowFinished = false;
  statusEl.textContent = message;
  await ShenaiSdkCapacitor.setOverlaysWebview({ overlay: false }).catch(() => {});
  document.body.classList.remove("sdk-active");
  home.classList.remove("hidden");
  pdfActions.classList.add("hidden");
}

async function showSdk() {
  await ShenaiSdkCapacitor.setViewRect({ x: 0, y: 0, width: 0, height: 0 }).catch(() => {});
  await ShenaiSdkCapacitor.setOverlaysWebview({ overlay: true }).catch(() => {});
  document.body.classList.add("sdk-active");
}

async function finishFlow() {
  if (flowFinished) {
    return;
  }
  flowFinished = true;
  await ShenaiSdkCapacitor.deinitialize();
  await showHome();
}

async function showPdfActions() {
  await ShenaiSdkCapacitor.setCameraMode({ cameraMode: CameraMode.OFF });
  await ShenaiSdkCapacitor.setOverlaysWebview({ overlay: false }).catch(() => {});
  document.body.classList.remove("sdk-active");
  home.classList.add("hidden");
  pdfActions.classList.remove("hidden");
  pdfStatus.textContent = "Measurement finished. Open the PDF report.";
}

async function hasMeasurementResults() {
  try {
    const response = await ShenaiSdkCapacitor.getMeasurementResults();
    const results = response && typeof response === "object" && "value" in response ? response.value : response;
    return results != null;
  } catch {
    return false;
  }
}

async function waitForMeasurementResults() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await hasMeasurementResults()) {
      return true;
    }
    await delay(200);
  }
  return false;
}

async function handleUserFlowFinished() {
  if (flowFinished || activeFlow == null) {
    return;
  }
  if (activeFlow.showPdfActionsAfterFinish) {
    await waitForMeasurementResults();
    await showPdfActions();
    return;
  }
  await finishFlow();
}

async function openFlow(flow) {
  statusEl.textContent = "Initializing SDK...";
  if (!shenApiKey) {
    await showHome(missingApiKeyMessage);
    return;
  }

  try {
    const initialized = await ShenaiSdkCapacitor.isInitialized();
    if (initialized.value) {
      await ShenaiSdkCapacitor.deinitialize();
    }
    activeFlow = flow;
    const result = await ShenaiSdkCapacitor.initialize({
      apiKey: shenApiKey,
      userId: "",
      settings: uiFlowSettings(flow)
    });
    if (result.value !== InitializationResult.OK) {
      await showHome(`Initialization failed: ${result.value}`);
      return;
    }
    if (flow.resetMeasurement) {
      await ShenaiSdkCapacitor.resetMeasurementSession();
      await ShenaiSdkCapacitor.setEnableMeasurementsDashboard({ value: false });
      await ShenaiSdkCapacitor.setScreen({ screen: Screen.MEASUREMENT });
    }
    await showSdk();
  } catch (error) {
    await showHome(`SDK error: ${error instanceof Error ? error.message : error}`);
  }
}

async function runPdfAction(action) {
  pdfStatus.textContent = "Working on PDF...";
  try {
    const message = await action();
    pdfStatus.textContent = message;
  } catch (error) {
    pdfStatus.textContent = `PDF action failed: ${error instanceof Error ? error.message : error}`;
  }
}

document.querySelector("#dashboard").addEventListener("click", () => {
  openFlow(dashboardFlow);
});

document.querySelector("#measurement").addEventListener("click", () => {
  openFlow(measurementFlow);
});

document.querySelector("#open-pdf").addEventListener("click", () => {
  runPdfAction(async () => {
    await ShenaiSdkCapacitor.openMeasurementResultsPdfInBrowser();
    return "PDF open request sent.";
  });
});

document.querySelector("#finish").addEventListener("click", finishFlow);

document.addEventListener("visibilitychange", async () => {
  if (activeFlow == null || flowFinished || !pdfActions.classList.contains("hidden")) {
    return;
  }
  await ShenaiSdkCapacitor.setCameraMode({
    cameraMode: document.hidden ? CameraMode.OFF : CameraMode.FACING_USER
  });
});

ShenaiSdkCapacitor.addListener("ShenAIEvent", event => {
  const eventName =
    typeof event === "string" ? event : (event?.EventName ?? event?.eventName ?? event?.name ?? event?.value);
  if (eventName === "USER_FLOW_FINISHED") {
    handleUserFlowFinished().catch(error => {
      showHome(`SDK error: ${error instanceof Error ? error.message : error}`).catch(console.error);
    });
  }
});

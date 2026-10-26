import {
  BmiCategory,
  CameraMode,
  FamilyHistory,
  Gender,
  HypertensionTreatment,
  InitializationResult,
  MeasurementEnvironmentCondition,
  MeasurementPreset,
  MeasurementState,
  NAFLDRisk,
  OnboardingMode,
  OperatingMode,
  ParentalHistory,
  PhysicalActivity,
  PrecisionMode,
  Race,
  ShenaiSdkCapacitor,
  UiVersion
} from "capacitor-shenai-sdk";

const shenApiKey = import.meta.env.VITE_SHENAI_API_KEY ?? "";
const missingApiKeyMessage = "Missing VITE_SHENAI_API_KEY. Rebuild the app with your API key.";
const pollIntervalMs = 200;

const elements = {
  measurementScreen: document.querySelector("#measurement-screen"),
  profileScreen: document.querySelector("#profile-screen"),
  resultsScreen: document.querySelector("#results-screen"),
  profileBackButton: document.querySelector("#profile-back-button"),
  resultsBackButton: document.querySelector("#results-back-button"),
  profileButtons: document.querySelectorAll("[data-open-profile]"),
  startButton: document.querySelector("#start-button"),
  stopButton: document.querySelector("#stop-button"),
  seeResultsButton: document.querySelector("#see-results-button"),
  measurementLine: document.querySelector("#measurement-line"),
  progressFill: document.querySelector("#progress-fill"),
  qualityEmpty: document.querySelector("#quality-empty"),
  qualityRows: document.querySelector("#quality-rows"),
  finalQualityEmpty: document.querySelector("#final-quality-empty"),
  finalQualityRows: document.querySelector("#final-quality-rows"),
  headlineGrid: document.querySelector("#headline-grid"),
  metricsGrid: document.querySelector("#metrics-grid"),
  risksGrid: document.querySelector("#risks-grid"),
  riskForm: document.querySelector("#risk-form"),
  cameraWindow: document.querySelector("#camera-window"),
  cameraPlaceholder: document.querySelector("#camera-placeholder")
};

const state = {
  initialized: false,
  running: false,
  finalizing: false,
  finished: false,
  resetting: false,
  violatedCondition: null,
  measurementState: null,
  pollTimer: null,
  resetGeneration: 0,
  results: null,
  risks: null,
  measurementStatus: "Ready",
  progress: 0,
  currentScreen: "measurement",
  profileReturnScreen: "measurement",
  profile: defaultProfile()
};

const enumMaps = {
  gender: Gender,
  physicalActivity: PhysicalActivity,
  race: Race,
  hypertensionTreatment: HypertensionTreatment,
  familyDiabetes: FamilyHistory,
  parentalHypertension: ParentalHistory
};

function defaultProfile() {
  return {
    age: 45,
    bodyHeight: 172,
    bodyWeight: 74,
    waistCircumference: 84,
    neckCircumference: 38,
    hipCircumference: 98,
    cholesterol: 190,
    cholesterolHdl: 52,
    triglyceride: 120,
    fastingGlucose: 92,
    sbp: 128,
    dbp: 82,
    isSmoker: false,
    hypertensionTreatment: "NO",
    hasDiabetes: false,
    gender: "FEMALE",
    physicalActivity: "MODERATELY",
    country: "US",
    race: "WHITE",
    vegetableFruitDiet: true,
    historyOfHighGlucose: false,
    historyOfHypertension: false,
    familyDiabetes: "NONE_FIRST_DEGREE",
    parentalHypertension: "NONE"
  };
}

function customUiSettings() {
  return {
    precisionMode: PrecisionMode.RELAXED,
    operatingMode: OperatingMode.MEASURE,
    measurementPreset: MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
    cameraMode: CameraMode.FACING_USER,
    onboardingMode: OnboardingMode.HIDDEN,
    showUserInterface: false,
    showFacePositioningOverlay: false,
    showVisualWarnings: false,
    enableCameraSwap: false,
    showFaceMask: true,
    showBloodFlow: false,
    enableStartAfterSuccess: false,
    enableSummaryScreen: false,
    showResultsFinishButton: false,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: false,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: false,
    showSignalQualityIndicator: false,
    showSignalTile: false,
    showStartStopButton: false,
    showInfoButton: false,
    showDisclaimer: false,
    uiVersion: UiVersion.V2,
    risksFactors: riskFactors()
  };
}

function riskFactors(results = null) {
  return {
    ...state.profile,
    gender: enumMaps.gender[state.profile.gender],
    physicalActivity: enumMaps.physicalActivity[state.profile.physicalActivity],
    race: enumMaps.race[state.profile.race],
    hypertensionTreatment: enumMaps.hypertensionTreatment[state.profile.hypertensionTreatment],
    familyDiabetes: enumMaps.familyDiabetes[state.profile.familyDiabetes],
    parentalHypertension: enumMaps.parentalHypertension[state.profile.parentalHypertension],
    sbp: readValue(results, "systolicBloodPressureMmhg") ?? state.profile.sbp,
    dbp: readValue(results, "diastolicBloodPressureMmhg") ?? state.profile.dbp
  };
}

function selectOptions(name, options) {
  const select = elements.riskForm.elements[name];
  select.replaceChildren();
  for (const [value, label] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }
}

function populateForm() {
  selectOptions("gender", [
    ["FEMALE", "Female"],
    ["MALE", "Male"],
    ["OTHER", "Other"]
  ]);
  selectOptions("physicalActivity", [
    ["SEDENTARY", "Sedentary"],
    ["LIGHTLY_ACTIVE", "Lightly active"],
    ["MODERATELY", "Moderately active"],
    ["VERY_ACTIVE", "Very active"],
    ["EXTRA_ACTIVE", "Extra active"]
  ]);
  selectOptions("race", [
    ["WHITE", "White"],
    ["AFRICAN_AMERICAN", "African-American"],
    ["OTHER", "Other"]
  ]);
  selectOptions("hypertensionTreatment", [
    ["NOT_NEEDED", "Not needed"],
    ["NO", "No"],
    ["YES", "Yes"]
  ]);
  selectOptions("familyDiabetes", [
    ["NONE", "None"],
    ["NONE_FIRST_DEGREE", "No first-degree relative"],
    ["FIRST_DEGREE", "First-degree relative"]
  ]);
  selectOptions("parentalHypertension", [
    ["NONE", "None"],
    ["ONE", "One parent"],
    ["BOTH", "Both parents"]
  ]);
  writeProfileToForm();
}

function writeProfileToForm() {
  for (const [name, value] of Object.entries(state.profile)) {
    const input = elements.riskForm.elements[name];
    if (!input) continue;
    if (input.type === "checkbox") {
      input.checked = Boolean(value);
    } else {
      input.value = value;
    }
  }
}

function readProfileFromForm() {
  const next = { ...state.profile };
  for (const [name] of Object.entries(next)) {
    const input = elements.riskForm.elements[name];
    if (!input) continue;
    if (input.type === "checkbox") {
      next[name] = input.checked;
    } else if (input.type === "number") {
      next[name] = Number(input.value);
    } else {
      next[name] = input.value;
    }
  }
  state.profile = next;
}

function unwrap(response) {
  if (response && typeof response === "object" && "value" in response) {
    return response.value ?? null;
  }
  return response ?? null;
}

function readValue(source, camelKey) {
  if (source == null) return null;
  if (source[camelKey] != null) return source[camelKey];
  const acronymKey = camelKey.replaceAll("Cv", "CV");
  if (source[acronymKey] != null) return source[acronymKey];
  const snakeKey = camelKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  return source[snakeKey] ?? null;
}

function formatNumber(value, decimals = 0) {
  if (value == null || Number.isNaN(Number(value)) || !Number.isFinite(Number(value))) {
    return "--";
  }
  return Number(value).toFixed(decimals);
}

function formatEnum(value) {
  if (value == null) return "--";
  return String(value).replaceAll("_", " ").toLowerCase();
}

function formatEnumValue(enumObject, value) {
  if (value == null) return "--";
  return formatEnum(enumObject[value] ?? value);
}

function normalizedQuality(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const number = Number(value);
  return Math.max(0, Math.min(1, number <= 1 ? number : number / 100));
}

function setProgress(value) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));
  state.progress = progress;
  elements.progressFill.style.width = `${progress}%`;
  renderMeasurementLine();
}

function renderMeasurementLine() {
  elements.measurementLine.textContent = `${state.measurementStatus} - ${formatNumber(state.progress)}%`;
}

function setMeasurementStatus(text) {
  state.measurementStatus = text;
  renderMeasurementLine();
}

function setCameraActive(active) {
  document.body.classList.toggle("camera-active", active);
  elements.cameraPlaceholder.textContent = active ? "" : "Camera paused";
}

function tile(label, value, unit = "") {
  return `
    <div class="value-tile">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${unit}</small>
    </div>
  `;
}

function renderGrid(container, values) {
  container.innerHTML = values.map(([label, value, unit]) => tile(label, value, unit)).join("");
}

function measurementMetricValues(results) {
  const quality = readValue(results, "qualityMetrics");
  const heartbeats = readValue(results, "heartbeats");
  return [
    ["Heart rate", formatNumber(readValue(results, "heartRateBpm")), "bpm"],
    ["HRV SDNN", formatNumber(readValue(results, "hrvSdnnMs"), 1), "ms"],
    ["HRV lnRMSSD", formatNumber(readValue(results, "hrvLnrmssdMs"), 2), "ms"],
    ["Cardiac stress", formatNumber(readValue(results, "stressIndex"), 1), ""],
    ["PNS activity", formatNumber(readValue(results, "parasympatheticActivity"), 1), ""],
    ["Breathing", formatNumber(readValue(results, "breathingRateBpm"), 1), "brpm"],
    ["Systolic", formatNumber(readValue(results, "systolicBloodPressureMmhg")), "mmHg"],
    ["Diastolic", formatNumber(readValue(results, "diastolicBloodPressureMmhg")), "mmHg"],
    ["Workload", formatNumber(readValue(results, "cardiacWorkloadMmhgPerSec"), 1), "mmHg/s"],
    ["Age", formatNumber(readValue(results, "ageYears")), "years"],
    ["BMI", formatNumber(readValue(results, "bmiKgPerM2"), 1), "kg/m2"],
    ["BMI category", formatEnumValue(BmiCategory, readValue(results, "bmiCategory")), ""],
    ["Weight", formatNumber(readValue(results, "weightKg"), 1), "kg"],
    ["Height", formatNumber(readValue(results, "heightCm"), 1), "cm"],
    ["Signal", formatNumber(readValue(results, "averageSignalQuality"), 1), "dB"],
    ["PPG quality", formatNumber(readValue(quality, "ppgQualityIndex"), 1), ""],
    ["BCG quality", formatNumber(readValue(quality, "bcgQualityIndex"), 1), ""],
    ["BP quality", formatNumber(readValue(quality, "bloodPressureQualityIndex"), 1), ""],
    ["SBP median error", formatNumber(readValue(quality, "expectedSbpMedianAbsErrorMmhg"), 1), "mmHg"],
    ["SBP p80 error", formatNumber(readValue(quality, "expectedSbpP80AbsErrorMmhg"), 1), "mmHg"],
    ["SBP mean error", formatNumber(readValue(quality, "expectedSbpMeanAbsErrorMmhg"), 1), "mmHg"],
    ["SBP balanced MAE", formatNumber(readValue(quality, "expectedSbpBalancedMaeMmhg"), 1), "mmHg"],
    ["DBP median error", formatNumber(readValue(quality, "expectedDbpMedianAbsErrorMmhg"), 1), "mmHg"],
    ["DBP p80 error", formatNumber(readValue(quality, "expectedDbpP80AbsErrorMmhg"), 1), "mmHg"],
    ["DBP mean error", formatNumber(readValue(quality, "expectedDbpMeanAbsErrorMmhg"), 1), "mmHg"],
    ["DBP balanced MAE", formatNumber(readValue(quality, "expectedDbpBalancedMaeMmhg"), 1), "mmHg"],
    ["Heartbeats", Array.isArray(heartbeats) ? String(heartbeats.length) : "--", ""]
  ];
}

function headlineValues(results) {
  return [
    ["HR", formatNumber(readValue(results, "heartRateBpm")), "bpm"],
    ["SBP", formatNumber(readValue(results, "systolicBloodPressureMmhg")), "mmHg"],
    ["DBP", formatNumber(readValue(results, "diastolicBloodPressureMmhg")), "mmHg"],
    ["BR", formatNumber(readValue(results, "breathingRateBpm"), 1), "brpm"]
  ];
}

function riskValues(risks) {
  const hard = risks?.hardAndFatalEvents;
  const cv = risks?.cvDiseases;
  const scores = risks?.scores;
  return [
    ["Wellness", formatNumber(readValue(risks, "wellnessScore"), 1), ""],
    ["Vascular age", formatNumber(readValue(risks, "vascularAge")), "years"],
    ["CVD risk", formatNumber(readValue(cv, "overallRisk"), 1), "%"],
    ["Coronary disease", formatNumber(readValue(cv, "coronaryHeartDiseaseRisk"), 1), "%"],
    ["Stroke risk", formatNumber(readValue(cv, "strokeRisk"), 1), "%"],
    ["Heart failure", formatNumber(readValue(cv, "heartFailureRisk"), 1), "%"],
    ["Peripheral vascular", formatNumber(readValue(cv, "peripheralVascularDiseaseRisk"), 1), "%"],
    ["Hard CV", formatNumber(readValue(hard, "hardCvEventRisk"), 1), "%"],
    ["Coronary death", formatNumber(readValue(hard, "coronaryDeathEventRisk"), 1), "%"],
    ["Fatal stroke", formatNumber(readValue(hard, "fatalStrokeEventRisk"), 1), "%"],
    ["CV mortality", formatNumber(readValue(hard, "totalCvMortalityRisk"), 1), "%"],
    ["Risk score", formatNumber(readValue(scores, "totalScore")), ""],
    ["Age score", formatNumber(readValue(scores, "ageScore")), ""],
    ["SBP score", formatNumber(readValue(scores, "sbpScore")), ""],
    ["Smoking score", formatNumber(readValue(scores, "smokingScore")), ""],
    ["Diabetes score", formatNumber(readValue(scores, "diabetesScore")), ""],
    ["BMI score", formatNumber(readValue(scores, "bmiScore")), ""],
    ["Cholesterol score", formatNumber(readValue(scores, "cholesterolScore")), ""],
    ["HDL score", formatNumber(readValue(scores, "cholesterolHdlScore")), ""],
    ["Hypertension", formatNumber(readValue(risks, "hypertensionRisk"), 1), "%"],
    ["Diabetes", formatNumber(readValue(risks, "diabetesRisk"), 1), "%"],
    ["Waist-height", formatNumber(readValue(risks, "waistToHeightRatio"), 2), ""],
    ["Body fat", formatNumber(readValue(risks, "bodyFatPercentage"), 1), "%"],
    ["Body roundness", formatNumber(readValue(risks, "bodyRoundnessIndex"), 2), ""],
    ["A body shape", formatNumber(readValue(risks, "aBodyShapeIndex"), 3), ""],
    ["Conicity", formatNumber(readValue(risks, "conicityIndex"), 2), ""],
    ["BMR", formatNumber(readValue(risks, "basalMetabolicRate")), "kcal"],
    ["TDEE", formatNumber(readValue(risks, "totalDailyEnergyExpenditure")), "kcal"],
    ["NAFLD", formatEnumValue(NAFLDRisk, readValue(risks, "nonAlcoholicFattyLiverDiseaseRisk")), ""]
  ];
}

function qualityRows(results) {
  if (results == null) return [];
  const quality = readValue(results, "qualityMetrics");
  const rows = [
    ["Signal", readValue(results, "averageSignalQuality")],
    ["PPG", readValue(quality, "ppgQualityIndex")],
    ["BCG", readValue(quality, "bcgQualityIndex")],
    ["BP", readValue(quality, "bloodPressureQualityIndex")]
  ];
  return rows
    .filter(([label, value]) => label === "Signal" || value != null)
    .map(([label, value]) => [label, formatNumber(value, 1), normalizedQuality(value)]);
}

function renderQualityRows(container, empty, results) {
  const rows = qualityRows(results);
  container.replaceChildren();
  empty.hidden = rows.length > 0;
  if (rows.length === 0) return;
  for (const [label, value, progress] of rows) {
    const row = document.createElement("div");
    row.className = "quality-row";
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const track = document.createElement("div");
    track.className = "quality-track";
    if (progress == null) {
      track.classList.add("empty-track");
    } else {
      const fill = document.createElement("div");
      fill.className = "quality-fill";
      fill.style.width = `${progress * 100}%`;
      track.append(fill);
    }
    const valueEl = document.createElement("span");
    valueEl.className = "quality-value";
    valueEl.textContent = value;
    row.append(labelEl, track, valueEl);
    container.append(row);
  }
}

function isRunningMeasurementState(measurementState) {
  return (
    measurementState === MeasurementState.WAITING_FOR_FACE ||
    measurementState === MeasurementState.RUNNING_SIGNAL_SHORT ||
    measurementState === MeasurementState.RUNNING_SIGNAL_GOOD ||
    measurementState === MeasurementState.RUNNING_SIGNAL_BAD ||
    measurementState === MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE ||
    measurementState === MeasurementState.FINALIZING
  );
}

function statusText(measurementState, condition) {
  if (state.finished || measurementState === MeasurementState.FINISHED) return "Measurement finished";
  if (state.finalizing || measurementState === MeasurementState.FINALIZING) return "Finalizing";
  if (condition != null) return conditionInstruction(condition);
  switch (measurementState) {
    case MeasurementState.WAITING_FOR_FACE:
      return "Waiting for face";
    case MeasurementState.RUNNING_SIGNAL_SHORT:
    case MeasurementState.RUNNING_SIGNAL_GOOD:
    case MeasurementState.RUNNING_SIGNAL_BAD:
    case MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE:
      return "Measurement conditions are good";
    case MeasurementState.FAILED:
      return "Measurement failed";
    default:
      return "Ready";
  }
}

function conditionInstruction(condition) {
  switch (condition) {
    case MeasurementEnvironmentCondition.FACE_POSITION:
    case MeasurementEnvironmentCondition.FOREHEAD_VISIBLE:
      return "Uncover your forehead";
    case MeasurementEnvironmentCondition.GLASSES_NOT_DETECTED:
      return "Remove your glasses";
    case MeasurementEnvironmentCondition.SUFFICIENT_LIGHT_LEVEL:
      return "Move to brighter light";
    case MeasurementEnvironmentCondition.EVEN_LIGHTING:
      return "Use even lighting";
    case MeasurementEnvironmentCondition.NO_BACKLIGHT:
      return "Avoid backlight";
    case MeasurementEnvironmentCondition.FACE_STABLE:
      return "Keep your face still";
    case MeasurementEnvironmentCondition.DEVICE_STABLE:
      return "Keep the phone still";
    default:
      return "Measurement conditions need attention";
  }
}

function renderButtons() {
  const running = isRunningMeasurementState(state.measurementState) || state.running || state.finalizing;
  elements.startButton.disabled = !state.initialized || running;
  elements.stopButton.disabled = !state.initialized || !running;
  elements.seeResultsButton.hidden = !state.finished;
  elements.seeResultsButton.disabled = !state.finished || state.results == null;
}

async function setCameraForCurrentScreen() {
  if (!state.initialized) {
    setCameraActive(false);
    return;
  }
  const active = state.currentScreen === "measurement" && !document.hidden;
  setCameraActive(active);
  if (active) {
    await ShenaiSdkCapacitor.setCameraMode({ cameraMode: CameraMode.FACING_USER });
    updateCameraRect();
  } else {
    await hideNativeCameraView();
    await ShenaiSdkCapacitor.setCameraMode({ cameraMode: CameraMode.OFF });
    await ShenaiSdkCapacitor.setOverlaysWebview({ overlay: false }).catch(() => {});
  }
}

function showScreen(screen) {
  state.currentScreen = screen;
  elements.measurementScreen.hidden = screen !== "measurement";
  elements.profileScreen.hidden = screen !== "profile";
  elements.resultsScreen.hidden = screen !== "results";
  window.scrollTo(0, 0);
  setCameraForCurrentScreen().catch(console.error);
}

function openProfile() {
  state.profileReturnScreen = state.currentScreen === "results" ? "results" : "measurement";
  showScreen("profile");
}

function closeProfile() {
  showScreen(state.profileReturnScreen);
}

async function initializeSdk() {
  setMeasurementStatus("Initializing SDK...");
  if (!shenApiKey) {
    setMeasurementStatus(missingApiKeyMessage);
    elements.cameraPlaceholder.textContent = missingApiKeyMessage;
    renderButtons();
    return;
  }

  try {
    const result = await ShenaiSdkCapacitor.initialize({
      apiKey: shenApiKey,
      userId: "",
      settings: customUiSettings()
    });
    state.initialized = result.value === InitializationResult.OK;
    if (!state.initialized) {
      setMeasurementStatus(`Initialization failed: ${result.value}`);
      elements.cameraPlaceholder.textContent = `Initialization failed: ${result.value}`;
      renderButtons();
      return;
    }
    setMeasurementStatus("Ready");
    renderButtons();
    showScreen("measurement");
    startPolling();
    await poll();
  } catch (error) {
    setMeasurementStatus(`SDK error: ${error instanceof Error ? error.message : error}`);
    renderButtons();
  }
}

async function startMeasurement() {
  if (!state.initialized) return;
  state.resetting = true;
  resetMeasurementUiState();
  try {
    await ShenaiSdkCapacitor.resetMeasurementSession();
    await ShenaiSdkCapacitor.setOperatingMode({ operatingMode: OperatingMode.MEASURE });
    await ShenaiSdkCapacitor.setCameraMode({ cameraMode: CameraMode.FACING_USER });
    await ShenaiSdkCapacitor.startMeasurement();
    state.running = true;
    state.measurementState = MeasurementState.WAITING_FOR_FACE;
    setMeasurementStatus("Waiting for face");
    renderButtons();
    updateCameraRect();
  } finally {
    state.resetting = false;
  }
  await poll();
}

async function stopMeasurement() {
  if (!state.initialized) return;
  state.resetting = true;
  stopPolling();
  try {
    await ShenaiSdkCapacitor.resetMeasurementSession();
    await ShenaiSdkCapacitor.setCameraMode({ cameraMode: CameraMode.FACING_USER });
    resetMeasurementUiState();
    showScreen("measurement");
  } finally {
    state.resetting = false;
    startPolling();
  }
}

async function poll() {
  if (!state.initialized || state.resetting) return;
  const resetGeneration = state.resetGeneration;
  const [measurementState, progress, condition, realtime, results] = await Promise.all([
    ShenaiSdkCapacitor.getMeasurementState().then(response => response.value),
    ShenaiSdkCapacitor.getMeasurementProgressPercentage().then(response => response.value),
    ShenaiSdkCapacitor.getCurrentViolatedMeasurementEnvironmentCondition()
      .then(response => response.value ?? null)
      .catch(() => null),
    ShenaiSdkCapacitor.getRealtimeMetrics({ periodSec: 10 })
      .then(unwrap)
      .catch(() => null),
    ShenaiSdkCapacitor.getMeasurementResults()
      .then(unwrap)
      .catch(() => null)
  ]);
  if (resetGeneration !== state.resetGeneration || state.resetting) return;

  state.measurementState = measurementState;
  state.finalizing = measurementState === MeasurementState.FINALIZING || state.finalizing;
  state.running = isRunningMeasurementState(measurementState);
  state.violatedCondition = condition;
  if (measurementState === MeasurementState.FINISHED) {
    state.finished = true;
  }
  setProgress(progress ?? state.progress);
  setMeasurementStatus(statusText(measurementState, condition));

  const displayResults = state.finished ? (results ?? state.results) : realtime;
  if (state.finished && results != null) {
    state.results = results;
  }
  renderQualityRows(elements.qualityRows, elements.qualityEmpty, displayResults);
  renderGrid(elements.headlineGrid, headlineValues(displayResults));
  renderButtons();

  if (measurementState === MeasurementState.FINISHED && !state.resetting) {
    await completeMeasurement(results);
  }
}

function startPolling() {
  stopPolling();
  state.pollTimer = window.setInterval(() => {
    poll().catch(error => {
      setMeasurementStatus(`SDK error: ${error instanceof Error ? error.message : error}`);
    });
  }, pollIntervalMs);
}

function stopPolling() {
  if (state.pollTimer != null) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
}

async function completeMeasurement(results = null) {
  if (state.resetting || (state.finished && state.results != null && state.risks != null)) {
    return;
  }
  state.running = false;
  state.finalizing = false;
  state.finished = true;
  state.measurementState = MeasurementState.FINISHED;
  state.results = results ?? unwrap(await ShenaiSdkCapacitor.getMeasurementResults().catch(() => null));
  if (state.results != null) {
    state.risks = unwrap(
      await ShenaiSdkCapacitor.computeHealthRisks({ risksFactors: riskFactors(state.results) }).catch(() => null)
    );
  }
  state.violatedCondition = null;
  setMeasurementStatus("Measurement finished");
  renderQualityRows(elements.qualityRows, elements.qualityEmpty, state.results);
  renderGrid(elements.headlineGrid, headlineValues(state.results));
  renderButtons();
}

function resetMeasurementUiState() {
  state.resetGeneration += 1;
  state.running = false;
  state.finalizing = false;
  state.finished = false;
  state.violatedCondition = null;
  state.measurementState = null;
  state.results = null;
  state.risks = null;
  setProgress(0);
  setMeasurementStatus("Ready");
  renderQualityRows(elements.qualityRows, elements.qualityEmpty, null);
  renderQualityRows(elements.finalQualityRows, elements.finalQualityEmpty, null);
  renderGrid(elements.headlineGrid, headlineValues(null));
  renderGrid(elements.metricsGrid, measurementMetricValues(null));
  renderGrid(elements.risksGrid, riskValues(null));
  renderButtons();
}

function showResults() {
  if (!state.finished || state.results == null) return;
  renderQualityRows(elements.finalQualityRows, elements.finalQualityEmpty, state.results);
  renderGrid(elements.metricsGrid, measurementMetricValues(state.results));
  renderGrid(elements.risksGrid, riskValues(state.risks));
  showScreen("results");
}

async function updateRisksFromProfile() {
  if (state.results == null) return;
  state.risks = unwrap(await ShenaiSdkCapacitor.computeHealthRisks({ risksFactors: riskFactors(state.results) }));
  if (state.currentScreen === "results") {
    renderGrid(elements.risksGrid, riskValues(state.risks));
  }
}

function updateCameraRect() {
  if (!state.initialized || state.currentScreen !== "measurement") return;
  const rect = elements.cameraWindow.getBoundingClientRect();
  const styles = window.getComputedStyle(elements.cameraWindow);
  const border = Number.parseFloat(styles.borderTopWidth) || 0;
  const innerWidth = rect.width - border * 2;
  const innerHeight = rect.height - border * 2;
  const nativeHeight = innerWidth / (9 / 16);
  const nativeY = rect.top + border - (nativeHeight - innerHeight) / 2;
  document.documentElement.style.setProperty("--camera-hole-x", `${rect.left + rect.width / 2}px`);
  document.documentElement.style.setProperty("--camera-hole-y", `${rect.top + rect.height / 2}px`);
  document.documentElement.style.setProperty(
    "--camera-hole-r",
    `${Math.max(0, Math.min(innerWidth, innerHeight) / 2)}px`
  );
  ShenaiSdkCapacitor.setViewRect({
    x: rect.left + border,
    y: nativeY,
    width: innerWidth,
    height: nativeHeight
  }).catch(() => {});
  ShenaiSdkCapacitor.setOverlaysWebview({ overlay: false }).catch(() => {});
}

function hideNativeCameraView() {
  document.documentElement.style.setProperty("--camera-hole-r", "0px");
  return ShenaiSdkCapacitor.setViewRect({
    x: -10000,
    y: -10000,
    width: 1,
    height: 1
  }).catch(() => {});
}

function sdkEventName(event) {
  if (typeof event === "string") return event;
  return event?.EventName ?? event?.eventName ?? event?.name ?? event?.value ?? event?.event ?? null;
}

elements.profileButtons.forEach(button => button.addEventListener("click", openProfile));
elements.profileBackButton.addEventListener("click", closeProfile);
elements.resultsBackButton.addEventListener("click", () => showScreen("measurement"));
elements.startButton.addEventListener("click", () => startMeasurement().catch(console.error));
elements.stopButton.addEventListener("click", () => stopMeasurement().catch(console.error));
elements.seeResultsButton.addEventListener("click", showResults);
elements.riskForm.addEventListener("submit", event => {
  event.preventDefault();
  readProfileFromForm();
  updateRisksFromProfile().catch(console.error).finally(closeProfile);
});

window.addEventListener("resize", updateCameraRect);
window.addEventListener("orientationchange", () => window.setTimeout(updateCameraRect, 250));
window.addEventListener("scroll", updateCameraRect, { passive: true });
document.addEventListener("visibilitychange", () => {
  setCameraForCurrentScreen().catch(console.error);
});

ShenaiSdkCapacitor.addListener("ShenAIEvent", event => {
  if (sdkEventName(event) === "MEASUREMENT_FINISHED") {
    completeMeasurement().catch(console.error);
  }
});

populateForm();
resetMeasurementUiState();
initializeSdk();

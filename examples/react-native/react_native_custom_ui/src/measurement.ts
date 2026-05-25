import type {
  HealthRisks,
  MeasurementResults,
} from "react-native-shenai-sdk";

import {
  EnvironmentConditionValue,
  MeasurementStateValue,
} from "./constants";

export type TileValue = [label: string, value: string, unit?: string];

export function readValue(source: unknown, camelKey: string) {
  if (source == null || typeof source !== "object") {
    return null;
  }

  const record = source as Record<string, unknown>;
  const acronymKey = camelKey
    .replaceAll("Cv", "CV")
    .replaceAll("Cvd", "CVD");
  const snakeKey = camelKey.replace(/[A-Z]/g, letter => {
    return `_${letter.toLowerCase()}`;
  });

  for (const key of [camelKey, acronymKey, snakeKey]) {
    if (record[key] != null) {
      return record[key];
    }
  }
  return null;
}

export function readNumber(source: unknown, camelKey: string) {
  const value = readValue(source, camelKey);
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return value;
}

export function formatNumber(value: unknown, decimals = 0) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }
  return value.toFixed(decimals);
}

export function normalizedQuality(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return Math.max(0, Math.min(1, value <= 1 ? value : value / 100));
}

export function isRunningMeasurementState(state: number | null) {
  return (
    state === MeasurementStateValue.WAITING_FOR_FACE ||
    state === MeasurementStateValue.RUNNING_SIGNAL_SHORT ||
    state === MeasurementStateValue.RUNNING_SIGNAL_GOOD ||
    state === MeasurementStateValue.RUNNING_SIGNAL_BAD ||
    state === MeasurementStateValue.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE ||
    state === MeasurementStateValue.FINALIZING
  );
}

function conditionInstruction(condition: number | null) {
  switch (condition) {
    case EnvironmentConditionValue.FACE_POSITION:
    case EnvironmentConditionValue.FOREHEAD_VISIBLE:
      return "Uncover your forehead";
    case EnvironmentConditionValue.GLASSES_NOT_DETECTED:
      return "Remove your glasses";
    case EnvironmentConditionValue.SUFFICIENT_LIGHT_LEVEL:
      return "Move to brighter light";
    case EnvironmentConditionValue.EVEN_LIGHTING:
      return "Use even lighting";
    case EnvironmentConditionValue.NO_BACKLIGHT:
      return "Avoid backlight";
    case EnvironmentConditionValue.FACE_STABLE:
      return "Keep your face still";
    case EnvironmentConditionValue.DEVICE_STABLE:
      return "Keep the phone still";
    default:
      return "Measurement conditions need attention";
  }
}

export function measurementStatusText(
  measurementState: number | null,
  condition: number | null,
  hasReachedFinalizing: boolean,
  hasFinishedMeasurement: boolean,
) {
  if (
    hasFinishedMeasurement ||
    measurementState === MeasurementStateValue.FINISHED
  ) {
    return "Measurement finished";
  }
  if (
    hasReachedFinalizing ||
    measurementState === MeasurementStateValue.FINALIZING
  ) {
    return "Finalizing";
  }
  if (condition != null) {
    return conditionInstruction(condition);
  }
  switch (measurementState) {
    case MeasurementStateValue.WAITING_FOR_FACE:
      return "Waiting for face";
    case MeasurementStateValue.RUNNING_SIGNAL_SHORT:
    case MeasurementStateValue.RUNNING_SIGNAL_GOOD:
    case MeasurementStateValue.RUNNING_SIGNAL_BAD:
    case MeasurementStateValue.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE:
      return "Measurement conditions are good";
    case MeasurementStateValue.FAILED:
      return "Measurement failed";
    default:
      return "Ready";
  }
}

export function measurementMetricValues(
  results: MeasurementResults | null,
): TileValue[] {
  const quality = readValue(results, "qualityMetrics");
  const heartbeats = readValue(results, "heartbeats");
  return [
    ["Heart rate", formatNumber(readNumber(results, "heartRateBpm")), "bpm"],
    ["HRV SDNN", formatNumber(readNumber(results, "hrvSdnnMs"), 1), "ms"],
    ["HRV lnRMSSD", formatNumber(readNumber(results, "hrvLnrmssdMs"), 2), "ms"],
    ["Cardiac stress", formatNumber(readNumber(results, "stressIndex"), 1)],
    [
      "PNS activity",
      formatNumber(readNumber(results, "parasympatheticActivity"), 1),
    ],
    ["Breathing", formatNumber(readNumber(results, "breathingRateBpm"), 1), "brpm"],
    [
      "Systolic",
      formatNumber(readNumber(results, "systolicBloodPressureMmhg")),
      "mmHg",
    ],
    [
      "Diastolic",
      formatNumber(readNumber(results, "diastolicBloodPressureMmhg")),
      "mmHg",
    ],
    [
      "Workload",
      formatNumber(readNumber(results, "cardiacWorkloadMmhgPerSec"), 1),
      "mmHg/s",
    ],
    ["Age", formatNumber(readNumber(results, "ageYears")), "years"],
    ["BMI", formatNumber(readNumber(results, "bmiKgPerM2"), 1), "kg/m2"],
    ["Weight", formatNumber(readNumber(results, "weightKg"), 1), "kg"],
    ["Height", formatNumber(readNumber(results, "heightCm"), 1), "cm"],
    ["Signal", formatNumber(readNumber(results, "averageSignalQuality"), 1), "dB"],
    ["PPG quality", formatNumber(readNumber(quality, "ppgQualityIndex"), 1)],
    ["BCG quality", formatNumber(readNumber(quality, "bcgQualityIndex"), 1)],
    [
      "BP quality",
      formatNumber(readNumber(quality, "bloodPressureQualityIndex"), 1),
    ],
    [
      "SBP median error",
      formatNumber(readNumber(quality, "expectedSbpMedianAbsErrorMmhg"), 1),
      "mmHg",
    ],
    [
      "DBP median error",
      formatNumber(readNumber(quality, "expectedDbpMedianAbsErrorMmhg"), 1),
      "mmHg",
    ],
    ["Heartbeats", Array.isArray(heartbeats) ? String(heartbeats.length) : "--"],
  ];
}

export function headlineValues(results: MeasurementResults | null): TileValue[] {
  return [
    ["HR", formatNumber(readNumber(results, "heartRateBpm")), "bpm"],
    ["SBP", formatNumber(readNumber(results, "systolicBloodPressureMmhg")), "mmHg"],
    ["DBP", formatNumber(readNumber(results, "diastolicBloodPressureMmhg")), "mmHg"],
    ["BR", formatNumber(readNumber(results, "breathingRateBpm"), 1), "brpm"],
  ];
}

export function healthRiskValues(risks: HealthRisks | null): TileValue[] {
  const hard = readValue(risks, "hardAndFatalEvents");
  const cv = readValue(risks, "cvDiseases");
  const scores = readValue(risks, "scores");
  return [
    ["Wellness", formatNumber(readNumber(risks, "wellnessScore"), 1)],
    ["Vascular age", formatNumber(readNumber(risks, "vascularAge")), "years"],
    ["CVD risk", formatNumber(readNumber(cv, "overallRisk"), 1), "%"],
    [
      "Coronary disease",
      formatNumber(readNumber(cv, "coronaryHeartDiseaseRisk"), 1),
      "%",
    ],
    ["Stroke risk", formatNumber(readNumber(cv, "strokeRisk"), 1), "%"],
    ["Heart failure", formatNumber(readNumber(cv, "heartFailureRisk"), 1), "%"],
    ["Hard CV", formatNumber(readNumber(hard, "hardCvEventRisk"), 1), "%"],
    [
      "Coronary death",
      formatNumber(readNumber(hard, "coronaryDeathEventRisk"), 1),
      "%",
    ],
    ["Fatal stroke", formatNumber(readNumber(hard, "fatalStrokeEventRisk"), 1), "%"],
    ["CV mortality", formatNumber(readNumber(hard, "totalCvMortalityRisk"), 1), "%"],
    ["Risk score", formatNumber(readNumber(scores, "totalScore"))],
    ["Hypertension", formatNumber(readNumber(risks, "hypertensionRisk"), 1), "%"],
    ["Diabetes", formatNumber(readNumber(risks, "diabetesRisk"), 1), "%"],
    ["Waist-height", formatNumber(readNumber(risks, "waistToHeightRatio"), 2)],
    ["Body fat", formatNumber(readNumber(risks, "bodyFatPercentage"), 1), "%"],
    ["BMR", formatNumber(readNumber(risks, "basalMetabolicRate")), "kcal"],
    [
      "TDEE",
      formatNumber(readNumber(risks, "totalDailyEnergyExpenditure")),
      "kcal",
    ],
  ];
}

export function qualityRows(results: MeasurementResults | null) {
  const quality = readValue(results, "qualityMetrics");
  return [
    ["Signal", readNumber(results, "averageSignalQuality")],
    ["PPG", readNumber(quality, "ppgQualityIndex")],
    ["BCG", readNumber(quality, "bcgQualityIndex")],
    ["BP", readNumber(quality, "bloodPressureQualityIndex")],
  ].filter(([label, value]) => label === "Signal" || value != null);
}

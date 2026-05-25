import type {
  MeasurementResults,
  RisksFactors,
} from "react-native-shenai-sdk";

import {RiskFactorValue, SettingsValue} from "./constants";
import {readNumber} from "./measurement";

export type Profile = {
  age: number;
  bodyHeight: number;
  bodyWeight: number;
  waistCircumference: number;
  neckCircumference: number;
  hipCircumference: number;
  cholesterol: number;
  cholesterolHdl: number;
  triglyceride: number;
  fastingGlucose: number;
  sbp: number;
  dbp: number;
  isSmoker: boolean;
  hypertensionTreatment: number;
  hasDiabetes: boolean;
  gender: number;
  physicalActivity: number;
  country: string;
  race: number;
  vegetableFruitDiet: boolean;
  historyOfHighGlucose: boolean;
  historyOfHypertension: boolean;
  familyDiabetes: number;
  parentalHypertension: number;
};

export type Choice = {label: string; value: number};

export const defaultProfile: Profile = {
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
  hypertensionTreatment: RiskFactorValue.HYPERTENSION_TREATMENT_NO,
  hasDiabetes: false,
  gender: RiskFactorValue.GENDER_FEMALE,
  physicalActivity: RiskFactorValue.PHYSICAL_ACTIVITY_MODERATELY,
  country: "US",
  race: RiskFactorValue.RACE_WHITE,
  vegetableFruitDiet: true,
  historyOfHighGlucose: false,
  historyOfHypertension: false,
  familyDiabetes: RiskFactorValue.FAMILY_HISTORY_NONE_FIRST_DEGREE,
  parentalHypertension: RiskFactorValue.PARENTAL_HISTORY_NONE,
};

export const genderChoices: Choice[] = [
  {label: "Female", value: RiskFactorValue.GENDER_FEMALE},
  {label: "Male", value: RiskFactorValue.GENDER_MALE},
  {label: "Other", value: RiskFactorValue.GENDER_OTHER},
];

export const activityChoices: Choice[] = [
  {label: "Sedentary", value: RiskFactorValue.PHYSICAL_ACTIVITY_SEDENTARY},
  {label: "Light", value: RiskFactorValue.PHYSICAL_ACTIVITY_LIGHTLY_ACTIVE},
  {label: "Moderate", value: RiskFactorValue.PHYSICAL_ACTIVITY_MODERATELY},
  {label: "Very", value: RiskFactorValue.PHYSICAL_ACTIVITY_VERY_ACTIVE},
  {label: "Extra", value: RiskFactorValue.PHYSICAL_ACTIVITY_EXTRA_ACTIVE},
];

export const raceChoices: Choice[] = [
  {label: "White", value: RiskFactorValue.RACE_WHITE},
  {label: "African-American", value: RiskFactorValue.RACE_AFRICAN_AMERICAN},
  {label: "Other", value: RiskFactorValue.RACE_OTHER},
];

export const treatmentChoices: Choice[] = [
  {label: "Not needed", value: RiskFactorValue.HYPERTENSION_TREATMENT_NOT_NEEDED},
  {label: "No", value: RiskFactorValue.HYPERTENSION_TREATMENT_NO},
  {label: "Yes", value: RiskFactorValue.HYPERTENSION_TREATMENT_YES},
];

export const familyChoices: Choice[] = [
  {label: "None", value: RiskFactorValue.FAMILY_HISTORY_NONE},
  {
    label: "No first-degree",
    value: RiskFactorValue.FAMILY_HISTORY_NONE_FIRST_DEGREE,
  },
  {label: "First-degree", value: RiskFactorValue.FAMILY_HISTORY_FIRST_DEGREE},
];

export const parentChoices: Choice[] = [
  {label: "None", value: RiskFactorValue.PARENTAL_HISTORY_NONE},
  {label: "One", value: RiskFactorValue.PARENTAL_HISTORY_ONE},
  {label: "Both", value: RiskFactorValue.PARENTAL_HISTORY_BOTH},
];

export function customUiSettings(profile: Profile) {
  return {
    precisionMode: SettingsValue.PRECISION_MODE_RELAXED,
    operatingMode: SettingsValue.OPERATING_MODE_MEASURE,
    measurementPreset:
      SettingsValue.MEASUREMENT_PRESET_THIRTY_SECONDS_ALL_METRICS,
    cameraMode: SettingsValue.CAMERA_MODE_FACING_USER,
    onboardingMode: SettingsValue.ONBOARDING_MODE_HIDDEN,
    showUserInterface: false,
    showFacePositioningOverlay: false,
    showVisualWarnings: false,
    enableCameraSwap: false,
    showFaceMask: false,
    showBloodFlow: false,
    hideShenaiLogo: true,
    enableStartAfterSuccess: false,
    enableSummaryScreen: false,
    showResultsFinishButton: false,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: false,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: false,
    applyPrecisionModeToBloodPressure: false,
    showSignalQualityIndicator: false,
    showSignalTile: false,
    showStartStopButton: false,
    showInfoButton: false,
    showDisclaimer: false,
    uiVersion: SettingsValue.UI_VERSION_V2,
    risksFactors: buildRiskFactors(profile),
  };
}

export function buildRiskFactors(
  profile: Profile,
  results?: MeasurementResults | null,
): RisksFactors {
  return {
    age: profile.age,
    cholesterol: profile.cholesterol,
    cholesterolHdl: profile.cholesterolHdl,
    sbp: readNumber(results, "systolicBloodPressureMmhg") ?? profile.sbp,
    dbp: readNumber(results, "diastolicBloodPressureMmhg") ?? profile.dbp,
    isSmoker: profile.isSmoker,
    hypertensionTreatment: profile.hypertensionTreatment,
    hasDiabetes: profile.hasDiabetes,
    bodyHeight: profile.bodyHeight,
    bodyWeight: profile.bodyWeight,
    waistCircumference: profile.waistCircumference,
    neckCircumference: profile.neckCircumference,
    hipCircumference: profile.hipCircumference,
    gender: profile.gender,
    physicalActivity: profile.physicalActivity,
    country: profile.country,
    race: profile.race,
    vegetableFruitDiet: profile.vegetableFruitDiet,
    historyOfHighGlucose: profile.historyOfHighGlucose,
    historyOfHypertension: profile.historyOfHypertension,
    triglyceride: profile.triglyceride,
    fastingGlucose: profile.fastingGlucose,
    familyDiabetes: profile.familyDiabetes,
    parentalHypertension: profile.parentalHypertension,
  } as RisksFactors;
}

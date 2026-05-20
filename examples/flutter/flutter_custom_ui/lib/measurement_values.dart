import 'package:shenai_sdk/pigeon.dart';

import 'models/display_value.dart';
import 'utils/formatters.dart';

List<DisplayValue> measurementMetricValues(MeasurementResults? results) {
  final quality = results?.quality_metrics;
  return [
    DisplayValue('Heart rate', formatNumber(results?.heart_rate_bpm), 'bpm'),
    DisplayValue(
      'HRV SDNN',
      formatNumber(results?.hrv_sdnn_ms, decimals: 1),
      'ms',
    ),
    DisplayValue(
      'HRV lnRMSSD',
      formatNumber(results?.hrv_lnrmssd_ms, decimals: 2),
      'ms',
    ),
    DisplayValue(
      'Cardiac stress',
      formatNumber(results?.stress_index, decimals: 1),
      '',
    ),
    DisplayValue(
      'PNS activity',
      formatNumber(results?.parasympathetic_activity, decimals: 1),
      '',
    ),
    DisplayValue(
      'Breathing',
      formatNumber(results?.breathing_rate_bpm, decimals: 1),
      'brpm',
    ),
    DisplayValue(
      'Systolic',
      formatNumber(results?.systolic_blood_pressure_mmhg),
      'mmHg',
    ),
    DisplayValue(
      'Diastolic',
      formatNumber(results?.diastolic_blood_pressure_mmhg),
      'mmHg',
    ),
    DisplayValue(
      'Workload',
      formatNumber(results?.cardiac_workload_mmhg_per_sec, decimals: 1),
      'mmHg/s',
    ),
    DisplayValue('Age', formatNumber(results?.age_years), 'years'),
    DisplayValue(
      'BMI',
      formatNumber(results?.bmi_kg_per_m2, decimals: 1),
      'kg/m2',
    ),
    DisplayValue('BMI category', formatEnum(results?.bmi_category), ''),
    DisplayValue('Weight', formatNumber(results?.weight_kg, decimals: 1), 'kg'),
    DisplayValue('Height', formatNumber(results?.height_cm, decimals: 1), 'cm'),
    DisplayValue('BP scale', formatBpScale(results), ''),
    DisplayValue(
      'Signal',
      formatNumber(results?.average_signal_quality, decimals: 1),
      'dB',
    ),
    DisplayValue(
      'PPG quality',
      formatNumber(quality?.ppg_quality_index, decimals: 1),
      '',
    ),
    DisplayValue(
      'BCG quality',
      formatNumber(quality?.bcg_quality_index, decimals: 1),
      '',
    ),
    DisplayValue(
      'BP quality',
      formatNumber(quality?.blood_pressure_quality_index, decimals: 1),
      '',
    ),
    DisplayValue(
      'SBP median error',
      formatNumber(quality?.expected_sbp_median_abs_error_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'SBP p80 error',
      formatNumber(quality?.expected_sbp_p80_abs_error_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'SBP mean error',
      formatNumber(quality?.expected_sbp_mean_abs_error_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'SBP balanced MAE',
      formatNumber(quality?.expected_sbp_balanced_mae_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'DBP median error',
      formatNumber(quality?.expected_dbp_median_abs_error_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'DBP p80 error',
      formatNumber(quality?.expected_dbp_p80_abs_error_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'DBP mean error',
      formatNumber(quality?.expected_dbp_mean_abs_error_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue(
      'DBP balanced MAE',
      formatNumber(quality?.expected_dbp_balanced_mae_mmhg, decimals: 1),
      'mmHg',
    ),
    DisplayValue('Heartbeats', '${results?.heartbeats.length ?? '-'}', ''),
  ];
}

List<DisplayValue> healthRiskValues(HealthRisks? risks) {
  return [
    DisplayValue(
      'Wellness',
      formatNumber(risks?.wellnessScore, decimals: 1),
      '',
    ),
    DisplayValue('Vascular age', formatNumber(risks?.vascularAge), 'years'),
    DisplayValue(
      'CVD risk',
      formatNumber(risks?.cvDiseases.overallRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Coronary disease',
      formatNumber(risks?.cvDiseases.coronaryHeartDiseaseRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Stroke risk',
      formatNumber(risks?.cvDiseases.strokeRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Heart failure',
      formatNumber(risks?.cvDiseases.heartFailureRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Peripheral vascular',
      formatNumber(
        risks?.cvDiseases.peripheralVascularDiseaseRisk,
        decimals: 1,
      ),
      '%',
    ),
    DisplayValue(
      'Hard CV',
      formatNumber(risks?.hardAndFatalEvents.hardCVEventRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Coronary death',
      formatNumber(
        risks?.hardAndFatalEvents.coronaryDeathEventRisk,
        decimals: 1,
      ),
      '%',
    ),
    DisplayValue(
      'Fatal stroke',
      formatNumber(risks?.hardAndFatalEvents.fatalStrokeEventRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'CV mortality',
      formatNumber(risks?.hardAndFatalEvents.totalCVMortalityRisk, decimals: 1),
      '%',
    ),
    DisplayValue('Risk score', formatNumber(risks?.scores.totalScore), ''),
    DisplayValue('Age score', formatNumber(risks?.scores.ageScore), ''),
    DisplayValue('SBP score', formatNumber(risks?.scores.sbpScore), ''),
    DisplayValue('Smoking score', formatNumber(risks?.scores.smokingScore), ''),
    DisplayValue(
      'Diabetes score',
      formatNumber(risks?.scores.diabetesScore),
      '',
    ),
    DisplayValue('BMI score', formatNumber(risks?.scores.bmiScore), ''),
    DisplayValue(
      'Cholesterol score',
      formatNumber(risks?.scores.cholesterolScore),
      '',
    ),
    DisplayValue(
      'HDL score',
      formatNumber(risks?.scores.cholesterolHdlScore),
      '',
    ),
    DisplayValue(
      'Hypertension',
      formatNumber(risks?.hypertensionRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Diabetes',
      formatNumber(risks?.diabetesRisk, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Waist-height',
      formatNumber(risks?.waistToHeightRatio, decimals: 2),
      '',
    ),
    DisplayValue(
      'Body fat',
      formatNumber(risks?.bodyFatPercentage, decimals: 1),
      '%',
    ),
    DisplayValue(
      'Body roundness',
      formatNumber(risks?.bodyRoundnessIndex, decimals: 2),
      '',
    ),
    DisplayValue(
      'A body shape',
      formatNumber(risks?.aBodyShapeIndex, decimals: 3),
      '',
    ),
    DisplayValue(
      'Conicity',
      formatNumber(risks?.conicityIndex, decimals: 2),
      '',
    ),
    DisplayValue('BMR', formatNumber(risks?.basalMetabolicRate), 'kcal'),
    DisplayValue(
      'TDEE',
      formatNumber(risks?.totalDailyEnergyExpenditure),
      'kcal',
    ),
    DisplayValue(
      'NAFLD',
      formatEnum(risks?.nonAlcoholicFattyLiverDiseaseRisk),
      '',
    ),
  ];
}

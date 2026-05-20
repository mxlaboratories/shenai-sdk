import 'package:shenai_sdk/pigeon.dart';

class RiskProfile {
  const RiskProfile({
    required this.age,
    required this.heightCm,
    required this.weightKg,
    required this.waistCm,
    required this.cholesterol,
    required this.hdl,
    required this.sbp,
    required this.dbp,
    required this.isSmoker,
    required this.hypertensionTreatment,
    required this.hasDiabetes,
    required this.gender,
    required this.neckCm,
    required this.hipCm,
    required this.physicalActivity,
    required this.country,
    required this.race,
    required this.vegetableFruitDiet,
    required this.historyOfHighGlucose,
    required this.historyOfHypertension,
    required this.triglyceride,
    required this.fastingGlucose,
    required this.familyDiabetes,
    required this.parentalHypertension,
  });

  factory RiskProfile.defaults() {
    return const RiskProfile(
      age: 45,
      heightCm: 172,
      weightKg: 74,
      waistCm: 84,
      cholesterol: 190,
      hdl: 52,
      sbp: 128,
      dbp: 82,
      isSmoker: false,
      hypertensionTreatment: HypertensionTreatment.no,
      hasDiabetes: false,
      gender: Gender.female,
      neckCm: 38,
      hipCm: 98,
      physicalActivity: PhysicalActivity.moderately,
      country: 'US',
      race: Race.white,
      vegetableFruitDiet: true,
      historyOfHighGlucose: false,
      historyOfHypertension: false,
      triglyceride: 120,
      fastingGlucose: 92,
      familyDiabetes: FamilyHistory.noneFirstDegree,
      parentalHypertension: ParentalHistory.none,
    );
  }

  final int age;
  final double heightCm;
  final double weightKg;
  final double waistCm;
  final double cholesterol;
  final double hdl;
  final double sbp;
  final double dbp;
  final bool isSmoker;
  final HypertensionTreatment hypertensionTreatment;
  final bool hasDiabetes;
  final Gender gender;
  final double neckCm;
  final double hipCm;
  final PhysicalActivity physicalActivity;
  final String country;
  final Race race;
  final bool vegetableFruitDiet;
  final bool historyOfHighGlucose;
  final bool historyOfHypertension;
  final double triglyceride;
  final double fastingGlucose;
  final FamilyHistory familyDiabetes;
  final ParentalHistory parentalHypertension;

  RisksFactors toRisksFactors({MeasurementResults? results}) {
    return RisksFactors(
      age: age,
      cholesterol: cholesterol,
      cholesterolHdl: hdl,
      sbp: results?.systolic_blood_pressure_mmhg ?? sbp,
      dbp: results?.diastolic_blood_pressure_mmhg ?? dbp,
      isSmoker: isSmoker,
      hypertensionTreatment: hypertensionTreatment,
      hasDiabetes: hasDiabetes,
      bodyHeight: heightCm,
      bodyWeight: weightKg,
      waistCircumference: waistCm,
      neckCircumference: neckCm,
      hipCircumference: hipCm,
      gender: gender,
      physicalActivity: physicalActivity,
      country: country,
      race: race,
      vegetableFruitDiet: vegetableFruitDiet,
      historyOfHighGlucose: historyOfHighGlucose,
      historyOfHypertension: historyOfHypertension,
      triglyceride: triglyceride,
      fastingGlucose: fastingGlucose,
      familyDiabetes: familyDiabetes,
      parentalHypertension: parentalHypertension,
    );
  }
}

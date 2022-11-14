class HealthRisksModel {
  final int? ageScore;
  final int? sbpScore;
  final int? smokingScore;
  final int? diabetesScore;
  final int? bmiScore;
  final int? cholesterolScore;
  final int? cholesterolHdlScore;
  final int? totalScore;
  final int? vascularAge;
  final double? overallRisk;
  final double? coronaryHeartDiseaseRisk;
  final double? strokeRisk;
  final double? heartFailureRisk;
  final double? peripheralVascularDiseaseRisk;
  final double? coronaryDeathEventRisk;
  final double? fatalStrokeEventRisk;
  final double? totalCVMortalityRisk;
  final double? hardCVEventRisk;

  HealthRisksModel({
    this.ageScore,
    this.sbpScore,
    this.smokingScore,
    this.diabetesScore,
    this.bmiScore,
    this.cholesterolScore,
    this.cholesterolHdlScore,
    this.totalScore,
    this.vascularAge,
    this.overallRisk,
    this.coronaryHeartDiseaseRisk,
    this.strokeRisk,
    this.heartFailureRisk,
    this.peripheralVascularDiseaseRisk,
    this.coronaryDeathEventRisk,
    this.fatalStrokeEventRisk,
    this.totalCVMortalityRisk,
    this.hardCVEventRisk,
});
}

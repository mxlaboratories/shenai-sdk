import 'package:shenai_sdk_example/domain/risks/health_risk_factor.dart';
import 'package:shenai_sdk_example/domain/risks/health_risks_events_service.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks_result_model.dart';
import 'package:shenai_sdk_flutter/domain/enums.dart';
import 'package:shenai_sdk_flutter/domain/models.dart';
import 'package:shenai_sdk_flutter/shenai_sdk_flutter.dart';

class ShenAiHealthRisksEventService implements HealthRisksEventsService {
  @override
  HealthRisksResultModel getHealthRisks(HealthRiskFactor healthRiskFactor) {

    final RisksFactors healthRisksFactors = RisksFactors(
      age: healthRiskFactor.age,
      bodyHeight: healthRiskFactor.bodyHeight,
      bodyWeight: healthRiskFactor.bodyWeight,
      cholesterol: healthRiskFactor.cholesterol,
      cholesterolHdl: healthRiskFactor.cholesterolHdl,
      country: healthRiskFactor.country,
      gender: _mapGender(healthRiskFactor.gender),
      hasDiabetes: healthRiskFactor.hasDiabetes ?? false,
      isSmoker: healthRiskFactor.isSmoker ?? false,
      hypertensionTreatment: healthRiskFactor.hypertensionTreatment ?? false,
      race: _mapRace(healthRiskFactor.race),
      sbp: healthRiskFactor.sbp,
    );
    final HealthRisks healthRisks = ShenaiSdk.computeHealthRisks(healthRisksFactors);
    final HealthRisks maximalHealthRisks = ShenaiSdk.getMaximalHealthRisks(healthRisksFactors);
    final HealthRisks minimalHealthRisks = ShenaiSdk.getMinimalHealthRisks(healthRisksFactors);
    return HealthRisksResultModel(
      healthRisks: _buildHealthRisk(healthRisks),
      maxHealthRisks: _buildHealthRisk(maximalHealthRisks),
      minHealthRisks: _buildHealthRisk(minimalHealthRisks),
    );
  }

  HealthRisksModel _buildHealthRisk(HealthRisks? risk) {
    return HealthRisksModel(
      ageScore: risk?.scores?.ageScore,
      bmiScore: risk?.scores?.bmiScore,
      cholesterolHdlScore: risk?.scores?.cholesterolHdlScore,
      cholesterolScore: risk?.scores?.cholesterolScore,
      diabetesScore: risk?.scores?.diabetesScore,
      sbpScore: risk?.scores?.sbpScore,
      smokingScore: risk?.scores?.smokingScore,
      totalScore: risk?.scores?.totalScore,
      coronaryDeathEventRisk: risk?.hardAndFatalEventsRisks?.coronaryDeathEventRisk,
      coronaryHeartDiseaseRisk: risk?.cvDiseases?.coronaryHeartDiseaseRisk,
      fatalStrokeEventRisk: risk?.hardAndFatalEventsRisks?.fatalStrokeEventRisk,
      hardCVEventRisk: risk?.hardAndFatalEventsRisks?.hardCVEventRisk,
      heartFailureRisk: risk?.cvDiseases?.heartFailureRisk,
      overallRisk: risk?.cvDiseases?.overallRisk,
      peripheralVascularDiseaseRisk: risk?.cvDiseases?.peripheralVascularDiseaseRisk,
      strokeRisk: risk?.cvDiseases?.strokeRisk,
      totalCVMortalityRisk: risk?.hardAndFatalEventsRisks?.totalCVMortalityRisk,
      vascularAge: risk?.vascularAge,
    );
  }

  Race? _mapRace(UserRace? userRace) {
    if (userRace != null) {
      switch(userRace) {
        case UserRace.white:
          return Race.WHITE;
        case UserRace.africanAmerican:
          return Race.AFRICAN_AMERICAN;
        case UserRace.other:
          return Race.OTHER;
      }
    }
    return null;
  }

  Gender? _mapGender(UserGender? userGender) {
    if (userGender != null) {
      switch(userGender) {
        case UserGender.male:
          return Gender.MALE;
        case UserGender.female:
          return Gender.FEMALE;
        case UserGender.other:
          return Gender.OTHER;
      }
    }
    return null;
  }
}

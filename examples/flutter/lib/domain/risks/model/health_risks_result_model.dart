import 'package:shenai_sdk_example/domain/risks/model/health_risks.dart';

class HealthRisksResultModel {
 final HealthRisksModel? healthRisks;
 final HealthRisksModel? minHealthRisks;
 final HealthRisksModel? maxHealthRisks;

  HealthRisksResultModel({this.healthRisks, this.minHealthRisks, this.maxHealthRisks});
}

import 'package:shenai_sdk_example/domain/risks/health_risk_factor.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks_result_model.dart';

abstract class HealthRisksEventsService {
  HealthRisksResultModel getHealthRisks(HealthRiskFactor healthRiskFactor);
}

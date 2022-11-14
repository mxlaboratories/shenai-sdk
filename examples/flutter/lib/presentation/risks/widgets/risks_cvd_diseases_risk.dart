import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks.dart';

class RisksCVDiseasesTile extends StatelessWidget {
  final HealthRisksModel? healthRisks;

  const RisksCVDiseasesTile(this.healthRisks, {super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(ConstantsValues.cardiovascularDiseases, style: Theme.of(context).textTheme.headline6),
        if (!(healthRisks?.overallRisk?.isNaN ?? false))
          Text("${ConstantsValues.overallScore}: "
              "${(healthRisks?.overallRisk ?? 0).toStringAsFixed(2)}%"),
        if (!(healthRisks?.coronaryHeartDiseaseRisk?.isNaN ?? false))
          Text("${ConstantsValues.coronaryHeartDisease}: "
              "${healthRisks?.coronaryHeartDiseaseRisk?.toStringAsFixed(2)}%"),
        if (!(healthRisks?.strokeRisk?.isNaN ?? false))
          Text("${ConstantsValues.stroke}: "
              "${healthRisks?.strokeRisk?.toStringAsFixed(2)}%"),
        if (!(healthRisks?.heartFailureRisk?.isNaN ?? false))
          Text("${ConstantsValues.heartFailure}: "
              "${healthRisks?.heartFailureRisk?.toStringAsFixed(2)}%"),
        if (!(healthRisks?.peripheralVascularDiseaseRisk?.isNaN ?? false))
          Text("${ConstantsValues.peripheralVascularDisease}: "
              "${healthRisks?.peripheralVascularDiseaseRisk?.toStringAsFixed(2)}%"),
      ],
    );
  }
}

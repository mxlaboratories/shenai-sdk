import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks_result_model.dart';

class RisksTotalScore extends StatelessWidget {
  final HealthRisksResultModel healthRisksValues;

  const RisksTotalScore(this.healthRisksValues, {super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(ConstantsValues.riskScore, style: Theme.of(context).textTheme.headline6),
        Text("${ConstantsValues.overallScore}: ${healthRisksValues.healthRisks?.totalScore}/"
            "${healthRisksValues.maxHealthRisks?.totalScore}"),
        Text("${ConstantsValues.age}: ${healthRisksValues.healthRisks?.ageScore}/"
            "${healthRisksValues.maxHealthRisks?.ageScore}"),
        Text("${ConstantsValues.totalCholesterol}: ${healthRisksValues.healthRisks?.cholesterolScore}/"
            "${healthRisksValues.maxHealthRisks?.cholesterolScore}"),
        Text("${ConstantsValues.hdl}: ${healthRisksValues.healthRisks?.cholesterolHdlScore}/"
            "${healthRisksValues.maxHealthRisks?.cholesterolHdlScore}"),
        Text("${ConstantsValues.bmi}: ${healthRisksValues.healthRisks?.bmiScore}/"
            "${healthRisksValues.maxHealthRisks?.bmiScore}"),
        Text("${ConstantsValues.systolicBloodPressure}: ${healthRisksValues.healthRisks?.sbpScore}/"
            "${healthRisksValues.maxHealthRisks?.sbpScore}"),
        Text("${ConstantsValues.smoking}: ${healthRisksValues.healthRisks?.smokingScore}/"
            "${healthRisksValues.maxHealthRisks?.smokingScore}"),
        Text("${ConstantsValues.diabetes}: ${healthRisksValues.healthRisks?.diabetesScore}/"
            "${healthRisksValues.maxHealthRisks?.diabetesScore}"),
      ],
    );
  }
}

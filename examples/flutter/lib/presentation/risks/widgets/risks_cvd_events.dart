import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks.dart';

class RisksCVDEvents extends StatelessWidget {
  final HealthRisksModel? healthRisks;

  const RisksCVDEvents(this.healthRisks, {super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(ConstantsValues.cardioVascularEvents, style: Theme.of(context).textTheme.headline6),
        if (!(healthRisks?.hardCVEventRisk?.isNaN ?? false))
          Text("${ConstantsValues.hardEvents}: ${healthRisks?.hardCVEventRisk?.toStringAsFixed(2)}%"),
        if (!(healthRisks?.coronaryDeathEventRisk?.isNaN ?? false))
          Text("${ConstantsValues.coronaryDeath}: ${healthRisks?.coronaryDeathEventRisk?.toStringAsFixed(2)}%"),
        if (!(healthRisks?.fatalStrokeEventRisk?.isNaN ?? false))
          Text("${ConstantsValues.fatalStroke}: ${healthRisks?.fatalStrokeEventRisk?.toStringAsFixed(2)}%"),
        if (!(healthRisks?.totalCVMortalityRisk?.isNaN ?? false))
          Text("${ConstantsValues.totalCardiovascular}: ${healthRisks?.totalCVMortalityRisk?.toStringAsFixed(2)}%"),
      ],
    );
  }
}

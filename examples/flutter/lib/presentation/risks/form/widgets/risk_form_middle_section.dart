import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/risks/health_risk_factor.dart';
import 'package:shenai_sdk_example/extensions/context_extension.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class RiskFormMiddleSection extends StatelessWidget {
  final HealthRiskFactor healthRiskFactor;
  final Function(HealthRiskFactor) onChanged;

  const RiskFormMiddleSection({super.key, required this.healthRiskFactor, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(ConstantsValues.currentSmoker, style: context.typo.body2),
            Switch(
              value: healthRiskFactor.isSmoker ?? false,
              onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(isSmoker: value)),
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(ConstantsValues.hypertensionTreatment, style: context.typo.body2),
            Switch(
              value: healthRiskFactor.hypertensionTreatment ?? false,
              onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(hypertensionTreatment: value)),
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(ConstantsValues.diabetes, style: context.typo.body2),
            Switch(
              value: healthRiskFactor.hasDiabetes ?? false,
              onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(hasDiabetes: value)),
            ),
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(ConstantsValues.gender, style: context.typo.body2),
            DropdownButton(
              value: healthRiskFactor.gender,
              items: UserGender.values.map((e) => DropdownMenuItem(value: e, child: Text(e.value))).toList(),
              onChanged: (UserGender? value) => onChanged.call(healthRiskFactor.copyWith(gender: value)),
            )
          ],
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(ConstantsValues.race, style: context.typo.body2),
            DropdownButton(
              value: healthRiskFactor.race,
              items: UserRace.values.map((e) => DropdownMenuItem(value: e, child: Text(e.value))).toList(),
              onChanged: (UserRace? value) => onChanged.call(healthRiskFactor.copyWith(race: value)),
            )
          ],
        ),
        const SizedBox(height: Dimens.spacingS),
      ],
    );
  }
}

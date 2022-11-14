import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/risks/health_risk_factor.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class RiskFormTopSection extends StatelessWidget {
  final HealthRiskFactor healthRiskFactor;
  final Function(HealthRiskFactor) onChanged;

  const RiskFormTopSection({super.key, required this.healthRiskFactor, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: TextFormField(
                decoration: _formDecoration(ConstantsValues.age),
                onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(age: int.parse(value))),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: Dimens.spacingS),
            Flexible(
              child: TextFormField(
                decoration: _formDecoration(ConstantsValues.systolicBloodPressure),
                onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(sbp: double.parse(value))),
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: Dimens.spacingM),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: TextFormField(
                decoration: _formDecoration(ConstantsValues.hdlLevel),
                onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(cholesterolHdl: double.parse(value))),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: Dimens.spacingS),
            Flexible(
              child: TextFormField(
                decoration: _formDecoration(ConstantsValues.totalCholesterolLevel),
                onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(cholesterol: double.parse(value))),
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: Dimens.spacingM),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: TextFormField(
                decoration: _formDecoration(ConstantsValues.bodyHeight),
                onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(bodyHeight: double.parse(value))),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: Dimens.spacingS),
            Flexible(
              child: TextFormField(
                decoration: _formDecoration(ConstantsValues.bodyWeight),
                onChanged: (value) => onChanged.call(healthRiskFactor.copyWith(bodyWeight: double.parse(value))),
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: Dimens.spacingS),
      ],
    );
  }

  InputDecoration _formDecoration(String label) {
    return InputDecoration(
      labelText: label,
      contentPadding: const EdgeInsets.all(Dimens.spacingS),
      border: InputBorder.none,
      filled: true,
      fillColor: AppColors.mainColorHighlight,
    );
  }
}

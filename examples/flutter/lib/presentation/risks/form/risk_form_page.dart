import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/risks/health_risk_factor.dart';
import 'package:shenai_sdk_example/presentation/risks/form/widgets/country_picker.dart';
import 'package:shenai_sdk_example/presentation/risks/form/widgets/risk_form_middle_section.dart';
import 'package:shenai_sdk_example/presentation/risks/form/widgets/risk_form_top_section.dart';
import 'package:shenai_sdk_example/presentation/risks/risks_cubit.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/style/dimens.dart';
import 'package:shenai_sdk_example/widgets/buttons/rounded_flat_button.dart';

class RiskFormPage extends StatefulWidget {
  const RiskFormPage({super.key});

  @override
  State<RiskFormPage> createState() => _RiskFormPageState();
}

class _RiskFormPageState extends State<RiskFormPage> {
  HealthRiskFactor _healthRiskFactor = HealthRiskFactor();
  String? _country;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(Dimens.spacingL),
            child: Column(
              children: [
                RiskFormTopSection(
                  healthRiskFactor: _healthRiskFactor,
                  onChanged: (healthRiskFactor) => setState(() => _healthRiskFactor = healthRiskFactor),
                ),
                RiskFormMiddleSection(
                  healthRiskFactor: _healthRiskFactor,
                  onChanged: (healthRiskFactor) => setState(() => _healthRiskFactor = healthRiskFactor),
                ),
                CountryPicker(onChanged: (val) => setState(() => _country = val)),
                const SizedBox(height: Dimens.spacingXL),
                RoundedFlatButton(
                  label: ConstantsValues.showRisk,
                  onPressed: _saveData,
                  color: AppColors.mainColorTeal,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _saveData() {
    final HealthRiskFactor dataFactory = _healthRiskFactor.copyWith(country: _country);

    BlocProvider.of<RisksCubit>(context).loadData(dataFactory);
    Navigator.of(context).pushNamed('/risks');
  }
}

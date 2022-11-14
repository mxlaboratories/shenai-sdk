import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/presentation/risks/risks_cubit.dart';
import 'package:shenai_sdk_example/presentation/risks/widgets/risks_cvd_diseases_risk.dart';
import 'package:shenai_sdk_example/presentation/risks/widgets/risks_cvd_events.dart';
import 'package:shenai_sdk_example/presentation/risks/widgets/risks_total_score.dart';
import 'package:shenai_sdk_example/style/dimens.dart';
import 'package:shenai_sdk_example/widgets/info_dialog.dart';

class RisksPage extends StatefulWidget {
  const RisksPage({super.key});

  @override
  _RisksPageState createState() => _RisksPageState();
}

class _RisksPageState extends State<RisksPage> {

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<RisksCubit, RisksState>(
          listener: (_, state) {
            if (state is RisksError) {
              const InfoDialog(message: ConstantsValues.errorText).show(context);
            }
          },
          builder: (_, state) {
            if (state is RisksLoaded) {
              return ListView(
                padding: const EdgeInsets.all(Dimens.spacingXL),
                children: [
                  RisksCVDiseasesTile(state.healthRisksValues.healthRisks),
                  RisksCVDEvents(state.healthRisksValues.healthRisks),
                  RisksTotalScore(state.healthRisksValues),
                  Text(
                    "${ConstantsValues.vascularAge}: ${state.healthRisksValues.healthRisks?.vascularAge}",
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
              );
            } else {
              return const Center(child: CircularProgressIndicator());
            }
          },
        ),
      ),
    );
  }
}

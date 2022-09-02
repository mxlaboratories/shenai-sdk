import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/widgets/buttons/rounded_flat_button.dart';

class MeasureButton extends StatelessWidget {
  final bool isReadyForMeasurement;
  final bool isMeasuring;

  const MeasureButton({
    super.key,
    required this.isReadyForMeasurement,
    required this.isMeasuring,
  });

  @override
  Widget build(BuildContext context) {
    return RoundedFlatButton(
      color: isReadyForMeasurement || isMeasuring
          ? AppColors.mainColorTeal
          : AppColors.mainColorLightGrey,
      disabledColor: AppColors.mainColorLightGrey,
      label: isMeasuring ? ConstantsValues.stopText : ConstantsValues.startText,
      onPressed: () => isReadyForMeasurement && !isMeasuring
          ? BlocProvider.of<MeasureCubit>(context).startMeasurement()
          : isMeasuring
          ? BlocProvider.of<MeasureCubit>(context).stopMeasurement()
          : null,
    );
  }
}

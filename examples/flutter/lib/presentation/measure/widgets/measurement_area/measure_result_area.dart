import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_values_cubits/pulse/pulse_cubit.dart';
import 'package:shenai_sdk_example/style/app_images.dart';
import 'package:shenai_sdk_example/style/dimens.dart';
import 'package:shenai_sdk_example/widgets/custom_value_tile.dart';

class MeasureResultArea extends StatefulWidget {
  @override
  State<MeasureResultArea> createState() => _MeasureResultAreaState();
}

class _MeasureResultAreaState extends State<MeasureResultArea> {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).textScaleFactor * Dimens.spacingXL +
          Dimens.spacing4XL,
      child: BlocBuilder<MeasureCubit, MeasureCubitState>(
        builder: (_, measureState) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                child: BlocBuilder<PulseCubit, PulseState>(
                  builder: (_, state) {
                    return CustomValueTile(
                      label: ConstantsValues.pulseText,
                      value: measureState is MeasureEnded &&
                              measureState.summaryData != null
                          ? "${measureState.summaryData?.heartRate?.toInt()}"
                          : state is PulseValue
                              ? "${state.pulse.toInt()}"
                              : "0",
                      unit: ConstantsValues.bpmUnitText,
                      image: AppImages.heart,
                    );
                  },
                ),
              ),
              Flexible(
                child: CustomValueTile(
                  label: ConstantsValues.hrvText,
                  isProgress: measureState is MeasureInProgress,
                  value: measureState is MeasureEnded
                      ? (measureState.summaryData?.hrv?.toInt().toString() ??
                          "?")
                      : "-",
                  unit: ConstantsValues.msUnitText,
                  image: AppImages.heart,
                ),
              ),
              Flexible(
                child: CustomValueTile(
                  label: ConstantsValues.breathText,
                  isProgress: measureState is MeasureInProgress,
                  value: measureState is MeasureEnded
                      ? (measureState.summaryData?.breathingRate
                              ?.toInt()
                              .toString() ??
                          "?")
                      : "-",
                  unit: ConstantsValues.bpmUnitText,
                  image: AppImages.lungs,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

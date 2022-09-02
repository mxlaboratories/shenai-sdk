import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/measure_button.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/measurement_area/measure_result_area.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/widgets/linear_progress_view.dart';

class MeasurementArea extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MeasureCubit, MeasureCubitState>(
      builder: (_, state) {
        return Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            if (state is MeasureInProgress)
              LinearProgressView(
                progress: state.progress,
                color: AppColors.white,
              ),
            MeasureButton(
              isReadyForMeasurement:
                  (state is MeasureReady && state.isReadyForMeasurement) ||
                      state is MeasureEnded,
              isMeasuring: state is MeasureInProgress,
            ),
            MeasureResultArea(),
          ],
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/measure/model/user_face_pos.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/face_position/face_position_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/warning_icon/warning_icon_cubit.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/widgets/buttons/rounded_flat_button.dart';

class MeasureButton extends StatefulWidget {
  final bool isReadyForMeasurement;
  final bool isMeasuring;

  const MeasureButton({
    Key? key,
    required this.isReadyForMeasurement,
    required this.isMeasuring,
  }) : super(key: key);

  @override
  State<MeasureButton> createState() => _MeasureButtonState();
}

class _MeasureButtonState extends State<MeasureButton> {
  bool _measureAvailable = false;

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners:[
        BlocListener<WarningIconCubit, WarningIconState>(
          listener: (_, state) {
            if (state is WarningIconNotShow) {
              setState(() => _measureAvailable = true);
            } else {
              setState(() => _measureAvailable = false);
            }
          },
        ),
        BlocListener<FacePositionCubit, FacePositionState>(
          listener: (_, state) {
            if (state is FacePositionValue && state.position == UserFacePos.ok) {
              setState(() => _measureAvailable = true);
            } else {
              setState(() => _measureAvailable = false);
            }
          },
        ),
      ],
      child: RoundedFlatButton(
        color: (_measureAvailable && widget.isReadyForMeasurement) || widget.isMeasuring
            ? AppColors.mainColorTeal
            : AppColors.mainColorLightGrey,
        disabledColor: AppColors.mainColorLightGrey,
        label: widget.isMeasuring ? ConstantsValues.stopText : ConstantsValues.startText,
        onPressed: () => _measureAvailable
            && widget.isReadyForMeasurement
            && !widget.isMeasuring
            ? BlocProvider.of<MeasureCubit>(context).startMeasurement()
            : widget.isMeasuring
            ? BlocProvider.of<MeasureCubit>(context).stopMeasurement()
            : null,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/measure/model/user_face_pos.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/face_frame/face_frame.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/face_position/face_position_cubit.dart';

class MeasureCameraPreview extends StatelessWidget {
  final int textureId;
  final bool isMeasurement;

  const MeasureCameraPreview({super.key, required this.textureId, required this.isMeasurement});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final deviceRatio = size.width / size.height;
    return Align(
      alignment: Alignment.topCenter,
      child: AspectRatio(
        aspectRatio: deviceRatio,
        child: BlocBuilder<FacePositionCubit, FacePositionState>(
          builder: (_, state) {
            return FaceFrame(
              isPosCorrect: state is FacePositionValue && state.position == UserFacePos.ok,
              textureId: textureId,
              isMeasurement: isMeasurement,
            );
          },
        ),
      ),
    );
  }
}

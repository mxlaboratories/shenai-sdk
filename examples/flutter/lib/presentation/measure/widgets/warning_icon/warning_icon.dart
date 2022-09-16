import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/measure/warning_type.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/warning_icon/warning_icon_cubit.dart';
import 'package:shenai_sdk_example/style/app_images.dart';

class WarningIcon extends StatelessWidget {
  const WarningIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<WarningIconCubit, WarningIconState>(
      builder: (_, state) {
        if (state is WarningIconShow) {
          return Positioned(
            left: MediaQuery.of(context).size.width/2.5,
            top: Platform.isIOS ? null : MediaQuery.of(context).size.height/15,
            bottom: Platform.isIOS ? 0 : null,
            child: Image.asset(_getImage(state.type)),
          );
        } else {
          return const SizedBox.shrink();
        }
      },
    );
  }

  String _getImage(WarningType type) {
    switch(type) {
      case WarningType.lighting:
        return AppImages.brightness;
      case WarningType.moving:
        return AppImages.vibrate;
      case WarningType.pulse:
        return AppImages.pulseWarning;
      case WarningType.other:
        return AppImages.warning;
    }
  }
}

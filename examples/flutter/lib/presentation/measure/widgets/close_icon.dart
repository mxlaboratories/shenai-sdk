import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class CloseIcon extends StatelessWidget {
  const CloseIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: Dimens.spacingS,
      left: Dimens.spacingM,
      child: Transform.rotate(
        angle: 40,
        child: IconButton(
          icon: const Icon(
            Icons.add_circle_rounded,
            color: Colors.white,
            size: Dimens.spacing2XL,
          ),
          padding: EdgeInsets.zero,
          onPressed: () {
            BlocProvider.of<MeasureCubit>(context).deinitialize();
            Navigator.of(context).pop();
          },
        ),
      ),
    );
  }
}

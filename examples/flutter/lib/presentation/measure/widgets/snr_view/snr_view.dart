import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/snr_view/snr_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/snr_view/snr_icon.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class SnrView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SnrCubit, SnrState>(
        builder: (_, state) {
          return Positioned(
            top: Dimens.spacingL,
            right: Dimens.spacingXL,
            child: Row(
              children: [
                SnrIcon(
                  snr: state is SnrValue ? state.snr : 0,
                  limit: 0,
                ),
                const SizedBox(width: 5),
                SnrIcon(
                  snr: state is SnrValue ? state.snr : 0,
                  limit: 4,
                ),
                const SizedBox(width: 5),
                SnrIcon(
                  snr: state is SnrValue ? state.snr : 0,
                  limit: 7,
                ),
              ],
            ),
          );
        },
    );
  }
}

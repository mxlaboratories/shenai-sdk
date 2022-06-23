import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/style/colors.dart';

class SnrIcon extends StatelessWidget {
  final int snr;
  final int limit;

  const SnrIcon({Key? key, required this.snr, required this.limit}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 13,
      height: 13,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.white.withOpacity(snr > limit ? 1 : 0.5),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class LinearProgressView extends StatelessWidget {
  final double progress;
  final EdgeInsets padding;
  final Color bgColor;
  final Color color;

  const LinearProgressView({
    super.key,
    this.progress = 1,
    this.padding = const EdgeInsets.symmetric(horizontal: Dimens.spacingSM, vertical: Dimens.spacingM),
    this.bgColor = AppColors.mainColorLightGrey,
    this.color = AppColors.mainColorTeal,
  });

  @override
  Widget build(BuildContext context) {
    return Flexible(
      child: Padding(
        padding: padding,
        child: LinearProgressIndicator(
          value: progress < 1 ? progress : null,
          backgroundColor: bgColor,
          color: color,
        ),
      ),
    );
  }
}

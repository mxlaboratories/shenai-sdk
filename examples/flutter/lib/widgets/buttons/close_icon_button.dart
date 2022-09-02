import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class CloseIconButton extends StatelessWidget {
  final Color color;
  final Color backgroundColor;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;

  const CloseIconButton({
    super.key,
    this.onTap,
    this.color = AppColors.mainColorBlue,
    this.backgroundColor = AppColors.closeButtonBackgroundColor,
    this.padding = const EdgeInsets.only(top: Dimens.spacingM, right: Dimens.spacingM),
  });

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: onTap,
      child: Padding(
        padding: padding,
        child: Material(
          color: backgroundColor,
          shape: const CircleBorder(),
          child: Padding(
            padding: const EdgeInsets.all(2.0),
            child: Icon(
              Icons.sentiment_very_dissatisfied,
              size: Dimens.spacing7XL,
              color: color,
            ),
          ),
        ),
      ),
    );
  }
}

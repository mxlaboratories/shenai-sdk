import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/extensions/context_extension.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/style/dimens.dart';
import 'package:shenai_sdk_example/style/typography.dart';

class RoundedFlatButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final Widget? icon;
  final Color color;
  final Color disabledColor;
  final EdgeInsetsGeometry padding;

  const RoundedFlatButton({
    super.key,
    required this.label,
    required this.onPressed,
    required this.disabledColor,
    this.color = AppColors.white,
    this.icon,
    this.padding = const EdgeInsets.symmetric(horizontal: Dimens.spacing2XL, vertical: Dimens.spacingXs),
  });

  @override
  Widget build(BuildContext context) {
    return TextButton(
      style: TextButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Dimens.spacingS)),
        backgroundColor: color,
        onSurface: disabledColor,
        padding: padding,
      ),
      onPressed: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          if (icon != null) icon!,
          if (icon != null) const SizedBox(width: Dimens.spacingS),
          Text(
            label,
            style: context.typo.flatButtonText.white(),
          ),
        ],
      ),
    );
  }
}

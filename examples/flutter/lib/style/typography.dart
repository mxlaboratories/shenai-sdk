import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shenai_sdk_example/style/colors.dart';

class AppTypography {
  final TextStyle headline1;
  final TextStyle headline2;
  final TextStyle body1;
  final TextStyle body2;
  final TextStyle formFieldStyleText;
  final TextStyle flatButtonText;
  final TextStyle customTileValueText;
  final TextStyle customTileUnitText;
  final TextStyle labelCardText;

  AppTypography({
    required this.headline1,
    required this.headline2,
    required this.body1,
    required this.body2,
    required this.formFieldStyleText,
    required this.flatButtonText,
    required this.customTileValueText,
    required this.customTileUnitText,
    required this.labelCardText,
  });

  static TextStyle wrapWithFont(TextStyle style) => GoogleFonts.inter(textStyle: style);

  TextTheme get textTheme => TextTheme(
    headline1: headline1,
    headline2: headline2,
  );

  static AppTypography shenAiSdkExample = AppTypography(
    headline1: wrapWithFont(
      const TextStyle(
        height: 1.25,
        fontWeight: FontWeight.w600,
        fontSize: 32.0,
      ),
    ),
    headline2: wrapWithFont(
      const TextStyle(
        height: 1.33,
        fontWeight: FontWeight.w400,
        fontSize: 24.0,
      ),
    ),
    body1: wrapWithFont(
      const TextStyle(
        height: 1.5,
        fontWeight: FontWeight.w500,
        fontSize: 16.0,
      ),
    ),
    body2: wrapWithFont(
      const TextStyle(
        height: 1.5,
        fontWeight: FontWeight.w400,
        fontSize: 16.0,
      ),
    ),
    formFieldStyleText: wrapWithFont(
      const TextStyle(
        color: AppColors.mainColorDarkBlue,
        fontWeight: FontWeight.w500,
        fontSize: 18.0,
      ),
    ),
    flatButtonText: wrapWithFont(
      const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.mainColorTeal,
      ),
    ),
    customTileValueText: wrapWithFont(
      const TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 32,
        color: AppColors.mainColorTeal,
      ),
    ),
    customTileUnitText: wrapWithFont(
      const TextStyle(
        fontWeight: FontWeight.w400,
        fontSize: 16,
        color: AppColors.staticTextColor,
      ),
    ),
    labelCardText: wrapWithFont(
      const TextStyle(
        fontWeight: FontWeight.w400,
        fontSize: 16,
        color: AppColors.staticTextColor,
      ),
    ),
  );

  static AppTypography of(BuildContext context) => Provider.of<AppTypography>(context, listen: false);

  static AppTypography ofWithListen(BuildContext context) => Provider.of<AppTypography>(context, listen: true);
}

extension TextStyleExtensions on TextStyle {
  TextStyle singleCenteredLine() => copyWith(height: 1);

  TextStyle accent(BuildContext context) => copyWith(color: Theme.of(context).colorScheme.secondary);

  TextStyle white() => copyWith(color: AppColors.white);

  TextStyle withColor(Color color) => copyWith(color: color);
}

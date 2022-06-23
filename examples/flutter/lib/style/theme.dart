import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/style/colors.dart';

ThemeData mainTheme() => ThemeData(
  highlightColor: AppColors.mainColorHighlight.withAlpha(80),
  splashColor: AppColors.mainColorHighlight.withAlpha(80),
  primaryColor: AppColors.mainColorAccent,
  brightness: Brightness.light,
  appBarTheme: mainAppBarTheme,
  primaryTextTheme: primaryTextTheme,
  dividerColor: Colors.transparent,
  textSelectionTheme: const TextSelectionThemeData(cursorColor: AppColors.mainColorBlue),
  colorScheme: ColorScheme.fromSwatch(primarySwatch: Colors.lightBlue).copyWith(secondary: AppColors.mainColorHighlight),
);

AppBarTheme get mainAppBarTheme => const AppBarTheme(
  elevation: 1.5,
  color: Colors.white,
  centerTitle: false,
);

TextTheme get primaryTextTheme => const TextTheme(
  headline6: TextStyle(
    fontWeight: FontWeight.w600,
    fontSize: 18,
    color: Color(0xff687478),
  ),
);

class TextScaleFactorAdapter extends StatelessWidget {
  const TextScaleFactorAdapter({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final mediaQueryData = MediaQuery.of(context);
    final double factor = mediaQueryData.size.shortestSide / 440.0;

    // don't increase text scale, just reduce if needed
    if (factor < 1.0) {
      final adjustedTextScaleFactor = mediaQueryData.textScaleFactor * factor;

      return MediaQuery(
        data: mediaQueryData.copyWith(
          textScaleFactor: adjustedTextScaleFactor,
        ),
        child: child,
      );
    } else {
      return child;
    }
  }
}

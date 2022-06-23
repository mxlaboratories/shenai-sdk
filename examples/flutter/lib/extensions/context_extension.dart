import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/style/typography.dart';

extension ContextExtensions on BuildContext {
  AppTypography get typo => AppTypography.of(this);
}

extension StfulContextExtensions on State {
  AppTypography get typo => AppTypography.of(context);
}

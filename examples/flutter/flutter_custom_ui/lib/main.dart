import 'package:flutter/material.dart';
import 'package:shenai_sdk/shenai_sdk.dart';

import 'app.dart';
import 'models/risk_profile.dart';
import 'sdk_settings.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final profile = RiskProfile.defaults();
  final initializationResult = shenApiKey.isEmpty
      ? null
      : await ShenaiSdk.initialize(
          shenApiKey,
          '',
          settings: customUiSettings(profile),
        );

  runApp(
    CustomUiExampleApp(
      initializationResult: initializationResult,
      initialProfile: profile,
    ),
  );
}

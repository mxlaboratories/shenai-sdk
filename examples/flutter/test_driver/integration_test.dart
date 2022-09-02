import 'dart:io';

import 'package:integration_test/integration_test_driver.dart';

Future<void> main() async {
  final Map<String, String> envVars = Platform.environment;
  final String adbPath = '${envVars['ANDROID_SDK_ROOT']!}/platform-tools/adb';

  await Process.run(adbPath , ['shell' ,'pm', 'grant', 'ai.mxlabs.shenai_sdk_example', 'android.permission.CAMERA']);
  await Process.run(adbPath , ['shell' ,'pm', 'grant', 'ai.mxlabs.shenai_sdk_example', 'android.permission.INTERNET']);
  await integrationDriver();
}

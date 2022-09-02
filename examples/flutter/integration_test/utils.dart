import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shenai_sdk_example/main.dart' as app;

Future<void> startAndWaitForApp(WidgetsBinding binding) async {
  await app.main();
  if (!binding.firstFrameRasterized) {
    await binding.waitUntilFirstFrameRasterized;
  }
}

Future<void> tap(WidgetTester tester, Finder finder) async {
  await tester.ensureVisible(finder);
  await tester.pumpAndSettle();
  await tester.tap(finder);
}

Future<void> waitUntil(
    WidgetTester tester,
    bool Function() requirement, {
      Duration timeout = const Duration(seconds: 180),
    }) async {
  bool timerDone = false;
  final timer = Timer(timeout, () => throw TimeoutException("Wait until has timed out"));
  while (timerDone != true) {
    final found = requirement();
    if (found) {
      timerDone = true;
    }
    await tester.pump(const Duration(seconds: 2));
  }
  timer.cancel();
}

Future<void> pumpUntilFound(
    WidgetTester tester,
    Finder finder, {
      Duration timeout = const Duration(seconds: 180),
    }) async {
  bool timerDone = false;
  final timer = Timer(timeout, () => throw TimeoutException("Pump until has timed out"));
  bool found = false;
  while (timerDone != true) {
    await tester.pump();
    try {
      found = tester.any(finder);
    } catch(e) {
      if (kDebugMode) {
        print("finder not found");
      }
    }

    if (found) {
      if (kDebugMode) {
        print("finder not found");
      }
      timerDone = true;
    }
  }
  timer.cancel();
}

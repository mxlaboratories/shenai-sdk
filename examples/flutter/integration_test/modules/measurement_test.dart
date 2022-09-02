import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';

import '../utils.dart';

void main() {
  final WidgetsBinding binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  measurementTest(binding);
}

void measurementTest(WidgetsBinding binding) {
  group('MXL - measurement flow tests', () {
    final welcomeTitleText = find.text(ConstantsValues.welcomeTitleText);
    final startText = find.text(ConstantsValues.startText);
    final notInitText = find.text(ConstantsValues.notInitText);

    if (ConstantsValues.shenAiAPIkey.isEmpty) {
      testWidgets("show not initialize text when API key isn't defined", (WidgetTester tester) async {
        startAndWaitForApp(binding);
        await pumpUntilFound(tester, welcomeTitleText);
        await tap(tester, welcomeTitleText);
        await pumpUntilFound(tester, notInitText);
        expect(notInitText, findsOneWidget);
      });
    } else {
      testWidgets("show start measurement button when API key is defined", (WidgetTester tester) async {
        startAndWaitForApp(binding);
        await pumpUntilFound(tester, welcomeTitleText);
        await tap(tester, welcomeTitleText);
        await pumpUntilFound(tester, startText);
        expect(startText, findsOneWidget);
      });
    }
  });
}

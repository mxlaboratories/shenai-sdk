import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';

import '../utils.dart';

void main() {
  final WidgetsBinding binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  welcomeTest(binding);
}

void welcomeTest(WidgetsBinding binding) {
  group('MXL - welcome page tests', () {
    final welcomeTitleText = find.text(ConstantsValues.welcomeTitleText);

    testWidgets("show welcome page", (WidgetTester tester) async {
      startAndWaitForApp(binding);
      await pumpUntilFound(tester, welcomeTitleText);
      expect(welcomeTitleText, findsOneWidget);
    });
  });
}

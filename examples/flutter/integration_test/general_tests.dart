import 'package:flutter/widgets.dart';
import 'package:integration_test/integration_test.dart';

import 'modules/measurement_test.dart';
import 'modules/welcome_test.dart';

void main() {
  final WidgetsBinding binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  welcomeTest(binding);
  measurementTest(binding);
}

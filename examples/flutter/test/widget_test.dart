import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:provider/provider.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/injection/bloc_factory.dart';
import 'package:shenai_sdk_example/injection/modules.dart';
import 'package:shenai_sdk_example/shen_ai_example_app.dart';
import 'package:shenai_sdk_example/style/typography.dart';

void main() {
  testWidgets("display welcome page", (WidgetTester tester) async {
    final welcomeTitleText = find.text(ConstantsValues.welcomeTitleText);
    final GetIt injector = GetIt.instance;
    registerModules(injector);
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          Provider<AppTypography>.value(value: AppTypography.shenAiSdkExample),
          Provider<BlocFactory>(create: (context) => BlocFactory(injector: injector)),
        ],
        child: const ShenAiExampleApp(),
      ),
    );

    expect(welcomeTitleText, findsOneWidget);
  });
}

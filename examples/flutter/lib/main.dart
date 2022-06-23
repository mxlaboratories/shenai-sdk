import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:get_it/get_it.dart';
import 'package:provider/provider.dart';
import 'package:shenai_sdk_example/injection/bloc_factory.dart';
import 'package:shenai_sdk_example/injection/modules.dart';
import 'package:shenai_sdk_example/shen_ai_example_app.dart';
import 'package:shenai_sdk_example/style/typography.dart';

Future<void> main() async {
  final WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  final GetIt injector = GetIt.instance;
  registerModules(injector);

  runApp(
    MultiProvider(
      providers: [
        Provider<AppTypography>.value(value: AppTypography.shenAiSdkExample),
        Provider<BlocFactory>(create: (context) => BlocFactory(injector: injector)),
      ],
      child: const ShenAiExampleApp(),
    ),
  );
}

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:shenai_sdk_example/injection/bloc_factory.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_page.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_values_cubits/pulse/pulse_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/face_position/face_position_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/snr_view/snr_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/warning_icon/warning_icon_cubit.dart';
import 'package:shenai_sdk_example/presentation/welcome_page.dart';
import 'package:shenai_sdk_example/style/theme.dart';

class ShenAiExampleApp extends StatelessWidget {
  const ShenAiExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    FlutterNativeSplash.remove();

    final BlocFactory blocFactory = BlocFactory.of(context);

    return MultiBlocProvider(
      providers: [
        BlocProvider<MeasureCubit>(create: (context) => blocFactory.get<MeasureCubit>()),
        BlocProvider<PulseCubit>(create: (context) => blocFactory.get<PulseCubit>()),
        BlocProvider<SnrCubit>(create: (context) => blocFactory.get<SnrCubit>()),
        BlocProvider<FacePositionCubit>(create: (context) => blocFactory.get<FacePositionCubit>()),
        BlocProvider<WarningIconCubit>(create: (context) => blocFactory.get<WarningIconCubit>()),
      ],
      child: MaterialApp(
        theme: mainTheme(),
        debugShowCheckedModeBanner: false,
        home: const WelcomePage(),
        routes: <String, WidgetBuilder>{
          '/measure': (BuildContext context) => MeasurePage(),
        },
      ),
    );
  }
}

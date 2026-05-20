import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';

import 'models/risk_profile.dart';
import 'pages/custom_measure_page.dart';
import 'pages/risk_form_page.dart';
import 'route_observer.dart';

class CustomUiExampleApp extends StatefulWidget {
  const CustomUiExampleApp({
    super.key,
    required this.initializationResult,
    required this.initialProfile,
  });

  final InitializationResult? initializationResult;
  final RiskProfile initialProfile;

  @override
  State<CustomUiExampleApp> createState() => _CustomUiExampleAppState();
}

class _CustomUiExampleAppState extends State<CustomUiExampleApp> {
  late RiskProfile _profile = widget.initialProfile;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shen.AI Custom UI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: const ColorScheme.light(
          primary: Colors.black,
          onPrimary: Colors.white,
          secondary: Color(0xFF444444),
          surface: Colors.white,
          onSurface: Colors.black,
        ),
        scaffoldBackgroundColor: Colors.white,
        useMaterial3: true,
      ),
      navigatorObservers: [customUiRouteObserver],
      routes: {
        RiskFormPage.routeName: (_) => RiskFormPage(
          profile: _profile,
          onSaved: (profile) => setState(() => _profile = profile),
        ),
      },
      home: CustomMeasurePage(
        initializationResult: widget.initializationResult,
        profile: _profile,
        onProfileSaved: (profile) => setState(() => _profile = profile),
      ),
    );
  }
}

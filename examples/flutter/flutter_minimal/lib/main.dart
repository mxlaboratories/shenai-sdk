import 'dart:async';

import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_sdk.dart';
import 'package:shenai_sdk/shenai_view.dart';

const String shenApiKey = String.fromEnvironment('SHENAI_API_KEY');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final initializationResult = shenApiKey.isEmpty
      ? null
      : await ShenaiSdk.initialize(
          shenApiKey,
          '',
          settings: _minimalExampleSettings(),
        );

  runApp(MinimalExampleApp(initializationResult: initializationResult));
}

InitializationSettings _minimalExampleSettings() {
  return InitializationSettings(
    precisionMode: PrecisionMode.relaxed,
    operatingMode: OperatingMode.measure,
    measurementPreset: MeasurementPreset.thirtySecondsAllMetrics,
    cameraMode: CameraMode.facingUser,
    onboardingMode: OnboardingMode.showOnce,
    showUserInterface: true,
    showFacePositioningOverlay: true,
    showVisualWarnings: true,
    enableCameraSwap: true,
    showFaceMask: true,
    showBloodFlow: true,
    enableStartAfterSuccess: false,
    enableSummaryScreen: true,
    showResultsFinishButton: true,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: true,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: true,
    applyPrecisionModeToBloodPressure: false,
    showSignalQualityIndicator: true,
    showSignalTile: true,
    showStartStopButton: true,
    showInfoButton: true,
    showDisclaimer: true,
    uiVersion: UiVersion.v2,
    risksFactors: _exampleRiskFactors(),
  );
}

RisksFactors _exampleRiskFactors() {
  return RisksFactors(
    age: 45,
    cholesterol: 190,
    cholesterolHdl: 52,
    sbp: 128,
    dbp: 82,
    isSmoker: false,
    hypertensionTreatment: HypertensionTreatment.no,
    hasDiabetes: false,
    bodyHeight: 172,
    bodyWeight: 74,
    waistCircumference: 84,
    neckCircumference: 38,
    hipCircumference: 98,
    gender: Gender.female,
    physicalActivity: PhysicalActivity.moderately,
    country: 'US',
    race: Race.white,
    vegetableFruitDiet: true,
    historyOfHighGlucose: false,
    historyOfHypertension: false,
    triglyceride: 120,
    fastingGlucose: 92,
    familyDiabetes: FamilyHistory.noneFirstDegree,
    parentalHypertension: ParentalHistory.none,
  );
}

class MinimalExampleApp extends StatelessWidget {
  const MinimalExampleApp({super.key, required this.initializationResult});

  final InitializationResult? initializationResult;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shen.AI Minimal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF176B87)),
        useMaterial3: true,
      ),
      home: MinimalExamplePage(initializationResult: initializationResult),
    );
  }
}

class MinimalExamplePage extends StatefulWidget {
  const MinimalExamplePage({super.key, required this.initializationResult});

  final InitializationResult? initializationResult;

  @override
  State<MinimalExamplePage> createState() => _MinimalExamplePageState();
}

class _MinimalExamplePageState extends State<MinimalExamplePage>
    with WidgetsBindingObserver {
  late InitializationResult? _initializationResult;
  late bool _isSdkInitialized;
  late bool _showSdkView;
  bool _appResumed = true;
  int _sdkViewGeneration = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializationResult = widget.initializationResult;
    _isSdkInitialized =
        widget.initializationResult == InitializationResult.success;
    _showSdkView = _isSdkInitialized;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final appResumed = state == AppLifecycleState.resumed;
    if (_appResumed == appResumed) {
      return;
    }
    _appResumed = appResumed;
    _syncSdkViewVisibility();
  }

  void _syncSdkViewVisibility() {
    final shouldShowSdkView = _isSdkInitialized && _appResumed;
    if (_showSdkView == shouldShowSdkView) {
      return;
    }
    setState(() {
      _showSdkView = shouldShowSdkView;
      if (shouldShowSdkView) {
        _sdkViewGeneration++;
      }
    });
    unawaited(
      _setCameraMode(
        shouldShowSdkView ? CameraMode.facingUser : CameraMode.off,
      ),
    );
  }

  Future<void> _setCameraMode(CameraMode mode) async {
    try {
      await ShenaiSdk.setCameraMode(mode);
    } catch (_) {
      // The SDK can already be deinitialized while lifecycle callbacks settle.
    }
  }

  Future<void> _toggleSdkInitialization() async {
    if (shenApiKey.isEmpty) {
      return;
    }

    if (_isSdkInitialized) {
      await ShenaiSdk.deinitialize();
      if (!mounted) {
        return;
      }
      setState(() {
        _isSdkInitialized = false;
        _showSdkView = false;
      });
      return;
    }

    final result = await ShenaiSdk.initialize(
      shenApiKey,
      '',
      settings: _minimalExampleSettings(),
    );
    if (!mounted) {
      return;
    }
    setState(() {
      _initializationResult = result;
      _isSdkInitialized = result == InitializationResult.success;
      _showSdkView = _isSdkInitialized && _appResumed;
      if (_showSdkView) {
        _sdkViewGeneration++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          tooltip: _isSdkInitialized ? 'Deinitialize SDK' : 'Initialize SDK',
          onPressed: _toggleSdkInitialization,
          icon: Icon(
            _isSdkInitialized ? Icons.power_settings_new : Icons.power_outlined,
          ),
        ),
        title: const Text('Shen.AI Minimal'),
      ),
      body: _showSdkView
          ? KeyedSubtree(key: ValueKey(_sdkViewGeneration), child: ShenaiView())
          : Center(child: Text(_statusMessage())),
    );
  }

  String _statusMessage() {
    if (shenApiKey.isEmpty) {
      return 'Missing SHENAI_API_KEY';
    }
    if (_isSdkInitialized) {
      return 'SDK view paused';
    }
    if (_initializationResult == InitializationResult.success) {
      return 'SDK deinitialized';
    }
    return 'Initialization failed: ${_initializationResult?.name ?? 'unknown'}';
  }
}

import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_sdk.dart';
import 'package:shenai_sdk/shenai_view.dart';

const String shenApiKey = String.fromEnvironment('SHENAI_API_KEY');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ShenaiFlowExampleApp());
}

InitializationSettings _uiFlowSettings({
  required List<Screen> screens,
  required bool dashboardOnly,
}) {
  return InitializationSettings(
    precisionMode: PrecisionMode.relaxed,
    operatingMode: OperatingMode.measure,
    measurementPreset: MeasurementPreset.thirtySecondsAllMetrics,
    cameraMode: CameraMode.facingUser,
    onboardingMode: OnboardingMode.hidden,
    showUserInterface: true,
    showFacePositioningOverlay: true,
    showVisualWarnings: true,
    enableCameraSwap: true,
    showFaceMask: true,
    showBloodFlow: true,
    enableStartAfterSuccess: false,
    enableSummaryScreen: !dashboardOnly,
    showResultsFinishButton: !dashboardOnly,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: !dashboardOnly,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: true,
    applyPrecisionModeToBloodPressure: false,
    showSignalQualityIndicator: true,
    showSignalTile: true,
    showStartStopButton: !dashboardOnly,
    showInfoButton: !dashboardOnly,
    showDisclaimer: !dashboardOnly,
    uiVersion: UiVersion.v2,
    risksFactors: _exampleRiskFactors(),
    uiFlowScreens: screens.map((screen) => screen.index).toList(),
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

class ShenaiFlowExampleApp extends StatefulWidget {
  const ShenaiFlowExampleApp({super.key});

  @override
  State<ShenaiFlowExampleApp> createState() => _ShenaiFlowExampleAppState();
}

class _ShenaiFlowExampleAppState extends State<ShenaiFlowExampleApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();
  InitializationResult? _initializationResult;
  bool _openingFlow = false;
  bool _missingApiKey = false;

  Future<void> _openFlow(_FlowConfig flow) async {
    if (_openingFlow) {
      return;
    }
    if (shenApiKey.isEmpty) {
      setState(() {
        _missingApiKey = true;
        _initializationResult = null;
      });
      return;
    }
    setState(() {
      _openingFlow = true;
      _initializationResult = null;
      _missingApiKey = false;
    });
    final initialized = await ShenaiSdk.isInitialized();
    if (initialized) {
      await ShenaiSdk.deinitialize();
    }
    final result = await ShenaiSdk.initialize(
      shenApiKey,
      '',
      settings: _uiFlowSettings(
        screens: flow.screens,
        dashboardOnly: flow.dashboardOnly,
      ),
    );
    if (!mounted) {
      return;
    }
    setState(() {
      _openingFlow = false;
      _initializationResult = result;
    });
    if (result != InitializationResult.success) {
      return;
    }
    if (flow.disableMeasurementsDashboard) {
      await ShenaiSdk.setEnableMeasurementsDashboard(false);
      if (!mounted) {
        return;
      }
    }
    final navigator = _navigatorKey.currentState;
    if (navigator == null) {
      return;
    }
    await navigator.push(
      MaterialPageRoute(
        builder: (_) => _SdkScreenPage(
          flow: flow,
          onFlowFinished: () {
            if (mounted) {
              setState(() => _initializationResult = null);
            }
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shen.AI Flow',
      debugShowCheckedModeBanner: false,
      navigatorKey: _navigatorKey,
      theme: ThemeData(
        colorScheme: const ColorScheme.light(
          primary: Colors.black,
          onPrimary: Colors.white,
          surface: Colors.white,
          onSurface: Colors.black,
        ),
        scaffoldBackgroundColor: Colors.white,
        useMaterial3: true,
      ),
      home: HomePage(
        initializationResult: _initializationResult,
        missingApiKey: _missingApiKey,
        openingFlow: _openingFlow,
        onOpenDashboard: () => _openFlow(_dashboardFlow),
        onOpenMeasurement: () => _openFlow(_measurementFlow),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({
    super.key,
    required this.initializationResult,
    required this.missingApiKey,
    required this.openingFlow,
    required this.onOpenDashboard,
    required this.onOpenMeasurement,
  });

  final InitializationResult? initializationResult;
  final bool missingApiKey;
  final bool openingFlow;
  final VoidCallback onOpenDashboard;
  final VoidCallback onOpenMeasurement;

  @override
  Widget build(BuildContext context) {
    final failed =
        initializationResult != null &&
        initializationResult != InitializationResult.success;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 360),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Shen.AI Flow',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 32),
                  if (missingApiKey) ...[
                    const Text(
                      'Missing SHENAI_API_KEY',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                  ] else if (failed) ...[
                    Text(
                      'Initialization failed: ${initializationResult!.name}',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                  ],
                  HomeActionButton(
                    label: 'Dashboard',
                    onPressed: openingFlow ? null : onOpenDashboard,
                  ),
                  const SizedBox(height: 12),
                  HomeActionButton(
                    label: 'Measurement',
                    onPressed: openingFlow ? null : onOpenMeasurement,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HomeActionButton extends StatelessWidget {
  const HomeActionButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.black,
        minimumSize: const Size.fromHeight(54),
        side: const BorderSide(color: Colors.black),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      onPressed: onPressed,
      child: Text(label),
    );
  }
}

class _SdkScreenPage extends StatefulWidget {
  const _SdkScreenPage({required this.flow, required this.onFlowFinished});

  final _FlowConfig flow;
  final VoidCallback onFlowFinished;

  @override
  State<_SdkScreenPage> createState() => _SdkScreenPageState();
}

class _SdkScreenPageState extends State<_SdkScreenPage>
    with WidgetsBindingObserver {
  bool _finished = false;
  bool _showSdkView = true;
  bool _showPdfActions = false;
  bool _pdfBusy = false;
  int _sdkViewGeneration = 0;
  String _pdfStatus = 'Complete the measurement flow to open the PDF report.';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    ShenaiSdk.setEventCallback((event) {
      if (kDebugMode) {
        debugPrint('Shen.AI event: $event');
      }
      if (event == Event.userFlowFinished) {
        unawaited(_handleUserFlowFinished());
      }
    });
    unawaited(_openScreen());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_finished || _showPdfActions) {
      return;
    }
    _setSdkViewVisible(state == AppLifecycleState.resumed);
  }

  Future<void> _openScreen() async {
    if (widget.flow.resetMeasurement) {
      await ShenaiSdk.resetMeasurementSession();
    }
    final initialScreen = widget.flow.initialScreen;
    if (initialScreen != null) {
      await ShenaiSdk.setScreen(initialScreen);
    }
  }

  Future<void> _handleUserFlowFinished() async {
    if (_finished) {
      return;
    }
    final hasResults = await _hasMeasurementResults();
    if (widget.flow.showPdfActionsAfterFinish && hasResults) {
      await _showPdfActionsPage();
      return;
    }
    await _finishFlow();
  }

  Future<bool> _hasMeasurementResults() async {
    try {
      final results = await ShenaiSdk.getMeasurementResults();
      return results != null;
    } catch (_) {
      return false;
    }
  }

  Future<void> _showPdfActionsPage() async {
    if (_showPdfActions || !mounted) {
      return;
    }
    setState(() {
      _showPdfActions = true;
      _showSdkView = false;
      _pdfStatus = 'Measurement finished. Open the PDF report.';
    });
    await _setCameraMode(CameraMode.off);
  }

  void _setSdkViewVisible(bool visible) {
    if (_showSdkView == visible) {
      return;
    }
    setState(() {
      _showSdkView = visible;
      if (visible) {
        _sdkViewGeneration++;
      }
    });
    unawaited(_setCameraMode(visible ? CameraMode.facingUser : CameraMode.off));
  }

  Future<void> _setCameraMode(CameraMode mode) async {
    try {
      await ShenaiSdk.setCameraMode(mode);
    } catch (_) {
      // Lifecycle callbacks can arrive while the SDK is closing.
    }
  }

  Future<void> _finishFlow() async {
    if (_finished) {
      return;
    }
    _finished = true;
    await ShenaiSdk.deinitialize();
    widget.onFlowFinished();
    if (!mounted) {
      return;
    }
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  Future<void> _openPdfInBrowser() async {
    await _runPdfAction(() async {
      await ShenaiSdk.openMeasurementResultsPdfInBrowser();
      return 'PDF open request sent.';
    });
  }

  Future<void> _runPdfAction(Future<String> Function() action) async {
    if (_pdfBusy) {
      return;
    }
    setState(() {
      _pdfBusy = true;
      _pdfStatus = 'Working on PDF...';
    });
    try {
      final status = await action();
      if (!mounted) {
        return;
      }
      setState(() => _pdfStatus = status);
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _pdfStatus = 'PDF action failed: $error');
    } finally {
      if (mounted) {
        setState(() => _pdfBusy = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        body: _showPdfActions
            ? _PdfActionsPage(
                busy: _pdfBusy,
                status: _pdfStatus,
                onOpenPdf: _openPdfInBrowser,
                onFinish: _finishFlow,
              )
            : _showSdkView
            ? KeyedSubtree(
                key: ValueKey(_sdkViewGeneration),
                child: ShenaiView(),
              )
            : const Center(child: Text('SDK view paused')),
      ),
    );
  }
}

class _PdfActionsPage extends StatelessWidget {
  const _PdfActionsPage({
    required this.busy,
    required this.status,
    required this.onOpenPdf,
    required this.onFinish,
  });

  final bool busy;
  final String status;
  final VoidCallback onOpenPdf;
  final VoidCallback onFinish;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Measurement PDF',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 16),
                  Text(status, textAlign: TextAlign.center),
                  const SizedBox(height: 24),
                  HomeActionButton(
                    label: 'Open PDF',
                    onPressed: busy ? null : onOpenPdf,
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: busy ? null : onFinish,
                    child: const Text('Finish'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FlowConfig {
  const _FlowConfig({
    required this.initialScreen,
    required this.screens,
    required this.dashboardOnly,
    required this.resetMeasurement,
    required this.showPdfActionsAfterFinish,
    required this.disableMeasurementsDashboard,
  });

  final Screen? initialScreen;
  final List<Screen> screens;
  final bool dashboardOnly;
  final bool resetMeasurement;
  final bool showPdfActionsAfterFinish;
  final bool disableMeasurementsDashboard;
}

const _dashboardFlow = _FlowConfig(
  initialScreen: null,
  screens: [Screen.dashboard],
  dashboardOnly: true,
  resetMeasurement: false,
  showPdfActionsAfterFinish: false,
  disableMeasurementsDashboard: false,
);

const _measurementFlow = _FlowConfig(
  initialScreen: Screen.measurement,
  screens: [Screen.measurement, Screen.results, Screen.healthRisks],
  dashboardOnly: false,
  resetMeasurement: true,
  showPdfActionsAfterFinish: true,
  disableMeasurementsDashboard: true,
);

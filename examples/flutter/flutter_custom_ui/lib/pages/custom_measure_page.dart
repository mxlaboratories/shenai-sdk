import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_sdk.dart';

import '../models/display_value.dart';
import '../models/risk_profile.dart';
import '../route_observer.dart';
import '../utils/formatters.dart';
import '../utils/sdk_read.dart';
import '../widgets/circle_camera_view.dart';
import '../widgets/custom_progress_bar.dart';
import '../widgets/measurement_quality_indicator.dart';
import '../widgets/simple_grid.dart';
import 'result_page.dart';
import 'risk_form_page.dart';

class CustomMeasurePage extends StatefulWidget {
  const CustomMeasurePage({
    super.key,
    required this.initializationResult,
    required this.profile,
    required this.onProfileSaved,
  });

  final InitializationResult? initializationResult;
  final RiskProfile profile;
  final ValueChanged<RiskProfile> onProfileSaved;

  @override
  State<CustomMeasurePage> createState() => _CustomMeasurePageState();
}

class _CustomMeasurePageState extends State<CustomMeasurePage>
    with RouteAware, WidgetsBindingObserver {
  Timer? _pollTimer;
  PageRoute<dynamic>? _route;
  bool _isPolling = false;
  bool _routeVisible = true;
  bool _appResumed = true;
  bool _showCamera = false;
  bool _isResettingMeasurement = false;
  int _cameraViewGeneration = 0;
  int _measurementResetGeneration = 0;
  MeasurementState? _measurementState;
  MeasurementResults? _realtimeMetrics;
  MeasurementResults? _results;
  HealthRisks? _healthRisks;
  MeasurementEnvironmentCondition? _violatedCondition;
  bool _hasReachedFinalizing = false;
  bool _hasFinishedMeasurement = false;
  double _progress = 0;

  bool get _isInitialized =>
      widget.initializationResult == InitializationResult.success;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _showCamera = _isInitialized;
    ShenaiSdk.setEventCallback((event) {
      if (kDebugMode) {
        debugPrint('Shen.AI event: $event');
      }
      final shouldHandleFinished =
          _isRunningMeasurementState(_measurementState) ||
          _hasReachedFinalizing ||
          _measurementState == MeasurementState.finished;
      if (event == Event.measurementFinished &&
          !_isResettingMeasurement &&
          shouldHandleFinished) {
        if (mounted) {
          setState(() => _hasFinishedMeasurement = true);
        }
        unawaited(_refreshSdkState(loadHealthRisks: true));
      }
    });
    unawaited(_refreshSdkState());
    _pollTimer = Timer.periodic(
      const Duration(milliseconds: 200),
      (_) => unawaited(_refreshSdkState()),
    );
    unawaited(_setSdkCameraMode(CameraMode.facingUser));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final route = ModalRoute.of(context);
    if (route is PageRoute<dynamic> && route != _route) {
      final previousRoute = _route;
      if (previousRoute != null) {
        customUiRouteObserver.unsubscribe(this);
      }
      _route = route;
      customUiRouteObserver.subscribe(this, route);
    }
    _syncCameraVisibility();
  }

  @override
  void didUpdateWidget(covariant CustomMeasurePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.profile != widget.profile && _results != null) {
      unawaited(_computeHealthRisks(widget.profile));
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    customUiRouteObserver.unsubscribe(this);
    unawaited(_setSdkCameraMode(CameraMode.off));
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _appResumed = state == AppLifecycleState.resumed;
    _syncCameraVisibility();
  }

  @override
  void didPop() {
    _routeVisible = false;
    _syncCameraVisibility();
  }

  @override
  void didPopNext() {
    _routeVisible = true;
    _syncCameraVisibility();
  }

  @override
  void didPush() {
    _routeVisible = true;
    _syncCameraVisibility();
  }

  @override
  void didPushNext() {
    _routeVisible = false;
    _syncCameraVisibility();
  }

  void _syncCameraVisibility() {
    final shouldShowCamera = _isInitialized && _routeVisible && _appResumed;
    if (_showCamera == shouldShowCamera) {
      return;
    }
    setState(() {
      _showCamera = shouldShowCamera;
      if (shouldShowCamera) {
        _cameraViewGeneration++;
      }
    });
    unawaited(
      _setSdkCameraMode(
        shouldShowCamera ? CameraMode.facingUser : CameraMode.off,
      ),
    );
  }

  Future<void> _setSdkCameraMode(CameraMode mode) async {
    if (!_isInitialized) {
      return;
    }
    await readSdkOrNull(() => ShenaiSdk.setCameraMode(mode));
  }

  Future<void> _refreshSdkState({bool loadHealthRisks = false}) async {
    if (_isPolling || _isResettingMeasurement || !mounted || !_isInitialized) {
      return;
    }
    final resetGeneration = _measurementResetGeneration;
    _isPolling = true;
    try {
      final measurementState = await readSdkOrNull(
        ShenaiSdk.getMeasurementState,
      );
      final progress = await readSdkOrNull(
        ShenaiSdk.getMeasurementProgressPercentage,
      );
      final violatedCondition = await readSdkOrNull(
        ShenaiSdk.getCurrentViolatedMeasurementEnvironmentCondition,
      );
      final realtimeMetrics = await readSdkOrNull(
        () => ShenaiSdk.getRealtimeMetrics(10),
      );
      final results = await readSdkOrNull(ShenaiSdk.getMeasurementResults);
      final shouldLoadRisks =
          loadHealthRisks ||
          measurementState == MeasurementState.finished && _healthRisks == null;
      final healthRisks = shouldLoadRisks
          ? await readSdkOrNull(
              () => ShenaiSdk.computeHealthRisks(
                widget.profile.toRisksFactors(results: results),
              ),
            )
          : null;

      if (!mounted ||
          _isResettingMeasurement ||
          resetGeneration != _measurementResetGeneration) {
        return;
      }
      setState(() {
        _measurementState = measurementState;
        final liveMeasurementState = _isRunningMeasurementState(
          measurementState,
        );
        if (measurementState == MeasurementState.finalizing) {
          _hasReachedFinalizing = true;
        }
        if (measurementState == MeasurementState.finished) {
          _hasFinishedMeasurement = true;
        }
        _progress = progress ?? _progress;
        _violatedCondition = violatedCondition;
        _realtimeMetrics = liveMeasurementState
            ? realtimeMetrics ?? _realtimeMetrics
            : null;
        if (_hasFinishedMeasurement ||
            measurementState == MeasurementState.finished) {
          _results = results ?? _results;
        }
        _healthRisks = healthRisks ?? _healthRisks;
      });
    } finally {
      _isPolling = false;
    }
  }

  Future<void> _computeHealthRisks(RiskProfile profile) async {
    if (!_isInitialized || _results == null) {
      return;
    }
    final healthRisks = await readSdkOrNull(
      () => ShenaiSdk.computeHealthRisks(
        profile.toRisksFactors(results: _results),
      ),
    );
    if (!mounted || healthRisks == null) {
      return;
    }
    setState(() => _healthRisks = healthRisks);
  }

  Future<void> _openRiskForm() async {
    final profile = await Navigator.of(context).push<RiskProfile>(
      MaterialPageRoute(
        builder: (_) => RiskFormPage(
          profile: widget.profile,
          onSaved: widget.onProfileSaved,
        ),
      ),
    );
    if (profile != null) {
      await _computeHealthRisks(profile);
    }
  }

  Future<void> _startMeasurement() async {
    if (!_isInitialized) {
      return;
    }
    _syncCameraVisibility();
    _isResettingMeasurement = true;
    _resetMeasurementUiState();
    try {
      await ShenaiSdk.resetMeasurementSession();
      await ShenaiSdk.setOperatingMode(OperatingMode.measure);
      await ShenaiSdk.startMeasurement();
    } finally {
      _isResettingMeasurement = false;
    }
    await _refreshSdkState();
  }

  Future<void> _stopMeasurement() async {
    if (!_isInitialized) {
      return;
    }
    _isResettingMeasurement = true;
    try {
      await readSdkOrNull(() => ShenaiSdk.resetMeasurementSession());
      await _setSdkCameraMode(CameraMode.facingUser);
      _resetMeasurementUiState();
    } finally {
      _isResettingMeasurement = false;
    }
  }

  void _resetMeasurementUiState() {
    if (!mounted) {
      return;
    }
    _measurementResetGeneration++;
    setState(() {
      _measurementState = null;
      _realtimeMetrics = null;
      _results = null;
      _healthRisks = null;
      _violatedCondition = null;
      _hasReachedFinalizing = false;
      _hasFinishedMeasurement = false;
      _progress = 0;
    });
  }

  void _openResults() {
    final measurementFinished =
        _hasFinishedMeasurement ||
        _measurementState == MeasurementState.finished;
    if (!measurementFinished || _results == null) {
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ResultPage(
          results: _results,
          risks: _healthRisks,
          profile: widget.profile,
          onProfileSaved: widget.onProfileSaved,
          onRisksChanged: (risks) => setState(() => _healthRisks = risks),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final running = _isRunningMeasurementState(_measurementState);
    final measurementFinished =
        _hasFinishedMeasurement ||
        _measurementState == MeasurementState.finished;
    final canOpenResults = measurementFinished && _results != null;
    final displayResults = _results ?? _realtimeMetrics;
    final statusText = _measurementStatusText(
      _measurementState,
      _violatedCondition,
      hasReachedFinalizing: _hasReachedFinalizing,
      hasFinishedMeasurement: _hasFinishedMeasurement,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Custom UI'),
        actions: [
          IconButton(
            tooltip: 'Health form',
            onPressed: _openRiskForm,
            icon: const Icon(Icons.assignment_outlined),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            Center(
              child: CircleCameraView(
                isInitialized: _isInitialized,
                showCamera: _showCamera,
                initializationResult: widget.initializationResult,
                cameraViewKey: ValueKey(_cameraViewGeneration),
              ),
            ),
            const SizedBox(height: 24),
            CustomProgressBar(value: _progress / 100),
            const SizedBox(height: 10),
            Text(
              '$statusText - ${formatNumber(_progress)}%',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 18),
            MeasurementQualityIndicator(
              title: 'Live quality',
              results: displayResults,
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _isInitialized && !running
                        ? _startMeasurement
                        : null,
                    icon: const Icon(Icons.play_arrow),
                    label: const Text('Start'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isInitialized && running
                        ? _stopMeasurement
                        : null,
                    icon: const Icon(Icons.stop),
                    label: const Text('Stop'),
                  ),
                ),
              ],
            ),
            if (measurementFinished) ...[
              const SizedBox(height: 12),
              FilledButton(
                onPressed: canOpenResults ? _openResults : null,
                child: const Text('SEE RESULTS'),
              ),
            ],
            const SizedBox(height: 20),
            SimpleGrid(values: _headlineValues(displayResults)),
          ],
        ),
      ),
    );
  }
}

String _measurementStatusText(
  MeasurementState? state,
  MeasurementEnvironmentCondition? condition, {
  required bool hasReachedFinalizing,
  required bool hasFinishedMeasurement,
}) {
  if (hasFinishedMeasurement || state == MeasurementState.finished) {
    return 'Measurement finished';
  }
  if (hasReachedFinalizing || state == MeasurementState.finalizing) {
    return 'Finalizing';
  }
  if (condition != null) {
    return _conditionInstruction(condition);
  }
  return switch (state) {
    MeasurementState.waitingForFace => 'Waiting for face',
    MeasurementState.runningSignalShort ||
    MeasurementState.runningSignalGood ||
    MeasurementState.runningSignalBad ||
    MeasurementState.runningSignalBadDeviceUnstable =>
      'Measurement conditions are good',
    MeasurementState.finalizing => 'Finalizing',
    MeasurementState.finished => 'Finished',
    MeasurementState.failed => 'Measurement failed',
    MeasurementState.notStarted || null => 'Ready',
  };
}

String _conditionInstruction(MeasurementEnvironmentCondition condition) {
  return switch (condition) {
    MeasurementEnvironmentCondition.facePosition => 'Uncover your forehead',
    MeasurementEnvironmentCondition.foreheadVisible => 'Uncover your forehead',
    MeasurementEnvironmentCondition.glassesNotDetected => 'Remove your glasses',
    MeasurementEnvironmentCondition.sufficientLightLevel =>
      'Move to brighter light',
    MeasurementEnvironmentCondition.evenLighting => 'Use even lighting',
    MeasurementEnvironmentCondition.noBacklight => 'Avoid backlight',
    MeasurementEnvironmentCondition.faceStable => 'Keep your face still',
    MeasurementEnvironmentCondition.deviceStable => 'Keep the phone still',
  };
}

bool _isRunningMeasurementState(MeasurementState? state) {
  return state == MeasurementState.runningSignalGood ||
      state == MeasurementState.runningSignalShort ||
      state == MeasurementState.runningSignalBad ||
      state == MeasurementState.runningSignalBadDeviceUnstable ||
      state == MeasurementState.waitingForFace ||
      state == MeasurementState.finalizing;
}

List<DisplayValue> _headlineValues(MeasurementResults? results) {
  return [
    DisplayValue('HR', formatNumber(results?.heart_rate_bpm), 'bpm'),
    DisplayValue(
      'SBP',
      formatNumber(results?.systolic_blood_pressure_mmhg),
      'mmHg',
    ),
    DisplayValue(
      'DBP',
      formatNumber(results?.diastolic_blood_pressure_mmhg),
      'mmHg',
    ),
    DisplayValue(
      'BR',
      formatNumber(results?.breathing_rate_bpm, decimals: 1),
      'brpm',
    ),
  ];
}

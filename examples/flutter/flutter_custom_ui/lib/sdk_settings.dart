import 'package:shenai_sdk/pigeon.dart';

import 'models/risk_profile.dart';

const String shenApiKey = String.fromEnvironment('SHENAI_API_KEY');

InitializationSettings customUiSettings(RiskProfile profile) {
  return InitializationSettings(
    precisionMode: PrecisionMode.relaxed,
    operatingMode: OperatingMode.measure,
    measurementPreset: MeasurementPreset.thirtySecondsAllMetrics,
    cameraMode: CameraMode.facingUser,
    onboardingMode: OnboardingMode.hidden,
    showUserInterface: false,
    showFacePositioningOverlay: false,
    showVisualWarnings: false,
    enableCameraSwap: false,
    showFaceMask: true,
    showBloodFlow: false,
    enableStartAfterSuccess: false,
    enableSummaryScreen: false,
    showResultsFinishButton: false,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: false,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: false,
    applyPrecisionModeToBloodPressure: false,
    showSignalQualityIndicator: false,
    showSignalTile: false,
    showStartStopButton: false,
    showInfoButton: false,
    showDisclaimer: false,
    uiVersion: UiVersion.v2,
    risksFactors: profile.toRisksFactors(),
  );
}

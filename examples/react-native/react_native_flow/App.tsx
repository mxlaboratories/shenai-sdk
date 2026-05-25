import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  NativeEventEmitter,
  NativeModules,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  deinitialize,
  getMeasurementResults,
  initialize,
  isInitialized,
  openMeasurementResultsPdfInBrowser,
  resetMeasurementSession,
  setEnableMeasurementsDashboard,
  setScreen,
  ShenaiSdkView,
} from "react-native-shenai-sdk";

declare const process: {
  env: {
    SHENAI_API_KEY?: string;
  };
};

const shenApiKey = process.env.SHENAI_API_KEY ?? "";
const {ShenaiSdkNativeModule} = NativeModules;
const sdkEventEmitter = new NativeEventEmitter(ShenaiSdkNativeModule);

const InitializationResultValue = {
  OK: 0,
} as const;

const ScreenValue = {
  MEASUREMENT: 2,
  RESULTS: 4,
  HEALTH_RISKS: 5,
  DASHBOARD: 11,
} as const;

const SettingsValue = {
  PRECISION_MODE_RELAXED: 1,
  OPERATING_MODE_MEASURE: 1,
  MEASUREMENT_PRESET_THIRTY_SECONDS_ALL_METRICS: 9,
  CAMERA_MODE_FACING_USER: 1,
  ONBOARDING_MODE_HIDDEN: 0,
  UI_VERSION_V2: 1,
} as const;

const RiskFactorValue = {
  GENDER_FEMALE: 1,
  PHYSICAL_ACTIVITY_MODERATELY: 2,
  RACE_WHITE: 0,
  HYPERTENSION_TREATMENT_NO: 1,
  FAMILY_HISTORY_NONE_FIRST_DEGREE: 1,
  PARENTAL_HISTORY_NONE: 0,
} as const;

const riskFactors = {
  age: 45,
  cholesterol: 190,
  cholesterolHdl: 52,
  sbp: 128,
  dbp: 82,
  isSmoker: false,
  hypertensionTreatment: RiskFactorValue.HYPERTENSION_TREATMENT_NO,
  hasDiabetes: false,
  bodyHeight: 172,
  bodyWeight: 74,
  waistCircumference: 84,
  neckCircumference: 38,
  hipCircumference: 98,
  gender: RiskFactorValue.GENDER_FEMALE,
  physicalActivity: RiskFactorValue.PHYSICAL_ACTIVITY_MODERATELY,
  country: "US",
  race: RiskFactorValue.RACE_WHITE,
  vegetableFruitDiet: true,
  historyOfHighGlucose: false,
  historyOfHypertension: false,
  triglyceride: 120,
  fastingGlucose: 92,
  familyDiabetes: RiskFactorValue.FAMILY_HISTORY_NONE_FIRST_DEGREE,
  parentalHypertension: RiskFactorValue.PARENTAL_HISTORY_NONE,
};

type FlowName = "dashboard" | "measurement";

type FlowConfig = {
  name: FlowName;
  dashboardOnly: boolean;
  resetMeasurement: boolean;
  showPdfActionsAfterFinish: boolean;
  disableMeasurementsDashboard: boolean;
  initialScreen: number | null;
  screens: number[];
};

const dashboardFlow: FlowConfig = {
  name: "dashboard",
  dashboardOnly: true,
  resetMeasurement: false,
  showPdfActionsAfterFinish: false,
  disableMeasurementsDashboard: false,
  initialScreen: null,
  screens: [ScreenValue.DASHBOARD],
};

const measurementFlow: FlowConfig = {
  name: "measurement",
  dashboardOnly: false,
  resetMeasurement: true,
  showPdfActionsAfterFinish: true,
  disableMeasurementsDashboard: true,
  initialScreen: ScreenValue.MEASUREMENT,
  screens: [
    ScreenValue.MEASUREMENT,
    ScreenValue.RESULTS,
    ScreenValue.HEALTH_RISKS,
  ],
};

function uiFlowSettings(flow: FlowConfig) {
  return {
    precisionMode: SettingsValue.PRECISION_MODE_RELAXED,
    operatingMode: SettingsValue.OPERATING_MODE_MEASURE,
    measurementPreset:
      SettingsValue.MEASUREMENT_PRESET_THIRTY_SECONDS_ALL_METRICS,
    cameraMode: SettingsValue.CAMERA_MODE_FACING_USER,
    onboardingMode: SettingsValue.ONBOARDING_MODE_HIDDEN,
    showUserInterface: true,
    showFacePositioningOverlay: true,
    showVisualWarnings: true,
    enableCameraSwap: true,
    showFaceMask: true,
    showBloodFlow: true,
    enableStartAfterSuccess: false,
    enableSummaryScreen: !flow.dashboardOnly,
    showResultsFinishButton: !flow.dashboardOnly,
    enableHealthRisks: true,
    showHealthIndicesFinishButton: !flow.dashboardOnly,
    saveHealthRisksFactors: true,
    showOutOfRangeResultIndicators: true,
    applyPrecisionModeToBloodPressure: false,
    showSignalQualityIndicator: true,
    showSignalTile: true,
    showStartStopButton: !flow.dashboardOnly,
    showInfoButton: !flow.dashboardOnly,
    showDisclaimer: !flow.dashboardOnly,
    uiVersion: SettingsValue.UI_VERSION_V2,
    uiFlowScreens: flow.screens,
    risksFactors: riskFactors,
  };
}

function resultName(result: number) {
  switch (result) {
    case 0:
      return "OK";
    case 1:
      return "INVALID_API_KEY";
    case 2:
      return "CONNECTION_ERROR";
    case 3:
      return "INTERNAL_ERROR";
    default:
      return String(result);
  }
}

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const App = () => {
  const [screen, setScreenName] = useState<"home" | "sdk" | "pdf">("home");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const activeFlowRef = useRef<FlowConfig | null>(null);
  const flowFinishedRef = useRef(false);

  const finishFlow = useCallback(async () => {
    if (flowFinishedRef.current) {
      return;
    }

    flowFinishedRef.current = true;
    try {
      await deinitialize();
    } catch (error) {
      console.log(error);
    }
    activeFlowRef.current = null;
    setPdfBusy(false);
    setStatus("");
    setScreenName("home");
  }, []);

  const hasMeasurementResults = useCallback(async () => {
    try {
      return (await getMeasurementResults()) != null;
    } catch {
      return false;
    }
  }, []);

  const waitForMeasurementResults = useCallback(async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (await hasMeasurementResults()) {
        return true;
      }
      await delay(200);
    }
    return false;
  }, [hasMeasurementResults]);

  const handleUserFlowFinished = useCallback(async () => {
    if (flowFinishedRef.current) {
      return;
    }

    const flow = activeFlowRef.current;
    if (flow == null) {
      return;
    }

    if (flow.showPdfActionsAfterFinish) {
      await waitForMeasurementResults();
      setStatus("Measurement finished. Open the PDF report.");
      setScreenName("pdf");
      return;
    }

    await finishFlow();
  }, [finishFlow, waitForMeasurementResults]);

  const openFlow = useCallback(async (flow: FlowConfig) => {
    if (busy) {
      return;
    }
    if (!shenApiKey) {
      setStatus("Missing SHENAI_API_KEY");
      return;
    }

    setBusy(true);
    setStatus("Initializing SDK...");
    flowFinishedRef.current = false;

    try {
      if (await isInitialized()) {
        await deinitialize();
      }

      activeFlowRef.current = flow;
      const result = await initialize(shenApiKey, "", uiFlowSettings(flow));
      if (result !== InitializationResultValue.OK) {
        activeFlowRef.current = null;
        setStatus(`Initialization failed: ${resultName(result)}`);
        return;
      }

      if (flow.resetMeasurement) {
        await resetMeasurementSession();
      }
      if (flow.disableMeasurementsDashboard) {
        await setEnableMeasurementsDashboard(false);
      }
      if (flow.initialScreen != null) {
        await setScreen(flow.initialScreen);
      }

      setStatus("");
      setScreenName("sdk");
    } catch (error) {
      console.log(error);
      activeFlowRef.current = null;
      setStatus(`SDK error: ${error instanceof Error ? error.message : error}`);
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const openPdf = useCallback(async () => {
    if (pdfBusy) {
      return;
    }

    setPdfBusy(true);
    setStatus("Working on PDF...");
    try {
      await openMeasurementResultsPdfInBrowser();
      setStatus("PDF open request sent.");
    } catch (error) {
      console.log(error);
      setStatus(
        `PDF action failed: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy]);

  useEffect(() => {
    const subscription = sdkEventEmitter.addListener("ShenAIEvent", event => {
      const eventName = event?.EventName ?? event?.eventName ?? event?.name;
      console.log("Shen.AI event", eventName ?? event);

      if (eventName === "USER_FLOW_FINISHED") {
        handleUserFlowFinished().catch(error => {
          console.log(error);
          setStatus(
            `SDK error: ${error instanceof Error ? error.message : error}`,
          );
          setScreenName("home");
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleUserFlowFinished]);

  if (screen === "sdk") {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.flowHeader}>
          <Pressable
            accessibilityRole="button"
            onPress={finishFlow}
            style={({pressed}) => [
              styles.secondaryButton,
              pressed && styles.pressedButton,
            ]}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </SafeAreaView>
        <ShenaiSdkView style={styles.sdkView} />
      </View>
    );
  }

  if (screen === "pdf") {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <Text style={styles.title}>Measurement PDF</Text>
        <Text style={styles.statusText}>{status}</Text>
        <Pressable
          accessibilityRole="button"
          disabled={pdfBusy}
          onPress={openPdf}
          style={({pressed}) => [
            styles.primaryButton,
            pdfBusy && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}>
          <Text style={styles.primaryButtonText}>Open PDF</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={pdfBusy}
          onPress={finishFlow}
          style={({pressed}) => [
            styles.secondaryButton,
            pdfBusy && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}>
          <Text style={styles.secondaryButtonText}>Finish</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.centeredScreen}>
      <Text style={styles.title}>Shen.AI Flow</Text>
      {status ? <Text style={styles.statusText}>{status}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => openFlow(dashboardFlow)}
        style={({pressed}) => [
          styles.primaryButton,
          busy && styles.disabledButton,
          pressed && styles.pressedButton,
        ]}>
        <Text style={styles.primaryButtonText}>Dashboard</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => openFlow(measurementFlow)}
        style={({pressed}) => [
          styles.primaryButton,
          busy && styles.disabledButton,
          pressed && styles.pressedButton,
        ]}>
        <Text style={styles.primaryButtonText}>Measurement</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  centeredScreen: {
    alignItems: "stretch",
    backgroundColor: "#FFFFFF",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  flowHeader: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#D7DEE2",
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  sdkView: {
    flex: 1,
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  statusText: {
    color: "#344054",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    borderColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 96,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.75,
  },
});

export default App;

import Head from "next/head";
import styles from "../styles/Home.module.css";
import {
  OperatingMode,
  MeasurementPreset,
  CameraMode,
  FaceState,
  NormalizedFaceBbox,
  MeasurementState,
  MeasurementResults,
  Heartbeat,
  PrecisionMode,
  InitializationSettings,
  CustomColorTheme,
  CustomMeasurementConfig,
  HealthRisks,
} from "shenai-sdk";
import { Screen as ShenaiScreen } from "shenai-sdk";
import { Collapse, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { CodeSnippet } from "../components/CodeSnippet";
import { useRouter } from "next/router";
import { CustomMeasurementConfigurator } from "../components/CustomMeasurementConfigurator";
import { UIElementsControls } from "../components/UIElementsControls";
import { ColorTheme } from "../components/ColorTheme";
import Link from "next/link";
import { FileTextOutlined } from "@ant-design/icons";
import { Visualizations } from "../components/Visualizations";
import { SignalsPreview } from "../components/SignalsPreview";
import { ResultsView } from "../components/ResultsView";
import { BasicOutputsView } from "../components/BasicOutputsView";
import { ControlsView } from "../components/ControlsView";
import { InitializationView } from "../components/InitializationView";
import { useShenaiSdk } from "../hooks/useShenaiSdk";
import { getEnumName } from "../helpers";
import { useDarkMode } from "../hooks/useDarkMode";
import { HealthIndicesView } from "../components/HealthIndicesView";
import { MeasurementResultsPdfSection } from "../components/PdfSection";

const { Panel } = Collapse;

export interface ShenaiSdkState {
  isInitialized: boolean;

  operatingMode: OperatingMode;
  precisionMode: PrecisionMode;
  measurementPreset: MeasurementPreset;
  cameraMode: CameraMode;
  faceState: FaceState;
  screen: ShenaiScreen;

  showUserInterface: boolean;
  showFacePositioningOverlay: boolean;
  showVisualWarnings: boolean;
  enableCameraSwap: boolean;
  showFaceMask: boolean;
  showBloodFlow: boolean;
  hideShenaiLogo: boolean;
  enableStartAfterSuccess: boolean;
  showOutOfRangeResultIndicators: boolean;
  showTrialMetricLabels: boolean;
  showSignalTile: boolean;
  showSignalQualityIndicator: boolean;
  showStartStopButton: boolean;
  showInfoButton: boolean;
  showDisclaimer: boolean;
  enableMeasurementsDashboard: boolean;

  enableSummaryScreen: boolean;
  enableHealthRisks: boolean;

  language: string;

  bbox: NormalizedFaceBbox | null;
  measurementState: MeasurementState;
  progress: number;

  hr10s: number | null;
  hr4s: number | null;
  realtimeHr: number | null;
  realtimeHrvSdnn: number | null;
  realtimeCardiacStress: number | null;
  results: MeasurementResults | null;
  healthIndices: HealthRisks | null;

  realtimeHeartbeats: Heartbeat[];

  recordingEnabled: boolean;
  badSignal: number | null;
  signalQuality: number | null;

  textureImage: number[];
  signalImage: number[];
  metaPredictionImage: number[];

  rppgSignal: number[];

  pricingPlan: string;
}

let ranInitialInit = false;

export default function Home() {
  const { shenaiSDK, loadShenaiSDK, unloadShenaiSDK } = useShenaiSdk();
  const darkMode = useDarkMode();

  useEffect(() => {
    if (!ranInitialInit) {
      ranInitialInit = true;
      loadShenaiSDK();
    }
  }, []);

  const [apiKey, setApiKey] = useState<string>("");
  const [sdkState, setSdkState] = useState<ShenaiSdkState>();
  const [sdkVersion, setSdkVersion] = useState<string>("");
  const [pendingInitialization, setPendingInitialization] = useState(false);
  const [initializationSettings, setInitializationSettings] =
    useState<InitializationSettings>();

  const [colorTheme, setColorTheme] = useState<CustomColorTheme>({
    themeColor: "#56A0A0",
    textColor: "#000000",
    backgroundColor: "#E6E6E6",
    tileColor: "#FFFFFF",
  });
  const [customConfig, setCustomConfig] = useState<CustomMeasurementConfig>();

  const canvasTopRef = useRef<HTMLDivElement>(null);
  const scrollToCanvas = () => {
    if (canvasTopRef.current) {
      canvasTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const initializeSdk = (
    apiKey: string,
    settings: InitializationSettings,
    onSuccess?: () => void
  ) => {
    if (!shenaiSDK) return;
    setPendingInitialization(true);
    shenaiSDK.initialize(apiKey, "", settings, (res) => {
      if (res === shenaiSDK.InitializationResult.OK) {
        console.log("Shen.AI License result: ", res);
        shenaiSDK.attachToCanvas("#mxcanvas");
        onSuccess?.();
        scrollToCanvas();
      } else {
        message.error(
          "License initialization problem: " +
          getEnumName(shenaiSDK.InitializationResult, res, "UNKNOWN")
        );
      }
      setPendingInitialization(false);
    });
  };

  useEffect(() => {
    if (!shenaiSDK) return;

    const optionalDefaultConfig = {
      durationSeconds: 60,
      infiniteMeasurement: false,

      instantMetrics: [
        shenaiSDK.Metric.HEART_RATE,
        shenaiSDK.Metric.BLOOD_PRESSURE,
      ],
      summaryMetrics: [
        shenaiSDK.Metric.HEART_RATE,
        shenaiSDK.Metric.BLOOD_PRESSURE,
        shenaiSDK.Metric.HRV_SDNN,
        shenaiSDK.Metric.BREATHING_RATE,
        shenaiSDK.Metric.CARDIAC_STRESS,
        shenaiSDK.Metric.CARDIAC_WORKLOAD,
        shenaiSDK.Metric.PNS_ACTIVITY,
        shenaiSDK.Metric.BMI,
      ],

      healthIndices: [
        shenaiSDK.HealthIndex.WELLNESS_SCORE,
        shenaiSDK.HealthIndex.VASCULAR_AGE,
        shenaiSDK.HealthIndex.CARDIOVASCULAR_DISEASE_RISK,
        shenaiSDK.HealthIndex.HARD_AND_FATAL_EVENTS_RISKS,
        shenaiSDK.HealthIndex.CARDIOVASCULAR_RISK_SCORE,
        shenaiSDK.HealthIndex.HYPERTENSION_RISK,
        shenaiSDK.HealthIndex.DIABETES_RISK,
        shenaiSDK.HealthIndex.NON_ALCOHOLIC_FATTY_LIVER_DISEASE_RISK,
        shenaiSDK.HealthIndex.WAIST_TO_HEIGHT_RATIO,
        shenaiSDK.HealthIndex.BODY_FAT_PERCENTAGE,
        shenaiSDK.HealthIndex.BODY_ROUNDNESS_INDEX,
        shenaiSDK.HealthIndex.A_BODY_SHAPE_INDEX,
        shenaiSDK.HealthIndex.CONICITY_INDEX,
        shenaiSDK.HealthIndex.BASAL_METABOLIC_RATE,
        shenaiSDK.HealthIndex.TOTAL_DAILY_ENERGY_EXPENDITURE,
      ],

      realtimeHrPeriodSeconds: 10,
      realtimeHrvPeriodSeconds: 30,
      realtimeCardiacStressPeriodSeconds: 30,
    };

    const settings: InitializationSettings = {
      initializationMode: shenaiSDK.InitializationMode.MEASUREMENT,
      precisionMode: shenaiSDK.PrecisionMode.STRICT,
      operatingMode: shenaiSDK.OperatingMode.POSITIONING,
      measurementPreset: shenaiSDK.MeasurementPreset.ONE_MINUTE_BETA_METRICS,
      cameraMode: shenaiSDK.CameraMode.FACING_USER,
      onboardingMode: shenaiSDK.OnboardingMode.SHOW_ONCE,
      showUserInterface: true,
      showFacePositioningOverlay: true,
      showVisualWarnings: true,
      enableCameraSwap: true,
      showFaceMask: true,
      showBloodFlow: true,
      hideShenaiLogo: false,
      enableStartAfterSuccess: true,
      enableSummaryScreen: true,
      enableHealthRisks: true,
      saveHealthRisksFactors: true,
      showOutOfRangeResultIndicators: true,
      showTrialMetricLabels: false,
      showStartStopButton: true,
      showInfoButton: true,
      enableMeasurementsDashboard: true,
      showDisclaimer: false,
      enableFullFrameProcessing: false,
      language: "auto",
      customColorTheme: colorTheme,
      customMeasurementConfig: optionalDefaultConfig,
    };
    setInitializationSettings(settings);

    const urlParams = new URLSearchParams(window?.location.search ?? "");
    const apiKey = urlParams.get("apiKey");
    if (apiKey && apiKey.length > 0) {
      initializeSdk(apiKey, settings);
    }
  }, [shenaiSDK]);

  const router = useRouter();
  useEffect(() => {
    router.query.apiKey && setApiKey(router.query.apiKey as string);
  }, [router.query.apiKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (shenaiSDK) {
        setSdkVersion(shenaiSDK.getVersion());

        const isInitialized = shenaiSDK.isInitialized();

        if (!isInitialized) {
          setSdkState(undefined);
          return;
        }

        const newState = {
          isInitialized,

          operatingMode: shenaiSDK.getOperatingMode(),
          precisionMode: shenaiSDK.getPrecisionMode(),
          measurementPreset: shenaiSDK.getMeasurementPreset(),
          cameraMode: shenaiSDK.getCameraMode(),
          faceState: shenaiSDK.getFaceState(),
          screen: shenaiSDK.getScreen() as unknown as ShenaiScreen,

          showUserInterface: shenaiSDK.getShowUserInterface(),
          showFacePositioningOverlay: shenaiSDK.getShowFacePositioningOverlay(),
          showVisualWarnings: shenaiSDK.getShowVisualWarnings(),
          enableCameraSwap: shenaiSDK.getEnableCameraSwap(),
          showFaceMask: shenaiSDK.getShowFaceMask(),
          showBloodFlow: shenaiSDK.getShowBloodFlow(),
          hideShenaiLogo: shenaiSDK.getHideShenaiLogo(),
          enableStartAfterSuccess: shenaiSDK.getEnableStartAfterSuccess(),
          showOutOfRangeResultIndicators:
            shenaiSDK.getShowOutOfRangeResultIndicators(),
          showTrialMetricLabels: shenaiSDK.getShowTrialMetricLabels(),
          showSignalTile: shenaiSDK.getShowSignalTile(),
          showSignalQualityIndicator: shenaiSDK.getShowSignalQualityIndicator(),
          showStartStopButton: shenaiSDK.getShowStartStopButton(),
          enableMeasurementsDashboard: shenaiSDK.getEnableMeasurementsDashboard(),
          showInfoButton: shenaiSDK.getShowInfoButton(),
          showDisclaimer: shenaiSDK.getShowDisclaimer(),
          language: shenaiSDK.getLanguage(),

          enableSummaryScreen: shenaiSDK.getEnableSummaryScreen(),
          enableHealthRisks: shenaiSDK.getEnableHealthRisks(),

          bbox: shenaiSDK.getNormalizedFaceBbox(),
          measurementState: shenaiSDK.getMeasurementState(),
          progress: shenaiSDK.getMeasurementProgressPercentage(),

          hr10s: shenaiSDK.getHeartRate10s(),
          hr4s: shenaiSDK.getHeartRate4s(),
          realtimeHr: shenaiSDK.getRealtimeHeartRate(),
          realtimeHrvSdnn: shenaiSDK.getRealtimeHrvSdnn(),
          realtimeCardiacStress: shenaiSDK.getRealtimeCardiacStress(),
          results: shenaiSDK.getMeasurementResults(),
          healthIndices: shenaiSDK.getHealthRisks(),

          realtimeHeartbeats: shenaiSDK.getRealtimeHeartbeats(100),

          recordingEnabled: shenaiSDK.getRecordingEnabled(),

          badSignal: shenaiSDK.getTotalBadSignalSeconds(),
          signalQuality: shenaiSDK.getCurrentSignalQualityMetric(),

          textureImage: shenaiSDK.getFaceTexturePng(),
          signalImage: shenaiSDK.getSignalQualityMapPng(),
          metaPredictionImage: shenaiSDK.getMetaPredictionImagePng(),

          rppgSignal: shenaiSDK.getFullPpgSignal(),

          pricingPlan: shenaiSDK.getPricingPlan(),
        };
        setSdkState(newState);
        setCustomConfig(shenaiSDK.getCustomMeasurementConfig());
        setColorTheme(shenaiSDK.getCustomColorTheme());
      }
    }, 200);
    return () => clearInterval(interval);
  }, [shenaiSDK]);

  const [colorThemeSnippetCode, setColorThemeSnippetCode] = useState("");
  const [measConfigSnippetCode, setMeasConfigSnippetCode] = useState("");
  const logoSrc = darkMode ? "/shen-logo-darkmode.png" : "/shen-logo.png";

  return (
    <>
      <Head>
        <title>Shen.AI SDK Playground</title>
        <meta name="description" content="Shen.AI SDK Playground" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-darkmode.png" type="image/png" media="(prefers-color-scheme: dark)" />
      </Head>
      <main className={styles.main}>
        <div className={styles.headerRow}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <img
              style={{ height: 20, marginRight: 8, marginTop: 8 }}
              src={logoSrc}
              alt="Shen logo"
            />
            <span style={{ fontSize: 20 }}>SDK Playground</span>
          </div>
          <div style={{ fontSize: "90%" }}>
            <Link href={"https://developer.shen.ai/"} target="_blank">
              <FileTextOutlined />
              &nbsp;SDK Documentation
            </Link>
          </div>
        </div>
        <div className={styles.contentRow}>
          <div className={styles.controlsCol}>
            <Collapse defaultActiveKey={[0, 1]}>
              <Panel header="Initialization" key="0">
                <InitializationView
                  shenaiSDK={shenaiSDK}
                  pendingInitialization={pendingInitialization}
                  initializationSettings={initializationSettings}
                  setInitializationSettings={setInitializationSettings}
                  initializeSdk={initializeSdk}
                  sdkVersion={sdkVersion}
                  colorTheme={colorTheme}
                  customConfig={customConfig}
                  sdkState={sdkState}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  loadRuntime={loadShenaiSDK}
                  destroyRuntime={unloadShenaiSDK}
                />
              </Panel>
              <Panel header="Controls" key="1">
                <ControlsView
                  shenaiSDK={shenaiSDK}
                  sdkState={sdkState}
                  setInitializationSettings={setInitializationSettings}
                />
              </Panel>
              <Panel
                header={
                  <>
                    Custom measurement config&nbsp;&nbsp;
                    <CodeSnippet code={measConfigSnippetCode} />
                  </>
                }
                key="2"
              >
                <CustomMeasurementConfigurator
                  shenaiSDK={shenaiSDK}
                  sdkState={sdkState}
                  customConfig={customConfig}
                  setCustomConfig={setCustomConfig}
                  setInitializationSettings={setInitializationSettings}
                  setSnippetCode={setMeasConfigSnippetCode}
                />
              </Panel>
              <Panel
                header={
                  <>
                    Color Theme&nbsp;&nbsp;
                    <CodeSnippet code={colorThemeSnippetCode} />
                  </>
                }
                key="3"
              >
                <ColorTheme
                  shenaiSDK={shenaiSDK}
                  sdkState={sdkState}
                  colorTheme={colorTheme}
                  setColorTheme={setColorTheme}
                  setSnippetCode={setColorThemeSnippetCode}
                />
              </Panel>
              <Panel header="User Interface settings" key="4">
                <UIElementsControls
                  shenaiSDK={shenaiSDK}
                  sdkState={sdkState}
                  setInitializationSettings={setInitializationSettings}
                />
              </Panel>
            </Collapse>
          </div>
          <div ref={canvasTopRef} className={styles.mxcanvasTopHelper} />
          <canvas id="mxcanvas" className={styles.mxcanvas} />
          <div className={styles.outputsCol}>
            <div className={styles.outputSectionTitle}>
              <h3>Outputs:</h3>
            </div>
            <Collapse defaultActiveKey={[0, 1, 3]}>
              <Panel header="Measurement details" key="0">
                <BasicOutputsView shenaiSDK={shenaiSDK} sdkState={sdkState} />
              </Panel>
              <Panel header="Measurement results" key="1">
                <ResultsView sdkState={sdkState} shenaiSDK={shenaiSDK} />
              </Panel>
              <Panel header="Health indices" key="2">
                <HealthIndicesView sdkState={sdkState} shenaiSDK={shenaiSDK} />
              </Panel>
              <Panel header="Results PDF" key="4">
                <MeasurementResultsPdfSection
                  shenaiSDK={shenaiSDK}
                  sdkState={sdkState}
                />
              </Panel>
              <Panel header="Signals preview" key="3">
                <SignalsPreview sdkState={sdkState} darkMode={darkMode} />
              </Panel>
            </Collapse>
          </div>
        </div>
        <div className={styles.footerRow}>
          &copy; {new Date().getFullYear()} Shen.AI OÜ
        </div>
      </main>
    </>
  );
}

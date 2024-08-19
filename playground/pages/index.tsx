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
  Screen,
  InitializationSettings,
  CustomColorTheme,
  CustomMeasurementConfig,
} from "shenai-sdk";
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

const { Panel } = Collapse;

export interface ShenaiSdkState {
  isInitialized: boolean;

  operatingMode: OperatingMode;
  precisionMode: PrecisionMode;
  measurementPreset: MeasurementPreset;
  cameraMode: CameraMode;
  faceState: FaceState;
  screen: Screen;

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

  bbox: NormalizedFaceBbox | null;
  measurementState: MeasurementState;
  progress: number;

  hr10s: number | null;
  hr4s: number | null;
  realtimeHr: number | null;
  realtimeHrvSdnn: number | null;
  realtimeCardiacStress: number | null;
  results: MeasurementResults | null;

  realtimeHeartbeats: Heartbeat[];

  recordingEnabled: boolean;
  badSignal: number | null;
  signalQuality: number | null;

  textureImage: number[];
  signalImage: number[];
  metaPredictionImage: number[];

  rppgSignal: number[];
}

export default function Home() {
  const shenaiSDK = useShenaiSdk();
  const darkMode = useDarkMode();

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
    console.log("would scroll but no element");
    if (canvasTopRef.current) {
      console.log("should scroll to canvas now");
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
    const settings: InitializationSettings = {
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
      showOutOfRangeResultIndicators: true,
      showTrialMetricLabels: true,
      enableFullFrameProcessing: false,
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
          screen: shenaiSDK.getScreen(),

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

          bbox: shenaiSDK.getNormalizedFaceBbox(),
          measurementState: shenaiSDK.getMeasurementState(),
          progress: shenaiSDK.getMeasurementProgressPercentage(),

          hr10s: shenaiSDK.getHeartRate10s(),
          hr4s: shenaiSDK.getHeartRate4s(),
          realtimeHr: shenaiSDK.getRealtimeHeartRate(),
          realtimeHrvSdnn: shenaiSDK.getRealtimeHrvSdnn(),
          realtimeCardiacStress: shenaiSDK.getRealtimeCardiacStress(),
          results: shenaiSDK.getMeasurementResults(),

          realtimeHeartbeats: shenaiSDK.getRealtimeHeartbeats(100),

          recordingEnabled: shenaiSDK.getRecordingEnabled(),

          badSignal: shenaiSDK.getTotalBadSignalSeconds(),
          signalQuality: shenaiSDK.getCurrentSignalQualityMetric(),

          textureImage: shenaiSDK.getFaceTexturePng(),
          signalImage: shenaiSDK.getSignalQualityMapPng(),
          metaPredictionImage: shenaiSDK.getMetaPredictionImagePng(),

          rppgSignal: shenaiSDK.getFullPpgSignal(),
        };
        setSdkState(newState);
        //console.log(newState);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [shenaiSDK]);

  const [colorThemeSnippetCode, setColorThemeSnippetCode] = useState("");
  const [measConfigSnippetCode, setMeasConfigSnippetCode] = useState("");

  return (
    <>
      <Head>
        <title>Shen.AI SDK Playground</title>
        <meta name="description" content="Shen.AI SDK Playground" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.headerRow}>
          <div>
            <img
              style={{ height: 32, marginRight: 8 }}
              src="/shen-square.png"
            />
            <span>Shen.AI SDK Playground</span>
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
            <div className={styles.controlRow} style={{ marginBottom: 10 }}>
              <div className={styles.controlTitle}>
                SDK version
                <CodeSnippet code={`shenaiSDK.getVersion();`} />
              </div>{" "}
              <div>{sdkVersion}</div>
            </div>
            <Collapse defaultActiveKey={[0, 1]}>
              <Panel header="Initialization" key="0">
                <InitializationView
                  shenaiSDK={shenaiSDK}
                  pendingInitialization={pendingInitialization}
                  initializationSettings={initializationSettings}
                  setInitializationSettings={setInitializationSettings}
                  initializeSdk={initializeSdk}
                  colorTheme={colorTheme}
                  customConfig={customConfig}
                  sdkState={sdkState}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
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
              <Panel header="UI elements" key="4">
                <UIElementsControls
                  shenaiSDK={shenaiSDK}
                  sdkState={sdkState}
                  setInitializationSettings={setInitializationSettings}
                />
              </Panel>
              <Panel header="Visualizations" key="5">
                <Visualizations sdkState={sdkState} />
              </Panel>
            </Collapse>
          </div>
          <div ref={canvasTopRef} className={styles.mxcanvasTopHelper} />
          <canvas id="mxcanvas" className={styles.mxcanvas} />
          <div className={styles.outputsCol}>
            <div className={styles.outputSectionTitle}>Outputs:</div>
            <BasicOutputsView shenaiSDK={shenaiSDK} sdkState={sdkState} />
            <ResultsView sdkState={sdkState} />
            <SignalsPreview sdkState={sdkState} darkMode={darkMode} />
          </div>
        </div>
        <div className={styles.footerRow}>
          &copy; {new Date().getFullYear()} MX Labs OÜ
        </div>
      </main>
    </>
  );
}

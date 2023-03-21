import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import {
  ShenaiSDK,
  OperatingMode,
  MeasurementPreset,
  CameraMode,
  FaceState,
  NormalizedFaceBbox,
  MeasurementState,
  MeasurementResults,
  Heartbeat,
  PrecisionMode,
  InitializationResult,
} from "shenai-sdk";
import { Button, Switch, Input, message } from "antd";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TypescriptSnippet } from "../components/CodeSnippet";
import { useRouter } from "next/router";

const HeartbeatsPreview = dynamic(
  () => import("../components/HeartbeatsPreview"),
  {
    ssr: false,
  }
);

let shenaiSDK: ShenaiSDK | null = null;
let initializeSDK: (apiKey: string) => void = () => {};

function getInitResultString(initResult: InitializationResult) {
  switch (initResult) {
    case shenaiSDK?.InitializationResult.OK:
      return "OK";
    case shenaiSDK?.InitializationResult.INVALID_API_KEY:
      return "INVALID_API_KEY";
    case shenaiSDK?.InitializationResult.CONNECTION_ERROR:
      return "CONNECTION_ERROR";
    case shenaiSDK?.InitializationResult.INTERNAL_ERROR:
      return "INTERNAL_ERROR";
  }
  return "UNKNOWN";
}

// Shen.AI SDK is not available on the server side, so we need to check if we are on the client side
if (typeof window !== "undefined") {
  import("shenai-sdk")
    .then((sdk) =>
      sdk.default({
        onRuntimeInitialized: () => {
          console.log("Shen.AI Runtime initialized");
        },
      })
    )
    .then((sdk) => {
      shenaiSDK = sdk;
      initializeSDK = (apiKey: string) => {
        shenaiSDK?.initialize(apiKey, "", {}, (res) => {
          if (res === shenaiSDK?.InitializationResult.OK) {
            console.log("Shen.AI License result: ", res);
            shenaiSDK?.attachToCanvas("#mxcanvas");
          } else {
            message.error(
              "License initialization problem: " + getInitResultString(res)
            );
          }
        });
      };
    });
}

const inter = Inter({ subsets: ["latin"] });

function getFaceStateString(faceState: FaceState) {
  switch (faceState) {
    case shenaiSDK?.FaceState.OK:
      return "OK";
    case shenaiSDK?.FaceState.TOO_CLOSE:
      return "TOO_CLOSE";
    case shenaiSDK?.FaceState.TOO_FAR:
      return "TOO_FAR";
    case shenaiSDK?.FaceState.NOT_CENTERED:
      return "NOT_CENTERED";
    case shenaiSDK?.FaceState.NOT_VISIBLE:
      return "NOT_VISIBLE";
    case shenaiSDK?.FaceState.UNKNOWN:
      return "UNKNOWN";
  }
  return "UNKNOWN";
}

function getMeasurementStateString(measurementState: MeasurementState) {
  switch (measurementState) {
    case shenaiSDK?.MeasurementState.NOT_STARTED:
      return "NOT_STARTED";
    case shenaiSDK?.MeasurementState.WAITING_FOR_FACE:
      return "WAITING_FOR_FACE";
    case shenaiSDK?.MeasurementState.RUNNING_SIGNAL_SHORT:
      return "RUNNING_SIGNAL_SHORT";
    case shenaiSDK?.MeasurementState.RUNNING_SIGNAL_BAD:
      return "RUNNING_SIGNAL_BAD";
    case shenaiSDK?.MeasurementState.RUNNING_SIGNAL_GOOD:
      return "RUNNING_SIGNAL_GOOD";
    case shenaiSDK?.MeasurementState.FINISHED:
      return "FINISHED";
    case shenaiSDK?.MeasurementState.FAILED:
      return "FAILED";
  }
  return "UNKNOWN";
}

interface ShenaiSdkState {
  isInitialized: boolean;

  operatingMode: OperatingMode;
  precisionMode: PrecisionMode;
  measurementPreset: MeasurementPreset;
  cameraMode: CameraMode;
  faceState: FaceState;

  showUserInterface: boolean;
  showFacePositioningOverlay: boolean;
  showVisualWarnings: boolean;
  enableCameraSwap: boolean;
  showFaceMask: boolean;
  showBloodFlow: boolean;

  bbox: NormalizedFaceBbox | null;
  measurementState: MeasurementState;
  progress: number;

  hr10s: number | null;
  hr4s: number | null;
  results: MeasurementResults | null;

  realtimeHeartbeats: Heartbeat[];

  recordingEnabled: boolean;
  badSignal: number | null;
}

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [sdkState, setSdkState] = useState<ShenaiSdkState>();

  const router = useRouter();
  useEffect(() => {
    router.query.apiKey && setApiKey(router.query.apiKey as string);
  }, [router.query.apiKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (shenaiSDK) {
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

          showUserInterface: shenaiSDK.getShowUserInterface(),
          showFacePositioningOverlay: shenaiSDK.getShowFacePositioningOverlay(),
          showVisualWarnings: shenaiSDK.getShowVisualWarnings(),
          enableCameraSwap: shenaiSDK.getEnableCameraSwap(),
          showFaceMask: shenaiSDK.getShowFaceMask(),
          showBloodFlow: shenaiSDK.getShowBloodFlow(),

          bbox: shenaiSDK.getNormalizedFaceBbox(),
          measurementState: shenaiSDK.getMeasurementState(),
          progress: shenaiSDK.getMeasurementProgressPercentage(),

          hr10s: shenaiSDK.getHeartRate10s(),
          hr4s: shenaiSDK.getHeartRate4s(),
          results: shenaiSDK.getMeasurementResults(),

          realtimeHeartbeats: shenaiSDK.getRealtimeHeartbeats(100),

          recordingEnabled: shenaiSDK.getRecordingEnabled(),

          badSignal: shenaiSDK.getTotalBadSignalSeconds(),
        };
        setSdkState(newState);
        //console.log(newState);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Shen.AI SDK Playground</title>
        <meta name="description" content="Shen.AI SDK Playground" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.controlsCol}>
          Initialization:
          <div className={styles.controlRow}>
            API key:{" "}
            <Input.Password
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Is initialized?
              <TypescriptSnippet code={`shenaiSDK.isInitialized();`} />
            </div>{" "}
            <div>{sdkState?.isInitialized ? "Yes" : "No"}</div>
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              <Button
                disabled={sdkState?.isInitialized === true}
                onClick={() => initializeSDK(apiKey)}
              >
                Initialize
              </Button>
              <TypescriptSnippet
                code={`shenaiSDK.initialize("API_KEY", "USER_ID", {}, (res) => {
  console.log("Initialization result: ", res)));
});`}
              />
            </div>
            <div>
              <TypescriptSnippet code={`shenaiSDK.deinitialize();`} />
              <Button
                disabled={sdkState?.isInitialized === false}
                onClick={() => {
                  shenaiSDK?.deinitialize();
                  const newcanvas = document.createElement("canvas");
                  document.getElementById("mxcanvas")?.replaceWith(newcanvas);
                  newcanvas.id = "mxcanvas";
                  newcanvas.style.maxHeight = "100vh";
                  newcanvas.style.aspectRatio = "0.547";
                }}
              >
                Deinitialize
              </Button>
            </div>
          </div>
          Controls:
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Operating mode:
              <TypescriptSnippet
                code={`shenaiSDK.setOperatingMode(shenaiSDK.OperatingMode.POSITIONING);
shenaiSDK.setOperatingMode(shenaiSDK.OperatingMode.MEASURE);
shenaiSDK.getOperatingMode();
`}
              />
            </div>
            <Button.Group>
              <Button
                type={
                  sdkState?.operatingMode &&
                  sdkState?.operatingMode ===
                    shenaiSDK?.OperatingMode.POSITIONING
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setOperatingMode(
                    shenaiSDK.OperatingMode.POSITIONING
                  )
                }
              >
                Positioning
              </Button>
              <Button
                type={
                  sdkState?.operatingMode &&
                  sdkState?.operatingMode === shenaiSDK?.OperatingMode.MEASURE
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setOperatingMode(shenaiSDK.OperatingMode.MEASURE)
                }
              >
                Measure
              </Button>
            </Button.Group>
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Precision mode:
              <TypescriptSnippet
                code={`shenaiSDK.setPrecisionMode(shenaiSDK.PrecisionMode.STRICT);
shenaiSDK.setPrecisionMode(shenaiSDK.PrecisionMode.RELAXED);
shenaiSDK.getPrecisionMode();
`}
              />
            </div>
            <Button.Group>
              <Button
                type={
                  sdkState?.precisionMode &&
                  sdkState?.precisionMode === shenaiSDK?.PrecisionMode.STRICT
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setPrecisionMode(shenaiSDK.PrecisionMode.STRICT)
                }
              >
                Strict
              </Button>
              <Button
                type={
                  sdkState?.precisionMode &&
                  sdkState?.precisionMode === shenaiSDK?.PrecisionMode.RELAXED
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setPrecisionMode(shenaiSDK.PrecisionMode.RELAXED)
                }
              >
                Relaxed
              </Button>
            </Button.Group>
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Measurement preset:
              <TypescriptSnippet
                code={`shenaiSDK.setMeasurementPreset(shenaiSDK.MeasurementPreset.ONE_MINUTE_HR_HRV_BR);
shenaiSDK.setMeasurementPreset(shenaiSDK.MeasurementPreset.ONE_MINUTE_BETA_METRICS);
shenaiSDK.setMeasurementPreset(shenaiSDK.MeasurementPreset.INFINITE_HR);
shenaiSDK.getMeasurementPreset();`}
              />
            </div>
            <Button.Group style={{ flexDirection: "column" }}>
              <Button
                type={
                  sdkState?.measurementPreset &&
                  sdkState?.measurementPreset ===
                    shenaiSDK?.MeasurementPreset.ONE_MINUTE_HR_HRV_BR
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setMeasurementPreset(
                    shenaiSDK.MeasurementPreset.ONE_MINUTE_HR_HRV_BR
                  )
                }
              >
                1 minute HR/HRV/BR
              </Button>
              <Button
                type={
                  sdkState?.measurementPreset &&
                  sdkState?.measurementPreset ===
                    shenaiSDK?.MeasurementPreset.ONE_MINUTE_BETA_METRICS
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setMeasurementPreset(
                    shenaiSDK.MeasurementPreset.ONE_MINUTE_BETA_METRICS
                  )
                }
              >
                1 minute beta metrics (BP/stress)
              </Button>
              <Button
                type={
                  sdkState?.measurementPreset &&
                  sdkState?.measurementPreset ===
                    shenaiSDK?.MeasurementPreset.INFINITE_HR
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setMeasurementPreset(
                    shenaiSDK.MeasurementPreset.INFINITE_HR
                  )
                }
              >
                Infinite HR
              </Button>
            </Button.Group>
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Camera facing:
              <TypescriptSnippet
                code={`shenaiSDK.setCameraMode(shenaiSDK.CameraMode.OFF);
shenaiSDK.setCameraMode(shenaiSDK.CameraMode.FACING_USER);
shenaiSDK.setCameraMode(shenaiSDK.CameraMode.FACING_ENVIRONMENT);
shenaiSDK.getCameraMode();`}
              />
            </div>
            <Button.Group>
              <Button
                type={
                  sdkState?.cameraMode &&
                  sdkState?.cameraMode === shenaiSDK?.CameraMode.OFF
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setCameraMode(shenaiSDK.CameraMode.OFF)
                }
              >
                Off
              </Button>
              <Button
                type={
                  sdkState?.cameraMode &&
                  sdkState?.cameraMode === shenaiSDK?.CameraMode.FACING_USER
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setCameraMode(shenaiSDK.CameraMode.FACING_USER)
                }
              >
                User
              </Button>
              <Button
                type={
                  sdkState?.cameraMode &&
                  sdkState?.cameraMode ===
                    shenaiSDK?.CameraMode.FACING_ENVIRONMENT
                    ? "primary"
                    : "default"
                }
                onClick={() =>
                  shenaiSDK?.setCameraMode(
                    shenaiSDK.CameraMode.FACING_ENVIRONMENT
                  )
                }
              >
                Environment
              </Button>
            </Button.Group>
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Show user interface:
              <TypescriptSnippet
                code={`shenaiSDK.getShowUserInterface();
shenaiSDK.setShowUserInterface(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.showUserInterface}
              onChange={(v) => {
                shenaiSDK?.setShowUserInterface(v);
              }}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Show face positioning overlay:
              <TypescriptSnippet
                code={`shenaiSDK.getShowFacePositioningOverlay();
shenaiSDK.setShowFacePositioningOverlay(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.showFacePositioningOverlay}
              onChange={(v) => {
                shenaiSDK?.setShowFacePositioningOverlay(v);
              }}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Show visual warnings:
              <TypescriptSnippet
                code={`shenaiSDK.getShowVisualWarnings();
shenaiSDK.setShowVisualWarnings(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.showVisualWarnings}
              onChange={(v) => {
                shenaiSDK?.setShowVisualWarnings(v);
              }}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Enable camera swap:
              <TypescriptSnippet
                code={`shenaiSDK.getEnableCameraSwap();
shenaiSDK.setEnableCameraSwap(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.enableCameraSwap}
              onChange={(v) => {
                shenaiSDK?.setEnableCameraSwap(v);
              }}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Show face mask:
              <TypescriptSnippet
                code={`shenaiSDK.getShowFaceMask();
shenaiSDK.setShowFaceMask(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.showFaceMask}
              onChange={(v) => {
                shenaiSDK?.setShowFaceMask(v);
              }}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Show blood flow:
              <TypescriptSnippet
                code={`shenaiSDK.getShowBloodFlow();
shenaiSDK.setShowBloodFlow(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.showBloodFlow}
              onChange={(v) => {
                shenaiSDK?.setShowBloodFlow(v);
              }}
            />
          </div>
          <div className={styles.controlRow}>
            <div className={styles.controlTitle}>
              Debug record measurement:
              <TypescriptSnippet
                code={`shenaiSDK.getRecordingEnabled();
shenaiSDK.setRecordingEnabled(false);`}
              />
            </div>
            <Switch
              checked={sdkState?.recordingEnabled}
              onChange={(v) => {
                shenaiSDK?.setRecordingEnabled(v);
              }}
            />
          </div>
        </div>
        <canvas
          id="mxcanvas"
          style={{ maxHeight: "100vh", aspectRatio: 0.547 }}
        />
        <div className={styles.outputsCol}>
          Outputs:
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Face state:
              <TypescriptSnippet
                code={`const faceState = shenaiSDK.getFaceState();
switch (faceState) {
  case shenaiSDK.FaceState.OK:
  case shenaiSDK.FaceState.TOO_CLOSE:
  case shenaiSDK.FaceState.TOO_FAR:
  case shenaiSDK.FaceState.NOT_CENTERED:
  case shenaiSDK.FaceState.NOT_VISIBLE:
  case shenaiSDK.FaceState.UNKNOWN:
}`}
              />
            </div>
            <div className={styles.outputValue}>
              {sdkState && getFaceStateString(sdkState.faceState)}
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Face bbox:
              <TypescriptSnippet
                code={`const {x, y, width, height} = shenaiSDK.getFaceBbox();`}
              />
            </div>
            <div className={styles.outputValue}>
              {sdkState?.bbox &&
                `[x: ${sdkState.bbox.x.toFixed(
                  2
                )}, y: ${sdkState.bbox.y.toFixed(
                  2
                )}], w: ${sdkState.bbox.width.toFixed(
                  2
                )}, h: ${sdkState.bbox.height.toFixed(2)}]`}
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Measurement state:
              <TypescriptSnippet
                code={`const measurementState = shenaiSDK.getMeasurementState();
switch (measurementState) {
  case shenaiSDK.MeasurementState.NOT_STARTED:
  case shenaiSDK.MeasurementState.WAITING_FOR_FACE:
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_SHORT:
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_BAD:
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_GOOD:
  case shenaiSDK.MeasurementState.FINISHED:
  case shenaiSDK.MeasurementState.FAILED:
}
`}
              />
            </div>
            <div className={styles.outputValue}>
              {sdkState?.measurementState &&
                getMeasurementStateString(sdkState.measurementState)}
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Measurement progress:
              <TypescriptSnippet
                code={`shenaiSDK.getMeasurementProgressPercentage();`}
              />
            </div>
            <div className={styles.outputValue}>
              {sdkState?.progress ? `${sdkState.progress.toFixed(0)}%` : ""}
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Bad signal:
              <TypescriptSnippet
                code={`shenaiSDK.getTotalBadSignalSeconds();`}
              />
            </div>
            <div className={styles.outputValue}>
              {sdkState?.badSignal ? `${sdkState.badSignal.toFixed(0)}s` : ""}
            </div>
          </div>
          Results:
          <div className={styles.outputBicol}>
            <div className={styles.bicolcol}>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  HR (10s)
                  <TypescriptSnippet code={`shenaiSDK.getHeartRate10s();`} />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.hr10s ? `${sdkState.hr10s.toFixed(0)} bpm` : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  HR (final)
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.heart_rate_bpm;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results
                    ? `${sdkState.results.heart_rate_bpm.toFixed(0)} bpm`
                    : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  HRV (SDNN)
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.hrv_sdnn_ms;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results
                    ? `${sdkState.results.hrv_sdnn_ms.toFixed(0)} ms`
                    : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  HRV (lnRMSSD)
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.hrv_lnrmssd_ms;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results
                    ? `${sdkState.results.hrv_lnrmssd_ms.toFixed(1)}`
                    : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  BR
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.breathing_rate_bpm;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results?.breathing_rate_bpm &&
                    `${sdkState.results.breathing_rate_bpm.toFixed(0)} bpm`}
                </div>
              </div>
            </div>
            <div className={styles.bicolcol}>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  HR (4s)
                  <TypescriptSnippet code={`shenaiSDK.getHeartRate4s();`} />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.hr4s ? `${sdkState.hr4s.toFixed(0)} bpm` : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  Stress Index
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.stress_index;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results
                    ? `${sdkState.results.stress_index.toFixed(1)}`
                    : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  Systolic BP
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.systolic_blood_pressure_mmhg;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results
                    ? `${sdkState.results.systolic_blood_pressure_mmhg?.toFixed(
                        0
                      )} mmHg`
                    : ""}
                </div>
              </div>
              <div className={styles.outputRow}>
                <div className={styles.outputLabel}>
                  Diastolic BP
                  <TypescriptSnippet
                    code={`shenaiSDK.getMeasurementResults()?.diastolic_blood_pressure_mmhg;`}
                  />
                </div>
                <div className={styles.outputValue}>
                  {sdkState?.results
                    ? `${sdkState.results.diastolic_blood_pressure_mmhg?.toFixed(
                        0
                      )} mmHg`
                    : ""}
                </div>
              </div>
            </div>
          </div>
          Signals:
          <TypescriptSnippet
            code={`shenaiSDK.getRealtimeHeartbeats();
shenaiSDK.getMeasurementResults()?.heartbeats;`}
          />
          <HeartbeatsPreview
            realtimeBeats={sdkState?.realtimeHeartbeats}
            finalBeats={sdkState?.results?.heartbeats}
          />
        </div>
      </main>
    </>
  );
}

import { ShenaiSdkState } from "../pages";
import styles from "../styles/Home.module.css";
import { CodeSnippet } from "./CodeSnippet";
import { getEnumName } from "../helpers";
import { ShenaiSDK } from "shenai-sdk";

export const BasicOutputsView: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  sdkState?: ShenaiSdkState;
}> = ({ shenaiSDK, sdkState }) => {
  const measurementInProgress =
    sdkState &&
    shenaiSDK &&
    [
      shenaiSDK.MeasurementState.FAILED,
      shenaiSDK.MeasurementState.FINISHED,
      shenaiSDK.MeasurementState.NOT_STARTED,
    ].indexOf(sdkState.measurementState) < 0;

  return (
    <>
      <div className={styles.outputRow}>
        <div className={styles.outputLabel}>
          Face state:
          <CodeSnippet
            code={`const faceState = shenaiSDK.getFaceState();
switch (faceState) {
  case shenaiSDK.FaceState.OK: { break; }
  case shenaiSDK.FaceState.TOO_CLOSE: { break; }
  case shenaiSDK.FaceState.TOO_FAR: { break; }
  case shenaiSDK.FaceState.NOT_CENTERED: { break; }
  case shenaiSDK.FaceState.NOT_VISIBLE: { break; }
  case shenaiSDK.FaceState.UNKNOWN: { break; }
}`}
          />
        </div>
        <div className={styles.outputCodeValue}>
          {getEnumName(shenaiSDK?.FaceState, sdkState?.faceState, "UNKNOWN")}
        </div>
      </div>
      <div className={styles.outputRow}>
        <div className={styles.outputLabel}>
          Face bbox:
          <CodeSnippet
            code={`const {x, y, width, height} = shenaiSDK.getFaceBbox();`}
          />
        </div>
        <div className={styles.outputCodeValue}>
          {(sdkState?.bbox &&
            `[x:${sdkState.bbox.x.toFixed(2)}, y:${sdkState.bbox.y.toFixed(
              2
            )}, w:${sdkState.bbox.width.toFixed(
              2
            )}, h:${sdkState.bbox.height.toFixed(2)}]`) ||
            "-"}
        </div>
      </div>
      <div className={styles.outputRow}>
        <div className={styles.outputLabel}>
          Measurement state:
          <CodeSnippet
            code={`const measurementState = shenaiSDK.getMeasurementState();
switch (measurementState) {
  case shenaiSDK.MeasurementState.NOT_STARTED: { break; }
  case shenaiSDK.MeasurementState.WAITING_FOR_FACE: { break; }
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_SHORT: { break; }
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_GOOD: { break; }
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_BAD: { break; }
  case shenaiSDK.MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE: { break; }
  case shenaiSDK.MeasurementState.FINISHED: { break; }
  case shenaiSDK.MeasurementState.FAILED: { break; }
`}
          />
        </div>
        <div className={styles.outputCodeValue}>
          {getEnumName(
            shenaiSDK?.MeasurementState,
            sdkState?.measurementState,
            "UNKNOWN"
          )}
        </div>
      </div>
      <div className={styles.outputRow}>
        <div className={styles.outputLabel}>
          Measurement progress:
          <CodeSnippet code={`shenaiSDK.getMeasurementProgressPercentage();`} />
        </div>
        <div className={styles.outputValue}>
          {typeof sdkState?.progress === "number" && measurementInProgress
            ? `${sdkState.progress.toFixed(0)}%`
            : "-"}
        </div>
      </div>
      <div className={styles.outputRow}>
        <div className={styles.outputLabel}>
          Bad signal:
          <CodeSnippet code={`shenaiSDK.getTotalBadSignalSeconds();`} />
        </div>
        <div className={styles.outputValue}>
          {typeof sdkState?.badSignal === "number" && measurementInProgress
            ? `${sdkState.badSignal.toFixed(0)}s`
            : "-"}
        </div>{" "}
      </div>
      <div className={styles.outputRow}>
        <div className={styles.outputLabel}>
          Signal quality:
          <CodeSnippet code={`shenaiSDK.getCurrentSignalQualityMetric();`} />
        </div>
        <div className={styles.outputValue}>
          {typeof sdkState?.signalQuality === "number" && measurementInProgress
            ? `${sdkState.signalQuality.toFixed(1)} dB`
            : "-"}
        </div>
      </div>
    </>
  );
};

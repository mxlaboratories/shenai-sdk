import { Button } from "antd";
import { ShenaiSdkState } from "../pages";
import styles from "../styles/Home.module.css";
import { CodeSnippet } from "./CodeSnippet";
import { CameraChoice } from "./CameraChoice";
import { ScreenSwitch } from "./ScreenSwitch";
import { LanguageChoice } from "./LanguageChoice";
import { MeasurementPresetChoice } from "./MeasurementPreset";
import {
  InitializationSettings,
  OperatingMode,
  PrecisionMode,
  ShenaiSDK,
} from "shenai-sdk";
import { Dispatch, SetStateAction } from "react";

export const ControlsView: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  sdkState?: ShenaiSdkState;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({ shenaiSDK, sdkState, setInitializationSettings }) => {
  function setOperatingMode(operatingMode?: OperatingMode) {
    if (!operatingMode) return;
    shenaiSDK?.setOperatingMode(operatingMode);
    setInitializationSettings((s) => ({ ...s, operatingMode }));
  }
  function setPrecisionMode(precisionMode?: PrecisionMode) {
    if (!precisionMode) return;
    shenaiSDK?.setPrecisionMode(precisionMode);
    setInitializationSettings((s) => ({ ...s, precisionMode }));
  }

  const disabled = !shenaiSDK || !sdkState?.isInitialized;

  return (
    <>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          Operating mode:
          <CodeSnippet
            code={`\
shenaiSDK.getOperatingMode();
shenaiSDK.setOperatingMode(shenaiSDK.OperatingMode.POSITIONING);
shenaiSDK.setOperatingMode(shenaiSDK.OperatingMode.MEASURE);`}
          />
        </div>
        <Button.Group>
          <Button
            type={
              sdkState?.operatingMode &&
              sdkState?.operatingMode === shenaiSDK?.OperatingMode.POSITIONING
                ? "primary"
                : "default"
            }
            onClick={() =>
              setOperatingMode(shenaiSDK?.OperatingMode.POSITIONING)
            }
            disabled={disabled}
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
            onClick={() => setOperatingMode(shenaiSDK?.OperatingMode.MEASURE)}
            disabled={disabled}
          >
            Measure
          </Button>
        </Button.Group>
      </div>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          Precision mode:
          <CodeSnippet
            code={`\
shenaiSDK.getPrecisionMode();
shenaiSDK.setPrecisionMode(shenaiSDK.PrecisionMode.STRICT);
shenaiSDK.setPrecisionMode(shenaiSDK.PrecisionMode.RELAXED);`}
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
            onClick={() => setPrecisionMode(shenaiSDK?.PrecisionMode.STRICT)}
            disabled={disabled}
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
            onClick={() => setPrecisionMode(shenaiSDK?.PrecisionMode.RELAXED)}
            disabled={disabled}
          >
            Relaxed
          </Button>
        </Button.Group>
      </div>
      <CameraChoice
        shenaiSDK={shenaiSDK}
        sdkState={sdkState}
        setInitializationSettings={setInitializationSettings}
      />
      <ScreenSwitch shenaiSDK={shenaiSDK} sdkState={sdkState} />
      <LanguageChoice shenaiSDK={shenaiSDK} sdkState={sdkState} />
      <MeasurementPresetChoice
        shenaiSDK={shenaiSDK}
        sdkState={sdkState}
        setInitializationSettings={setInitializationSettings}
      />
    </>
  );
};

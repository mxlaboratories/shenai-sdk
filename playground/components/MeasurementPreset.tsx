import React, { Dispatch, SetStateAction, useMemo } from "react";
import { ShenaiSdkState } from "../pages";
import { Select } from "antd";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import {
  InitializationSettings,
  MeasurementPreset,
  ShenaiSDK,
} from "shenai-sdk";
import { getEnumName } from "../helpers";

export const MeasurementPresetChoice: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({ shenaiSDK, sdkState, setInitializationSettings }) => {
  const presetNames = useMemo(() => {
    if (!shenaiSDK) return;
    const m = new Map<MeasurementPreset, string>();
    m.set(
      shenaiSDK.MeasurementPreset.ONE_MINUTE_ALL_METRICS,
      "1 minute"
    );
    m.set(
      shenaiSDK.MeasurementPreset.FOURTY_FIVE_SECONDS_ALL_METRICS,
      "45s"
    );
    m.set(
      shenaiSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
      "30s"
    );
    m.set(
      shenaiSDK.MeasurementPreset.QUICK_HR_MODE,
      "10s Heart Rate"
    );
    m.set(shenaiSDK.MeasurementPreset.CUSTOM, "Custom");
    return m;
  }, [shenaiSDK]);

  const stringToPreset = useMemo(() => {
    if (!presetNames) return;
    const m = new Map<string, MeasurementPreset>();
    presetNames.forEach((val, key) => m.set(val, key));
    return m;
  }, [presetNames]);

  const code = useMemo(() => {
    const lines = ["shenaiSDK.getMeasurementPreset();"];
    const currentPreset = sdkState?.measurementPreset;
    if (presetNames) {
      presetNames.forEach((val, preset) => {
        const name = getEnumName(shenaiSDK?.MeasurementPreset, preset);
        if (name != "")
          lines.push(
            `${
              preset != currentPreset ? "// " : ""
            }shenaiSDK.setMeasurementPreset(shenaiSDK.MeasurementPreset.${name});`
          );
      });
    }
    return lines.join("\n");
  }, [shenaiSDK, sdkState, presetNames]);

  return (
    <div className={styles.controlRow}>
      <div className={styles.controlTitle}>
        Measurement preset:
        <CodeSnippet code={code} />
      </div>
      <Select
        value={
          (sdkState && presetNames?.get(sdkState.measurementPreset)) ??
          "UNKNOWN"
        }
        style={{ width: 200 }}
        onChange={(value) => {
          if (!shenaiSDK) return;
          const measurementPreset =
            stringToPreset?.get(value) ??
            shenaiSDK.MeasurementPreset.ONE_MINUTE_HR_HRV_BR;
          shenaiSDK.setMeasurementPreset(measurementPreset);
          setInitializationSettings((s) => ({ ...s, measurementPreset }));
        }}
        popupMatchSelectWidth={false}
        options={
          presetNames
            ? Array.from(presetNames.values()).map((value) => ({ value }))
            : []
        }
        disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
      />
    </div>
  );
};

import React, { Dispatch, SetStateAction } from "react";
import { CodeSnippet } from "./CodeSnippet";
import { Switch } from "antd";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { InitializationSettings, ShenaiSDK } from "shenai-sdk";

export const UIElementsControls: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  sdkState?: ShenaiSdkState;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({ shenaiSDK, sdkState, setInitializationSettings }) => {
  const boolSettings = [
    {
      title: "Show user interface",
      value: sdkState?.showUserInterface,
      code: "ShowUserInterface",
      update: (b: boolean) => {
        shenaiSDK?.setShowUserInterface(b);
        setInitializationSettings((s) => ({ ...s, showUserInterface: b }));
      },
    },
    {
      title: "Show face positioning overlay",
      value: sdkState?.showFacePositioningOverlay,
      code: "ShowFacePositioningOverlay",
      update: (b: boolean) => {
        shenaiSDK?.setShowFacePositioningOverlay(b);
        setInitializationSettings((s) => ({
          ...s,
          showFacePositioningOverlay: b,
        }));
      },
    },
    {
      title: "Show visual warnings",
      value: sdkState?.showVisualWarnings,
      code: "ShowVisualWarnings",
      update: (b: boolean) => {
        shenaiSDK?.setShowVisualWarnings(b);
        setInitializationSettings((s) => ({ ...s, showVisualWarnings: b }));
      },
    },
    {
      title: "Enable camera swap",
      value: sdkState?.enableCameraSwap,
      code: "EnableCameraSwap",
      update: (b: boolean) => {
        shenaiSDK?.setEnableCameraSwap(b);
        setInitializationSettings((s) => ({ ...s, enableCameraSwap: b }));
      },
    },
    {
      title: "Show face mask",
      value: sdkState?.showFaceMask,
      code: "ShowFaceMask",
      update: (b: boolean) => {
        shenaiSDK?.setShowFaceMask(b);
        setInitializationSettings((s) => ({ ...s, showFaceMask: b }));
      },
    },
    {
      title: "Show blood flow",
      value: sdkState?.showBloodFlow,
      code: "ShowBloodFlow",
      update: (b: boolean) => {
        shenaiSDK?.setShowBloodFlow(b);
        setInitializationSettings((s) => ({ ...s, showBloodFlow: b }));
      },
    },
    {
      title: "Hide Shen.AI logo",
      value: sdkState?.hideShenaiLogo,
      code: "HideShenaiLogo",
      update: (b: boolean) => {
        shenaiSDK?.setHideShenaiLogo(b);
        setInitializationSettings((s) => ({ ...s, hideShenaiLogo: b }));
      },
    },
    {
      title: "Enable start after success",
      value: sdkState?.enableStartAfterSuccess,
      code: "EnableStartAfterSuccess",
      update: (b: boolean) => {
        shenaiSDK?.setEnableStartAfterSuccess(b);
        setInitializationSettings((s) => ({
          ...s,
          enableStartAfterSuccess: b,
        }));
      },
    },
    {
      title: "Indicate out-of-range results",
      value: sdkState?.showOutOfRangeResultIndicators,
      code: "ShowOutOfRangeResultIndicators",
      update: (b: boolean) => {
        shenaiSDK?.setShowOutOfRangeResultIndicators(b);
        setInitializationSettings((s) => ({
          ...s,
          showOutOfRangeResultIndicators: b,
        }));
      },
    },
    {
      title: "Show trial metric labels",
      value: sdkState?.showTrialMetricLabels,
      code: "ShowTrialMetricLabels",
      update: (b: boolean) => {
        shenaiSDK?.setShowTrialMetricLabels(b);
        setInitializationSettings((s) => ({ ...s, showTrialMetricLabels: b }));
      },
    },
    {
      title: "Debug record measurement",
      value: sdkState?.recordingEnabled,
      code: "RecordingEnabled",
      update: (b: boolean) => shenaiSDK?.setRecordingEnabled(b),
    },
  ];
  return (
    <>
      {boolSettings.map(({ title, value, code, update }) => (
        <div key={code} className={styles.controlRow}>
          <div className={styles.controlTitle}>
            {title}:
            <CodeSnippet
              code={`shenaiSDK.get${code}();
shenaiSDK.set${code}(${value ?? false});`}
            />
          </div>
          <Switch
            checked={value}
            onChange={update}
            disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
          />
        </div>
      ))}
    </>
  );
};

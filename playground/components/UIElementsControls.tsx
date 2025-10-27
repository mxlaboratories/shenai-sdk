import React, { Dispatch, SetStateAction } from "react";
import { CodeSnippet } from "./CodeSnippet";
import { Switch } from "antd";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { InitializationSettings, ShenaiSDK } from "shenai-sdk";

export const UIElementsControls: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({ shenaiSDK, sdkState, setInitializationSettings }) => {
  const isCorePlan = sdkState?.pricingPlan === "CORE";

  const sections = [
    {
      title: "UX Flow",
      settings: [
        {
          title: "Enable summary screen",
          value: sdkState?.enableSummaryScreen,
          code: "EnableSummaryScreen",
          update: (b: boolean) => {
            shenaiSDK?.setEnableSummaryScreen(b);
            setInitializationSettings((s) => ({
              ...s,
              enableSummaryScreen: b,
            }));
          },
        },
        {
          title: "Enable health indices",
          value: sdkState?.enableHealthRisks,
          code: "EnableHealthRisks",
          restricted: true, // This option is not available on CORE
          update: (b: boolean) => {
            shenaiSDK?.setEnableHealthRisks(b);
            setInitializationSettings((s) => ({ ...s, enableHealthRisks: b }));
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
      ],
    },
    {
      title: "UI Elements",
      settings: [
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
          title: "Show signal tile",
          value: sdkState?.showSignalTile,
          code: "ShowSignalTile",
          update: (b: boolean) => {
            shenaiSDK?.setShowSignalTile(b);
            setInitializationSettings((s) => ({ ...s, showSignalTile: b }));
          },
        },
        {
          title: "Show signal quality indicator",
          value: sdkState?.showSignalQualityIndicator,
          code: "ShowSignalQualityIndicator",
          update: (b: boolean) => {
            shenaiSDK?.setShowSignalQualityIndicator(b);
            setInitializationSettings((s) => ({
              ...s,
              showSignalQualityIndicator: b,
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
          title: "Hide Shen.AI logo",
          value: sdkState?.hideShenaiLogo,
          code: "HideShenaiLogo",
          restricted: true, // This option is not available on CORE
          update: (b: boolean) => {
            shenaiSDK?.setHideShenaiLogo(b);
            setInitializationSettings((s) => ({ ...s, hideShenaiLogo: b }));
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
            setInitializationSettings((s) => ({
              ...s,
              showTrialMetricLabels: b,
            }));
          },
        },
        {
          title: "Show start/stop button",
          value: sdkState?.showStartStopButton,
          code: "ShowStartStopButton",
          update: (b: boolean) => {
            shenaiSDK?.setShowStartStopButton(b);
            setInitializationSettings((s) => ({
              ...s,
              showStartStopButton: b,
            }));
          },
        },
        {
          title: "Show info button",
          value: sdkState?.showInfoButton,
          code: "SetShowInfoButton",
          update: (b: boolean) => {
            shenaiSDK?.setShowInfoButton(b);
            setInitializationSettings((s) => ({
              ...s,
              showInfoButton: b,
            }));
          },
        },
        {
          title: "Enable Measurements Dashboard",
          value: sdkState?.enableMeasurementsDashboard,
          code: "SetEnableMeasurementsDashboard",
          update: (b: boolean) => {
            shenaiSDK?.setEnableMeasurementsDashboard(b);
            setInitializationSettings((s) => ({
              ...s,
              enableMeasurementsDashboard: b,
            }));
          },
        },
      ],
    },
    {
      title: "Visualization",
      settings: [
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
      ],
    },
  ];

  return (
    <>
      {sections.map(({ title, settings }) => (
        <div key={title}>
          <h3>{title}</h3>
          {settings.map(({ title, value, code, update, restricted }) => {
            const isDisabled =
              shenaiSDK === undefined ||
              !sdkState?.isInitialized ||
              (restricted && isCorePlan);

            return (
              <div
                key={code}
                className={styles.controlRow}
                style={{
                  // If restricted and user is on CORE plan, gray out the row
                  cursor: restricted && isCorePlan ? "not-allowed" : "default",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  className={styles.controlTitle}
                  style={{
                    marginRight: "1rem",
                    opacity: restricted && isCorePlan ? 0.5 : 1,
                  }}
                >
                  {title}:
                  <CodeSnippet
                    code={`shenaiSDK.get${code}();\nshenaiSDK.set${code}(${value ?? false
                      });`}
                  />
                </div>

                {restricted && isCorePlan && (
                  <span
                    style={{
                      marginLeft: "auto",
                      marginRight: "1rem",
                      fontSize: "0.7rem",
                      border: "1px solid",
                      paddingLeft: "0.5rem",
                      paddingRight: "0.5rem",
                    }}
                  >
                    Professional Plan only
                  </span>
                )}
                <Switch
                  checked={value}
                  onChange={update}
                  disabled={isDisabled}
                />
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

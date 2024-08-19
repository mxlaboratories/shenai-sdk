import { InitializationSettings, ShenaiSDK } from "shenai-sdk";
import styles from "../styles/Home.module.css";
import { Select, Switch } from "antd";
import { getEnumName, getEnumNames, makeEnumFromName } from "../helpers";
import { Dispatch, SetStateAction } from "react";

export const InitializationSettingsComponent: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  disabled: boolean;
  initializationSettings: InitializationSettings | undefined;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({
  shenaiSDK,
  disabled,
  initializationSettings,
  setInitializationSettings,
}) => {
  const settings = initializationSettings;
  const boolSettings = [
    {
      title: "Enable summary screen",
      value: settings?.enableSummaryScreen,
      update: (b: boolean) => ({ ...settings, enableSummaryScreen: b }),
    },
    {
      title: "Enable health risks",
      value: settings?.enableHealthRisks,
      update: (b: boolean) => ({ ...settings, enableHealthRisks: b }),
    },
    {
      title: "Full-frame processing",
      value: settings?.enableFullFrameProcessing,
      update: (b: boolean) => ({ ...settings, enableFullFrameProcessing: b }),
    },
  ];

  return (
    <>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>Onboarding mode:</div>
        <Select
          options={getEnumNames(shenaiSDK?.OnboardingMode).map((value) => ({
            value,
          }))}
          value={getEnumName(
            shenaiSDK?.OnboardingMode,
            settings?.onboardingMode,
            "UNKNOWN"
          )}
          popupMatchSelectWidth={false}
          onSelect={(value) => {
            setInitializationSettings((s) => ({
              ...s,
              onboardingMode:
                makeEnumFromName(shenaiSDK?.OnboardingMode, value) ??
                shenaiSDK?.OnboardingMode.SHOW_ONCE,
            }));
          }}
          disabled={disabled}
        />
      </div>
      {boolSettings.map(({ title, value, update }, idx) => (
        <div className={styles.controlRow} key={idx}>
          <div className={styles.controlTitle}>{title}</div>
          <Switch
            checked={value}
            onChange={(v) => setInitializationSettings(() => update(v))}
            disabled={disabled}
          />
        </div>
      ))}
    </>
  );
};

export const getInitializationSettingsSnippetCode = (
  shenaiSDK: ShenaiSDK,
  settings: InitializationSettings
) =>
  `\
// to be used in shenaiSDK.initialize()
const settings = {` +
  (settings.precisionMode
    ? `
  precisionMode: shenaiSDK.PrecisionMode.${getEnumName(
    shenaiSDK.PrecisionMode,
    settings.precisionMode
  )},`
    : "") +
  (settings.operatingMode
    ? `
  operatingMode: shenaiSDK.OperatingMode.${getEnumName(
    shenaiSDK.OperatingMode,
    settings.operatingMode
  )},`
    : "") +
  (settings.measurementPreset
    ? `
  measurementPreset: shenaiSDK.MeasurementPreset.${getEnumName(
    shenaiSDK.MeasurementPreset,
    settings.measurementPreset
  )},`
    : "") +
  (settings.cameraMode
    ? `
  cameraMode: shenaiSDK.CameraMode.${getEnumName(
    shenaiSDK.CameraMode,
    settings.cameraMode
  )},`
    : "") +
  (settings.onboardingMode
    ? `
  onboardingMode: shenaiSDK.OnboardingMode.${getEnumName(
    shenaiSDK.OnboardingMode,
    settings.onboardingMode
  )},`
    : "") +
  `
  showUserInterface: ${settings.showUserInterface},
  showFacePositioningOverlay: ${settings.showFacePositioningOverlay},
  showVisualWarnings: ${settings.showVisualWarnings},
  enableCameraSwap: ${settings.enableCameraSwap},
  showFaceMask: ${settings.showFaceMask},
  showBloodFlow: ${settings.showBloodFlow},
  hideShenaiLogo: ${settings.hideShenaiLogo},
  enableStartAfterSuccess: ${settings.enableStartAfterSuccess},
  enableSummaryScreen: ${settings.enableSummaryScreen},
  enableHealthRisks: ${settings.enableHealthRisks},
  showOutOfRangeResultIndicators: ${settings.showOutOfRangeResultIndicators},
  showTrialMetricLabels: ${settings.showTrialMetricLabels},
  enableFullFrameProcessing: ${settings.enableFullFrameProcessing},
}`;

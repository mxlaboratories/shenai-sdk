import { InitializationSettings, ShenaiSDK } from "shenai-sdk";
import styles from "../styles/Home.module.css";
import { Select, Switch } from "antd";
import { getEnumName, getEnumNames, makeEnumFromName } from "../helpers";
import { Dispatch, SetStateAction } from "react";

export const InitializationSettingsComponent: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  initialized: boolean;
  initializationSettings: InitializationSettings | undefined;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({
  shenaiSDK,
  initialized,
  initializationSettings,
  setInitializationSettings,
}) => {
  const settings = initializationSettings;

  const excludeOptionsInitMode = ["FAST_CALIBRATION"];
  const allOptionsInitMode = getEnumNames(shenaiSDK?.InitializationMode);
  const filteredOptionsInitMode = allOptionsInitMode.filter(
    (option) => !excludeOptionsInitMode.includes(option)
  );

  const selectOptionsInitMode = filteredOptionsInitMode.map((value) => {
    return {
      value,
      label: <span style={{ opacity: 1 }}>{value}</span>,
      disabled: initialized,
    };
  });

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
            initialized
              ? shenaiSDK?.getOnboardingMode()
              : settings?.onboardingMode,
            "UNKNOWN"
          )}
          popupMatchSelectWidth={false}
          onSelect={(value) => {
            if (initialized) {
              shenaiSDK?.setOnboardingMode(
                makeEnumFromName(shenaiSDK?.OnboardingMode, value) ??
                  shenaiSDK?.OnboardingMode.SHOW_ONCE
              );
            }
            setInitializationSettings((s) => ({
              ...s,
              onboardingMode:
                makeEnumFromName(shenaiSDK?.OnboardingMode, value) ??
                shenaiSDK?.OnboardingMode.SHOW_ONCE,
            }));
          }}
        />
      </div>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>Initialization mode:</div>
        <Select
          options={selectOptionsInitMode}
          value={getEnumName(
            shenaiSDK?.InitializationMode,
            settings?.initializationMode,
            "UNKNOWN"
          )}
          popupMatchSelectWidth={false}
          onSelect={(value) => {
            setInitializationSettings((s) => ({
              ...s,
              initializationMode:
                makeEnumFromName(shenaiSDK?.InitializationMode, value) ??
                shenaiSDK?.InitializationMode.MEASUREMENT,
            }));
          }}
        />
      </div>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>Show disclaimer:</div>
        <Switch
          checked={!!settings?.showDisclaimer}
          onChange={(b) => {
            setInitializationSettings((s) => ({
              ...s,
              showDisclaimer: b,
            }));
          }}
        />
      </div>
      <div className={styles.controlRow}>
       <div className={styles.controlTitle}>Save form data:</div>
        <Switch
         checked={!!settings?.saveHealthRisksFactors}
         onChange={(b) => {
          setInitializationSettings((s) => ({
           ...s,
           saveHealthRisksFactors: b,
          }));
        }}
      />
</div>      
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
  (settings.initializationMode
    ? `
  initializationMode: shenaiSDK.InitializationMode.${getEnumName(
    shenaiSDK.InitializationMode,
    settings.initializationMode
  )},`
    : "") +
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
  showStartStopButton: ${settings.showStartStopButton},
  showInfoButton: ${settings.showInfoButton},
  showDisclaimer: ${settings.showDisclaimer},
  enableFullFrameProcessing: ${settings.enableFullFrameProcessing},
  language: "${settings.language}",
}`;

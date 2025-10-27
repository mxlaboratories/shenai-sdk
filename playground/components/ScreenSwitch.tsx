import { Select } from "antd";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { getEnumName, getEnumNames, makeEnumFromName } from "../helpers";
import { ShenaiSDK } from "shenai-sdk";

export const ScreenSwitch: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
}> = ({ shenaiSDK, sdkState }) => {
  const screen = getEnumName(shenaiSDK?.Screen, sdkState?.screen, "UNKNOWN");
  const isCorePlan = sdkState?.pricingPlan === "CORE";

  const restrictedOptions = ["HEALTH_RISKS", "HEALTH_RISKS_EDIT"];
  const excludeOptions = ["ENTERID"];
  const allOptions = getEnumNames(shenaiSDK?.Screen);
  const filteredOptions = allOptions.filter(option => !excludeOptions.includes(option));

  const selectOptions = filteredOptions.map((value) => {
    const isRestricted = isCorePlan && restrictedOptions.includes(value);
    return {
      value,
      label: <span style={{ opacity: isRestricted ? 0.5 : 1 }}>{value}</span>,
      disabled: isRestricted,
    };
  });

  return (
    <div className={styles.controlRow}>
      <div className={styles.controlTitle}>
        Screen:{" "}
        <CodeSnippet
          code={`shenaiSDK.setScreen(shenaiSDK.Screen.${
            screen !== "UNKNOWN" ? screen : "ONBOARDING"
          });`}
        />
      </div>
      <Select
        options={selectOptions}
        value={screen}
        popupMatchSelectWidth={false}
        onSelect={(value) => {
          if (shenaiSDK) {
            const newScreen =
              makeEnumFromName(shenaiSDK.Screen, value) ??
              shenaiSDK.Screen.INITIALIZATION;
            if (newScreen) {
              shenaiSDK.setScreen(newScreen);
            }
          }
        }}
        disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
      />
    </div>
  );
};

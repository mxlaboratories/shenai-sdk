import { Select } from "antd";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { getEnumName, getEnumNames, makeEnumFromName } from "../helpers";
import { ShenaiSDK } from "shenai-sdk";

export const ScreenSwitch: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  sdkState?: ShenaiSdkState;
}> = ({ shenaiSDK, sdkState }) => {
  const screen = getEnumName(shenaiSDK?.Screen, sdkState?.screen, "UNKNOWN");

  return (
    <div className={styles.controlRow}>
      <div className={styles.controlTitle}>
        Screen:{" "}
        <CodeSnippet
          code={`shenaiSDK.setScreen(shenaiSDK.Screen.${
            screen != "UNKNOWN" ? screen : "ONBOARDING"
          });`}
        />
      </div>
      <Select
        options={getEnumNames(shenaiSDK?.Screen).map((value) => ({ value }))}
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

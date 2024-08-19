import { Dispatch, SetStateAction } from "react";
import { Button, Collapse, Input } from "antd";
import { ShenaiSdkState } from "../pages";
import styles from "../styles/Home.module.css";
import {
  InitializationSettingsComponent,
  getInitializationSettingsSnippetCode,
} from "./InitializationSettings";
import { CodeSnippet } from "./CodeSnippet";
import { LoadingOutlined } from "@ant-design/icons";
import {
  CustomColorTheme,
  CustomMeasurementConfig,
  InitializationSettings,
  ShenaiSDK,
} from "shenai-sdk";
const { Panel } = Collapse;

export const InitializationView: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  pendingInitialization: boolean;
  initializationSettings: InitializationSettings | undefined;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
  initializeSdk: (
    apiKey: string,
    settings: InitializationSettings,
    onSuccess?: () => void
  ) => void;
  colorTheme: CustomColorTheme;
  customConfig: CustomMeasurementConfig | undefined;
  sdkState?: ShenaiSdkState;
  apiKey: string;
  setApiKey: (key: string) => void;
}> = ({
  shenaiSDK,
  pendingInitialization,
  initializationSettings,
  setInitializationSettings,
  initializeSdk,
  colorTheme,
  customConfig,
  sdkState,
  apiKey,
  setApiKey,
}) => {
  const initialize = () => {
    initializeSdk(apiKey, initializationSettings ?? {}, () => {
      if (!shenaiSDK) return;
      shenaiSDK.setCustomColorTheme(colorTheme);
      if (
        initializationSettings?.measurementPreset ==
          shenaiSDK.MeasurementPreset.CUSTOM &&
        customConfig
      ) {
        shenaiSDK.setCustomMeasurementConfig(customConfig);
      }
    });
  };

  const initializationDisabled =
    !shenaiSDK || sdkState?.isInitialized === true || pendingInitialization;

  return (
    <>
      <div className={styles.controlRow}>
        <span style={{ minWidth: 70 }}>API key:</span>
        <Input.Password
          onChange={(e) => setApiKey(e.target.value)}
          value={apiKey}
        />
      </div>
      <Collapse defaultActiveKey={[]}>
        <Panel
          header={
            <>
              Initialization settings &nbsp;&nbsp;
              {shenaiSDK && initializationSettings && (
                <CodeSnippet
                  code={getInitializationSettingsSnippetCode(
                    shenaiSDK,
                    initializationSettings
                  )}
                />
              )}
            </>
          }
          key="0"
        >
          <InitializationSettingsComponent
            shenaiSDK={shenaiSDK}
            disabled={initializationDisabled}
            initializationSettings={initializationSettings}
            setInitializationSettings={setInitializationSettings}
          />
        </Panel>
      </Collapse>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          Is initialized?
          <CodeSnippet code={`shenaiSDK.isInitialized();`} />
        </div>{" "}
        <div>{sdkState?.isInitialized ? "Yes" : "No"}</div>
      </div>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          <Button disabled={initializationDisabled} onClick={initialize}>
            Initialize {pendingInitialization && <LoadingOutlined />}
          </Button>
          <CodeSnippet
            code={`\
shenaiSDK.initialize("API_KEY", "USER_ID",
  {/* settings */},
  (res) => {
    console.log("Initialization result: ", res)));
  });`}
          />
        </div>
        <div>
          <CodeSnippet code={`shenaiSDK.deinitialize();`} />
          <Button
            disabled={!shenaiSDK || !sdkState?.isInitialized}
            onClick={() => {
              if (!shenaiSDK) return;
              shenaiSDK.deinitialize();
              const newcanvas = document.createElement("canvas");
              const oldcanvas = document.getElementById(
                "mxcanvas"
              ) as HTMLCanvasElement;
              newcanvas.style.maxHeight = oldcanvas.style.maxHeight;
              newcanvas.style.aspectRatio = oldcanvas.style.aspectRatio;
              newcanvas.width = oldcanvas.width;
              newcanvas.height = oldcanvas.height;
              oldcanvas.replaceWith(newcanvas);
              newcanvas.id = "mxcanvas";
            }}
          >
            Deinitialize
          </Button>
        </div>
      </div>
    </>
  );
};

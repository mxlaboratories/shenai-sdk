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
  shenaiSDK: ShenaiSDK | null;
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
  sdkVersion: string;
  colorTheme: CustomColorTheme;
  customConfig: CustomMeasurementConfig | undefined;
  sdkState?: ShenaiSdkState;
  apiKey: string;
  setApiKey: (key: string) => void;
  loadRuntime: () => void;
  destroyRuntime: () => void;
}> = ({
  shenaiSDK,
  pendingInitialization,
  initializationSettings,
  setInitializationSettings,
  initializeSdk,
  sdkVersion,
  colorTheme,
  customConfig,
  sdkState,
  apiKey,
  setApiKey,
  loadRuntime,
  destroyRuntime,
}) => {
  const initialize = () => {
    initializeSdk(apiKey, initializationSettings ?? {}, () => {});
  };

  const replaceCanvas = () => {
    const newcanvas = document.createElement("canvas");
    const oldcanvas = document.getElementById("mxcanvas") as HTMLCanvasElement;
    newcanvas.style.maxHeight = oldcanvas.style.maxHeight;
    newcanvas.style.aspectRatio = oldcanvas.style.aspectRatio;
    newcanvas.width = oldcanvas.width;
    newcanvas.height = oldcanvas.height;
    oldcanvas.replaceWith(newcanvas);
    newcanvas.id = "mxcanvas";
  };

  const initialized = sdkState?.isInitialized === true;
  
  return (
    <>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          <Button
            disabled={shenaiSDK !== null}
            onClick={loadRuntime}
            size="small"
          >
            Load
          </Button>
          <CodeSnippet
            code={`
let LoadSDK = (await import("shenai-sdk")).default;
let shenaiSDK = await LoadSDK({
  onRuntimeInitialized: () => {
    console.log("Shen.AI Runtime initialized");
  },
});
)`}
          />
        </div>
        <div className={styles.controlTitle}>
          <Button
            disabled={shenaiSDK === null}
            onClick={() => {
              destroyRuntime();
              replaceCanvas();
            }}
            size="small"
          >
            Unload
          </Button>
          <CodeSnippet
            code={`shenaiSDK.destroyRuntime();
shenaiSDK = null;`}
          />
        </div>
      </div>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          SDK version:
          <CodeSnippet code={`shenaiSDK.getVersion();`} />
        </div>{" "}
        <div>{sdkVersion}</div>
      </div>
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
            initialized={initialized}
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
          Pricing plan:
          <CodeSnippet code={`shenaiSDK.getPricingPlan();`} />
        </div>{" "}
        <div className={styles.outputCodeValue}>
          {sdkState?.pricingPlan ?? "-"}
        </div>
      </div>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          <Button disabled={initialized} onClick={initialize}>
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
              replaceCanvas();
            }}
          >
            Deinitialize
          </Button>
        </div>
      </div>
    </>
  );
};

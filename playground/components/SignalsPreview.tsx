import { ShenaiSdkState } from "../pages";
import dynamic from "next/dynamic";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";

const HeartbeatsPreview = dynamic(
  () => import("../components/HeartbeatsPreview"),
  {
    ssr: false,
  }
);

const PPGPreview = dynamic(() => import("../components/PPGPreview"), {
  ssr: false,
});

export const SignalsPreview: React.FC<{
  sdkState?: ShenaiSdkState;
  darkMode: boolean;
}> = ({ sdkState, darkMode }) => {
  return (
    <>
      <div className={styles.outputSectionTitle}>Signals:</div>
      <div className={styles.plotContainer}>
        <div className={styles.plotTitle}>
          <CodeSnippet
            code={`\
// realtime intervals
shenaiSDK.getRealtimeHeartbeats();
// final intervals
shenaiSDK.getMeasurementResults()?.heartbeats;`}
          />
          <h4>Heartbeat intervals tachogram</h4>
        </div>
        <HeartbeatsPreview
          realtimeBeats={sdkState?.realtimeHeartbeats}
          finalBeats={sdkState?.results?.heartbeats}
          darkMode={darkMode}
        />
      </div>
      {sdkState?.rppgSignal && (
        <div className={styles.plotContainer}>
          <div className={styles.plotTitle}>
            <CodeSnippet code="shenaiSDK.getFullPpgSignal()" />
            <h4>rPPG signal</h4>
          </div>
          <PPGPreview signal={sdkState?.rppgSignal ?? []} darkMode={darkMode} />
        </div>
      )}
    </>
  );
};

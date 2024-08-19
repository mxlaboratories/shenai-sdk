import { ShenaiSdkState } from "../pages";
import styles from "../styles/Home.module.css";
import { CodeSnippet } from "./CodeSnippet";

export const Visualizations: React.FC<{ sdkState?: ShenaiSdkState }> = ({
  sdkState,
}) => {
  const texPreviewScale = 100 / 32;
  const metaPreviewScale = 100 / 256;

  return (
    <div className={styles.outputRow}>
      <div className={styles.visualizationCol}>
        <div className={styles.visualizationColTitle}>
          <CodeSnippet code="shenaiSDK.getMetaPredictionImagePng()" />
          <h4>Meta input</h4>
        </div>
        {(sdkState?.metaPredictionImage &&
          sdkState?.metaPredictionImage.length > 0 && (
            <img
              alt="Meta input"
              width={256 * metaPreviewScale}
              height={256 * metaPreviewScale}
              src={`data:image/png;base64,${Buffer.from(
                sdkState?.metaPredictionImage
              ).toString("base64")}`}
            />
          )) || <>...</>}
      </div>
      <div className={styles.visualizationCol}>
        <div className={styles.visualizationColTitle}>
          <CodeSnippet code="shenaiSDK.getFaceTexturePng()" />
          <h4>Face texture</h4>
        </div>
        {(sdkState?.textureImage && sdkState?.textureImage.length > 0 && (
          <img
            alt="Face texture"
            width={16 * texPreviewScale}
            height={32 * texPreviewScale}
            src={`data:image/png;base64,${Buffer.from(
              sdkState?.textureImage
            ).toString("base64")}`}
          />
        )) || <>...</>}
      </div>
      <div className={styles.visualizationCol}>
        <div className={styles.visualizationColTitle}>
          <CodeSnippet code="shenaiSDK.getSignalQualityMapPng()" />
          <h4>Signal quality</h4>
        </div>
        {(sdkState?.signalImage && sdkState?.signalImage.length > 0 && (
          <img
            alt="Signal quality"
            width={16 * texPreviewScale}
            height={32 * texPreviewScale}
            src={`data:image/png;base64,${Buffer.from(
              sdkState?.signalImage
            ).toString("base64")}`}
          />
        )) || <>...</>}
      </div>
    </div>
  );
};

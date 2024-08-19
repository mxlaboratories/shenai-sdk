import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { CodeSnippet } from "./CodeSnippet";
import { Select } from "antd";
import { CameraMode, InitializationSettings, ShenaiSDK } from "shenai-sdk";
import { getEnumName, getEnumNames } from "../helpers";

export const CameraChoice: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
  sdkState?: ShenaiSdkState;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
}> = ({ shenaiSDK, sdkState, setInitializationSettings }) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  const updateCameraList = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((d) => d.kind == "videoinput");
      setCameras(cameras);
    });
  };

  const options = useMemo(() => {
    return [
      ...getEnumNames(shenaiSDK?.CameraMode).map((value) => ({ value })),
      ...cameras.map((c) => ({
        value: c.deviceId,
        label: c.label,
      })),
    ];
  }, [cameras]);

  const onSelectCamera = (value: string) => {
    function setCameraMode(cameraMode?: CameraMode) {
      if (!cameraMode) return;
      shenaiSDK?.setCameraMode(cameraMode);
      setInitializationSettings((s) => ({ ...s, cameraMode }));
    }
    if (value === "OFF") {
      setCameraMode(shenaiSDK?.CameraMode.OFF);
    } else if (value === "FACING_USER") {
      setCameraMode(shenaiSDK?.CameraMode.FACING_USER);
    } else if (value === "FACING_ENVIRONMENT") {
      setCameraMode(shenaiSDK?.CameraMode.FACING_ENVIRONMENT);
    } else {
      shenaiSDK?.selectCameraByDeviceId(value, true);
      setInitializationSettings((s) =>
        shenaiSDK
          ? {
              ...s,
              cameraMode: shenaiSDK.CameraMode.DEVICE_ID,
            }
          : s
      );
    }
  };

  return (
    <>
      <div className={styles.controlRow}>
        <div className={styles.controlTitle}>
          Camera:{" "}
          <CodeSnippet
            code={`\
shenaiSDK.getCameraMode();
shenaiSDK.setCameraMode(shenaiSDK.CameraMode.OFF);
shenaiSDK.setCameraMode(shenaiSDK.CameraMode.FACING_USER);
shenaiSDK.setCameraMode(shenaiSDK.CameraMode.FACING_ENVIRONMENT);
shenaiSDK.setCameraMode(shenaiSDK.CameraMode.DEVICE_ID);

// select camera by ID
navigator.mediaDevices.enumerateDevices().then(devices => {
    const cameras = devices.filter(d => d.kind == "videoinput");
    const cameraIdx = 0;
    if (cameraIdx < cameras.length) {
      const deviceId = cameras[cameraIdx].deviceId;
      const facingUser = true;
      // selects the camera by device ID (also sets DEVICE_ID mode)
      shenaiSDK.selectCameraByDeviceId(deviceId, facingUser);
    }
});
`}
          />
        </div>
        <Select
          options={options}
          onDropdownVisibleChange={updateCameraList}
          value={getEnumName(
            shenaiSDK?.CameraMode,
            sdkState?.cameraMode,
            "UNKNOWN"
          )}
          popupMatchSelectWidth={false}
          onSelect={onSelectCamera}
          disabled={shenaiSDK === undefined || !sdkState?.isInitialized}
        />
      </div>
    </>
  );
};

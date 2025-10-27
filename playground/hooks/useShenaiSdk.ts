import { useRef, useState } from "react";
import { ShenaiSDK } from "shenai-sdk";

export const useShenaiSdk = () => {
  const [sdkLoaded, setSdkLoaded] = useState<boolean>(false);
  const sdkRef = useRef<ShenaiSDK | null>(null);
  const loadStarted = useRef<boolean>(false);

  const loadShenaiSDK = async () => {
    if (loadStarted.current) {
      return;
    }
    if (typeof window !== "undefined") {
      try {
        loadStarted.current = true;
        let LoadSDK = (await import("shenai-sdk")).default;
        let shenaiSDK = await LoadSDK({
          enableErrorReporting: false,
          onRuntimeInitialized: () => {
            console.log("Shen.AI Runtime initialized no sentry");
          },
        });
        sdkRef.current = shenaiSDK;
        setSdkLoaded(true);
        loadStarted.current = false;
      } catch (error) {
        console.error("Failed to import Shen.AI SDK:", error);
      }
    }
  };

  const unloadShenaiSDK = () => {
    if (sdkRef.current) {
      (sdkRef.current as any).destroyRuntime();
      sdkRef.current = null;
      setSdkLoaded(false);
    }
  };

  return { shenaiSDK: sdkRef.current, loadShenaiSDK, unloadShenaiSDK };
};

import { useRef, useState } from "react";
import { ShenaiSDK } from "shenai-sdk";

export const useShenaiSdk = () => {
  const [shenaiSdk, setShenaiSdk] = useState<ShenaiSDK>();
  const sdkRef = useRef<ShenaiSDK | null | undefined>(undefined);

  if (sdkRef.current) {
    if (shenaiSdk != sdkRef.current) setShenaiSdk(sdkRef.current);
  } else if (sdkRef.current !== null) {
    sdkRef.current = null;
    if (typeof window !== "undefined") {
      try {
        import("shenai-sdk")
          .then((sdk) =>
            sdk.default({
              onRuntimeInitialized: () => {
                console.log("Shen.AI Runtime initialized");
              },
            })
          )
          .then((sdk) => {
            sdkRef.current = sdk;
            setShenaiSdk(sdk);
          });
      } catch (error) {
        console.error("Failed to import Shen.AI SDK:", error);
      }
    }
  }

  return shenaiSdk;
};

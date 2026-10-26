// ShenaiContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { ShenaiSDK } from "shenai-sdk";
import { getShenaiSDK, destroyShenaiSDK } from "./globalShenaiSDK";

const ShenaiContext = createContext<ShenaiSDK | null>(null);

export function ShenaiSDKProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<ShenaiSDK | null>(null);

  useEffect(() => {
    let mounted = true;

    getShenaiSDK()
      .then((shenai) => {
        if (mounted) {
          setSdk(shenai);
        }
      })
      .catch((err) => {
        console.error("Failed to load ShenAI SDK:", err);
      });

    return () => {
      mounted = false;
      destroyShenaiSDK();
      setSdk(null);
    };
  }, []);

  return (
    <ShenaiContext.Provider value={sdk}>{children}</ShenaiContext.Provider>
  );
}

export function useShenaiSDK() {
  return useContext(ShenaiContext);
}

export function useRealtimeHeartRate() {
  const sdk = useShenaiSDK();
  const [heartRate, setHeartRate] = useState<number | null>(null);

  useEffect(() => {
    if (!sdk) return;

    const intervalId = setInterval(() => {
      const rate = sdk.getHeartRate10s();
      if (rate !== null) {
        setHeartRate(rate);
      }
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [sdk]);

  return heartRate;
}

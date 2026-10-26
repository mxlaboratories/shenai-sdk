import { computed, ref, watchEffect, type Ref } from "vue";
import type { ShenaiSDK } from "shenai-sdk";

/**
 * Hook that reads Shen.AI's real-time heart rate every ~200ms,
 * storing it in a reactive variable so you can display it in the UI.
 */
export function useRealtimeHeartRate(sdk: Ref<ShenaiSDK | null>) {
  const heartRate = ref<number | null>(null);
  let intervalId: number | null = null;

  watchEffect(() => {
    // whenever sdk changes, clear the old interval and set a new one if needed
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (sdk.value) {
      intervalId = window.setInterval(() => {
        const rate = sdk.value?.getHeartRate10s() ?? null;
        if (rate !== null) {
          heartRate.value = rate;
        }
      }, 200);
    }
  });

  return computed(() => heartRate.value);
}

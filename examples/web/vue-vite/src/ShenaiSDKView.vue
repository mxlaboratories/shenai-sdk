<template>
    <div class="wrapper">
        <div class="title">
            <h1>Shen.AI SDK</h1>
            <h2>Vue + Vite example</h2>
        </div>
        <!-- The measurement canvas (SDK draws here) -->
        <canvas id="mxcanvas"></canvas>
        <div class="hr-tile">
            Current Heart Rate: <br />
            <strong>{{ heartRateDisplay }}</strong>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";
import { type ShenaiSDK } from "shenai-sdk";
import { useRealtimeHeartRate } from "./useRealtimeHeartRate";

// We inject the sdk from ShenaiProvider
const sdkRef = inject<Ref<ShenaiSDK | null>>("ShenaiSDK", ref(null));

// If injection fails or the provider is missing, sdkRef will be null
// But typically, you must wrap ShenaiSDKView with <ShenaiProvider> for it to work
const heartRate = sdkRef ? useRealtimeHeartRate(sdkRef) : null;

const heartRateDisplay = computed(() => {
    if (!heartRate?.value) {
        return "-";
    }
    return `${heartRate.value} BPM`;
});
</script>

<style scoped>
.wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

#mxcanvas {
    aspect-ratio: 480 / 894;
    max-width: 100%;
    max-height: 100%;
}

@media (max-aspect-ratio: 480 / 894) {
    #mxcanvas {
        width: 100%;
        height: auto;
    }
}

@media (min-aspect-ratio: 480 / 894) {
    #mxcanvas {
        height: 100%;
        width: auto;
    }
}

.title {
    padding: 20px;
    text-align: center;
}

.hr-tile {
    padding: 20px;
    text-align: center;
}
</style>
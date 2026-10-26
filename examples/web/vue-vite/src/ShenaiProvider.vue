<template>
    <div>
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from "vue";
import type { ShenaiSDK } from "shenai-sdk";
import { getShenaiSDK, destroyShenaiSDK } from "./globalShenaiSDK";

// We store the loaded sdk in a ref:
const sdk = ref<ShenaiSDK | null>(null);

onMounted(() => {
    // Attempt to load the SDK
    getShenaiSDK()
        .then((instance) => {
            sdk.value = instance;
        })
        .catch((error) => {
            console.error("Failed to load Shen.AI SDK:", error);
            sdk.value = null;
        });
});

onUnmounted(() => {
    destroyShenaiSDK();
    sdk.value = null;
});

provide("ShenaiSDK", sdk);
</script>

<style scoped>
.title {
    padding: 20px;
    text-align: center;
}
</style>
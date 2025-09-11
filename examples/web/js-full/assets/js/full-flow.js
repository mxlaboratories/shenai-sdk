import CreateShenaiSDK from "../../shenai-sdk/index.mjs";
import { APP_CONFIG } from "../../app-config.js";
import { ensureCanvasResolution } from "./view-port-resize.js"

const urlParams = new URLSearchParams(window.location.search);
const API_KEY = urlParams.get("apiKey") || APP_CONFIG.API_KEY;

CreateShenaiSDK().then((shenai) => {
    shenai.initialize(
        API_KEY,
        APP_CONFIG.USER_ID,

        // example usage of initialization settings
        // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
        {
            hideShenaiLogo: false,

            // hide "5 stars" signal quality indicator
            showSignalQualityIndicator: false,

            onboardingMode: shenai.OnboardingMode.SHOW_ALWAYS,

            // example usage of custom measurement config
            // for more information see: https://developer.shen.ai/getting-started/configuration#custom-measurement-configuration
            customMeasurementConfig: {
                durationSeconds: 30,
                infiniteMeasurement: false,
                instantMetrics: [shenai.Metric.HEART_RATE, shenai.Metric.BLOOD_PRESSURE],
                summaryMetrics: [
                    shenai.Metric.HEART_RATE,
                    shenai.Metric.BLOOD_PRESSURE,
                    shenai.Metric.HRV_SDNN,
                    shenai.Metric.BREATHING_RATE,
                    shenai.Metric.CARDIAC_STRESS,
                    shenai.Metric.CARDIAC_WORKLOAD,
                    shenai.Metric.PNS_ACTIVITY,
                    shenai.Metric.BMI
                ],
                healthIndices: [
                    shenai.HealthIndex.WELLNESS_SCORE,
                    shenai.HealthIndex.VASCULAR_AGE,
                    shenai.HealthIndex.CARDIOVASCULAR_DISEASE_RISK,
                    shenai.HealthIndex.HARD_AND_FATAL_EVENTS_RISKS,
                    shenai.HealthIndex.CARDIOVASCULAR_RISK_SCORE,
                    shenai.HealthIndex.HYPERTENSION_RISK,
                    shenai.HealthIndex.DIABETES_RISK,
                    shenai.HealthIndex.NON_ALCOHOLIC_FATTY_LIVER_DISEASE_RISK,
                    shenai.HealthIndex.WAIST_TO_HEIGHT_RATIO,
                    shenai.HealthIndex.BODY_FAT_PERCENTAGE,
                    shenai.HealthIndex.BODY_ROUNDNESS_INDEX,
                    shenai.HealthIndex.A_BODY_SHAPE_INDEX,
                    shenai.HealthIndex.CONICITY_INDEX,
                    shenai.HealthIndex.BASAL_METABOLIC_RATE,
                    shenai.HealthIndex.TOTAL_DAILY_ENERGY_EXPENDITURE
                ],

                realtimeHrPeriodSeconds: 10,
                realtimeHrvPeriodSeconds: 30,
                realtimeCardiacStressPeriodSeconds: 30,
            },

            // example usage of event callback
            // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
            eventCallback: (event) => {
                console.log("Shen.AI event:", event);
                if (event === "USER_FLOW_FINISHED") {
                    window.location.href = "../../index.html";
                }
            },

            onCameraError: () => console.log("camera error"),
        },

        // initialization results handling
        // for more information see: https://developer.shen.ai/getting-started/initialization#error-handling
        (result) => {
            if (result === shenai.InitializationResult.OK) {
                console.log("Shen.AI SDK initialized");
            } else {
                alert("Shen.AI license activation error " + result.toString());
            }
        }
    );
    window.shenai = shenai;
});

// providing the user interface
// for more information see: https://developer.shen.ai/getting-started/initialization#providing-the-user-interface
ensureCanvasResolution()
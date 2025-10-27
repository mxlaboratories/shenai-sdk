import React from "react";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";
import { Tooltip } from "antd";
import { getEnumName } from "../helpers";
import { ShenaiSDK } from "shenai-sdk";

// Define which metrics are restricted in the CORE plan.
const restrictedMetrics = [
  "bmi_kg_per_m2",
  "systolic_blood_pressure_mmhg",
  "diastolic_blood_pressure_mmhg",
  "cardiac_workload_mmhg_per_sec",
  "age_years",
];

// Helper to check if a given metric is restricted under the CORE plan
function isRestrictedMetric(metricKey: string, pricingPlan?: string) {
  return pricingPlan === "CORE" && restrictedMetrics.includes(metricKey);
}

// A small wrapper component for a row, applying styles and tooltips for restricted metrics
const ResultRow: React.FC<{
  label: React.ReactNode;
  code?: string;
  value: string | number | "-";
  unit?: string;
  metricKey: string;
  pricingPlan?: string;
}> = ({ label, code, value, unit, metricKey, pricingPlan }) => {
  const restricted = isRestrictedMetric(metricKey, pricingPlan);
  const rowContent = (
    <div
      className={styles.outputRow}
      style={restricted ? { opacity: 0.5 } : undefined}
    >
      <div className={styles.outputLabel}>
        {label}
        {code && <CodeSnippet code={code} />}
      </div>
      <div className={styles.outputValue}>
        {value}
        {unit && <span className={styles.resultUnit}>{unit}</span>}
      </div>
    </div>
  );

  return restricted ? (
    <Tooltip title="Available only in Professional Plan" mouseEnterDelay={0.3}>
      {rowContent}
    </Tooltip>
  ) : (
    rowContent
  );
};

export const ResultsView: React.FC<{
  sdkState?: ShenaiSdkState, shenaiSDK: ShenaiSDK | null;
}> = ({
  sdkState,
  shenaiSDK
}) => {
  const plan = sdkState?.pricingPlan;

  return (
    <>
      <div className={styles.outputSectionTitle}>Health Check results:</div>
      <div className={styles.outputBicol}>
        <div>
          <ResultRow
            label="Heart Rate (10s)"
            code={`shenaiSDK.getHeartRate10s();`}
            value={
              typeof sdkState?.hr10s === "number"
                ? sdkState.hr10s.toFixed(0)
                : "-"
            }
            unit="bpm"
            metricKey="hr10s"
            pricingPlan={plan}
          />
          <ResultRow
            label={`Heart Rate (${sdkState?.results ? "final" : "real-time"})`}
            code={`\
// real-time
shenaiSDK.getRealtimeHeartRate();
// final
shenaiSDK.getMeasurementResults()?.heart_rate_bpm;`}
            value={
              sdkState?.results
                ? sdkState.results.heart_rate_bpm.toFixed(0)
                : typeof sdkState?.realtimeHr === "number"
                ? sdkState?.realtimeHr.toFixed(0)
                : "-"
            }
            unit="bpm"
            metricKey="heart_rate_bpm"
            pricingPlan={plan}
          />
          <ResultRow
            label={`HRV SDNN (${sdkState?.results ? "final" : "real-time"})`}
            code={`\
// real-time
shenaiSDK.getRealtimeHrvSdnn();
// final
shenaiSDK.getMeasurementResults()?.hrv_sdnn_ms;`}
            value={
              typeof sdkState?.results?.hrv_sdnn_ms === "number"
                ? sdkState.results.hrv_sdnn_ms.toFixed(0)
                : typeof sdkState?.realtimeHrvSdnn === "number"
                ? sdkState.realtimeHrvSdnn.toFixed(0)
                : "-"
            }
            unit="ms"
            metricKey="hrv_sdnn_ms"
            pricingPlan={plan}
          />
          <ResultRow
            label="HRV lnRMSSD"
            code={`shenaiSDK.getMeasurementResults()?.hrv_lnrmssd_ms;`}
            value={
              typeof sdkState?.results?.hrv_lnrmssd_ms === "number"
                ? sdkState.results.hrv_lnrmssd_ms.toFixed(1)
                : "-"
            }
            unit="ms"
            metricKey="hrv_lnrmssd_ms"
            pricingPlan={plan}
          />
          <ResultRow
            label="Breathing Rate"
            code={`shenaiSDK.getMeasurementResults()?.breathing_rate_bpm;`}
            value={
              typeof sdkState?.results?.breathing_rate_bpm === "number"
                ? sdkState.results.breathing_rate_bpm.toFixed(0)
                : "-"
            }
            unit="bpm"
            metricKey="breathing_rate_bpm"
            pricingPlan={plan}
          />
          <ResultRow
            label="Age"
            code={`shenaiSDK.getMeasurementResults()?.age_years;`}
            value={
              typeof sdkState?.results?.age_years === "number"
                ? sdkState.results.age_years.toFixed(0)
                : "-"
            }
            unit="years"
            metricKey="age_years"
            pricingPlan={plan}
          />
          <ResultRow
            label="BMI classification"
            code={`shenaiSDK.getMeasurementResults()?.bmi_category;`}
            value={sdkState?.results?.bmi_category ? getEnumName(shenaiSDK?.BmiCategory, sdkState?.results?.bmi_category, "UNKNOWN") : "-"}
            metricKey="bmi_classification"
            pricingPlan={plan}
          />
        </div>
        <div className={styles.bicolcol}>
          <ResultRow
            label="Heart Rate (4s)"
            code={`shenaiSDK.getHeartRate4s();`}
            value={
              typeof sdkState?.hr4s === "number"
                ? sdkState.hr4s.toFixed(0)
                : "-"
            }
            unit="bpm"
            metricKey="hr4s"
            pricingPlan={plan}
          />
          <ResultRow
            label={`Cardiac Stress (${
              sdkState?.results ? "final" : "real-time"
            })`}
            code={`\
// real-time
shenaiSDK.getRealtimeCardiacStress();
// final
shenaiSDK.getMeasurementResults()?.stress_index;`}
            value={
              typeof sdkState?.results?.stress_index === "number"
                ? sdkState.results.stress_index.toFixed(1)
                : typeof sdkState?.realtimeCardiacStress === "number"
                ? sdkState.realtimeCardiacStress.toFixed(1)
                : "-"
            }
            metricKey="stress_index"
            pricingPlan={plan}
          />
          <ResultRow
            label="Parasympathetic Activity"
            code={`shenaiSDK.getMeasurementResults()?.parasympathetic_activity;`}
            value={
              typeof sdkState?.results?.parasympathetic_activity === "number"
                ? sdkState.results.parasympathetic_activity.toFixed(0)
                : "-"
            }
            unit="%"
            metricKey="parasympathetic_activity"
            pricingPlan={plan}
          />
          <ResultRow
            label="Systolic BP"
            code={`shenaiSDK.getMeasurementResults()?.systolic_blood_pressure_mmhg;`}
            value={
              typeof sdkState?.results?.systolic_blood_pressure_mmhg ===
              "number"
                ? sdkState.results.systolic_blood_pressure_mmhg.toFixed(0)
                : "-"
            }
            unit="mmHg"
            metricKey="systolic_blood_pressure_mmhg"
            pricingPlan={plan}
          />
          <ResultRow
            label="Diastolic BP"
            code={`shenaiSDK.getMeasurementResults()?.diastolic_blood_pressure_mmhg;`}
            value={
              typeof sdkState?.results?.diastolic_blood_pressure_mmhg ===
              "number"
                ? sdkState.results.diastolic_blood_pressure_mmhg.toFixed(0)
                : "-"
            }
            unit="mmHg"
            metricKey="diastolic_blood_pressure_mmhg"
            pricingPlan={plan}
          />
          <ResultRow
            label="Cardiac Workload"
            code={`shenaiSDK.getMeasurementResults()?.cardiac_workload_mmhg_per_sec;`}
            value={
              typeof sdkState?.results?.cardiac_workload_mmhg_per_sec ===
              "number"
                ? sdkState.results.cardiac_workload_mmhg_per_sec.toFixed(0)
                : "-"
            }
            unit="mmHg"
            metricKey="cardiac_workload_mmhg_per_sec"
            pricingPlan={plan}
          />
        </div>
      </div>
    </>
  );
};

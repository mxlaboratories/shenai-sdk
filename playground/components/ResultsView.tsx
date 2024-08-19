import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { ShenaiSdkState } from "../pages";

export const ResultsView: React.FC<{ sdkState?: ShenaiSdkState }> = ({
  sdkState,
}) => {
  return (
    <>
      <div className={styles.outputSectionTitle}>Results:</div>
      <div className={styles.outputBicol}>
        <div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Heart Rate (10s)
              <CodeSnippet code={`shenaiSDK.getHeartRate10s();`} />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.hr10s === "number"
                ? `${sdkState.hr10s.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>bpm</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Heart Rate ({sdkState?.results ? "final" : "real-time"})
              <CodeSnippet
                code={`\
// real-time
shenaiSDK.getRealtimeHeartRate();
// final
shenaiSDK.getMeasurementResults()?.heart_rate_bpm;`}
              />
            </div>
            <div className={styles.outputValue}>
              {sdkState?.results
                ? `${sdkState.results.heart_rate_bpm.toFixed(0)}`
                : typeof sdkState?.realtimeHr === "number"
                ? `${sdkState?.realtimeHr.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>bpm</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              HRV SDNN ({sdkState?.results ? "final" : "real-time"})
              <CodeSnippet
                code={`\
// real-time
shenaiSDK.getRealtimeHrvSdnn();
// final
shenaiSDK.getMeasurementResults()?.hrv_sdnn_ms;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.hrv_sdnn_ms === "number"
                ? `${sdkState.results.hrv_sdnn_ms.toFixed(0)}`
                : typeof sdkState?.realtimeHrvSdnn === "number"
                ? `${sdkState?.realtimeHrvSdnn.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>ms</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              HRV lnRMSSD
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.hrv_lnrmssd_ms;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.hrv_lnrmssd_ms === "number"
                ? `${sdkState.results.hrv_lnrmssd_ms.toFixed(1)}`
                : "-"}
              <span className={styles.resultUnit}>ms</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Breathing Rate
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.breathing_rate_bpm;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.breathing_rate_bpm === "number"
                ? `${sdkState.results.breathing_rate_bpm.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>bpm</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Age
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.age_years;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.age_years === "number"
                ? `${sdkState.results.age_years.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>years</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              BMI
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.bmi_kg_per_m2;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.bmi_kg_per_m2 === "number"
                ? `${sdkState.results.bmi_kg_per_m2.toFixed(2)}`
                : "-"}
              <span className={styles.resultUnit}>kg/m²</span>
            </div>
          </div>
        </div>
        <div className={styles.bicolcol}>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Heart Rate (4s)
              <CodeSnippet code={`shenaiSDK.getHeartRate4s();`} />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.hr4s === "number"
                ? `${sdkState.hr4s.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>bpm</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Cardiac Stress ({sdkState?.results ? "final" : "real-time"})
              <CodeSnippet
                code={`\
// real-time
shenaiSDK.getRealtimeCardiacStress();
// final
shenaiSDK.getMeasurementResults()?.stress_index;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.stress_index === "number"
                ? `${sdkState.results.stress_index.toFixed(1)}`
                : typeof sdkState?.realtimeCardiacStress === "number"
                ? `${sdkState?.realtimeCardiacStress.toFixed(1)}`
                : "-"}
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Parasympathetic Activity
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.parasympathetic_activity;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.parasympathetic_activity === "number"
                ? `${sdkState.results.parasympathetic_activity.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>%</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Systolic BP
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.systolic_blood_pressure_mmhg;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.systolic_blood_pressure_mmhg ===
              "number"
                ? `${sdkState.results.systolic_blood_pressure_mmhg.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>mmHg</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Diastolic BP
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.diastolic_blood_pressure_mmhg;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.diastolic_blood_pressure_mmhg ===
              "number"
                ? `${sdkState.results.diastolic_blood_pressure_mmhg.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>mmHg</span>
            </div>
          </div>
          <div className={styles.outputRow}>
            <div className={styles.outputLabel}>
              Cardiac Workload
              <CodeSnippet
                code={`shenaiSDK.getMeasurementResults()?.cardiac_workload_mmhg_per_sec;`}
              />
            </div>
            <div className={styles.outputValue}>
              {typeof sdkState?.results?.cardiac_workload_mmhg_per_sec ===
              "number"
                ? `${sdkState.results.cardiac_workload_mmhg_per_sec.toFixed(0)}`
                : "-"}
              <span className={styles.resultUnit}>mmHg</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import React from "react";
import { CodeSnippet } from "./CodeSnippet";
import styles from "../styles/Home.module.css";
import { Tooltip } from "antd";
import { ShenaiSdkState } from "../pages";
import { ShenaiSDK } from "shenai-sdk";
import { getEnumName } from "../helpers";

const ResultRow: React.FC<{
  label: React.ReactNode;
  code?: string;
  value: string | number | "-";
  unit?: string;
  metricKey: string;
  pricingPlan?: string;
}> = ({ label, code, value, unit, metricKey, pricingPlan }) => {
  // If you have any plan-based restrictions, you can do them here.
  // Currently omitted for simplicity:
  const rowContent = (
    <div className={styles.outputRow}>
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

  return rowContent; // or wrap in <Tooltip> if restricted
};

export const HealthIndicesView: React.FC<{
  sdkState?: ShenaiSdkState, shenaiSDK: ShenaiSDK | null;
}> = ({
  sdkState,
  shenaiSDK
}) => {
  const plan = sdkState?.pricingPlan;
  const indices = sdkState?.healthIndices;

  return (
    <>
      <div className={styles.outputSectionTitle}>Health Indices:</div>
      <div className={styles.outputBicol}>
        <div>
          <ResultRow
            label="Wellness Score"
            code={`shenaiSDK.getHealthRisks()?.wellnessScore;`}
            value={
              indices?.wellnessScore != null ? indices.wellnessScore.toFixed(1) : "-"
            }
            metricKey="wellnessScore"
            pricingPlan={plan}
          />
          <ResultRow
            label="Vascular Age"
            code={`shenaiSDK.getHealthRisks()?.vascularAge;`}
            value={indices?.vascularAge != null ? indices.vascularAge.toFixed(0) : "-"}
            unit="years"
            metricKey="vascularAge"
            pricingPlan={plan}
          />
          <ResultRow
            label="Waist-to-Height Ratio"
            code={`shenaiSDK.getHealthRisks()?.waistToHeightRatio;`}
            value={
              indices?.waistToHeightRatio != null
                ? indices.waistToHeightRatio.toFixed(3)
                : "-"
            }
            metricKey="waistToHeightRatio"
            pricingPlan={plan}
          />
          <ResultRow
            label="Body Fat Percentage"
            code={`shenaiSDK.getHealthRisks()?.bodyFatPercentage;`}
            value={
              indices?.bodyFatPercentage != null
                ? indices.bodyFatPercentage.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="bodyFatPercentage"
            pricingPlan={plan}
          />
          <ResultRow
            label="Body Roundness Index"
            code={`shenaiSDK.getHealthRisks()?.bodyRoundnessIndex;`}
            value={
              indices?.bodyRoundnessIndex != null
                ? indices.bodyRoundnessIndex.toFixed(2)
                : "-"
            }
            metricKey="bodyRoundnessIndex"
            pricingPlan={plan}
          />
          <ResultRow
            label="A Body Shape Index"
            code={`shenaiSDK.getHealthRisks()?.aBodyShapeIndex;`}
            value={
              indices?.aBodyShapeIndex != null
                ? indices.aBodyShapeIndex.toFixed(3)
                : "-"
            }
            metricKey="aBodyShapeIndex"
            pricingPlan={plan}
          />
          <ResultRow
            label="Conicity Index"
            code={`shenaiSDK.getHealthRisks()?.conicityIndex;`}
            value={
              indices?.conicityIndex != null
                ? indices.conicityIndex.toFixed(3)
                : "-"
            }
            metricKey="conicityIndex"
            pricingPlan={plan}
          />
          <ResultRow
            label="Basal Metabolic Rate"
            code={`shenaiSDK.getHealthRisks()?.basalMetabolicRate;`}
            value={
              indices?.basalMetabolicRate != null
                ? indices.basalMetabolicRate.toFixed(0)
                : "-"
            }
            unit="kcal/day"
            metricKey="basalMetabolicRate"
            pricingPlan={plan}
          />
          <ResultRow
            label="Total Daily Energy Expenditure"
            code={`shenaiSDK.getHealthRisks()?.totalDailyEnergyExpenditure;`}
            value={
              indices?.totalDailyEnergyExpenditure != null
                ? indices.totalDailyEnergyExpenditure.toFixed(0)
                : "-"
            }
            unit="kcal/day"
            metricKey="totalDailyEnergyExpenditure"
            pricingPlan={plan}
          />
          <ResultRow
            label="Hypertension Risk"
            code={`shenaiSDK.getHealthRisks()?.hypertensionRisk;`}
            value={indices?.hypertensionRisk != null ? indices.hypertensionRisk.toFixed(1) : "-"}
            unit="%"
            metricKey="hypertensionRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Diabetes Risk"
            code={`shenaiSDK.getHealthRisks()?.diabetesRisk;`}
            value={indices?.diabetesRisk != null ? indices.diabetesRisk.toFixed(0) : "-"}
            unit="%"
            metricKey="diabetesRisk"
            pricingPlan={plan}
          />
        </div>
        <div className={styles.bicolcol}>
          {/* CVDiseasesRisks */}
          <ResultRow
            label="Cardiovascular Disease Overall Risk"
            code={`shenaiSDK.getHealthRisks()?.cvDiseases.overallRisk;`}
            value={
              indices?.cvDiseases?.overallRisk != null
                ? indices.cvDiseases.overallRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="overallRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Coronary Heart Disease Risk"
            code={`shenaiSDK.getHealthRisks()?.cvDiseases.coronaryHeartDiseaseRisk;`}
            value={
              indices?.cvDiseases?.coronaryHeartDiseaseRisk != null
                ? indices.cvDiseases.coronaryHeartDiseaseRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="coronaryHeartDiseaseRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Stroke Risk"
            code={`shenaiSDK.getHealthRisks()?.cvDiseases.strokeRisk;`}
            value={
              indices?.cvDiseases?.strokeRisk != null
                ? indices.cvDiseases.strokeRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="strokeRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Heart Failure Risk"
            code={`shenaiSDK.getHealthRisks()?.cvDiseases.heartFailureRisk;`}
            value={
              indices?.cvDiseases?.heartFailureRisk != null
                ? indices.cvDiseases.heartFailureRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="heartFailureRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Peripheral Vascular Disease Risk"
            code={`shenaiSDK.getHealthRisks()?.cvDiseases.peripheralVascularDiseaseRisk;`}
            value={
              indices?.cvDiseases?.peripheralVascularDiseaseRisk != null
                ? indices.cvDiseases.peripheralVascularDiseaseRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="peripheralVascularDiseaseRisk"
            pricingPlan={plan}
          />

          {/* HardAndFatalEventsRisks */}
          <ResultRow
            label="Coronary Death Event Risk"
            code={`shenaiSDK.getHealthRisks()?.hardAndFatalEvents.coronaryDeathEventRisk;`}
            value={
              indices?.hardAndFatalEvents?.coronaryDeathEventRisk != null
                ? indices.hardAndFatalEvents.coronaryDeathEventRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="coronaryDeathEventRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Fatal Stroke Event Risk"
            code={`shenaiSDK.getHealthRisks()?.hardAndFatalEvents.fatalStrokeEventRisk;`}
            value={
              indices?.hardAndFatalEvents?.fatalStrokeEventRisk != null
                ? indices.hardAndFatalEvents.fatalStrokeEventRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="fatalStrokeEventRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Total Cardiovascular Mortality Risk"
            code={`shenaiSDK.getHealthRisks()?.hardAndFatalEvents.totalCVMortalityRisk;`}
            value={
              indices?.hardAndFatalEvents?.totalCVMortalityRisk != null
                ? indices.hardAndFatalEvents.totalCVMortalityRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="totalCVMortalityRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Hard Cardiovascular Event Risk"
            code={`shenaiSDK.getHealthRisks()?.hardAndFatalEvents.hardCVEventRisk;`}
            value={
              indices?.hardAndFatalEvents?.hardCVEventRisk != null
                ? indices.hardAndFatalEvents.hardCVEventRisk.toFixed(1)
                : "-"
            }
            unit="%"
            metricKey="hardCVEventRisk"
            pricingPlan={plan}
          />
          <ResultRow
            label="Non Alcoholic Fatty Liver Disease risk"
            code={`shenaiSDK.getHealthRisks()?.nonAlcoholicFattyLiverDiseaseRisk;`}
            value={indices?.nonAlcoholicFattyLiverDiseaseRisk != null ? getEnumName(shenaiSDK?.NAFLDRisk, indices.nonAlcoholicFattyLiverDiseaseRisk, "UNKNOWN") : "-"}
            metricKey="nonAlcoholicFattyLiverDiseaseRisk"
            pricingPlan={plan}
          />
        </div>
      </div>
    </>
  );
};

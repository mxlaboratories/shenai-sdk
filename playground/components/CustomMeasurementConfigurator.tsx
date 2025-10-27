import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import styles from "../styles/Home.module.css";
import { Form, Switch, InputNumber } from "antd";
import {
  CustomMeasurementConfig,
  HealthIndex,
  InitializationSettings,
  Metric,
  ShenaiSDK,
} from "shenai-sdk";
import { DraggableList } from "./DraggableList";
import { getEnumName } from "../helpers";
import { ShenaiSdkState } from "../pages";

export const CustomMeasurementConfigurator: React.FC<{
  shenaiSDK: ShenaiSDK | null;
  sdkState?: ShenaiSdkState;
  customConfig: CustomMeasurementConfig | undefined;
  setCustomConfig: Dispatch<
    SetStateAction<CustomMeasurementConfig | undefined>
  >;
  setInitializationSettings: Dispatch<
    SetStateAction<InitializationSettings | undefined>
  >;
  setSnippetCode: (code: string) => void;
}> = ({
  shenaiSDK,
  sdkState,
  customConfig,
  setCustomConfig,
  setInitializationSettings,
  setSnippetCode,
}) => {
  const [form] = Form.useForm();
  const isInitialized = !!sdkState?.isInitialized;
  const config = customConfig;

  useEffect(() => {
    if (!shenaiSDK) return;
    form.setFieldsValue(customConfig);
  }, [shenaiSDK, customConfig, form]);

  const metricToString = useMemo(() => {
    if (!shenaiSDK) return undefined;
    const m = new Map<Metric, string>();
    m.set(shenaiSDK.Metric.HEART_RATE, "Heart Rate");
    m.set(shenaiSDK.Metric.HRV_SDNN, "HRV SDNN");
    m.set(shenaiSDK.Metric.BREATHING_RATE, "Breathing Rate");
    m.set(shenaiSDK.Metric.SYSTOLIC_BP, "Systolic BP");
    m.set(shenaiSDK.Metric.DIASTOLIC_BP, "Diastolic BP");
    m.set(shenaiSDK.Metric.CARDIAC_STRESS, "Cardiac Stress");
    m.set(shenaiSDK.Metric.PNS_ACTIVITY, "Parasympathetic Activity");
    m.set(shenaiSDK.Metric.CARDIAC_WORKLOAD, "Cardiac Workload");
    m.set(shenaiSDK.Metric.AGE, "Age");
    m.set(shenaiSDK.Metric.BMI, "BMI");
    m.set(shenaiSDK.Metric.BLOOD_PRESSURE, "Blood Pressure");
    return m;
  }, [shenaiSDK]);

  const stringToMetric = useMemo(() => {
    if (!metricToString) return undefined;
    const m = new Map<string, Metric>();
    metricToString.forEach((val, key) => m.set(val, key));
    return m;
  }, [metricToString]);

  const healthIndexToString = useMemo(() => {
    if (!shenaiSDK) return undefined;
    const m = new Map<HealthIndex, string>();
    m.set(shenaiSDK.HealthIndex.WELLNESS_SCORE, "Wellness Score");
    m.set(shenaiSDK.HealthIndex.VASCULAR_AGE, "Vascular Age");
    m.set(shenaiSDK.HealthIndex.CARDIOVASCULAR_DISEASE_RISK, "Cardiovascular Disease Risk");
    m.set(shenaiSDK.HealthIndex.HARD_AND_FATAL_EVENTS_RISKS, "Hard And Fatal Events Risk");
    m.set(shenaiSDK.HealthIndex.CARDIOVASCULAR_RISK_SCORE, "Cardiovascular Risk Score");
    m.set(shenaiSDK.HealthIndex.WAIST_TO_HEIGHT_RATIO, "Waist-To-Height Ratio");
    m.set(shenaiSDK.HealthIndex.BODY_FAT_PERCENTAGE, "Body Fat Percentage");
    m.set(shenaiSDK.HealthIndex.BODY_ROUNDNESS_INDEX, "Body Roundness Index");
    m.set(shenaiSDK.HealthIndex.A_BODY_SHAPE_INDEX, "A Body Shape Index");
    m.set(shenaiSDK.HealthIndex.CONICITY_INDEX, "Conicity Index");
    m.set(shenaiSDK.HealthIndex.BASAL_METABOLIC_RATE, "Basal Metabolic Rate");
    m.set(shenaiSDK.HealthIndex.TOTAL_DAILY_ENERGY_EXPENDITURE, "Total Daily Energy Expenditure");
    m.set(shenaiSDK.HealthIndex.HYPERTENSION_RISK, "Hypertension Risk");
    m.set(shenaiSDK.HealthIndex.DIABETES_RISK, "Diabetes Risk");
    m.set(shenaiSDK.HealthIndex.NON_ALCOHOLIC_FATTY_LIVER_DISEASE_RISK, "Non Alcoholic Fatty Liver Disease Risk");
    return m;
  }, [shenaiSDK]);

  const stringToHealthIndex = useMemo(() => {
    if (!healthIndexToString) return undefined;
    const m = new Map<string, HealthIndex>();
    healthIndexToString.forEach((val, key) => m.set(val, key));
    return m;
  }, [healthIndexToString]);

  const availableInstantMetrics = useMemo(() => {
    if (!shenaiSDK || !config || !metricToString) return [];
    const finite = !config.infiniteMeasurement;
    const quick = config.durationSeconds != null && config.durationSeconds < 15;
    
    // We return just the heartrate if the duration is less then 15 seconds
    if (quick) {
      return [shenaiSDK.Metric.HEART_RATE]
        .map((m) => metricToString.get(m) ?? "")
        .filter((x) => x !== "");
    }
    
    return [
      shenaiSDK.Metric.HEART_RATE,
      shenaiSDK.Metric.HRV_SDNN,
      finite ? shenaiSDK.Metric.BREATHING_RATE : undefined,
      finite ? shenaiSDK.Metric.BLOOD_PRESSURE : undefined,
      finite ? shenaiSDK.Metric.SYSTOLIC_BP : undefined,
      finite ? shenaiSDK.Metric.DIASTOLIC_BP : undefined,
      shenaiSDK.Metric.CARDIAC_STRESS,
    ]
      .map((m) => (m ? metricToString.get(m) ?? "" : ""))
      .filter((x) => x !== "");
  }, [shenaiSDK, config, metricToString]);

  const availableSummaryMetrics = useMemo(() => {
    // Summary metrics are all possible metrics since we have metricToString keys.
    // We just return all keys when infiniteMeasurement is false.
    if (!stringToMetric || !config || config.infiniteMeasurement || !shenaiSDK || !metricToString) return [];
    const quick = config.durationSeconds != null && config.durationSeconds < 15;
    if (quick) {
      return [shenaiSDK.Metric.HEART_RATE]
        .map((m) => metricToString.get(m) ?? "")
        .filter((x) => x !== "");
    }
    
    return Array.from(stringToMetric.keys());
  }, [stringToMetric, config, metricToString, shenaiSDK])

  const availableHealthIndices = useMemo(() => {
    if (!stringToHealthIndex || !config || config.infiniteMeasurement) return [];
    return Array.from(stringToHealthIndex.keys());
  }, [stringToHealthIndex, config]);

  const instantMetrics = useMemo(
    () =>
      config?.instantMetrics?.map((m) => metricToString?.get(m) ?? "Error") ??
      [],
    [config, metricToString]
  );

  const summaryMetrics = useMemo(
    () =>
      config?.summaryMetrics?.map((m) => metricToString?.get(m) ?? "Error") ??
      [],
    [config, metricToString]
  );

  const healthIndices = useMemo(
    () =>
      config?.healthIndices?.map((h) => healthIndexToString?.get(h) ?? "Error") ??
      [],
    [config, healthIndexToString]
  );

  const finalInstantMetrics = useMemo(
    () =>
      instantMetrics.filter(
        (m) => availableInstantMetrics.includes(m) || m === "Error"
      ),
    [instantMetrics, availableInstantMetrics]
  );

  const finalSummaryMetrics = useMemo(
    () =>
      summaryMetrics.filter(
        (m) => availableSummaryMetrics.includes(m) || m === "Error"
      ),
    [summaryMetrics, availableSummaryMetrics]
  );

  const finalHealthIndices = useMemo(
    () =>
      healthIndices.filter(
        (h) => availableHealthIndices.includes(h) || h === "Error"
      ),
    [healthIndices, availableHealthIndices]
  );


  const formatMetrics = useCallback(
    (metrics: string[] | undefined) => {
      if (!metrics || !shenaiSDK || !stringToMetric) return "[]";
      return (
        "[" +
        metrics
          .map((m) =>
            getEnumName(shenaiSDK.Metric, stringToMetric.get(m) ?? undefined)
          )
          .filter((x) => x !== "")
          .map((x) => `shenaiSDK.Metric.${x}`)
          .join(", ") +
        "]"
      );
    },
    [shenaiSDK, stringToMetric]
  );

  const formatHealthIndices = useCallback(
    (indices: string[] | undefined) => {
      if (!indices || !shenaiSDK || !stringToHealthIndex) return "[]";
      return (
        "[" +
        indices
          .map((h) =>
            getEnumName(shenaiSDK.HealthIndex, stringToHealthIndex.get(h) ?? undefined)
          )
          .filter((x) => x !== "")
          .map((x) => `shenaiSDK.HealthIndex.${x}`)
          .join(", ") +
        "]"
      );
    },
    [shenaiSDK, stringToHealthIndex]
  );

  useEffect(() => {
    setSnippetCode(
      `\
shenaiSDK.setCustomMeasurementConfig({
  durationSeconds: ${config?.durationSeconds},
  infiniteMeasurement: ${config?.infiniteMeasurement},

  instantMetrics: ${formatMetrics(finalInstantMetrics)},` +
        (!config?.infiniteMeasurement
          ? `
  summaryMetrics: ${formatMetrics(finalSummaryMetrics)},`
          : "") +
        `
  healthIndices: ${formatHealthIndices(finalHealthIndices)},

  realtimeHrPeriodSeconds: ${config?.realtimeHrPeriodSeconds},
  realtimeHrvPeriodSeconds: ${config?.realtimeHrvPeriodSeconds},
  realtimeCardiacStressPeriodSeconds: ${config?.realtimeCardiacStressPeriodSeconds},
})
`
    );
  }, [
    setSnippetCode,
    config,
    formatMetrics,
    formatHealthIndices,
    finalInstantMetrics,
    finalSummaryMetrics,
    finalHealthIndices
  ]);

  /**
   * A helper to handle configuration changes.
   * Always sets initialization settings.
   * If initialized, calls shenaiSDK.setCustomMeasurementConfig.
   * If not, updates customConfig.
   */
  const handleConfigChange = (newConfig: CustomMeasurementConfig) => {
    // Always update initialization settings
    setInitializationSettings((s) =>
      shenaiSDK
        ? { ...s, measurementPreset: shenaiSDK.MeasurementPreset.CUSTOM }
        : s
    );
    if (isInitialized) {
      // SDK is initialized: update SDK config
      if (shenaiSDK) shenaiSDK.setCustomMeasurementConfig(newConfig);
    }
    setCustomConfig(newConfig);
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (!config) return;
    const newConfig = { ...config, ...changedValues };
    handleConfigChange(newConfig);
  };

  const onInstantMetricsChange = (items: string[]) => {
    if (!config || !stringToMetric) return;
    const newMetrics = items
      .map((x) => stringToMetric.get(x))
      .filter((x): x is Metric => x !== undefined);
    const newConfig = { ...config, instantMetrics: newMetrics };
    handleConfigChange(newConfig);
  };

  const onSummaryMetricsChange = (items: string[]) => {
    if (!config || !stringToMetric) return;
    const newMetrics = items
      .map((x) => stringToMetric.get(x))
      .filter((x): x is Metric => x !== undefined);
    const newConfig = { ...config, summaryMetrics: newMetrics };
    handleConfigChange(newConfig);
  };

  const onHealthIndicesChange = (items: string[]) => {
    if (!config || !stringToHealthIndex || !shenaiSDK) return;

    const MASTER_HEALTH_INDEX_ORDER: HealthIndex[] = [
      shenaiSDK.HealthIndex.WELLNESS_SCORE,
      shenaiSDK.HealthIndex.VASCULAR_AGE,
      shenaiSDK.HealthIndex.CARDIOVASCULAR_DISEASE_RISK,
      shenaiSDK.HealthIndex.HARD_AND_FATAL_EVENTS_RISKS,
      shenaiSDK.HealthIndex.CARDIOVASCULAR_RISK_SCORE,
      shenaiSDK.HealthIndex.HYPERTENSION_RISK,
      shenaiSDK.HealthIndex.DIABETES_RISK,
      shenaiSDK.HealthIndex.NON_ALCOHOLIC_FATTY_LIVER_DISEASE_RISK,
      shenaiSDK.HealthIndex.WAIST_TO_HEIGHT_RATIO,
      shenaiSDK.HealthIndex.BODY_FAT_PERCENTAGE,
      shenaiSDK.HealthIndex.BODY_ROUNDNESS_INDEX,
      shenaiSDK.HealthIndex.A_BODY_SHAPE_INDEX,
      shenaiSDK.HealthIndex.CONICITY_INDEX,
      shenaiSDK.HealthIndex.BASAL_METABOLIC_RATE,
      shenaiSDK.HealthIndex.TOTAL_DAILY_ENERGY_EXPENDITURE
    ];

    const rawIndices = items
      .map((x) => stringToHealthIndex.get(x))
      .filter((x): x is HealthIndex => x !== undefined);

    const orderMap = new Map<HealthIndex, number>();
    MASTER_HEALTH_INDEX_ORDER.forEach((val, index) => {
      orderMap.set(val, index);
    });

    const sortedIndices = rawIndices.slice().sort((a, b) => {
      const orderA = orderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    const newConfig = { ...config, healthIndices: sortedIndices };
    handleConfigChange(newConfig);
  };

  // Determine restricted items based on CORE plan
  const isCorePlan = sdkState?.pricingPlan === "CORE";
  let restrictedItems: string[] = [];
  if (isCorePlan && metricToString) {
    const restrictedMetrics = [
      shenaiSDK?.Metric.BLOOD_PRESSURE,
      shenaiSDK?.Metric.SYSTOLIC_BP,
      shenaiSDK?.Metric.DIASTOLIC_BP,
      shenaiSDK?.Metric.AGE,
      shenaiSDK?.Metric.BMI,
      shenaiSDK?.Metric.CARDIAC_WORKLOAD,
    ].filter((m): m is Metric => m !== undefined);

    restrictedItems = restrictedMetrics
      .map((m) => metricToString.get(m) ?? "")
      .filter((x) => x !== "");
  }

  return (
    <>
      <Form
        form={form}
        layout="horizontal"
        onValuesChange={onValuesChange}
        labelCol={{ span: 16 }}
        wrapperCol={{ span: 8 }}
        disabled={!shenaiSDK}
      >
        <Form.Item label="Duration" name="durationSeconds">
          <InputNumber
            min={10}
            max={120}
            style={{ width: "100%" }}
            suffix="s"
            disabled={!shenaiSDK || config?.infiniteMeasurement}
          />
        </Form.Item>
        <Form.Item
          label="Infinite Measurement"
          name="infiniteMeasurement"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item label="Real-time HR Period" name="realtimeHrPeriodSeconds">
          <InputNumber min={4} max={60} style={{ width: "100%" }} suffix="s" />
        </Form.Item>
        <Form.Item label="Real-time HRV Period" name="realtimeHrvPeriodSeconds">
          <InputNumber
            min={10}
            max={60}
            style={{ width: "100%" }}
            suffix="s"
            disabled={!shenaiSDK || config?.infiniteMeasurement === false}
          />
        </Form.Item>
        <Form.Item
          label="Real-time Stress Period"
          name="realtimeCardiacStressPeriodSeconds"
        >
          <InputNumber
            min={10}
            max={60}
            style={{ width: "100%" }}
            suffix="s"
            disabled={!shenaiSDK || config?.infiniteMeasurement === false}
          />
        </Form.Item>
      </Form>

      {finalInstantMetrics && (
        <div className={styles.metricsList}>
          <h4>Instant Metrics:</h4>
          <DraggableList
            items={finalInstantMetrics}
            availableItems={availableInstantMetrics}
            onChange={onInstantMetricsChange}
            newItemTitle="Add metric"
            disabled={!shenaiSDK}
            restrictedItems={restrictedItems}
          />
        </div>
      )}

      {finalSummaryMetrics && (availableSummaryMetrics?.length ?? 0) > 0 && (
        <div className={styles.metricsList}>
          <h4>Health Check Results:</h4>
          <DraggableList
            items={finalSummaryMetrics}
            availableItems={availableSummaryMetrics}
            onChange={onSummaryMetricsChange}
            newItemTitle="Add metric"
            disabled={!shenaiSDK}
            restrictedItems={restrictedItems}
          />
        </div>
      )}

      {finalHealthIndices && (availableHealthIndices?.length ?? 0) > 0 && (
        <div className={styles.metricsList}>
          <h4>Health Indices:</h4>
          <DraggableList
            items={finalHealthIndices}
            availableItems={availableHealthIndices}
            onChange={onHealthIndicesChange}
            newItemTitle="Add Index"
            disabled={!shenaiSDK}
            dragDisabled={true}
          />
        </div>
      )}
    </>
  );
};

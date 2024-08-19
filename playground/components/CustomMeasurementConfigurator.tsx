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
  InitializationSettings,
  Metric,
  ShenaiSDK,
} from "shenai-sdk";
import { DraggableList } from "./DraggableList";
import { getEnumName } from "../helpers";
import { ShenaiSdkState } from "../pages";

export const CustomMeasurementConfigurator: React.FC<{
  shenaiSDK: ShenaiSDK | undefined;
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

  useEffect(() => {
    if (!shenaiSDK) return;
    const defaultConfig = {
      durationSeconds: 60,
      infiniteMeasurement: false,

      instantMetrics: [
        shenaiSDK.Metric.HEART_RATE,
        shenaiSDK.Metric.HRV_SDNN,
        shenaiSDK.Metric.BREATHING_RATE,
        shenaiSDK.Metric.SYSTOLIC_BP,
        shenaiSDK.Metric.DIASTOLIC_BP,
        shenaiSDK.Metric.CARDIAC_STRESS,
      ],
      summaryMetrics: [
        shenaiSDK.Metric.HEART_RATE,
        shenaiSDK.Metric.HRV_SDNN,
        shenaiSDK.Metric.BREATHING_RATE,
        shenaiSDK.Metric.SYSTOLIC_BP,
        shenaiSDK.Metric.DIASTOLIC_BP,
        shenaiSDK.Metric.CARDIAC_STRESS,
        shenaiSDK.Metric.PNS_ACTIVITY,
        shenaiSDK.Metric.CARDIAC_WORKLOAD,
      ],

      realtimeHrPeriodSeconds: 10,
      realtimeHrvPeriodSeconds: 30,
      realtimeCardiacStressPeriodSeconds: 30,
    };
    setCustomConfig(defaultConfig);
    form.setFieldsValue(defaultConfig);
  }, [shenaiSDK, form]);

  const config = customConfig;

  useEffect(() => {
    if (!config) return;
    shenaiSDK?.setCustomMeasurementConfig(config);
    setInitializationSettings((s) =>
      shenaiSDK
        ? { ...s, measurementPreset: shenaiSDK.MeasurementPreset.CUSTOM }
        : s
    );
  }, [config]);

  const metricToString = useMemo(() => {
    if (!shenaiSDK) return;
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
    return m;
  }, [shenaiSDK]);

  const stringToMetric = useMemo(() => {
    if (!metricToString) return;
    const m = new Map<string, Metric>();
    metricToString.forEach((val, key) => m.set(val, key));
    return m;
  }, [metricToString]);

  const availableInstantMetrics = useMemo(() => {
    if (!shenaiSDK || !config) return;
    const finite = !config.infiniteMeasurement;
    return [
      shenaiSDK.Metric.HEART_RATE,
      shenaiSDK.Metric.HRV_SDNN,
      finite ? shenaiSDK.Metric.BREATHING_RATE : undefined,
      finite ? shenaiSDK.Metric.SYSTOLIC_BP : undefined,
      finite ? shenaiSDK.Metric.DIASTOLIC_BP : undefined,
      shenaiSDK.Metric.CARDIAC_STRESS,
    ]
      .map((m) => (m ? metricToString?.get(m) ?? "" : ""))
      .filter((x) => x !== "");
  }, [shenaiSDK, config, metricToString]);

  const availableSummaryMetrics = useMemo(() => {
    if (!stringToMetric || !config) return;
    if (config.infiniteMeasurement) return [];
    return Array.from(stringToMetric.keys());
  }, [stringToMetric, config]);

  const instantMetrics = useMemo(() => {
    if (!config || !metricToString) return;
    return config.instantMetrics?.map((m) => metricToString.get(m) ?? "Error");
  }, [config, metricToString]);

  const summaryMetrics = useMemo(() => {
    if (!config || !metricToString) return;
    return config.summaryMetrics?.map((m) => metricToString.get(m) ?? "Error");
  }, [config, metricToString]);

  const finalInstantMetrics = useMemo(
    () =>
      instantMetrics?.filter(
        (m) => [...(availableInstantMetrics ?? []), "Error"].indexOf(m) >= 0
      ),
    [instantMetrics, availableInstantMetrics]
  );
  const finalSummaryMetrics = useMemo(
    () =>
      summaryMetrics?.filter(
        (m) => [...(availableSummaryMetrics ?? []), "Error"].indexOf(m) >= 0
      ),
    [summaryMetrics, availableSummaryMetrics]
  );

  const onValuesChange = (changedValues: any, allValues: any) => {
    setCustomConfig({ ...config, ...changedValues });
  };

  const formatMetrics = useCallback(
    (metrics: string[] | undefined) => {
      if (metrics)
        return (
          "[" +
          metrics
            .map((m) =>
              getEnumName(shenaiSDK?.Metric, stringToMetric?.get(m) ?? -1)
            )
            .filter((x) => x !== "")
            .map((x) => `shenaiSDK.Metric.${x}`)
            .join(", ") +
          "]"
        );
    },
    [shenaiSDK, stringToMetric]
  );

  const disabled = shenaiSDK === undefined || !sdkState?.isInitialized;

  useEffect(
    () =>
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
  
    realtimeHrPeriodSeconds: ${config?.realtimeHrPeriodSeconds},
    realtimeHrvPeriodSeconds: ${config?.realtimeHrvPeriodSeconds},
    realtimeCardiacStressPeriodSeconds: ${config?.realtimeCardiacStressPeriodSeconds},
  })      
  `
      ),
    [
      setSnippetCode,
      config,
      formatMetrics,
      finalInstantMetrics,
      finalSummaryMetrics,
    ]
  );

  return (
    <>
      <Form
        form={form}
        layout="horizontal"
        onValuesChange={onValuesChange}
        labelCol={{ span: 16 }}
        wrapperCol={{ span: 8 }}
        disabled={disabled}
      >
        <Form.Item label="Duration" name="durationSeconds">
          <InputNumber
            min={15}
            max={120}
            style={{ width: "100%" }}
            suffix="s"
            disabled={disabled || config?.infiniteMeasurement === true}
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
            disabled={disabled || config?.infiniteMeasurement === false}
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
            disabled={disabled || config?.infiniteMeasurement === false}
            suffix="s"
          />
        </Form.Item>
      </Form>
      {finalInstantMetrics && (
        <div className={styles.metricsList}>
          <h4>Instant Metrics:</h4>
          <DraggableList
            items={finalInstantMetrics}
            availableItems={availableInstantMetrics}
            onChange={(items) =>
              stringToMetric &&
              setCustomConfig({
                ...config,
                instantMetrics: items
                  .map((x) => stringToMetric.get(x))
                  .filter((x) => x !== undefined) as Metric[],
              })
            }
            newItemTitle="Add metric"
            disabled={disabled}
          />
        </div>
      )}
      {finalSummaryMetrics && (availableSummaryMetrics?.length ?? 0) > 0 && (
        <div className={styles.metricsList}>
          <h4>Summary Metrics:</h4>
          <DraggableList
            items={finalSummaryMetrics}
            availableItems={availableSummaryMetrics}
            onChange={(items) =>
              stringToMetric &&
              setCustomConfig({
                ...config,
                summaryMetrics: items
                  .map((x) => stringToMetric.get(x))
                  .filter((x) => x !== undefined) as Metric[],
              })
            }
            newItemTitle="Add metric"
            disabled={disabled}
          />
        </div>
      )}
    </>
  );
};

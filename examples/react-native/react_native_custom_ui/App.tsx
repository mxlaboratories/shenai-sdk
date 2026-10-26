import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  NativeEventEmitter,
  NativeModules,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  computeHealthRisks,
  deinitialize,
  getCurrentViolatedMeasurementEnvironmentCondition,
  getMeasurementProgressPercentage,
  getMeasurementResults,
  getMeasurementState,
  getRealtimeMetrics,
  initialize,
  isInitialized,
  resetMeasurementSession,
  setCameraMode,
  setOperatingMode,
  ShenaiSdkView,
  startMeasurement,
} from "react-native-shenai-sdk";
import type {
  HealthRisks,
  MeasurementResults,
} from "react-native-shenai-sdk";

import {
  BooleanRow,
  InitializationMessage,
  MetricGrid,
  NumericField,
  QualityIndicator,
  SegmentedChoice,
  TextField,
} from "./src/components";
import {
  InitializationResultValue,
  MeasurementStateValue,
  SettingsValue,
} from "./src/constants";
import {
  formatNumber,
  headlineValues,
  healthRiskValues,
  isRunningMeasurementState,
  measurementMetricValues,
  measurementStatusText,
} from "./src/measurement";
import {
  activityChoices,
  buildRiskFactors,
  customUiSettings,
  defaultProfile,
  familyChoices,
  genderChoices,
  parentChoices,
  raceChoices,
  treatmentChoices,
  type Profile,
} from "./src/profile";
import {styles} from "./src/styles";

declare const process: {
  env: {
    SHENAI_API_KEY?: string;
  };
};

const shenApiKey = process.env.SHENAI_API_KEY ?? "";
const {ShenaiSdkNativeModule} = NativeModules;
const sdkEventEmitter = new NativeEventEmitter(ShenaiSdkNativeModule);

type AppScreen = "measurement" | "profile" | "results";

const App = () => {
  const [screen, setScreen] = useState<AppScreen>("measurement");
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [initializationResult, setInitializationResult] = useState<
    number | null | false
  >(null);
  const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState("Initializing SDK...");
  const [measurementState, setMeasurementState] = useState<number | null>(null);
  const [violatedCondition, setViolatedCondition] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [realtimeMetrics, setRealtimeMetrics] =
    useState<MeasurementResults | null>(null);
  const [results, setResults] = useState<MeasurementResults | null>(null);
  const [healthRisks, setHealthRisks] = useState<HealthRisks | null>(null);
  const [hasReachedFinalizing, setHasReachedFinalizing] = useState(false);
  const [hasFinishedMeasurement, setHasFinishedMeasurement] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [profileReturnScreen, setProfileReturnScreen] =
    useState<AppScreen>("measurement");

  const profileRef = useRef(profile);
  const isPollingRef = useRef(false);
  const resettingRef = useRef(false);
  const resetGenerationRef = useRef(0);
  const resultsRef = useRef<MeasurementResults | null>(null);
  const healthRisksRef = useRef<HealthRisks | null>(null);
  const hasFinishedMeasurementRef = useRef(false);
  const initializedRef = useRef(false);
  const screenRef = useRef<AppScreen>("measurement");

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    initializedRef.current = initialized;
  }, [initialized]);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    healthRisksRef.current = healthRisks;
  }, [healthRisks]);

  useEffect(() => {
    hasFinishedMeasurementRef.current = hasFinishedMeasurement;
  }, [hasFinishedMeasurement]);

  const updateProfile = useCallback((next: Partial<Profile>) => {
    setProfile(current => {
      const updated = {...current, ...next};
      profileRef.current = updated;
      return updated;
    });
  }, []);

  const resetMeasurementUiState = useCallback(() => {
    resetGenerationRef.current += 1;
    resultsRef.current = null;
    healthRisksRef.current = null;
    hasFinishedMeasurementRef.current = false;
    setMeasurementState(null);
    setViolatedCondition(null);
    setProgress(0);
    setRealtimeMetrics(null);
    setResults(null);
    setHealthRisks(null);
    setHasReachedFinalizing(false);
    setHasFinishedMeasurement(false);
  }, []);

  const refreshSdkState = useCallback(async (loadHealthRisks = false) => {
    if (
      isPollingRef.current ||
      resettingRef.current ||
      !initializedRef.current
    ) {
      return;
    }

    const resetGeneration = resetGenerationRef.current;
    isPollingRef.current = true;

    try {
      const [nextState, nextProgress, nextCondition, realtime, sdkResults] =
        await Promise.all([
          getMeasurementState(),
          getMeasurementProgressPercentage(),
          getCurrentViolatedMeasurementEnvironmentCondition().catch(() => null),
          getRealtimeMetrics(10).catch(() => null),
          getMeasurementResults().catch(() => null),
        ]);

      if (
        resettingRef.current ||
        resetGenerationRef.current !== resetGeneration
      ) {
        return;
      }

      const running = isRunningMeasurementState(nextState);
      const finished =
        nextState === MeasurementStateValue.FINISHED ||
        hasFinishedMeasurementRef.current ||
        sdkResults != null;

      setMeasurementState(nextState);
      setViolatedCondition(nextCondition);
      setProgress(nextProgress ?? 0);
      setHasReachedFinalizing(current => {
        return current || nextState === MeasurementStateValue.FINALIZING;
      });
      setHasFinishedMeasurement(current => {
        const next = current || finished;
        hasFinishedMeasurementRef.current = next;
        return next;
      });

      if (finished) {
        const finalResults = sdkResults ?? resultsRef.current;
        if (finalResults != null) {
          resultsRef.current = finalResults;
          setResults(finalResults);
        }
        setRealtimeMetrics(null);

        if (
          (loadHealthRisks || healthRisksRef.current == null) &&
          finalResults != null
        ) {
          const risks = await computeHealthRisks(
            buildRiskFactors(profileRef.current, finalResults),
          ).catch(() => null);
          if (
            risks != null &&
            !resettingRef.current &&
            resetGenerationRef.current === resetGeneration
          ) {
            healthRisksRef.current = risks;
            setHealthRisks(risks);
          }
        }
        return;
      }

      setRealtimeMetrics(running ? realtime : null);
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  const initializeSdk = useCallback(async () => {
    if (!shenApiKey) {
      setStatus("Missing SHENAI_API_KEY");
      setInitializationResult(false);
      setInitialized(false);
      return;
    }

    setStatus("Initializing SDK...");
    setInitializationResult(null);
    resetMeasurementUiState();

    try {
      if (await isInitialized()) {
        await deinitialize();
      }

      const result = await initialize(
        shenApiKey,
        "",
        customUiSettings(profileRef.current),
      );

      setInitializationResult(result);
      const ok = result === InitializationResultValue.OK;
      setInitialized(ok);
      initializedRef.current = ok;
      if (!ok) {
        setStatus(`Initialization failed: ${result}`);
        return;
      }

      setStatus("Ready");
      await setCameraMode(SettingsValue.CAMERA_MODE_FACING_USER);
      await refreshSdkState();
    } catch (error) {
      setInitializationResult(false);
      setInitialized(false);
      initializedRef.current = false;
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, [refreshSdkState, resetMeasurementUiState]);

  const startCustomMeasurement = useCallback(async () => {
    if (!initializedRef.current || resettingRef.current) {
      return;
    }

    setScreen("measurement");
    resettingRef.current = true;
    setResetting(true);
    resetMeasurementUiState();

    try {
      await resetMeasurementSession();
      await setOperatingMode(SettingsValue.OPERATING_MODE_MEASURE);
      await setCameraMode(SettingsValue.CAMERA_MODE_FACING_USER);
      await startMeasurement();
      setMeasurementState(MeasurementStateValue.WAITING_FOR_FACE);
      setStatus("Waiting for face");
    } finally {
      resettingRef.current = false;
      setResetting(false);
    }

    await refreshSdkState();
  }, [refreshSdkState, resetMeasurementUiState]);

  const stopCustomMeasurement = useCallback(async () => {
    if (!initializedRef.current || resettingRef.current) {
      return;
    }

    resettingRef.current = true;
    setResetting(true);

    try {
      await resetMeasurementSession();
      await setCameraMode(SettingsValue.CAMERA_MODE_FACING_USER);
      resetMeasurementUiState();
      setStatus("Ready");
      setScreen("measurement");
    } finally {
      resettingRef.current = false;
      setResetting(false);
    }
  }, [resetMeasurementUiState]);

  const openProfile = useCallback(() => {
    setProfileReturnScreen(screenRef.current);
    setScreen("profile");
    if (initializedRef.current) {
      setCameraMode(SettingsValue.CAMERA_MODE_OFF).catch(() => null);
    }
  }, []);

  const closeProfile = useCallback(async () => {
    setScreen(profileReturnScreen);
    if (initializedRef.current && profileReturnScreen === "measurement") {
      await setCameraMode(SettingsValue.CAMERA_MODE_FACING_USER).catch(
        () => null,
      );
    }
    if (resultsRef.current != null) {
      const risks = await computeHealthRisks(
        buildRiskFactors(profileRef.current, resultsRef.current),
      ).catch(() => null);
      if (risks != null) {
        healthRisksRef.current = risks;
        setHealthRisks(risks);
      }
    }
  }, [profileReturnScreen]);

  const openResults = useCallback(async () => {
    if (resultsRef.current == null && results == null) {
      return;
    }
    setScreen("results");
    if (initializedRef.current) {
      await setCameraMode(SettingsValue.CAMERA_MODE_OFF).catch(() => null);
    }
  }, [results]);

  const backToMeasurement = useCallback(async () => {
    setScreen("measurement");
    if (initializedRef.current) {
      await setCameraMode(SettingsValue.CAMERA_MODE_FACING_USER).catch(
        () => null,
      );
    }
  }, []);

  useEffect(() => {
    initializeSdk();
    return () => {
      deinitialize().catch(() => null);
    };
  }, [initializeSdk]);

  useEffect(() => {
    const subscription = sdkEventEmitter.addListener("ShenAIEvent", event => {
      const eventName = event?.EventName;
      if (eventName === "MEASUREMENT_FINISHED") {
        hasFinishedMeasurementRef.current = true;
        setHasFinishedMeasurement(true);
        refreshSdkState(true);
      }
      if (eventName) {
        console.log("Shen.AI event:", eventName);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshSdkState]);

  useEffect(() => {
    if (!initialized || screen !== "measurement") {
      return;
    }
    const interval = setInterval(() => {
      refreshSdkState();
    }, 200);
    return () => {
      clearInterval(interval);
    };
  }, [initialized, refreshSdkState, screen]);

  const running = isRunningMeasurementState(measurementState);
  const measurementFinished =
    hasFinishedMeasurement || measurementState === MeasurementStateValue.FINISHED;
  const displayResults = measurementFinished ? results : realtimeMetrics;
  const currentStatus = measurementStatusText(
    measurementState,
    violatedCondition,
    hasReachedFinalizing,
    hasFinishedMeasurement,
  );

  if (screen === "profile") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health profile</Text>
          <Pressable
            accessibilityRole="button"
            onPress={closeProfile}
            style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Done</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body and labs</Text>
            <NumericField
              label="Age"
              onChange={age => updateProfile({age})}
              value={profile.age}
            />
            <NumericField
              label="Height cm"
              onChange={bodyHeight => updateProfile({bodyHeight})}
              value={profile.bodyHeight}
            />
            <NumericField
              label="Weight kg"
              onChange={bodyWeight => updateProfile({bodyWeight})}
              value={profile.bodyWeight}
            />
            <NumericField
              label="Waist cm"
              onChange={waistCircumference =>
                updateProfile({waistCircumference})
              }
              value={profile.waistCircumference}
            />
            <NumericField
              label="Neck cm"
              onChange={neckCircumference =>
                updateProfile({neckCircumference})
              }
              value={profile.neckCircumference}
            />
            <NumericField
              label="Hip cm"
              onChange={hipCircumference => updateProfile({hipCircumference})}
              value={profile.hipCircumference}
            />
            <NumericField
              label="Cholesterol"
              onChange={cholesterol => updateProfile({cholesterol})}
              value={profile.cholesterol}
            />
            <NumericField
              label="HDL"
              onChange={cholesterolHdl => updateProfile({cholesterolHdl})}
              value={profile.cholesterolHdl}
            />
            <NumericField
              label="Triglyceride"
              onChange={triglyceride => updateProfile({triglyceride})}
              value={profile.triglyceride}
            />
            <NumericField
              label="Fasting glucose"
              onChange={fastingGlucose => updateProfile({fastingGlucose})}
              value={profile.fastingGlucose}
            />
            <NumericField
              label="Systolic BP"
              onChange={sbp => updateProfile({sbp})}
              value={profile.sbp}
            />
            <NumericField
              label="Diastolic BP"
              onChange={dbp => updateProfile({dbp})}
              value={profile.dbp}
            />
            <TextField
              label="Country"
              onChange={country => updateProfile({country})}
              value={profile.country}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk factors</Text>
            <SegmentedChoice
              label="Gender"
              onChange={gender => updateProfile({gender})}
              options={genderChoices}
              value={profile.gender}
            />
            <SegmentedChoice
              label="Physical activity"
              onChange={physicalActivity => updateProfile({physicalActivity})}
              options={activityChoices}
              value={profile.physicalActivity}
            />
            <SegmentedChoice
              label="Race"
              onChange={race => updateProfile({race})}
              options={raceChoices}
              value={profile.race}
            />
            <SegmentedChoice
              label="Hypertension treatment"
              onChange={hypertensionTreatment =>
                updateProfile({hypertensionTreatment})
              }
              options={treatmentChoices}
              value={profile.hypertensionTreatment}
            />
            <SegmentedChoice
              label="Family diabetes"
              onChange={familyDiabetes => updateProfile({familyDiabetes})}
              options={familyChoices}
              value={profile.familyDiabetes}
            />
            <SegmentedChoice
              label="Parental hypertension"
              onChange={parentalHypertension =>
                updateProfile({parentalHypertension})
              }
              options={parentChoices}
              value={profile.parentalHypertension}
            />
            <BooleanRow
              label="Smoker"
              onChange={isSmoker => updateProfile({isSmoker})}
              value={profile.isSmoker}
            />
            <BooleanRow
              label="Diabetes"
              onChange={hasDiabetes => updateProfile({hasDiabetes})}
              value={profile.hasDiabetes}
            />
            <BooleanRow
              label="Vegetable and fruit diet"
              onChange={vegetableFruitDiet =>
                updateProfile({vegetableFruitDiet})
              }
              value={profile.vegetableFruitDiet}
            />
            <BooleanRow
              label="History of high glucose"
              onChange={historyOfHighGlucose =>
                updateProfile({historyOfHighGlucose})
              }
              value={profile.historyOfHighGlucose}
            />
            <BooleanRow
              label="History of hypertension"
              onChange={historyOfHypertension =>
                updateProfile({historyOfHypertension})
              }
              value={profile.historyOfHypertension}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "results") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Results</Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={openProfile}
              style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Profile</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={backToMeasurement}
              style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Back</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurement quality</Text>
            <QualityIndicator results={results} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metrics</Text>
            <MetricGrid values={measurementMetricValues(results)} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health indices</Text>
            <MetricGrid values={healthRiskValues(healthRisks)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Custom UI</Text>
        <Pressable
          accessibilityRole="button"
          onPress={openProfile}
          style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Profile</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cameraShell}>
          {initialized ? (
            <ShenaiSdkView style={styles.sdkView} />
          ) : (
            <InitializationMessage
              initializationResult={initializationResult}
              initialized={initialized}
              status={status}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${Math.max(0, Math.min(100, progress))}%`},
              ]}
            />
          </View>
          <Text style={styles.statusText}>
            {initialized
              ? `${currentStatus} - ${formatNumber(progress)}%`
              : status}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live quality</Text>
          <QualityIndicator results={displayResults} />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!initialized || running || resetting}
            onPress={startCustomMeasurement}
            style={({pressed}) => [
              styles.primaryButton,
              (!initialized || running || resetting) && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}>
            <Text style={styles.primaryButtonText}>Start</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!initialized || !running || resetting}
            onPress={stopCustomMeasurement}
            style={({pressed}) => [
              styles.secondaryButton,
              (!initialized || !running || resetting) && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}>
            <Text style={styles.secondaryButtonText}>Stop</Text>
          </Pressable>
        </View>

        {measurementFinished && (
          <Pressable
            accessibilityRole="button"
            disabled={results == null}
            onPress={openResults}
            style={({pressed}) => [
              styles.resultsButton,
              results == null && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}>
            <Text style={styles.primaryButtonText}>See results</Text>
          </Pressable>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current values</Text>
          <MetricGrid values={headlineValues(displayResults)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

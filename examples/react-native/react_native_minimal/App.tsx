import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  NativeEventEmitter,
  NativeModules,
} from "react-native";

import {
  initialize,
  ShenaiSdkView,
  InitializationResult,
  MeasurementPreset,
  useRealtimeHeartRate,
  useMeasurementResults,
} from "react-native-shenai-sdk";

const { ShenaiSdkNativeModule } = NativeModules;

const sdkEventEmitter = new NativeEventEmitter(ShenaiSdkNativeModule);

const App = () => {
  const [initResult, setInitResult] = useState<
    InitializationResult | null | false
  >(null);

  useEffect(() => {
    async function initSDK() {
      try {
        const subscription = sdkEventEmitter.addListener(
          "ShenAIEvent",
          (event) => {
            const eventName = event?.EventName;
            if (eventName) {
              console.log("Event Name:", eventName);
            }
          }
        );
        console.log("Initializing SDK");
        const result = await initialize("API_KEY", "", {
          measurementPreset: MeasurementPreset.THIRTY_SECONDS_UNVALIDATED,
        });
        console.log("Initialization result", result);
        setInitResult(result);
      } catch (error) {
        console.log(error);
        setInitResult(false);
      }
    }
    initSDK();
  }, []);

  const hr = useRealtimeHeartRate();
  const results = useMeasurementResults();

  return (
    <View style={{ flex: 1 }}>
      {initResult === false && (
        <SafeAreaView>
          <View>
            <Text>Initialization failed</Text>
          </View>
        </SafeAreaView>
      )}
      {initResult === null && (
        <SafeAreaView>
          <View>
            <Text>Initializing...</Text>
          </View>
        </SafeAreaView>
      )}
      {hr && <Text>HR: {hr}</Text>}
      {initResult === InitializationResult.OK && (
        <ShenaiSdkView style={{ flex: 1 }} />
      )}
      <Text>HRV: {results?.hrvSdnnMs} MS</Text>
      <Text>
        BP: {results?.systolicBloodPressureMmhg} /{" "}
        {results?.diastolicBloodPressureMmhg} MMHG
      </Text>
    </View>
  );
};

export default App;

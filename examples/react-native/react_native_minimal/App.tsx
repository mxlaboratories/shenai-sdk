import React, {useCallback, useEffect, useState} from "react";
import {
  NativeEventEmitter,
  NativeModules,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  deinitialize,
  initialize,
  ShenaiSdkView,
} from "react-native-shenai-sdk";

declare const process: {
  env: {
    SHENAI_API_KEY?: string;
  };
};

const shenApiKey = process.env.SHENAI_API_KEY ?? "";
const {ShenaiSdkNativeModule} = NativeModules;
const sdkEventEmitter = new NativeEventEmitter(ShenaiSdkNativeModule);
const initializationResultOk = 0;
const thirtySecondsUnvalidatedPreset = 5;

const App = () => {
  const [initResult, setInitResult] = useState<number | null | false>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const isInitialized = initResult === initializationResultOk;

  const initializeSDK = useCallback(async () => {
    if (!shenApiKey) {
      setErrorMessage("Missing SHENAI_API_KEY");
      setInitResult(false);
      return;
    }

    setIsBusy(true);
    setInitResult(null);
    setErrorMessage(null);

    try {
      console.log("Initializing SDK");
      const result = await initialize(shenApiKey, "", {
        measurementPreset: thirtySecondsUnvalidatedPreset,
      });
      console.log("Initialization result", result);
      setInitResult(result);
    } catch (error) {
      console.log(error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setInitResult(false);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const deinitializeSDK = useCallback(async () => {
    setIsBusy(true);

    try {
      await deinitialize();
      setErrorMessage("SDK deinitialized");
      setInitResult(false);
    } catch (error) {
      console.log(error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsBusy(false);
    }
  }, []);

  const toggleSDK = useCallback(async () => {
    if (isBusy) {
      return;
    }

    if (isInitialized) {
      await deinitializeSDK();
      return;
    }

    await initializeSDK();
  }, [deinitializeSDK, initializeSDK, isBusy, isInitialized]);

  useEffect(() => {
    const subscription = sdkEventEmitter.addListener("ShenAIEvent", event => {
      const eventName = event?.EventName;
      if (eventName) {
        console.log("Event Name:", eventName);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    initializeSDK();
  }, [initializeSDK]);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            disabled={isBusy || !shenApiKey}
            onPress={toggleSDK}
            style={({pressed}) => [
              styles.toggleButton,
              (isBusy || !shenApiKey) && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}>
            <Text style={styles.toggleButtonText}>
              {isInitialized ? "Deinitialize" : "Initialize"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      {initResult === false && (
        <SafeAreaView>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {errorMessage ?? "Initialization failed"}
            </Text>
          </View>
        </SafeAreaView>
      )}
      {initResult === null && (
        <SafeAreaView>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Initializing...</Text>
          </View>
        </SafeAreaView>
      )}
      {initResult === initializationResultOk && (
        <ShenaiSdkView style={styles.sdkView} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sdkView: {
    flex: 1,
  },
  header: {
    borderBottomColor: "#D7DEE2",
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  toggleButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#176B87",
    borderRadius: 6,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 112,
    paddingHorizontal: 14,
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.75,
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  statusContainer: {
    padding: 16,
  },
  statusText: {
    color: "#222222",
  },
});

export default App;

import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { initialize, ShenaiSdkView } from "react-native-shenai-sdk";

const shenApiKey = process.env.EXPO_PUBLIC_SHENAI_API_KEY ?? "";
const initializationResultOk = 0;

export default function App() {
  const [initResult, setInitResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initSDK() {
      try {
        console.log("Initializing SDK");
        if (!shenApiKey) throw new Error("Missing EXPO_PUBLIC_SHENAI_API_KEY");
        const result = await initialize(shenApiKey, "");
        console.log("Initialization result", result);
        setInitResult(result);
      } catch (error) {
        console.log(error);
        setError(error);
        setInitResult(false);
      }
    }
    initSDK();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {initResult === initializationResultOk ? (
        <ShenaiSdkView style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={styles.placeholder}>
          <Text>
            {initResult === null
              ? "Initializing Shen.AI SDK..."
              : error
                ? "Initialization failed"
                : "SDK not available"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

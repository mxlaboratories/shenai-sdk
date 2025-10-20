import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";

import {
  initialize,
  ShenaiSdkView,
  InitializationResult,
} from "react-native-shenai-sdk";

export default function App() {
  useEffect(() => {
    async function initSDK() {
      try {
        console.log("Initializing SDK");
        const result = await initialize("API_KEY", "");
        console.log("Initialization result", result);
      } catch (error) {
        console.log(error);
      }
    }
    initSDK();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ShenaiSdkView style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

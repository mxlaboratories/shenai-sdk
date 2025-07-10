import {
  InitializationResult,
  MeasurementPreset,
  ShenaiSdkCapacitor,
} from "capacitor-shenai-sdk";

window.testEcho = () => {
  const inputValue = document.getElementById("echoInput").value;
  ShenaiSdkCapacitor.echo({ value: inputValue });
};

ShenaiSdkCapacitor.addListener("ShenAIEvent", async (event) => {
  console.log("Event: ", event);
});

window.initShenai = () => {
  ShenaiSdkCapacitor.echo({ value: "initializing SDK..." });
  ShenaiSdkCapacitor.initialize({
    apiKey: "YOUR_API_KEY",
    userId: "",
    settings: {
      measurementPreset: MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
    },
  })
    .then((res) => {
      ShenaiSdkCapacitor.echo({
        value:
          "initialization result: " +
          (res.value == InitializationResult.OK ? "OK" : "error" + res.value),
      });
    })
    .catch((err) => {
      ShenaiSdkCapacitor.echo({ value: "initialization result: " + err });
    });
};

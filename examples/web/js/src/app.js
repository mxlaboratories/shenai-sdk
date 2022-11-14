import SHEN from "./shenai-sdk/index.mjs";

const API_KEY = "";
const USER_ID = "";

function error(message) {
  document.getElementById("stage").className = "state-error";
  alert(message);
}

async function initialize() {
  try {
    const shenai = await SHEN({
      onRuntimeInitialized: () => {
        console.log("SHEN.AI initialized");
      },
    });

    shenai.initialize(API_KEY, USER_ID, (result) => {
      if (result === shenai.InitializationResult.OK) {
        document.getElementById("stage").className = "state-loaded";
        beginPolling(shenai);
        document
          .getElementById("compute-risks")
          .addEventListener("click", () => computeRisks(shenai));
      } else {
        error("Shen.ai license activation error " + result.toString());
      }
    });
  } catch (e) {
    error("Error: " + e);
  }
}

let finished = false;

function beginPolling(shenai) {
  setInterval(() => pollHeartRate(shenai), 300);
  setInterval(() => pollFacePosition(shenai), 300);
  setInterval(() => pollMeasurement(shenai), 1000);
}

function pollHeartRate(shenai) {
  if (finished) return;
  const hr = shenai.getLatestHeartRate();

  document.getElementById("heart-rate").innerText =
    hr && hr > 0 ? Math.round(hr) : "  ";
}

function FacePositionInstructions(shenai, faceState) {
  switch (faceState) {
    case shenai.FaceState.OK:
      return "Face well positioned";
    case shenai.FaceState.NOT_CENTERED:
      return "Move your head to the center";
    case shenai.FaceState.TOO_CLOSE:
      return "Move your head away from the camera";
    case shenai.FaceState.TOO_FAR:
      return "Move your head closer to the camera";
    case shenai.FaceState.UNSTABLE:
      return "Too much head movement";
    default:
      return "";
  }
}

function pollFacePosition(shenai) {
  if (finished) return;
  const facePosition = shenai.getFaceState();
  const instruction = FacePositionInstructions(shenai, facePosition);

  const progress = shenai.getMeasurementProgressPercentage();

  if (progress > 0) {
    document.getElementById("progress").innerText =
      "Progress: " + Math.round(progress) + "%";
  }

  document.getElementById("instruction").innerText = instruction;
}

let isMeasuring = false;

function pollMeasurement(shenai) {
  const measurementState = shenai.getEngineState();

  if (measurementState === shenai.EngineState.SUCCESS) {
    finished = true;
    document.getElementById("instruction").innerText = "Measurement complete!";
    const result = shenai.getMeasurementResult();
    document.getElementById("heart-rate").innerText = "";
    document.getElementById("progress").innerText = "";
    document.getElementById("results").innerText =
      "HR: " +
      result.heart_rate_bpm +
      " BPM, HRV: " +
      result.hrv_sdnn_ms +
      " ms, BR: " +
      Math.round(result.breathing_rate_bpm) +
      " BPM";
    let intervalsEl = document.getElementById("intervals");
    let intervals = result.heartbeats;
    if (intervals) {
      let download = document.getElementById("download-intervals");
      download.href =
        "data:text/csv," +
        encodeURI(
          "\nstart_time_sec,end_time_sec,duration_ms\n" +
            intervals
              .map(
                (i) =>
                  i.start_location_sec.toFixed(3) +
                  "," +
                  i.end_location_sec.toFixed(3) +
                  "," +
                  i.duration_ms.toString()
              )
              .join("\n")
        );
      download.style = "";
    }
    return;
  }

  if (isMeasuring && shenai.isReadyForMeasurement()) shenai.startMeasurement();

  if (shenai.isReadyForMeasurement()) isMeasuring = true;
}

function computeRisks(shenai) {
  // sample risks factors
  const risksFactors = {
    age: 45,
    cholesterol: 220.0,
    cholesterolHdl: 47.0,
    sbp: 137,
    isSmoker: true,
    hypertensionTreatment: true,
    hasDiabetes: true,
    // bodyHeight: 180,
    // bodyWeight: 80.0,
    gender: shenai.Gender.MALE,
    country: "GB",
    race: shenai.Race.OTHER,
  };
  const risks = shenai.computeHealthRisks(risksFactors);
  const minRisks = shenai.getMinimalRisks(risksFactors);
  const maxRisks = shenai.getMaximalRisks(risksFactors);
  if (
    risks &&
    minRisks &&
    maxRisks &&
    risks.vascularAge.hasValue() &&
    minRisks.vascularAge.hasValue() &&
    maxRisks.vascularAge.hasValue()
  ) {
    document.getElementById("risks").innerText =
      "Vascular age (" +
      minRisks.vascularAge.getValue() +
      "-" +
      maxRisks.vascularAge.getValue() +
      "): " +
      risks.vascularAge.getValue() +
      " years";
  }
}

await initialize();

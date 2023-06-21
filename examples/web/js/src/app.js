import SHEN from "./shenai-sdk/index.mjs";

const API_KEY = "YOUR_API_KEY";
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

    shenai.initialize(API_KEY, USER_ID, {}, (result) => {
      if (result === shenai.InitializationResult.OK) {
        document.getElementById("stage").className = "state-loaded";
        beginPolling(shenai);
        document
          .getElementById("compute-risks")
          .addEventListener("click", () => {
            let form = document.getElementById("health-risks-factors");
            form.style.display = "flex";
            form.style.flexDirection = "column";
          });
        document
          .getElementById("health-risks-factors")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            console.log(data);

            const risksFactors = {
              age: data.age,
              cholesterol: data.cholesterol,
              cholesterolHdl: data.cholesterolHdl,
              sbp: data.sbp,
              isSmoker: !!data.smoker,
              hypertensionTreatment: !!data.hypertensionTreatment,
              hasDiabetes: !!data.diabetes,
              bodyHeight: data.bodyHeight,
              bodyWeight: data.bodyWeight,
              gender:
                data.gender === "Male"
                  ? shenai.Gender.MALE
                  : data.gender === "Female"
                  ? shenai.Gender.FEMALE
                  : shenai.Gender.OTHER,
              country: data.country,
              race:
                data.race === "White"
                  ? shenai.Race.WHITE
                  : data.race === "African-American"
                  ? shenai.Race.AFRICAN_AMERICAN
                  : shenai.Race.OTHER,
            };

            console.log(risksFactors);

            computeRisks(shenai, risksFactors);

            const form = document.getElementById("health-risks-factors");
            form.reset();
            form.style.display = "none";
          });
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
  const hr = shenai.getHeartRate10s();

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

function pollMeasurement(shenai) {
  const measurementState = shenai.getMeasurementState();

  if (measurementState === shenai.MeasurementState.FINISHED) {
    finished = true;
    const result = shenai.getMeasurementResults();
    document.getElementById("heart-rate").innerText = "";
    document.getElementById("progress").innerText = "";
    document.getElementById("results").innerText =
      "HR: " +
      result.heart_rate_bpm +
      " BPM, HRV SDNN: " +
      result.hrv_sdnn_ms +
      " ms, HRV lnRMSSD: " +
      result.hrv_lnrmssd_ms +
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
      document.getElementById("intervals-value").innerText = intervals
        .map(
          (i) =>
            i.start_location_sec.toFixed(3) +
            "," +
            i.end_location_sec.toFixed(3) +
            "," +
            i.duration_ms.toString()
        )
        .join(" ");
    }
    document.getElementById("instruction").innerText = "Measurement complete!";
    return;
  }

  if (shenai.getOperatingMode() !== shenai.OperatingMode.MEASURE) {
    document.getElementById("measuring").innerText = "Measuring...";
    shenai.setOperatingMode(shenai.OperatingMode.MEASURE);
  }
}

function computeRisks(shenai, risksFactors) {
  // sample risks factors
  const risks = shenai.computeHealthRisks(risksFactors);
  const minRisks = shenai.getMinimalRisks(risksFactors);
  const maxRisks = shenai.getMaximalRisks(risksFactors);
  if (risks && minRisks && maxRisks) {
    document.getElementById("risks").style.display = "block";

    const displayRisks = (subRisks, subMinRisks, subMaxRisks) => (name) => {
      console.log(
        "Shall display risks for ",
        name,
        " theya re: ",
        subRisks[name],
        subMinRisks[name],
        subMaxRisks[name]
      );
      if (
        subRisks[name] !== null &&
        subMinRisks[name] !== null &&
        subMaxRisks[name] !== null
      ) {
        document.getElementById(name).innerText +=
          "(" +
          subMinRisks[name] +
          "-" +
          subMaxRisks[name] +
          "): " +
          subRisks[name].toFixed(1);
      }
    };

    if (
      risks.hardAndFatalEvents &&
      minRisks.hardAndFatalEvents &&
      maxRisks.hardAndFatalEvents
    ) {
      const subRisks = risks.hardAndFatalEvents;
      const subMinRisks = minRisks.hardAndFatalEvents;
      const subMaxRisks = maxRisks.hardAndFatalEvents;
      [
        "coronaryDeathEventRisk",
        "fatalStrokeEventRisk",
        "totalCVMortalityRisk",
        "hardCVEventRisk",
      ].forEach(displayRisks(subRisks, subMinRisks, subMaxRisks));
    }
    if (risks.cvDiseases && minRisks.cvDiseases && maxRisks.cvDiseases) {
      const subRisks = risks.cvDiseases;
      const subMinRisks = minRisks.cvDiseases;
      const subMaxRisks = maxRisks.cvDiseases;
      [
        "overallRisk",
        "coronaryHeartDiseaseRisk",
        "strokeRisk",
        "heartFailureRisk",
        "peripheralVascularDiseaseRisk",
      ].forEach(displayRisks(subRisks, subMinRisks, subMaxRisks));
    }
    if (risks.scores && minRisks.scores && maxRisks.scores) {
      const subRisks = risks.scores;
      const subMinRisks = minRisks.scores;
      const subMaxRisks = maxRisks.scores;
      [
        "ageScore",
        "sbpScore",
        "smokingScore",
        "diabetesScore",
        "bmiScore",
        "cholesterolScore",
        "cholesterolHdlScore",
        "totalScore",
      ].forEach(displayRisks(subRisks, subMinRisks, subMaxRisks));
    }
    if (risks.vascularAge && minRisks.vascularAge && maxRisks.vascularAge) {
      displayRisks(risks, minRisks, maxRisks)("vascularAge");
    }
  }
}

await initialize();

import CreateShenaiSDK from "./shenai-sdk/index.mjs";

const API_KEY = "YOUR_API_KEY";
const USER_ID = "";

function error(message) {
  document.getElementById("stage").className = "state-error";
  alert(message);
}

function showElement(elem) {
  elem.classList.remove("hidden");
}

function hideElement(elem) {
  elem.classList.add("hidden");
}

async function initialize() {
  try {
    const shenai = await CreateShenaiSDK({
      onRuntimeInitialized: () => console.log("Shen.AI SDK ready"),
    });

    shenai.initialize(API_KEY, USER_ID, {}, (result) => {
      if (result === shenai.InitializationResult.OK) {
        console.log("Shen.AI initialized (license activated)");
        document.getElementById("stage").className = "state-loaded";
        beginPolling(shenai);
        document
          .getElementById("compute-risks")
          .addEventListener("click", () =>
            showElement(document.getElementById("health-risks-factors"))
          );
        document
          .getElementById("health-risks-factors")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            computeRisks(shenai, data);
          });
      } else {
        error("Shen.AI license activation error " + result.toString());
      }
    });
  } catch (e) {
    error("Error: " + e);
  }
}

let finished = false;
let wakeLock = "wakeLock" in navigator ? null : false;

function beginPolling(shenai) {
  setInterval(() => pollHeartRate(shenai), 300);
  setInterval(() => pollFacePosition(shenai), 300);
  setInterval(() => pollMeasurement(shenai), 1000);
}

function pollHeartRate(shenai) {
  if (finished) return;
  const hr = shenai.getHeartRate10s();
  const hrElem = document.getElementById("heart-rate");
  hrElem.innerText = hr ? Math.round(hr) : "  ";
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
  }
  return "";
}

function pollFacePosition(shenai) {
  if (finished) return;
  const facePosition = shenai.getFaceState();
  const instruction = FacePositionInstructions(shenai, facePosition);
  document.getElementById("instruction").innerText = instruction;

  const progress = shenai.getMeasurementProgressPercentage();
  if (progress > 0) {
    const progressElem = document.getElementById("progress");
    progressElem.innerText = `Progress: ${Math.round(progress)}%`;
  }
}

function makeCsvHref(columnNames, dataRows) {
  return (
    "data:text/csv," +
    encodeURI(
      "\n" +
        columnNames.join(",") +
        "\n" +
        dataRows.map((row) => row.join(",")).join("\n")
    )
  );
}

function presentResults(results) {
  document.getElementById("results").innerText = [
    `HR: ${results.heart_rate_bpm} BPM`,
    `HRV SDNN: ${results.hrv_sdnn_ms} ms`,
    `HRV lnRMSSD: ${results.hrv_lnrmssd_ms} ms`,
    `BR: ${Math.round(results.breathing_rate_bpm)} BPM`,
  ].join(", ");

  const intervals = results.heartbeats;
  if (intervals) {
    const csvColumnNames = ["start_time_sec", "end_time_sec", "duration_ms"];
    const csvDataRows = intervals.map((i) => [
      i.start_location_sec.toFixed(3),
      i.end_location_sec.toFixed(3),
      i.duration_ms.toString(),
    ]);
    const download = document.getElementById("download-intervals");
    download.href = makeCsvHref(csvColumnNames, csvDataRows);
    showElement(download);
    sessionStorage.setItem(
      "intervals",
      csvDataRows.map((row) => row.join(",")).join(" ")
    );
  }
  document.getElementById("instruction").innerText = "Measurement complete!";
  document.getElementById("heart-rate").innerText = "";
  document.getElementById("progress").innerText = "";
}

function pollMeasurement(shenai) {
  const measurementState = shenai.getMeasurementState();

  if (measurementState === shenai.MeasurementState.FINISHED) {
    finished = true;
    if (wakeLock) wakeLock.release().then(() => (wakeLock = null));
    const results = shenai.getMeasurementResults();
    presentResults(results);
    return;
  }

  if (shenai.getOperatingMode() !== shenai.OperatingMode.MEASURE) {
    console.log("Start measuring");
    shenai.setOperatingMode(shenai.OperatingMode.MEASURE);
    sessionStorage.setItem("measuring", "true");
    if (wakeLock === null)
      navigator.wakeLock.request("screen").then((l) => (wakeLock = l));
  }
}

function presentRisks(shenai, risksFactors) {
  // sample risks factors
  const risks = shenai.computeHealthRisks(risksFactors);
  const minRisks = shenai.getMinimalRisks(risksFactors);
  const maxRisks = shenai.getMaximalRisks(risksFactors);
  if (risks && minRisks && maxRisks) {
    showElement(document.getElementById("risks"));

    const displayRisks = (subRisks, subMinRisks, subMaxRisks) => (name) => {
      const risk = subRisks[name];
      const minRisk = subMinRisks[name];
      const maxRisk = subMaxRisks[name];
      if (risk !== null && minRisk !== null && maxRisk !== null) {
        const riskElem = document.getElementById(name);
        riskElem.innerText += `(${minRisk}-${maxRisk}): ${risk.toFixed(1)}`;
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

function computeRisks(shenai, data) {
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

  presentRisks(shenai, risksFactors);

  const form = document.getElementById("health-risks-factors");
  form.reset();
  hideElement(form);
}

await initialize();

import CreateShenaiSDK from "./shenai-sdk/index.mjs";

if (typeof window !== "undefined" && window.__forceCanvasCapture) {
  window.MediaStreamTrackProcessor = undefined;
}

const API_KEY = new URLSearchParams(window.location.search).get("apiKey") || "YOUR_API_KEY";
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
    if (typeof window !== "undefined") {
      window.__shenai = shenai;
      window.__shenaiTestState = window.__shenaiTestState || {};
    }

    shenai.initialize(
      API_KEY,
      USER_ID,
      {
        eventCallback: (event) => {
          if (event === "MEASUREMENT_FINISHED") {
            finishMeasurement(shenai);
          } else if (event === "MEASUREMENT_FAILED" && !finished) {
            finished = true;
            releaseWakeLock();
            error("Measurement failed");
          }
        }
      },
      (result) => {
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
      }
    );
  } catch (e) {
    error("Error: " + e);
  }
}

let finished = false;
let wakeLock = "wakeLock" in navigator ? null : false;

function releaseWakeLock() {
  if (wakeLock) wakeLock.release().then(() => (wakeLock = null));
}

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
    case shenai.FaceState.NOT_VISIBLE:
      return "Make sure your face is visible";
    case shenai.FaceState.TURNED_AWAY:
      return "Turn your face towards the camera";
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

function finishMeasurement(shenai) {
  if (finished) return;
  finished = true;
  releaseWakeLock();
  const results = shenai.getMeasurementResults();
  presentResults(results);
}

function pollMeasurement(shenai) {
  const measurementState = shenai.getMeasurementState();

  if (measurementState === shenai.MeasurementState.FINISHED) {
    finishMeasurement(shenai);
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

    const hasNumericValue = (val) => typeof val === "number" && !Number.isNaN(val);

    const displayRisks =
      (subRisks = {}, subMinRisks = {}, subMaxRisks = {}) =>
      (name) => {
        const riskElem = document.getElementById(name);
        if (!riskElem) {
          return;
        }
        const risk = subRisks[name];
        const minRisk = subMinRisks[name];
        const maxRisk = subMaxRisks[name];
        const hasRisk = hasNumericValue(risk);
        const hasRange = hasNumericValue(minRisk) && hasNumericValue(maxRisk);

        if (!hasRisk && !hasRange) {
          return;
        }

        let suffix = "";
        if (hasRange) {
          suffix += `(${minRisk}-${maxRisk})`;
        }
        if (hasRisk) {
          suffix += `${hasRange ? " " : ""}: ${risk.toFixed(1)}`;
        }
        riskElem.innerText += suffix;
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
    const hasVascularAgeValue = hasNumericValue(risks.vascularAge);
    const hasVascularAgeRange =
      hasNumericValue(minRisks.vascularAge) && hasNumericValue(maxRisks.vascularAge);
    if (hasVascularAgeValue || hasVascularAgeRange) {
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
    hypertensionTreatment:
      data.hypertensionTreatment === "Yes"
        ? shenai.HypertensionTreatment.YES
        : data.hypertensionTreatment === "No"
        ? shenai.HypertensionTreatment.NO
        : shenai.HypertensionTreatment.NOT_NEEDED,
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

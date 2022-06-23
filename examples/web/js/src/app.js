import SHEN from "./shenai-sdk/index.mjs";

const API_KEY = "eff92074fd0748ddb1381299a67f744c";
const USER_ID = "";

function error(message) {
    document.getElementById("stage").className = "state-error";
    alert(message);
}

async function initialize() {
    try {
        const shenai = await SHEN({
            onRuntimeInitialized: () => { console.log("SHENAI initialized"); }
        });

        shenai.initialize(API_KEY, USER_ID,
            (result) => {
                if (result === shenai.InitializationResult.OK) {
                    document.getElementById("stage").className = "state-loaded";
                    beginPolling(shenai);
                }
                else {
                    error("Shen.ai license activation error " + result.toString());
                }
            }
        );
    }
    catch (e) {
        error("Error: " + e);
    }
}

function beginPolling(shenai) {
    setInterval(() => pollHeartRate(shenai), 300);
    setInterval(() => pollFacePosition(shenai), 300);
    setInterval(() => pollMeasurement(shenai), 1000);
}

function pollHeartRate(shenai) {
    const hr = shenai.getLatestHR();

    document.getElementById("heart-rate").innerText =
        (hr && hr > 0)
            ? Math.round(hr)
            : "";
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
            return ""
    }
}

function pollFacePosition(shenai) {
    const facePosition = shenai.getFaceState();
    const instruction = FacePositionInstructions(shenai, facePosition);

    document.getElementById("instruction").innerText = instruction;
}

let isMeasuring = false;

function pollMeasurement(shenai) {
    if (isMeasuring && shenai.isReadyForMeasurement())
        shenai.startMeasurement();

    if (shenai.isReadyForMeasurement())
        isMeasuring = true;
}

await initialize();

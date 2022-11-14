import React, { useEffect, useState, useRef } from "react";
import CreateShenaiSDK, {
  ShenaiSDK,
  RisksFactors,
  HealthRisks,
  Heartbeat,
} from "shenai-sdk";
import { useInterval } from "react-use";
import styled from "styled-components";
import Header from "./Header";
import Loading from "./Loading";
import Result from "./Result";
import ProgressBar from "./ProgressBar";
import { HeartbeatsPreview } from "./HeartbeatsPreview";

const LoadingWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const OverallWrapper = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  margin-bottom: 20px;
  overflow: hidden;
`;

const CanvasWrapper = styled.div`
  position: relative;
  flex-grow: 1;
  background: #eee;
  max-width: 100vw;
  min-height: 400px;
  @media (min-width: 1000px) and (min-aspect-ratio: 4/3) {
    & {
      margin-top: -100px;
    }
  }
`;

const DrawCanvas = styled.canvas`
  position: relative;
  height: 100%;
  z-index: 5;
`;

const CanvasOverlayContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
`;

const InstructionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  padding: 10px;
`;

const Instructions = styled.div`
  font-size: 0.45em;
  @media (min-width: 768px) {
    font-size: 0.55em;
  }
  @media (min-width: 1024px) {
    font-size: 0.7em;
  }
  background: #fff;
  border-radius: 5px;
  padding: 5px 20px;
`;

const FacePositioningContainer = styled.div`
  position: relative;
  flex-grow: 1;
  min-height: 0;
  z-index: 10;
`;

const FacePositioningOverlay = styled.img`
  position: absolute;
  left: 5%;
  top: 0;
  width: 90%;
  height: 100%;
  transition: opacity 0.2s;
  opacity: 0;
  &.show {
    opacity: 0.7;
  }
`;

const MeasurementContainer = styled.div`
  display: flex:
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  z-index: 20;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 5px;
`;

const Button = styled.button`
  font-family: "Roboto", sans-serif;
  font-weight: bold;
  font-size: 0.7em;
  color: #56b0b0;
  padding: 6px 20px;
  background: #fff;
  border: 0;
  border-radius: 5px;
  transition: background 0.2s;
  &:hover {
    background: #eee;
  }
  &:disabled {
    color: #ccc;
  }
  &:disabled:hover {
    background: #fff;
  }
  &.red {
    color: #ffab98;
  }
`;

const ProgressBarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  height: 5px;
  box-sizing: content-box;
`;

const ResultContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ResultWrapper = styled.div`
  width: 33.333%;
`;

const RisksContainer = styled.div`
  background-color: black;
  padding: 10px;
  border-radius: 5px;
  margin: 20px;
`;

const API_KEY = "";
const USER_ID = "";

function App() {
  const [shenai, setShenai] = useState<ShenaiSDK>();
  const [hr, setHr] = useState<number>();
  const [hrv, setHrv] = useState<number>();
  const [br, setBr] = useState<number>();
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>();
  const [progress, setProgress] = useState<number>(0);
  const [readyForMeasurement, setReadyForMeasurement] =
    useState<boolean>(false);
  const [measurementStarted, setMeasurementStarted] = useState<boolean>(false);
  const [facePositionInstruction, setFacePositionInstruction] =
    useState("Please wait...");
  const [faceWellPositioned, setFaceWellPositioned] = useState<number>(-1);
  const [healthRisks, setHealthRisks] = useState<HealthRisks>();
  const [minHealthRisks, setMinHealthRisks] = useState<HealthRisks>();
  const [maxHealthRisks, setMaxHealthRisks] = useState<HealthRisks>();

  useEffect(() => {
    (async () => {
      const shenai = await CreateShenaiSDK({
        onRuntimeInitialized() {
          console.log("Instance initialized");
        },
      });
      setShenai(shenai);
    })();
  }, []);

  useEffect(() => {
    if (shenai) {
      shenai.initialize(API_KEY, USER_ID, (result) => {
        if (result !== shenai.InitializationResult.OK) {
          let info: string = "";
          switch (result) {
            case shenai.InitializationResult.CONNECTION_ERROR:
              info = "connection error";
              break;
            case shenai.InitializationResult.INVALID_API_KEY:
              info = "invalid api key";
              break;
            default:
              info = "unknown error";
          }
          alert("Shen.ai license activation error: " + info);
        }
      });
    }
  }, [shenai]);

  useInterval(() => {
    const hr = shenai?.getLatestHeartRate();
    if (hr && hr !== 0) {
      setHr(Math.round(hr));
    }
    const newReady = shenai?.isReadyForMeasurement();
    if (newReady !== null && newReady !== readyForMeasurement) {
      setReadyForMeasurement(newReady!);
    }
    if (shenai) {
      let faceState = shenai.getFaceState();
      let measurementState = shenai.getEngineState();

      if (measurementState === shenai.EngineState.SUCCESS) {
        setFacePositionInstruction("Measurement complete!");
        setMeasurementStarted(false);
        const result = shenai.getMeasurementResult();
        setHr(result.heart_rate_bpm);
        setHrv(result.hrv_sdnn_ms);
        setBr(result.breathing_rate_bpm);
        setHeartbeats(result.heartbeats);
      } else {
        setFacePositionInstruction(
          ((state) => {
            switch (state) {
              case shenai.FaceState.OK:
                return "Face well positioned";
              case shenai.FaceState.NOT_CENTERED:
                return "Move your head to the center";
              case shenai.FaceState.TOO_CLOSE:
                return "Move your head further from the camera";
              case shenai.FaceState.TOO_FAR:
                return "Move your head closer to the camera";
              case shenai.FaceState.UNSTABLE:
                return "Too much head movement";
              default:
                return shenai.isRenderingInitialized()
                  ? "Position your face in the middle of the screen"
                  : "Please wait...";
            }
          })(faceState)
        );
      }
      setFaceWellPositioned(
        shenai.isRenderingInitialized()
          ? faceState === shenai.FaceState.OK
            ? 1
            : 0
          : -1
      );
    }
    const progress = shenai?.getMeasurementProgressPercentage();
    if (progress) setProgress(progress);
  }, 300);

  useInterval(() => {
    if (measurementStarted && shenai?.isReadyForMeasurement()) {
      const status = shenai?.startMeasurement();
      if (
        status !== shenai.BeginMeasurementStatus.STARTED &&
        status !== shenai.BeginMeasurementStatus.RESUMED
      ) {
        let info: string = "";
        switch (status) {
          case shenai.BeginMeasurementStatus.NOT_STARTED_CAMERA:
            info = "camera not ready";
            break;
          case shenai.BeginMeasurementStatus.NOT_STARTED_FACE:
            info = "face not properly positioned";
            break;
          case shenai.BeginMeasurementStatus.NOT_STARTED_LIGHTING:
            info = "bad lighting";
            break;
          default:
            info = "Unknown error";
        }
        alert("Couldn't start the measurement: " + info);
      }
    }
  }, 1000);

  // Press D+B+G to toggle debug mode
  const debugHotkeyD = useRef<boolean>(false);
  const debugHotkeyB = useRef<boolean>(false);
  const debugHotkeyG = useRef<boolean>(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyD") debugHotkeyD.current = true;
      else if (e.code === "KeyB") debugHotkeyB.current = true;
      else if (e.code === "KeyG") debugHotkeyG.current = true;
      if (
        debugHotkeyD.current &&
        debugHotkeyB.current &&
        debugHotkeyG.current
      ) {
        shenai?.toggleDebug();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyD") debugHotkeyD.current = false;
      else if (e.code === "KeyB") debugHotkeyB.current = false;
      else if (e.code === "KeyG") debugHotkeyG.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [shenai]);

  function startStopMeasurement() {
    if (!measurementStarted) {
      console.log(shenai);
      shenai?.startMeasurement();
      setMeasurementStarted(true);
    } else {
      // shenai?.stopMeasurement();
      // setMeasurementStarted(false);
    }
  }

  function computeHealthRisks() {
    if (shenai) {
      // sample risks factors
      const risksFactors: RisksFactors = {
        age: 45,
        cholesterol: 220,
        cholesterolHdl: 47,
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
      setHealthRisks(risks);
      setMaxHealthRisks(maxRisks);
      setMinHealthRisks(minRisks);
    }
  }

  return (
    <OverallWrapper>
      <Wrapper>
        <Header />

        <CanvasWrapper>
          <LoadingWrapper>
            <Loading />
          </LoadingWrapper>

          <DrawCanvas id="mxcanvas" width={480} height={720}></DrawCanvas>

          <CanvasOverlayContainer>
            <InstructionsContainer>
              <Instructions>{facePositionInstruction}</Instructions>
            </InstructionsContainer>
            <FacePositioningContainer>
              <FacePositioningOverlay
                src="face-position-overlay-green.png"
                className={faceWellPositioned == 1 ? "show" : undefined}
              ></FacePositioningOverlay>
              <FacePositioningOverlay
                src="face-position-overlay-red.png"
                className={faceWellPositioned == 0 ? "show" : undefined}
              ></FacePositioningOverlay>
            </FacePositioningContainer>
            <MeasurementContainer>
              <ButtonContainer>
                <Button
                  onClick={startStopMeasurement}
                  disabled={!readyForMeasurement /*&& !measurementStarted*/}
                  className={/*measurementStarted ? "red" :*/ undefined}
                >
                  {/*measurementStarted ? "STOP" :*/ "START"}
                </Button>
              </ButtonContainer>
              <ProgressBarContainer>
                <ProgressBar progress={progress}></ProgressBar>
              </ProgressBarContainer>
              <ResultContainer>
                <ResultWrapper>
                  <Result
                    title={"PULSE"}
                    value={hr ? "" + hr : "?"}
                    unit={"bpm"}
                    bkg={"result_heart_bkg.svg"}
                  />
                </ResultWrapper>
                <ResultWrapper>
                  <Result
                    title={"HRV"}
                    value={hrv ? "" + hrv : "?"}
                    unit={"ms"}
                    bkg={"result_heart_bkg.svg"}
                  />
                </ResultWrapper>
                <ResultWrapper>
                  <Result
                    title={"BREATH"}
                    value={br ? "" + br : "?"}
                    unit={"bpm"}
                    bkg={"result_lungs_bkg.svg"}
                  />
                </ResultWrapper>
              </ResultContainer>
            </MeasurementContainer>
          </CanvasOverlayContainer>
        </CanvasWrapper>
      </Wrapper>
      {heartbeats && <HeartbeatsPreview heartbeats={heartbeats} />}
      <RisksContainer>
        <ButtonContainer>
          <Button onClick={computeHealthRisks}>{"Compute Health Risks"}</Button>
        </ButtonContainer>
        <Result
          title={"Vascular Age"}
          value={
            healthRisks && healthRisks.vascularAge.hasValue()
              ? "" + healthRisks.vascularAge.getValue()
              : "?"
          }
          unit={
            "" +
            (minHealthRisks && minHealthRisks.vascularAge.hasValue()
              ? minHealthRisks.vascularAge.getValue() + "-"
              : "") +
            (maxHealthRisks && maxHealthRisks.vascularAge.hasValue()
              ? maxHealthRisks.vascularAge.getValue() + " "
              : "") +
            "years"
          }
        />
        <Result
          title={"Overall CVD Risk"}
          value={
            healthRisks && healthRisks.cvDiseases.overallRisk.hasValue()
              ? "" + healthRisks.cvDiseases.overallRisk.getValue().toFixed(1)
              : "?"
          }
          unit={
            "" +
            (minHealthRisks && minHealthRisks.cvDiseases.overallRisk.hasValue()
              ? minHealthRisks.cvDiseases.overallRisk.getValue() + "-"
              : "") +
            (maxHealthRisks && maxHealthRisks.cvDiseases.overallRisk.hasValue()
              ? maxHealthRisks.cvDiseases.overallRisk.getValue() + " "
              : "") +
            "%"
          }
        />
        <Result
          title={"Hard CV Event Risk"}
          value={
            healthRisks &&
            healthRisks.hardAndFatalEvents.hardCVEventRisk.hasValue()
              ? "" +
                healthRisks.hardAndFatalEvents.hardCVEventRisk
                  .getValue()
                  .toFixed(1)
              : "?"
          }
          unit={
            "" +
            (minHealthRisks &&
            minHealthRisks.hardAndFatalEvents.hardCVEventRisk.hasValue()
              ? minHealthRisks.hardAndFatalEvents.hardCVEventRisk.getValue() +
                "-"
              : "") +
            (maxHealthRisks &&
            maxHealthRisks.hardAndFatalEvents.hardCVEventRisk.hasValue()
              ? maxHealthRisks.hardAndFatalEvents.hardCVEventRisk.getValue() +
                " "
              : "") +
            "%"
          }
        />
        <Result
          title={"Total score"}
          value={
            healthRisks && healthRisks.scores.totalScore.hasValue()
              ? "" + healthRisks.scores.totalScore.getValue()
              : "?"
          }
          unit={
            "" +
            (minHealthRisks && minHealthRisks.scores.totalScore.hasValue()
              ? minHealthRisks.scores.totalScore.getValue() + "-"
              : "") +
            (maxHealthRisks && maxHealthRisks.scores.totalScore.hasValue()
              ? maxHealthRisks.scores.totalScore.getValue() + " "
              : "") +
            "points"
          }
        />
      </RisksContainer>
    </OverallWrapper>
  );
}

export default App;

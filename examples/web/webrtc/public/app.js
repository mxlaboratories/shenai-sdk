const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "demo";
const role = params.get("role");
const clientId = crypto.randomUUID();
const oppositeRole = role === "doctor" ? "patient" : "doctor";
const API_KEY = "";
const ENABLE_CALL_AUDIO = false;

const state = {
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  dataChannel: null,
  eventSource: null,
  remoteReady: false,
  localReady: false,
  offerInFlight: false,
  pendingRemoteCandidates: [],
  scanStatus: "idle",
  sdkInputStream: null,
  sdkCanvasStream: null,
  sdkCanvasVideoTrack: null,
  shenai: null,
  shenaiFactory: null,
  shenaiInitPromise: null,
  shenaiInitialized: false,
  scanTimer: null,
};

const els = {
  breathingValue: document.querySelector("#breathingValue"),
  callView: document.querySelector("#callView"),
  cameraButton: document.querySelector("#cameraButton"),
  connectionBadge: document.querySelector("#connectionBadge"),
  consentValue: document.querySelector("#consentValue"),
  controls: document.querySelector("#controls"),
  doctorLink: document.querySelector("#doctorLink"),
  faceStateValue: document.querySelector("#faceStateValue"),
  heartRateValue: document.querySelector("#heartRateValue"),
  leaveButton: document.querySelector("#leaveButton"),
  localFrame: document.querySelector(".local-frame"),
  localVideo: document.querySelector("#localVideo"),
  measurementStateValue: document.querySelector("#measurementStateValue"),
  panelEyebrow: document.querySelector("#panelEyebrow"),
  panelTitle: document.querySelector("#panelTitle"),
  patientLink: document.querySelector("#patientLink"),
  primaryAction: document.querySelector("#primaryAction"),
  progressFill: document.querySelector("#progressFill"),
  remoteEmpty: document.querySelector("#remoteEmpty"),
  remoteLabel: document.querySelector("#remoteLabel"),
  remoteVideo: document.querySelector("#remoteVideo"),
  roleBadge: document.querySelector("#roleBadge"),
  roleChooser: document.querySelector("#roleChooser"),
  roomBadge: document.querySelector("#roomBadge"),
  scanNotice: document.querySelector("#scanNotice"),
  screenTitle: document.querySelector("#screenTitle"),
  secondaryAction: document.querySelector("#secondaryAction"),
  shenaiCanvas: document.querySelector("#shenaiCanvas"),
  signalValue: document.querySelector("#signalValue"),
  stressValue: document.querySelector("#stressValue"),
  videoStage: document.querySelector(".video-stage"),
};

function setText(element, value) {
  element.textContent = value;
}

function setNotice(text, tone = "neutral") {
  els.scanNotice.textContent = text;
  els.scanNotice.dataset.tone = tone;
}

function show(element, visible) {
  element.classList.toggle("hidden", !visible);
}

function enumName(enumObj, value, fallback = "--") {
  if (!enumObj || value === null || value === undefined) return fallback;

  const match = Object.keys(enumObj).find((key) => enumObj[key] === value);
  return match ? match.replaceAll("_", " ") : fallback;
}

function formatSignalQuality(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";

  const normalizedValue = Math.max(0, Math.min(5, value * 5));
  return `${normalizedValue.toFixed(1)} / 5`;
}

function formatNumber(value, unit = "") {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)}${unit}`
    : "--";
}

function simplifyMeasurementState(rawState) {
  switch (rawState) {
    case "FINISHED":
      return "Finished";
    case "RUNNING SIGNAL SHORT":
    case "RUNNING SIGNAL GOOD":
    case "RUNNING SIGNAL BAD":
    case "RUNNING SIGNAL BAD DEVICE UNSTABLE":
      return "In progress";
    default:
      return "Positioning";
  }
}

function sendData(message) {
  if (state.dataChannel?.readyState === "open") {
    state.dataChannel.send(JSON.stringify(message));
  }
}

async function sendSignal(message, targetRole = oppositeRole) {
  await fetch("/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      room,
      role,
      clientId,
      targetRole,
      message,
    }),
  });
}

function updatePeerBadge() {
  const stateText = state.peerConnection?.connectionState || "starting";
  els.connectionBadge.textContent =
    state.dataChannel?.readyState === "open" ? "Connected" : stateText;
  els.connectionBadge.dataset.state =
    state.dataChannel?.readyState === "open" ? "connected" : stateText;
}

function updateMetrics(payload = {}) {
  setText(els.heartRateValue, formatNumber(payload.heartRate, " bpm"));
  setText(els.breathingValue, formatNumber(payload.breathingRate, " bpm"));
  setText(els.stressValue, formatNumber(payload.stressIndex));
  setText(els.signalValue, formatSignalQuality(payload.signalQuality));
  setText(els.faceStateValue, payload.faceState || "--");
  setText(els.measurementStateValue, payload.measurementState || "Positioning");
  els.progressFill.style.width = `${Math.max(0, Math.min(100, payload.progress || 0))}%`;
}

function setPatientScanFocus(active) {
  if (role !== "patient") return;
  els.videoStage.classList.toggle("scan-focus-local", active);
}

function setSdkCanvasVisible(active) {
  if (role !== "patient") return;
  els.localFrame.classList.toggle("sdk-visible", active);
}

function stopMediaStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

function createSdkInputStream() {
  const videoTrack = getLocalCameraTrack();
  if (!videoTrack || videoTrack.readyState !== "live") {
    throw new Error("Patient camera track is not available.");
  }

  videoTrack.enabled = true;

  const sdkVideoTrack = videoTrack.clone();
  sdkVideoTrack.enabled = true;

  return new MediaStream([sdkVideoTrack]);
}

function stopSdkInputStream() {
  stopMediaStream(state.sdkInputStream);
  state.sdkInputStream = null;
}

function getLocalCameraTrack() {
  return state.localStream?.getVideoTracks()[0] || null;
}

function getCameraFrameSize() {
  const settings = getLocalCameraTrack()?.getSettings?.() || {};

  return {
    width: els.localVideo.videoWidth || settings.width || 1280,
    height: els.localVideo.videoHeight || settings.height || 720,
  };
}

function syncShenaiCanvasSizeToCamera() {
  if (state.shenaiInitialized) return;

  const { width, height } = getCameraFrameSize();
  els.shenaiCanvas.width = width;
  els.shenaiCanvas.height = height;
}

function createFreshShenaiCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "shenaiCanvas";

  if (els.shenaiCanvas?.parentNode) {
    els.shenaiCanvas.parentNode.replaceChild(canvas, els.shenaiCanvas);
  } else {
    els.localFrame.appendChild(canvas);
  }

  els.shenaiCanvas = canvas;
  syncShenaiCanvasSizeToCamera();
}

function getVideoSender() {
  return state.peerConnection
    ?.getSenders()
    .find((sender) => sender.track?.kind === "video");
}

async function replaceOutgoingVideoTrack(track) {
  const sender = getVideoSender();
  if (!sender || !track) return;
  await sender.replaceTrack(track);
}

async function shareSdkCanvasWithDoctor() {
  if (role !== "patient") return;

  state.sdkCanvasStream?.getTracks().forEach((track) => track.stop());
  state.sdkCanvasStream = els.shenaiCanvas.captureStream(30);
  state.sdkCanvasVideoTrack = state.sdkCanvasStream.getVideoTracks()[0] || null;

  await replaceOutgoingVideoTrack(state.sdkCanvasVideoTrack);
}

async function shareCameraWithDoctor() {
  if (role !== "patient") return;
  await replaceOutgoingVideoTrack(getLocalCameraTrack());
  state.sdkCanvasStream?.getTracks().forEach((track) => track.stop());
  state.sdkCanvasStream = null;
  state.sdkCanvasVideoTrack = null;
}

async function waitForAnimationFrames(count = 2) {
  for (let i = 0; i < count; i += 1) {
    await new Promise((resolveFrame) => requestAnimationFrame(resolveFrame));
  }
}

async function prepareSdkForScan() {
  const shenai = state.shenai;
  const previousSdkInputStream = state.sdkInputStream;
  const nextSdkInputStream = createSdkInputStream();

  shenai.setOperatingMode(shenai.OperatingMode.POSITIONING);
  await waitForAnimationFrames();
  shenai.setMediaStream(nextSdkInputStream, true);
  state.sdkInputStream = nextSdkInputStream;
  stopMediaStream(previousSdkInputStream);
  await waitForAnimationFrames(3);
}

function pauseShenaiSession() {
  setSdkCanvasVisible(false);

  try {
    if (state.shenaiInitialized && state.shenai) {
      state.shenai.setOperatingMode(state.shenai.OperatingMode.POSITIONING);
    }
  } catch (error) {
    console.warn("Could not pause Shen.AI SDK", error);
  }
}

function configureRoleView() {
  els.roomBadge.textContent = `Room ${room}`;
  els.roleBadge.textContent = role === "patient" ? "Patient" : "Doctor";
  els.roleBadge.dataset.role = role;
  els.screenTitle.textContent =
    role === "patient" ? "Patient exam room" : "Doctor console";
  els.remoteLabel.textContent = role === "patient" ? "Doctor" : "Patient";
  els.panelEyebrow.textContent = role === "patient" ? "Patient scan" : "Patient vitals";
  els.panelTitle.textContent =
    role === "patient" ? "Scan request" : "Vitals scan";

  if (role === "patient") {
    els.localFrame.appendChild(els.shenaiCanvas);
    els.localFrame.classList.add("patient-local-frame");
  }

  if (role === "doctor") {
    els.primaryAction.textContent = "Request scan";
    els.primaryAction.disabled = true;
    els.consentValue.textContent = "Not requested";
  } else {
    els.primaryAction.textContent = "Accept scan";
    els.primaryAction.disabled = true;
    els.consentValue.textContent = "Waiting";
  }

  updateMetrics({
    measurementState: "Positioning",
    progress: 0,
  });
}

async function startLocalMedia() {
  state.localStream = await navigator.mediaDevices.getUserMedia({
    audio: ENABLE_CALL_AUDIO,
    video: {
      facingMode: "user",
      height: { ideal: 720 },
      width: { ideal: 1280 },
    },
  });

  els.localVideo.srcObject = state.localStream;
  await new Promise((resolveMetadata) => {
    if (els.localVideo.videoWidth > 0) {
      resolveMetadata();
      return;
    }

    els.localVideo.addEventListener("loadedmetadata", resolveMetadata, {
      once: true,
    });
  });

  if (role === "patient") {
    syncShenaiCanvasSizeToCamera();
  }
}

function createPeerConnection() {
  state.peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  state.pendingRemoteCandidates = [];

  for (const track of state.localStream.getTracks()) {
    state.peerConnection.addTrack(track, state.localStream);
  }

  state.peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      sendSignal({ type: "candidate", candidate });
    }
  };

  state.peerConnection.ontrack = ({ streams }) => {
    state.remoteStream = streams[0];
    els.remoteVideo.srcObject = state.remoteStream;
    show(els.remoteEmpty, false);
  };

  state.peerConnection.onconnectionstatechange = updatePeerBadge;

  if (role === "doctor") {
    setupDataChannel(state.peerConnection.createDataChannel("shenai-vitals"));
  } else {
    state.peerConnection.ondatachannel = ({ channel }) => setupDataChannel(channel);
  }
}

function setupDataChannel(channel) {
  state.dataChannel = channel;

  channel.onopen = () => {
    updatePeerBadge();
    if (role === "doctor") {
      els.primaryAction.disabled = false;
      setNotice("Ready to request a patient scan", "good");
    }
  };

  channel.onclose = updatePeerBadge;

  channel.onmessage = (event) => {
    try {
      handleCallMessage(JSON.parse(event.data));
    } catch (error) {
      console.warn("Invalid data channel message", error);
    }
  };
}

async function maybeCreateOffer() {
  if (
    role !== "doctor" ||
    !state.localReady ||
    !state.remoteReady ||
    state.offerInFlight ||
    state.peerConnection.signalingState !== "stable"
  ) {
    return;
  }

  state.offerInFlight = true;

  try {
    const offer = await state.peerConnection.createOffer();
    await state.peerConnection.setLocalDescription(offer);
    await sendSignal({
      type: "offer",
      description: state.peerConnection.localDescription,
    });
  } finally {
    state.offerInFlight = false;
  }
}

async function flushPendingRemoteCandidates() {
  if (!state.peerConnection?.remoteDescription) return;

  const candidates = state.pendingRemoteCandidates.splice(0);
  for (const candidate of candidates) {
    await state.peerConnection.addIceCandidate(candidate);
  }
}

async function addRemoteCandidate(candidate) {
  if (!candidate) return;

  if (!state.peerConnection?.remoteDescription) {
    state.pendingRemoteCandidates.push(candidate);
    return;
  }

  await state.peerConnection.addIceCandidate(candidate);
}

async function handleSignal({ role: senderRole, message }) {
  if (senderRole === role) return;

  switch (message.type) {
    case "ready":
      state.remoteReady = true;
      await maybeCreateOffer();
      break;
    case "offer":
      await state.peerConnection.setRemoteDescription(message.description);
      await flushPendingRemoteCandidates();
      await state.peerConnection.setLocalDescription(
        await state.peerConnection.createAnswer(),
      );
      await sendSignal({
        type: "answer",
        description: state.peerConnection.localDescription,
      });
      break;
    case "answer":
      await state.peerConnection.setRemoteDescription(message.description);
      await flushPendingRemoteCandidates();
      break;
    case "candidate":
      await addRemoteCandidate(message.candidate);
      break;
    case "bye":
      setNotice("The other participant left the room", "warn");
      break;
  }
}

function connectSignaling() {
  state.eventSource = new EventSource(
    `/events?room=${encodeURIComponent(room)}&role=${encodeURIComponent(role)}&client=${clientId}`,
  );

  state.eventSource.addEventListener("open", () => {
    state.localReady = true;
    sendSignal({ type: "ready" });
  });

  state.eventSource.addEventListener("peer-joined", () => {
    if (state.localReady) {
      sendSignal({ type: "ready" });
    }
  });

  state.eventSource.addEventListener("peer-left", () => {
    updatePeerBadge();
    setNotice("Peer disconnected", "warn");
  });

  state.eventSource.addEventListener("signal", (event) => {
    handleSignal(JSON.parse(event.data)).catch((error) => {
      console.error("Signal handling failed", error);
      setNotice("Connection negotiation failed", "bad");
    });
  });
}

async function getShenaiFactory() {
  if (state.shenaiFactory) return state.shenaiFactory;

  const module = await import("/shenai-sdk/index.mjs");
  state.shenaiFactory = module.default;

  return state.shenaiFactory;
}

async function createShenaiSdk() {
  const createSdk = await getShenaiFactory();

  state.shenai = await createSdk({
    enablePreloadDisplay: false,
    hidePreloadDisplayLogo: true,
    locateFile: (filename) => `/shenai-sdk/${filename}`,
    preloadDisplayCanvasId: "shenaiCanvas",
  });

  return state.shenai;
}

async function initializeShenai() {
  if (state.shenaiInitialized) return state.shenai;
  if (state.shenaiInitPromise) return state.shenaiInitPromise;

  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    throw new Error("API key is required on the patient side.");
  }

  state.shenaiInitPromise = (async () => {
    createFreshShenaiCanvas();
    const shenai = await createShenaiSdk();
    const { width, height } = getCameraFrameSize();

    await new Promise((resolveInit, rejectInit) => {
      shenai.initialize(
        API_KEY,
        `webrtc-patient-${room}`,
        {
          cameraAspectRatio: width / height,
          cameraMode: shenai.CameraMode.OFF,
          enableCameraSwap: false,
          enableFullFrameProcessing: true,
          enableHealthRisks: false,
          enableStartAfterSuccess: false,
          enableSummaryScreen: false,
          eventCallback: (event) => {
            if (event === "MEASUREMENT_FINISHED") {
              finishScan();
            }
          },
          hideShenaiLogo: false,
          initializationMode: shenai.InitializationMode.MEASUREMENT,
          measurementPreset: shenai.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
          onboardingMode: shenai.OnboardingMode.HIDDEN,
          operatingMode: shenai.OperatingMode.POSITIONING,
          precisionMode: shenai.PrecisionMode.STRICT,
          showDisclaimer: false,
          showFaceMask: true,
          showFacePositioningOverlay: true,
          showInfoButton: false,
          showOutOfRangeResultIndicators: false,
          showSignalQualityIndicator: true,
          showSignalTile: true,
          showStartStopButton: false,
          showUserInterface: false,
          showVisualWarnings: true,
          showBloodFlow: true,
        },
        (result) => {
          if (result === shenai.InitializationResult.OK) {
            shenai.attachToCanvas("#shenaiCanvas");
            state.shenaiInitialized = true;
            resolveInit();
          } else {
            rejectInit(new Error(`Shen.AI initialization failed: ${result}`));
          }
        },
      );
    });

    return shenai;
  })();

  try {
    return await state.shenaiInitPromise;
  } catch (error) {
    state.shenaiInitPromise = null;
    throw error;
  }
}

async function startScan() {
  try {
    state.scanStatus = "starting";
    setPatientScanFocus(true);
    els.localVideo.srcObject = state.localStream;
    await els.localVideo.play().catch(() => {});
    els.primaryAction.textContent = "Starting scan";
    els.primaryAction.disabled = true;
    show(els.secondaryAction, false);
    setNotice("Preparing scan on the patient's camera stream", "warn");
    els.consentValue.textContent = "Accepted";
    sendData({ type: "scan_accepted" });

    await initializeShenai();

    await prepareSdkForScan();
    setSdkCanvasVisible(true);
    state.shenai.setOperatingMode(state.shenai.OperatingMode.MEASURE);
    await waitForAnimationFrames(3);
    await shareSdkCanvasWithDoctor();

    state.scanStatus = "running";
    els.primaryAction.textContent = "Stop scan";
    els.primaryAction.disabled = false;
    setNotice("Scan running on the patient's camera stream", "good");
    sendData({ type: "scan_started" });
    startScanPolling();
  } catch (error) {
    console.error(error);
    state.scanStatus = "idle";
    await shareCameraWithDoctor().catch((restoreError) => {
      console.warn("Could not restore outgoing camera track", restoreError);
    });
    pauseShenaiSession();
    setPatientScanFocus(false);
    updateMetrics({
      measurementState: "Positioning",
      progress: 0,
    });
    els.primaryAction.textContent = "Accept scan";
    els.primaryAction.disabled = false;
    setNotice(error.message, "bad");
    sendData({ type: "scan_stopped", reason: error.message });
  }
}

function stopScan(sendUpdate = true) {
  clearInterval(state.scanTimer);
  state.scanTimer = null;

  state.scanStatus = "idle";
  setSdkCanvasVisible(false);
  shareCameraWithDoctor().catch((error) => {
    console.warn("Could not restore outgoing camera track", error);
  }).finally(pauseShenaiSession);
  setPatientScanFocus(false);
  updateMetrics({
    measurementState: "Positioning",
    progress: 0,
  });
  els.primaryAction.textContent = role === "patient" ? "Accept scan" : "Request scan";
  els.primaryAction.disabled = role === "patient";
  setNotice("No active scan");

  if (sendUpdate) {
    sendData({ type: "scan_stopped" });
  }
}

function startScanPolling() {
  clearInterval(state.scanTimer);

  state.scanTimer = setInterval(() => {
    if (!state.shenaiInitialized) return;

    const shenai = state.shenai;
    const realtimeMetrics = shenai.getRealtimeMetrics(10) || {};
    const rawMeasurementState = enumName(
      shenai.MeasurementState,
      shenai.getMeasurementState(),
      "NOT STARTED",
    );
    const payload = {
      breathingRate: realtimeMetrics.breathing_rate_bpm,
      faceState: enumName(shenai.FaceState, shenai.getFaceState()),
      heartRate: shenai.getRealtimeHeartRate?.() || shenai.getHeartRate10s?.(),
      measurementState: simplifyMeasurementState(rawMeasurementState),
      progress: shenai.getMeasurementProgressPercentage(),
      signalQuality: shenai.getCurrentSignalQualityMetric(),
      stressIndex: realtimeMetrics.stress_index,
    };

    updateMetrics(payload);
    sendData({ type: "scan_status", payload });
  }, 1000);
}

function summarizeResults(results) {
  if (!results) return null;

  return {
    averageSignalQuality: results.average_signal_quality,
    breathingRate: results.breathing_rate_bpm,
    diastolicBloodPressure: results.diastolic_blood_pressure_mmhg,
    heartRate: results.heart_rate_bpm,
    hrvSdnn: results.hrv_sdnn_ms,
    stressIndex: results.stress_index,
    systolicBloodPressure: results.systolic_blood_pressure_mmhg,
  };
}

function finishScan() {
  if (state.scanStatus !== "running") return;

  clearInterval(state.scanTimer);
  state.scanTimer = null;

  const results = summarizeResults(state.shenai?.getMeasurementResults());
  state.scanStatus = "finished";
  setSdkCanvasVisible(false);
  shareCameraWithDoctor().catch((error) => {
    console.warn("Could not restore outgoing camera track", error);
  }).finally(pauseShenaiSession);
  setPatientScanFocus(false);
  setNotice("Scan finished", "good");
  els.primaryAction.textContent = "Accept scan";
  els.primaryAction.disabled = true;
  els.progressFill.style.width = "100%";

  if (results) {
    updateMetrics({
      breathingRate: results.breathingRate,
      heartRate: results.heartRate,
      measurementState: "Finished",
      progress: 100,
      signalQuality: results.averageSignalQuality,
      stressIndex: results.stressIndex,
    });
  }

  sendData({ type: "scan_finished", results });
}

function handleCallMessage(message) {
  switch (message.type) {
    case "scan_request":
      if (role !== "patient") return;
      state.scanStatus = "requested";
      els.primaryAction.textContent = "Accept scan";
      els.primaryAction.disabled = false;
      show(els.secondaryAction, true);
      setNotice("Doctor requested a vitals scan", "warn");
      els.consentValue.textContent = "Requested";
      break;
    case "scan_accepted":
      if (role === "doctor") {
        setNotice("Patient accepted. Waiting for scan data", "good");
        els.consentValue.textContent = "Accepted";
      }
      break;
    case "scan_declined":
      if (role === "doctor") {
        setNotice("Patient declined the scan", "warn");
        els.consentValue.textContent = "Declined";
        updateMetrics({
          measurementState: "Positioning",
          progress: 0,
        });
      }
      break;
    case "scan_started":
      if (role === "doctor") {
        setNotice("Patient scan view is live", "good");
      }
      break;
    case "scan_status":
      if (role === "doctor") {
        updateMetrics(message.payload);
      }
      break;
    case "scan_finished":
      if (role === "doctor") {
        setNotice("Patient scan finished", "good");
        updateMetrics({
          breathingRate: message.results?.breathingRate,
          heartRate: message.results?.heartRate,
          measurementState: "Finished",
          progress: 100,
          signalQuality: message.results?.averageSignalQuality,
          stressIndex: message.results?.stressIndex,
        });
      }
      break;
    case "scan_stopped":
      if (role === "doctor") {
        setNotice(message.reason || "Patient scan stopped", "warn");
        updateMetrics({
          measurementState: "Positioning",
          progress: 0,
        });
      }
      break;
  }
}

function wireControls() {
  els.cameraButton.addEventListener("click", () => {
    for (const track of state.localStream.getVideoTracks()) {
      track.enabled = !track.enabled;
      els.cameraButton.textContent = track.enabled ? "Camera off" : "Camera on";
    }
  });

  els.primaryAction.addEventListener("click", () => {
    if (role === "doctor") {
      setNotice("Scan request sent to patient", "warn");
      els.consentValue.textContent = "Requested";
      sendData({ type: "scan_request" });
      return;
    }

    if (state.scanStatus === "running") {
      stopScan();
      return;
    }

    startScan();
  });

  els.secondaryAction.addEventListener("click", () => {
    show(els.secondaryAction, false);
    els.primaryAction.disabled = true;
    els.consentValue.textContent = "Declined";
    setNotice("Scan declined");
    sendData({ type: "scan_declined" });
  });

  els.leaveButton.addEventListener("click", () => {
    sendSignal({ type: "bye" });
    state.dataChannel?.close();
    state.peerConnection?.close();
    state.eventSource?.close();
    stopSdkInputStream();
    state.localStream?.getTracks().forEach((track) => track.stop());
    setNotice("You left the room", "warn");
    updatePeerBadge();
  });
}

function setupRoleChooser() {
  const targetRoom = room || "demo";
  els.patientLink.href = `/?room=${encodeURIComponent(targetRoom)}&role=patient`;
  els.doctorLink.href = `/?room=${encodeURIComponent(targetRoom)}&role=doctor`;
  els.roomBadge.textContent = `Room ${targetRoom}`;
  show(els.roleChooser, true);
}

async function boot() {
  if (!["patient", "doctor"].includes(role)) {
    setupRoleChooser();
    return;
  }

  configureRoleView();
  show(els.callView, true);
  show(els.controls, true);
  setNotice("Starting camera and microphone");

  try {
    await startLocalMedia();
    createPeerConnection();
    connectSignaling();
    wireControls();
    updatePeerBadge();
    setNotice("Waiting for peer");

    if (role === "patient") {
      initializeShenai().catch((error) => {
        console.warn("Could not pre-initialize Shen.AI SDK", error);
      });
    }
  } catch (error) {
    console.error(error);
    setNotice(error.message, "bad");
  }
}

boot();

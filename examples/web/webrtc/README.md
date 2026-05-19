# Shen.AI WebRTC teleconference example

This example demonstrates a teleconference workflow with two roles:

- `patient`: the person being scanned
- `doctor`: the person requesting the scan

The patient browser uses one camera stream for both WebRTC and Shen.AI:

```text
Patient camera stream
  -> RTCPeerConnection audio/video call
  -> Shen.AI setMediaStream(...)
```

The doctor receives scan commands, status, and summarized vitals through a WebRTC `RTCDataChannel`. The Shen.AI SDK runs only in the patient browser.

## Run

From the repository root:

```bash
cd examples/web/webrtc
npm start
```

Open two browser tabs:

```text
http://localhost:3000/?room=demo&role=patient
http://localhost:3000/?room=demo&role=doctor
```

Set your API key directly in:

```text
examples/web/webrtc/public/app.js
```

Update:

```js
const API_KEY = "YOUR_API_KEY";
```

Do not open `public/index.html` directly from the filesystem. The Shen.AI Web SDK needs `SharedArrayBuffer`, so the page must be served with `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers. `server.js` adds these headers.

## SDK location

The server serves the Web SDK from:

```text
examples/web/webrtc/public/shenai-sdk
```

Place the Shen.AI Web SDK files there so this file exists:

```text
examples/web/webrtc/public/shenai-sdk/index.mjs
```

## Flow

1. Both roles join the same `room`.
2. WebRTC negotiates an audio/video call through the local signaling server.
3. The doctor clicks `Request scan`.
4. The patient clicks `Accept scan`.
5. The patient browser initializes Shen.AI and calls `shenai.setMediaStream(localCameraStream, true)`.
6. The patient view switches the large video tile to the local camera while the scan runs.
7. The Shen.AI canvas appears only inside that large camera tile, with positioning, visual warnings, blood flow, and signal UI enabled.
8. The patient automatically sends the Shen.AI canvas video track to the doctor while the scan runs.
9. The patient sends scan status and summarized vitals to the doctor over `RTCDataChannel`.

## Privacy model

The signaling server forwards only WebRTC signaling messages. It does not run Shen.AI and does not store vitals. Vitals are sent peer-to-peer only after the patient accepts the scan.

## Troubleshooting

If the browser reports that `SharedArrayBuffer` is not supported or that `COOP/COEP` headers are missing, stop any other static server and run this example with:

```bash
cd examples/web/webrtc
npm start
```

Then open the app from `http://127.0.0.1:3000`, not from a `file://` URL.

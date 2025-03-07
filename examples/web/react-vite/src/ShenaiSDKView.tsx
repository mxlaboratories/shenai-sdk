import { useRealtimeHeartRate } from "./ShenaiContext";

export const ShenaiSDKView = () => {
  const hr = useRealtimeHeartRate();

  return (
    <div className="wrapper">
      <div className="title">
        <h1>Shen.AI SDK</h1>
        <h2>React + Vite example</h2>
      </div>
      <canvas id="mxcanvas"></canvas>
      <div className="hr-tile">
        Current Heart Rate: <br />
        <strong>{hr ? `${hr} BPM` : "-"}</strong>
      </div>
    </div>
  );
};

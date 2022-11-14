import React, { useMemo } from "react";
import { Heartbeat } from "shenai-sdk";
import Uplot from "uplot";
import "uplot/dist/uPlot.min.css";
import UplotReact from "uplot-react";

const chartOptions: Uplot.Options = {
  title: "Heartbeat intervals tachogram",
  width: 600,
  height: 200,
  scales: {
    x: {
      time: false,
    },
  },
  series: [
    {
      label: "Time",
      value: (_, v) => `${v.toFixed(2)} s`,
    },
    {
      label: "Interval duration",
      stroke: "blue",
      value: (_, v) => `${v} ms`,
      spanGaps: true,
    },
  ],
};

export const HeartbeatsPreview: React.FC<{ heartbeats?: Heartbeat[] }> = ({
  heartbeats,
}) => {
  const data = useMemo(
    () =>
      heartbeats && [
        heartbeats.map((b) => (b.start_location_sec + b.end_location_sec) / 2),
        heartbeats.map((b) => b.duration_ms),
      ],
    [heartbeats]
  );

  return <UplotReact data={data as Uplot.AlignedData} options={chartOptions} />;
};

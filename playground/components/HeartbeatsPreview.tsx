"use client";

import React, { useMemo } from "react";
import { Heartbeat } from "shenai-sdk";
import Uplot from "uplot";
import "uplot/dist/uPlot.min.css";
import UplotReact from "uplot-react";

const chartOptions: Uplot.Options = {
  title: "Heartbeat intervals tachogram",
  width: 400,
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
      label: "Realtime intervals",
      stroke: "red",
      value: (_, v) => `${v} ms`,
      spanGaps: true,
    },
    {
      label: "Final intervals",
      stroke: "blue",
      value: (_, v) => `${v} ms`,
      spanGaps: true,
    },
  ],
};

export const HeartbeatsPreview: React.FC<{
  realtimeBeats?: Heartbeat[];
  finalBeats?: Heartbeat[];
}> = ({ realtimeBeats, finalBeats }) => {
  const data = useMemo(() => {
    const b1 =
      realtimeBeats && realtimeBeats.length > 0
        ? [
            realtimeBeats.map((b) => b.end_location_sec),
            realtimeBeats.map((b) => b.duration_ms),
          ]
        : [[], []];
    const b2 =
      finalBeats && finalBeats.length > 0
        ? [
            finalBeats.map((b) => b.end_location_sec),
            finalBeats.map((b) => b.duration_ms),
          ]
        : [[], []];
    return Uplot.join([b1 as Uplot.AlignedData, b2 as Uplot.AlignedData]);
  }, [realtimeBeats, finalBeats]);

  return <UplotReact data={data as Uplot.AlignedData} options={chartOptions} />;
};

export default HeartbeatsPreview;

"use client";

import React, { useMemo } from "react";
import { Heartbeat } from "shenai-sdk";
import Uplot from "uplot";
import "uplot/dist/uPlot.min.css";
import UplotReact from "uplot-react";
import { getBasePlotOptions } from "./BasePlotOptions";
import { useScreenWidth } from "../hooks/useScreenWidth";

const getChartOptions = (dark: boolean, width: number): Uplot.Options => {
  const options = getBasePlotOptions({ dark, width });
  options.series = [
    options.series[0],
    {
      label: "Realtime intervals",
      stroke: "rgb(226, 93, 31)",
      value: (_, v) => `${v} ms`,
      spanGaps: true,
    },
    {
      label: "Final intervals",
      stroke: "rgb(66, 180, 173)",
      value: (_, v) => `${v} ms`,
      spanGaps: true,
    },
  ];
  return options;
};

export const HeartbeatsPreview: React.FC<{
  realtimeBeats?: Heartbeat[];
  finalBeats?: Heartbeat[];
  darkMode: boolean;
}> = ({ realtimeBeats, finalBeats, darkMode }) => {
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

  const screenWidth = useScreenWidth();
  const plotWidth = Math.min(430, screenWidth - 50);

  return (
    <UplotReact
      data={data as Uplot.AlignedData}
      options={getChartOptions(darkMode, plotWidth)}
    />
  );
};

export default HeartbeatsPreview;

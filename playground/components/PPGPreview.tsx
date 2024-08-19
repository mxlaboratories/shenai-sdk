"use client";

import React from "react";
import Uplot from "uplot";
import UplotReact from "uplot-react";
import { getBasePlotOptions } from "./BasePlotOptions";
import { useScreenWidth } from "../hooks/useScreenWidth";

const getChartOptions = (dark: boolean, width: number): Uplot.Options => {
  const options = getBasePlotOptions({ dark, width });
  options.series = [
    options.series[0],
    {
      label: "rPPG signal",
      stroke: "rgb(226, 93, 31)",
    },
  ];
  return options;
};

export const PPGPreview: React.FC<{
  signal: number[];
  darkMode: boolean;
}> = ({ signal, darkMode }) => {
  const screenWidth = useScreenWidth();
  const plotWidth = Math.min(430, screenWidth - 50);

  return (
    <UplotReact
      data={
        signal
          ? ([signal.map((_, i) => i / 30), signal] as Uplot.AlignedData)
          : [[], []]
      }
      options={getChartOptions(darkMode, plotWidth)}
    />
  );
};

export default PPGPreview;

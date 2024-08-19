import Uplot from "uplot";

export const getBasePlotOptions = ({
  width = 430,
  height = 150,
  dark = false,
}): Uplot.Options => ({
  width,
  height,

  axes: [
    {
      stroke: () => (dark ? "white" : "black"),
      ticks: {
        stroke: () => (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
      },
      grid: {
        stroke: () => (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
      },
    },
    {
      stroke: () => (dark ? "white" : "black"),
      ticks: {
        stroke: () => (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
      },
      grid: {
        stroke: () => (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"),
      },
    },
  ],

  scales: {
    x: {
      time: false,
    },
  },
  series: [
    {
      label: "Time",
      value: (_, v) => `${v?.toFixed(2)} s`,
    },
    {
      label: "signal",
      stroke: "red",
    },
  ],
});

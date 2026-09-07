export const SINGLE_CHART_NAME = "SalesChart";

export type TrioKind = "column" | "line" | "pie";

export type TrioChartSpec = {
  name: string;
  kind: TrioKind;
  range: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const TRIO_CHARTS: readonly TrioChartSpec[] = [
  {
    name: "SalesColumn",
    kind: "column",
    range: "A1:D5",
    x: 420,
    y: 10,
    width: 380,
    height: 250,
  },
  {
    name: "SalesLine",
    kind: "line",
    range: "A1:D5",
    x: 820,
    y: 10,
    width: 380,
    height: 250,
  },
  {
    name: "SalesPie",
    kind: "pie",
    range: "F1:G4",
    x: 420,
    y: 280,
    width: 320,
    height: 250,
  },
];

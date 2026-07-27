export const FACES = ["U", "R", "F", "D", "L", "B"] as const;
export const CUBE_COLORS = [
  "white",
  "red",
  "green",
  "yellow",
  "orange",
  "blue",
] as const;

export type Face = (typeof FACES)[number];
export type CubeColor = (typeof CUBE_COLORS)[number];
export type FaceColors = readonly [
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
  CubeColor,
];
export type CubeState = Readonly<Record<Face, FaceColors>>;
export type AppStatus =
  | "IDLE"
  | "VALIDATING"
  | "SOLVING"
  | "SOLVED"
  | "ERROR";

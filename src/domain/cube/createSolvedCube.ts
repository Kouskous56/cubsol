import type { CubeColor, CubeState, FaceColors } from "./types";

const face = (color: CubeColor): FaceColors =>
  [color, color, color, color, color, color, color, color, color] as const;

export function createSolvedCube(): CubeState {
  return {
    U: face("white"),
    R: face("red"),
    F: face("green"),
    D: face("yellow"),
    L: face("orange"),
    B: face("blue"),
  };
}

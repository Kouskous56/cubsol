import type { CubeColor, CubeState, FaceColors } from "./types";
import { freezeCubeState } from "./freezeCubeState";

const face = (color: CubeColor): FaceColors =>
  [
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
  ] as FaceColors;

export function createSolvedCube(): CubeState {
  return freezeCubeState({
    U: face("white"),
    R: face("red"),
    F: face("green"),
    D: face("yellow"),
    L: face("orange"),
    B: face("blue"),
  });
}

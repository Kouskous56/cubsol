import type { CubeColor, CubeState, FaceColors } from "./types";

const face = (color: CubeColor): FaceColors =>
  Object.freeze([
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
  ]) as FaceColors;

export function createSolvedCube(): CubeState {
  return Object.freeze({
    U: face("white"),
    R: face("red"),
    F: face("green"),
    D: face("yellow"),
    L: face("orange"),
    B: face("blue"),
  });
}

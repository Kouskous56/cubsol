import { describe, expect, it } from "vitest";
import { createSolvedCube } from "./createSolvedCube";
import { applyAlgorithm } from "./moveEngine";
import { isSolvedCube, validateCubeState } from "./validator";
import {
  type CubeColor,
  type CubeState,
  type Face,
  type FaceColors,
} from "./types";

function replaceSticker(
  cube: CubeState,
  face: Face,
  index: number,
  color: CubeColor,
): CubeState {
  const nextFace = [...cube[face]];
  nextFace[index] = color;
  return { ...cube, [face]: nextFace as unknown as FaceColors };
}

function swapStickers(
  cube: CubeState,
  first: readonly [Face, number],
  second: readonly [Face, number],
): CubeState {
  const firstColor = cube[first[0]][first[1]];
  const secondColor = cube[second[0]][second[1]];
  return replaceSticker(
    replaceSticker(cube, first[0], first[1], secondColor),
    second[0],
    second[1],
    firstColor,
  );
}

const issueCodes = (cube: CubeState) =>
  validateCubeState(cube).issues.map((issue) => issue.code);

describe("physical cube validator", () => {
  it("accepts solved and legally scrambled cubes", () => {
    expect(validateCubeState(createSolvedCube())).toEqual({
      valid: true,
      issues: [],
    });
    expect(
      validateCubeState(
        applyAlgorithm(createSolvedCube(), "R U2 F B' L2 D R' F2 U"),
      ),
    ).toEqual({ valid: true, issues: [] });
    expect(isSolvedCube(createSolvedCube())).toBe(true);
    expect(isSolvedCube(applyAlgorithm(createSolvedCube(), "R"))).toBe(false);
  });

  it("reports exact color-count errors", () => {
    const invalid = replaceSticker(createSolvedCube(), "U", 0, "red");
    const result = validateCubeState(invalid);

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "COLOR_COUNT",
          details: { color: "white", actual: 8, expected: 9 },
        }),
        expect.objectContaining({
          code: "COLOR_COUNT",
          details: { color: "red", actual: 10, expected: 9 },
        }),
      ]),
    );
  });

  it("detects one flipped edge", () => {
    const flipped = swapStickers(createSolvedCube(), ["U", 7], ["F", 1]);

    expect(issueCodes(flipped)).toContain("EDGE_ORIENTATION");
  });

  it("detects one twisted corner", () => {
    const solved = createSolvedCube();
    const u = solved.U[8];
    const r = solved.R[0];
    const f = solved.F[2];
    const twisted = replaceSticker(
      replaceSticker(replaceSticker(solved, "U", 8, r), "R", 0, f),
      "F",
      2,
      u,
    );

    expect(issueCodes(twisted)).toContain("CORNER_ORIENTATION");
  });

  it("detects an odd edge permutation", () => {
    const oddPermutation = swapStickers(
      createSolvedCube(),
      ["R", 1],
      ["F", 1],
    );

    expect(issueCodes(oddPermutation)).toContain("PERMUTATION_PARITY");
  });

  it("detects duplicate center colors before cubie analysis", () => {
    const invalid = swapStickers(createSolvedCube(), ["R", 4], ["F", 0]);

    expect(issueCodes(invalid)).toContain("DUPLICATE_CENTERS");
  });
});

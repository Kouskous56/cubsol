import { describe, expect, it } from "vitest";
import { createSolvedCube } from "./createSolvedCube";
import { CubeSerializationError, cubeToFacelets } from "./cubeToFacelets";
import {
  CUBE_COLORS,
  FACES,
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
  return {
    ...cube,
    [face]: nextFace as unknown as FaceColors,
  };
}

describe("cube domain foundation", () => {
  it("creates six faces with nine stickers each", () => {
    const cube = createSolvedCube();

    expect(FACES).toHaveLength(6);
    for (const face of FACES) {
      expect(cube[face]).toHaveLength(9);
      expect(new Set(cube[face])).toHaveLength(1);
    }
  });

  it("uses every standard color exactly nine times", () => {
    const stickers = Object.values(createSolvedCube()).flat();

    for (const color of CUBE_COLORS) {
      expect(stickers.filter((sticker) => sticker === color)).toHaveLength(9);
    }
  });

  it("freezes the solved state and every face at runtime", () => {
    const cube = createSolvedCube();

    expect(Object.isFrozen(cube)).toBe(true);
    for (const face of FACES) {
      expect(Object.isFrozen(cube[face])).toBe(true);
    }
  });

  it("serializes in Kociemba face order", () => {
    expect(cubeToFacelets(createSolvedCube())).toBe(
      "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
    );
  });

  it("maps stickers by center color for a non-solved state", () => {
    const solved = createSolvedCube();
    const firstSwap = replaceSticker(solved, "U", 0, "red");
    const swapped = replaceSticker(firstSwap, "R", 0, "white");
    const facelets = cubeToFacelets(swapped);

    expect(facelets).toHaveLength(54);
    expect(facelets[0]).toBe("R");
    expect(facelets[9]).toBe("U");
  });

  it("rejects duplicate center colors", () => {
    const invalid = replaceSticker(createSolvedCube(), "R", 4, "white");

    expect(() => cubeToFacelets(invalid)).toThrow(CubeSerializationError);
    expect(() => cubeToFacelets(invalid)).toThrow(
      'Màu tâm "white" xuất hiện trên nhiều mặt.',
    );
  });
});

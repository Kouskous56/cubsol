import { describe, expect, it } from "vitest";
import { createSolvedCube } from "./createSolvedCube";
import { cubeToFacelets } from "./cubeToFacelets";
import { CUBE_COLORS, FACES } from "./types";

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

  it("serializes in Kociemba face order", () => {
    expect(cubeToFacelets(createSolvedCube())).toBe(
      "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
    );
  });
});

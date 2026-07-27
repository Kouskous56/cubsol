import { describe, expect, it } from "vitest";
import { createSolvedCube } from "./createSolvedCube";
import { applyAlgorithm, applyMove } from "./moveEngine";
import { invertAlgorithm, invertMove, parseAlgorithm } from "./notation";
import { validateCubeState } from "./validator";
import {
  CUBE_COLORS,
  FACES,
  type CubeColor,
  type Move,
} from "./types";

const quarterMoves = FACES as readonly Move[];
const allMoves = FACES.flatMap((face) => [
  face,
  `${face}'` as Move,
  `${face}2` as Move,
]);

function stickerCounts(state: ReturnType<typeof createSolvedCube>) {
  const stickers = Object.values(state).flat();
  return Object.fromEntries(
    CUBE_COLORS.map((color) => [
      color,
      stickers.filter((sticker) => sticker === color).length,
    ]),
  ) as Record<CubeColor, number>;
}

describe("facelet move engine", () => {
  it.each(allMoves)("%s followed by its inverse is identity", (move) => {
    const solved = createSolvedCube();
    const moved = applyMove(solved, move);

    expect(applyMove(moved, invertMove(move))).toEqual(solved);
  });

  it.each(quarterMoves)("four %s turns are identity", (move) => {
    expect(applyAlgorithm(createSolvedCube(), `${move} ${move} ${move} ${move}`))
      .toEqual(createSolvedCube());
  });

  it.each(FACES)("%s2 equals two clockwise turns", (face) => {
    const solved = createSolvedCube();
    expect(applyMove(solved, `${face}2`)).toEqual(
      applyMove(applyMove(solved, face), face),
    );
  });

  it("uses the standard clockwise F strip cycle", () => {
    const moved = applyMove(createSolvedCube(), "F");

    expect([moved.R[0], moved.R[3], moved.R[6]]).toEqual([
      "white",
      "white",
      "white",
    ]);
    expect([moved.D[0], moved.D[1], moved.D[2]]).toEqual([
      "red",
      "red",
      "red",
    ]);
    expect([moved.L[2], moved.L[5], moved.L[8]]).toEqual([
      "yellow",
      "yellow",
      "yellow",
    ]);
    expect([moved.U[6], moved.U[7], moved.U[8]]).toEqual([
      "orange",
      "orange",
      "orange",
    ]);
  });

  it("preserves centers, color counts and physical validity", () => {
    const solved = createSolvedCube();
    const moved = applyAlgorithm(
      solved,
      "R U R' U' F2 D L2 B' R2 U F' D2",
    );

    for (const face of FACES) {
      expect(moved[face][4]).toBe(solved[face][4]);
    }
    expect(stickerCounts(moved)).toEqual(stickerCounts(solved));
    expect(validateCubeState(moved)).toEqual({ valid: true, issues: [] });
  });

  it("reverses deterministic pseudo-random algorithms", () => {
    let seed = 0x5eed1234;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };

    for (let sample = 0; sample < 200; sample += 1) {
      const moves = Array.from(
        { length: 40 },
        () => allMoves[Math.floor(random() * allMoves.length)],
      );
      const scrambled = applyAlgorithm(createSolvedCube(), moves);
      const restored = applyAlgorithm(scrambled, invertAlgorithm(moves));

      expect(restored).toEqual(createSolvedCube());
      expect(validateCubeState(scrambled).valid).toBe(true);
    }
  });

  it("accepts a string or a parsed sequence equivalently", () => {
    const source = "R U2 F' L D B2";
    expect(applyAlgorithm(createSolvedCube(), source)).toEqual(
      applyAlgorithm(createSolvedCube(), parseAlgorithm(source)),
    );
  });
});

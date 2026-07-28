import { describe, expect, it } from "vitest";
import {
  applyAlgorithm,
  createSolvedCube,
  cubeToFacelets,
  isSolvedCube,
} from "@/src/domain/cube";
import { KociembaSolver } from "./KociembaSolver";

describe("KociembaSolver integration", () => {
  it(
    "solves real URFDLB facelets with the embedded WASM engine",
    async () => {
      const state = applyAlgorithm(createSolvedCube(), ["R", "U", "F2", "L'"]);
      const engine = new KociembaSolver();
      const moves = await engine.solve(cubeToFacelets(state));

      expect(moves.length).toBeGreaterThan(0);
      expect(isSolvedCube(applyAlgorithm(state, moves))).toBe(true);
      expect(engine.isReady()).toBe(true);
    },
    20_000,
  );

  it("rejects malformed facelet input before invoking WASM", async () => {
    const engine = new KociembaSolver();

    await expect(engine.solve("UUU")).rejects.toEqual(
      expect.objectContaining({ code: "INVALID_INPUT" }),
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  applyAlgorithm,
  createSolvedCube,
  invertAlgorithm,
  type Move,
} from "@/src/domain/cube";
import type { SolverEngine } from "./SolverEngine";
import { solveCube } from "./solveCube";

class StubSolver implements SolverEngine {
  ready = false;
  constructor(private readonly moves: readonly Move[]) {}
  async init() {
    this.ready = true;
  }
  isReady() {
    return this.ready;
  }
  async solve() {
    return this.moves;
  }
}

describe("solveCube use case", () => {
  it("returns immediately for a solved cube without initializing the engine", async () => {
    const engine = new StubSolver(["R"]);
    const result = await solveCube(createSolvedCube(), engine);

    expect(result.moves).toEqual([]);
    expect(result.solvingTimeMs).toBe(0);
    expect(engine.isReady()).toBe(false);
  });

  it("accepts only a solution verified by the domain move engine", async () => {
    const scramble: readonly Move[] = ["R", "U", "F2", "L'"];
    const scrambled = applyAlgorithm(createSolvedCube(), scramble);
    const result = await solveCube(
      scrambled,
      new StubSolver(invertAlgorithm(scramble)),
    );

    expect(result.moves).toEqual(invertAlgorithm(scramble));
  });

  it("rejects an engine response that does not solve the cube", async () => {
    const scrambled = applyAlgorithm(createSolvedCube(), ["R"]);

    await expect(solveCube(scrambled, new StubSolver(["U"]))).rejects.toEqual(
      expect.objectContaining({ code: "INVALID_SOLUTION" }),
    );
  });
});

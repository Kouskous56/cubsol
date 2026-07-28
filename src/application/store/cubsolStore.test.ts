import { beforeEach, describe, expect, it } from "vitest";
import { createSolvedCube } from "@/src/domain/cube/createSolvedCube";
import {
  applyAlgorithm,
  invertAlgorithm,
  type Move,
} from "@/src/domain/cube";
import type { SolverEngine } from "@/src/application/solver/SolverEngine";
import { useCubSolStore } from "./cubsolStore";

class StubSolver implements SolverEngine {
  constructor(private readonly moves: readonly Move[]) {}
  async init() {}
  isReady() {
    return true;
  }
  async solve() {
    return this.moves;
  }
}

describe("CubSol store", () => {
  beforeEach(() => {
    useCubSolStore.getState().clearSession();
  });

  it("starts with a blank cube in idle session", () => {
    const state = useCubSolStore.getState();

    expect(state.status).toBe("IDLE");
    expect(state.cubeState).not.toBeNull();
    expect(state.cubeState!.U[4]).toBe("white");
    expect(state.cubeState!.R[4]).toBe("red");
    expect(state.solutionMoves).toEqual([]);
    expect(state.currentStep).toBe(0);
    expect(state.solvingTimeMs).toBeNull();
  });

  it("replaces cube state and clears stale playback data", () => {
    const cube = createSolvedCube();

    useCubSolStore.getState().setCubeState(cube);
    const state = useCubSolStore.getState();

    expect(state.cubeState).toEqual(cube);
    expect(state.status).toBe("IDLE");
    expect(state.solutionMoves).toEqual([]);
    expect(state.isPlaying).toBe(false);
  });

  it("clears the active cube without retaining a mutable solution array", () => {
    useCubSolStore.getState().setCubeState(createSolvedCube());
    useCubSolStore.getState().clearSession();
    const state = useCubSolStore.getState();

    expect(state.cubeState).not.toBeNull();
    expect(state.cubeState).not.toEqual(createSolvedCube());
    expect(state.solutionMoves).toEqual([]);
    expect(state.currentStep).toBe(0);
    expect(state.errorMessage).toBeNull();
  });

  it("starts a manual entry from a blank center-locked template", () => {
    useCubSolStore.getState().startManualEntry();

    const state = useCubSolStore.getState().cubeState;
    expect(state).not.toBeNull();
    expect(Object.isFrozen(state!)).toBe(true);
    expect(state!.U[4]).toBe("white");
    expect(state!.R[4]).toBe("red");
    expect(state!.F[4]).toBe("green");
    expect(state!.D[4]).toBe("yellow");
    expect(state!.L[4]).toBe("orange");
    expect(state!.B[4]).toBe("blue");
    expect(state!.U[0]).toBe("white");
  });

  it("updates a non-center sticker immutably and clears stale validation", () => {
    useCubSolStore.getState().startManualEntry();
    const previous = useCubSolStore.getState().cubeState;

    useCubSolStore.getState().setSticker("U", 0, "red");
    const state = useCubSolStore.getState();

    expect(state.cubeState).not.toBe(previous);
    expect(state.cubeState?.U[0]).toBe("red");
    expect(state.cubeState?.U[4]).toBe("white");
    expect(Object.isFrozen(state.cubeState?.U)).toBe(true);
  });

  it("does not allow editing a center sticker", () => {
    useCubSolStore.getState().startManualEntry();
    const previous = useCubSolStore.getState().cubeState;

    useCubSolStore.getState().setSticker("U", 4, "red");

    expect(useCubSolStore.getState().cubeState).toBe(previous);
  });

  it("reports count errors and accepts a solved cube", () => {
    useCubSolStore.getState().startManualEntry();
    useCubSolStore.getState().setSticker("U", 0, "red");

    expect(useCubSolStore.getState().validateCube()).toBe(false);
    expect(
      useCubSolStore.getState().validationIssues.some(
        (issue) => issue.code === "COLOR_COUNT",
      ),
    ).toBe(true);

    useCubSolStore.getState().setCubeState(createSolvedCube());
    expect(useCubSolStore.getState().validateCube()).toBe(true);
    expect(useCubSolStore.getState().validationIssues).toEqual([]);
  });

  it("solves a valid cube and exposes bounded playback controls", async () => {
    const scramble: readonly Move[] = ["R", "U", "F2"];
    useCubSolStore
      .getState()
      .setCubeState(applyAlgorithm(createSolvedCube(), scramble));

    const solved = await useCubSolStore
      .getState()
      .solveCurrentCube(new StubSolver(invertAlgorithm(scramble)));

    expect(solved).toBe(true);
    expect(useCubSolStore.getState().status).toBe("SOLVED");
    expect(useCubSolStore.getState().solutionMoves).toEqual(
      invertAlgorithm(scramble),
    );

    useCubSolStore.getState().play();
    expect(useCubSolStore.getState().isPlaying).toBe(true);
    useCubSolStore.getState().stepForward();
    useCubSolStore.getState().stepForward();
    useCubSolStore.getState().stepForward();
    useCubSolStore.getState().stepForward();
    expect(useCubSolStore.getState().currentStep).toBe(3);
    expect(useCubSolStore.getState().isPlaying).toBe(false);

    useCubSolStore.getState().stepBackward();
    expect(useCubSolStore.getState().currentStep).toBe(2);
    useCubSolStore.getState().resetPlayback();
    expect(useCubSolStore.getState().currentStep).toBe(0);
  });

  it("does not call a solver for invalid manual input", async () => {
    useCubSolStore.getState().startManualEntry();
    useCubSolStore.getState().setSticker("U", 0, "red");

    const solved = await useCubSolStore
      .getState()
      .solveCurrentCube(new StubSolver([]));

    expect(solved).toBe(false);
    expect(useCubSolStore.getState().status).toBe("ERROR");
    expect(useCubSolStore.getState().validationIssues.length).toBeGreaterThan(0);
  });

  it("creates a valid random scramble and clears stale solver data", () => {
    useCubSolStore.getState().randomScramble();
    const state = useCubSolStore.getState();

    expect(state.cubeState).not.toEqual(createSolvedCube());
    expect(state.validateCube()).toBe(true);
    expect(state.solutionMoves).toEqual([]);
    expect(state.scrambledState).toBeNull();
  });

  it("reconstructs tutorial state deterministically at any step", async () => {
    const scramble: readonly Move[] = ["R", "U"];
    const scrambled = applyAlgorithm(createSolvedCube(), scramble);
    const solution = invertAlgorithm(scramble);
    useCubSolStore.getState().setCubeState(scrambled);
    await useCubSolStore
      .getState()
      .solveCurrentCube(new StubSolver(solution));

    useCubSolStore.getState().startTutorial();
    expect(useCubSolStore.getState().cubeState).toEqual(scrambled);

    useCubSolStore.getState().goToStep(1);
    expect(useCubSolStore.getState().cubeState).toEqual(
      applyAlgorithm(scrambled, solution.slice(0, 1)),
    );

    useCubSolStore.getState().goToStep(99);
    expect(useCubSolStore.getState().cubeState).toEqual(createSolvedCube());
    expect(useCubSolStore.getState().currentStep).toBe(solution.length);

    useCubSolStore.getState().exitTutorial();
    expect(useCubSolStore.getState().cubeState).toEqual(scrambled);
    expect(useCubSolStore.getState().currentStep).toBe(0);
  });
});

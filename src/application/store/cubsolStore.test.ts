import { beforeEach, describe, expect, it } from "vitest";
import { createSolvedCube } from "@/src/domain/cube/createSolvedCube";
import { useCubSolStore } from "./cubsolStore";

describe("CubSol store", () => {
  beforeEach(() => {
    useCubSolStore.getState().clearSession();
  });

  it("starts with an empty idle session", () => {
    const state = useCubSolStore.getState();

    expect(state.status).toBe("IDLE");
    expect(state.cubeState).toBeNull();
    expect(state.solutionMoves).toEqual([]);
    expect(state.currentStep).toBe(0);
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

    expect(state.cubeState).toBeNull();
    expect(state.solutionMoves).toEqual([]);
    expect(state.currentStep).toBe(0);
    expect(state.errorMessage).toBeNull();
  });

  it("starts a manual entry from a valid center-locked template", () => {
    useCubSolStore.getState().startManualEntry();

    expect(useCubSolStore.getState().cubeState).toEqual(createSolvedCube());
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
});

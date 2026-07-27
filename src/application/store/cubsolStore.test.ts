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
});

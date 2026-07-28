import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import {
  applyAlgorithm,
  createSolvedCube,
  invertAlgorithm,
  type Move,
} from "@/src/domain/cube";
import type { SolverEngine } from "@/src/application/solver/SolverEngine";
import { TutorialPlayer } from "./TutorialPlayer";

vi.mock("./LazyRubiksCube", () => ({
  LazyRubiksCube: ({
    animatedMove,
    onAnimationComplete,
  }: {
    animatedMove?: Move | null;
    onAnimationComplete?: (() => void) | null;
  }) => (
    <button
      data-move={animatedMove ?? ""}
      disabled={!animatedMove}
      onClick={() => onAnimationComplete?.()}
      type="button"
    >
      Hoàn tất animation
    </button>
  ),
}));

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

describe("TutorialPlayer", () => {
  beforeEach(async () => {
    useCubSolStore.getState().clearSession();
    const scramble: readonly Move[] = ["R", "U"];
    useCubSolStore
      .getState()
      .setCubeState(applyAlgorithm(createSolvedCube(), scramble));
    await useCubSolStore
      .getState()
      .solveCurrentCube(new StubSolver(invertAlgorithm(scramble)));
  });

  it("animates forward and backward before committing each step", async () => {
    render(<TutorialPlayer />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Xem hướng dẫn từng bước",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Bước tiếp" }));
    const animation = screen.getByRole("button", {
      name: "Hoàn tất animation",
    });
    expect(animation).toHaveAttribute("data-move", "U'");
    expect(useCubSolStore.getState().currentStep).toBe(0);

    await act(async () => {
      fireEvent.click(animation);
    });
    expect(useCubSolStore.getState().currentStep).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Bước trước" }));
    expect(animation).toHaveAttribute("data-move", "U");
    await act(async () => {
      fireEvent.click(animation);
    });
    expect(useCubSolStore.getState().currentStep).toBe(0);
  });
});

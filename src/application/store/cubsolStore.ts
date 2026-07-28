"use client";

import { create } from "zustand";
import {
  applyAlgorithm,
  createSolvedCube,
  freezeCubeState,
  validateCubeState,
  type AppStatus,
  type CubeColor,
  type CubeState,
  type CubeValidationIssue,
  type Face,
  type FaceColors,
  type Move,
} from "@/src/domain/cube";
import type { SolverEngine } from "@/src/application/solver/SolverEngine";
import { solveCube } from "@/src/application/solver/solveCube";

export interface CubSolStore {
  cubeState: CubeState | null;
  status: AppStatus;
  errorMessage: string | null;
  validationIssues: readonly CubeValidationIssue[];
  solutionMoves: readonly Move[];
  solvingTimeMs: number | null;
  currentStep: number;
  isPlaying: boolean;
  scrambledState: CubeState | null;
  setCubeState: (cubeState: CubeState) => void;
  setSticker: (face: Face, index: number, color: CubeColor) => void;
  validateCube: () => boolean;
  solveCurrentCube: (engine?: SolverEngine) => Promise<boolean>;
  setCurrentStep: (step: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  play: () => void;
  pause: () => void;
  resetPlayback: () => void;
  startManualEntry: () => void;
  randomScramble: () => void;
  clearSession: () => void;
  startTutorial: () => void;
  goToStep: (step: number) => void;
  exitTutorial: () => void;
}

function createBlankCube(): CubeState {
  const face = (color: CubeColor): FaceColors =>
    Object.freeze([
      "white", "white", "white",
      "white", color,  "white",
      "white", "white", "white",
    ]) as FaceColors;

  return freezeCubeState({
    U: face("white"),
    R: face("red"),
    F: face("green"),
    D: face("yellow"),
    L: face("orange"),
    B: face("blue"),
  });
}

const initialState = {
  cubeState: createBlankCube(),
  status: "IDLE" as const,
  errorMessage: null,
  validationIssues: [] as readonly CubeValidationIssue[],
  solutionMoves: [] as readonly Move[],
  solvingTimeMs: null,
  currentStep: 0,
  isPlaying: false,
  scrambledState: null as CubeState | null,
};

export const useCubSolStore = create<CubSolStore>((set, get) => ({
  ...initialState,
  setCubeState: (cubeState) =>
    set({
      cubeState,
      status: "IDLE",
      errorMessage: null,
      validationIssues: [],
      solutionMoves: [],
      solvingTimeMs: null,
      currentStep: 0,
      isPlaying: false,
      scrambledState: null,
    }),
  setSticker: (face, index, color) =>
    set((state) => {
      if (!state.cubeState || index < 0 || index > 8 || index === 4) {
        return state;
      }

      const nextFace = [...state.cubeState[face]];
      nextFace[index] = color;
      const cubeState = freezeCubeState({
        ...state.cubeState,
        [face]: nextFace,
      });

      return {
        cubeState,
        status: "IDLE",
        errorMessage: null,
        validationIssues: [],
        solutionMoves: [],
        solvingTimeMs: null,
        currentStep: 0,
        isPlaying: false,
        scrambledState: null,
      };
    }),
  validateCube: () => {
    const cubeState = get().cubeState;
    if (!cubeState) {
      set({
        status: "ERROR",
        errorMessage: "Hãy bắt đầu nhập màu trước khi kiểm tra.",
        validationIssues: [],
      });
      return false;
    }

    const result = validateCubeState(cubeState);
    set({
      status: result.valid ? "IDLE" : "ERROR",
      errorMessage: result.valid
        ? null
        : "Trạng thái Rubik chưa hợp lệ. Hãy sửa các mục bên dưới.",
      validationIssues: result.issues,
    });
    return result.valid;
  },
  solveCurrentCube: async (providedEngine) => {
    const cubeState = get().cubeState;
    if (!cubeState) {
      set({
        status: "ERROR",
        errorMessage: "Hãy nhập trạng thái Rubik trước khi tìm lời giải.",
        validationIssues: [],
      });
      return false;
    }

    const validation = validateCubeState(cubeState);
    if (!validation.valid) {
      set({
        status: "ERROR",
        errorMessage: "Trạng thái Rubik chưa hợp lệ nên không thể tìm lời giải.",
        validationIssues: validation.issues,
      });
      return false;
    }

    set({
      status: "SOLVING",
      errorMessage: null,
      validationIssues: [],
      solutionMoves: [],
      solvingTimeMs: null,
      currentStep: 0,
      isPlaying: false,
    });

    try {
      const engine =
        providedEngine ??
        (await import("@/src/infrastructure/solver/KociembaSolver")).getSolverEngine();
      const result = await solveCube(cubeState, engine);

      if (get().cubeState !== cubeState) return false;
      set({
        status: "SOLVED",
        solutionMoves: result.moves,
        solvingTimeMs: result.solvingTimeMs,
        scrambledState: cubeState,
        currentStep: 0,
        isPlaying: false,
      });
      return true;
    } catch (error) {
      if (get().cubeState !== cubeState) return false;
      set({
        status: "ERROR",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Solver gặp lỗi không xác định.",
        solutionMoves: [],
        solvingTimeMs: null,
        currentStep: 0,
        isPlaying: false,
      });
      return false;
    }
  },
  setCurrentStep: (step) =>
    set((state) => ({
      currentStep: Math.max(0, Math.min(step, state.solutionMoves.length)),
      isPlaying: false,
    })),
  stepForward: () =>
    set((state) => {
      const currentStep = Math.min(
        state.currentStep + 1,
        state.solutionMoves.length,
      );
      return {
        currentStep,
        isPlaying:
          state.isPlaying && currentStep < state.solutionMoves.length,
      };
    }),
  stepBackward: () =>
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
      isPlaying: false,
    })),
  play: () =>
    set((state) => ({
      isPlaying:
        state.status === "SOLVED" &&
        state.currentStep < state.solutionMoves.length,
    })),
  pause: () => set({ isPlaying: false }),
  resetPlayback: () => set({ currentStep: 0, isPlaying: false }),
  startManualEntry: () =>
    set({
      ...initialState,
      cubeState: createBlankCube(),
    }),
  randomScramble: () => {
    const faces: Face[] = ["U", "R", "F", "D", "L", "B"];
    const suffixes = ["", "'", "2"] as const;
    const moves: Move[] = [];
    let lastFace: Face | null = null;
    for (let i = 0; i < 22; i++) {
      let face: Face;
      do {
        face = faces[Math.floor(Math.random() * 6)];
      } while (face === lastFace);
      lastFace = face;
      const suffix = suffixes[Math.floor(Math.random() * 3)];
      moves.push(`${face}${suffix}` as Move);
    }
    const scrambled = applyAlgorithm(createSolvedCube(), moves);
    set({
      status: "IDLE",
      cubeState: scrambled,
      errorMessage: null,
      validationIssues: [],
      solutionMoves: [],
      solvingTimeMs: null,
      currentStep: 0,
      isPlaying: false,
      scrambledState: null,
    });
  },
  clearSession: () => set(initialState),
  startTutorial: () =>
    set((state) => {
      if (!state.scrambledState || state.solutionMoves.length === 0) {
        return state;
      }
      return {
        cubeState: state.scrambledState,
        currentStep: 0,
        isPlaying: false,
      };
    }),
  goToStep: (step) =>
    set((state) => {
      if (!state.scrambledState) return state;
      const clampedStep = Math.max(
        0,
        Math.min(step, state.solutionMoves.length),
      );
      const movesToApply = state.solutionMoves.slice(0, clampedStep);
      const newCubeState = applyAlgorithm(state.scrambledState, movesToApply);
      return {
        cubeState: newCubeState,
        currentStep: clampedStep,
        isPlaying: false,
      };
    }),
  exitTutorial: () =>
    set((state) => {
      if (!state.scrambledState) return state;
      return {
        cubeState: state.scrambledState,
        currentStep: 0,
        isPlaying: false,
      };
    }),
}));

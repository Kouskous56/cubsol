"use client";

import { create } from "zustand";
import {
  createSolvedCube,
  freezeCubeState,
  validateCubeState,
  type AppStatus,
  type CubeColor,
  type CubeState,
  type CubeValidationIssue,
  type Face,
} from "@/src/domain/cube";

export interface CubSolStore {
  cubeState: CubeState | null;
  status: AppStatus;
  errorMessage: string | null;
  validationIssues: readonly CubeValidationIssue[];
  solutionMoves: readonly string[];
  currentStep: number;
  isPlaying: boolean;
  setCubeState: (cubeState: CubeState) => void;
  setSticker: (face: Face, index: number, color: CubeColor) => void;
  validateCube: () => boolean;
  startManualEntry: () => void;
  clearSession: () => void;
}

const initialState = {
  cubeState: null,
  status: "IDLE" as const,
  errorMessage: null,
  validationIssues: [] as readonly CubeValidationIssue[],
  solutionMoves: [] as readonly string[],
  currentStep: 0,
  isPlaying: false,
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
      currentStep: 0,
      isPlaying: false,
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
        currentStep: 0,
        isPlaying: false,
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
  startManualEntry: () =>
    set({
      ...initialState,
      cubeState: createSolvedCube(),
    }),
  clearSession: () => set(initialState),
}));

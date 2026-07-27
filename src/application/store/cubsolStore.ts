"use client";

import { create } from "zustand";
import type { AppStatus, CubeState } from "@/src/domain/cube/types";

export interface CubSolStore {
  cubeState: CubeState | null;
  status: AppStatus;
  errorMessage: string | null;
  solutionMoves: readonly string[];
  currentStep: number;
  isPlaying: boolean;
  setCubeState: (cubeState: CubeState) => void;
  clearSession: () => void;
}

const initialState = {
  cubeState: null,
  status: "IDLE" as const,
  errorMessage: null,
  solutionMoves: [] as readonly string[],
  currentStep: 0,
  isPlaying: false,
};

export const useCubSolStore = create<CubSolStore>((set) => ({
  ...initialState,
  setCubeState: (cubeState) =>
    set({
      cubeState,
      status: "IDLE",
      errorMessage: null,
      solutionMoves: [],
      currentStep: 0,
      isPlaying: false,
    }),
  clearSession: () => set(initialState),
}));

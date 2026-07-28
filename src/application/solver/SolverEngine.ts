import type { Move } from "@/src/domain/cube";

export interface SolverEngine {
  init(): Promise<void>;
  isReady(): boolean;
  solve(facelets: string): Promise<readonly Move[]>;
}

export class SolverError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_INPUT"
      | "INITIALIZATION_FAILED"
      | "SOLVE_FAILED"
      | "INVALID_SOLUTION",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SolverError";
  }
}

import {
  applyAlgorithm,
  cubeToFacelets,
  isSolvedCube,
  validateCubeState,
  type CubeState,
  type Move,
} from "@/src/domain/cube";
import { SolverError, type SolverEngine } from "./SolverEngine";

export interface SolveCubeResult {
  moves: readonly Move[];
  solvingTimeMs: number;
}

export async function solveCube(
  state: CubeState,
  engine: SolverEngine,
): Promise<SolveCubeResult> {
  const validation = validateCubeState(state);
  if (!validation.valid) {
    throw new SolverError(
      "Trạng thái Rubik không hợp lệ nên không thể đưa vào solver.",
      "INVALID_INPUT",
    );
  }

  if (isSolvedCube(state)) {
    return { moves: Object.freeze([]), solvingTimeMs: 0 };
  }

  const startedAt = performance.now();
  await engine.init();
  const moves = Object.freeze([...(await engine.solve(cubeToFacelets(state)))]);
  const solvingTimeMs = Math.max(0, performance.now() - startedAt);

  if (!isSolvedCube(applyAlgorithm(state, moves))) {
    throw new SolverError(
      "Solver trả về chuỗi nước đi không giải được trạng thái đầu vào.",
      "INVALID_SOLUTION",
    );
  }

  return { moves, solvingTimeMs };
}

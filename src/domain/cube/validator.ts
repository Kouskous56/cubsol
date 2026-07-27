import { cubeToFacelets, CubeSerializationError } from "./cubeToFacelets";
import { CUBE_COLORS, FACES, type CubeColor, type CubeState } from "./types";

export type CubeValidationErrorCode =
  | "INVALID_FACE_SIZE"
  | "COLOR_COUNT"
  | "DUPLICATE_CENTERS"
  | "INVALID_CORNER_SET"
  | "INVALID_EDGE_SET"
  | "CORNER_ORIENTATION"
  | "EDGE_ORIENTATION"
  | "PERMUTATION_PARITY";

export interface CubeValidationIssue {
  code: CubeValidationErrorCode;
  message: string;
  details?: Readonly<Record<string, number | string>>;
}

export interface CubeValidationResult {
  valid: boolean;
  issues: readonly CubeValidationIssue[];
}

const cornerFacelets = [
  [8, 9, 20],
  [6, 18, 38],
  [0, 36, 47],
  [2, 45, 11],
  [29, 26, 15],
  [27, 44, 24],
  [33, 53, 42],
  [35, 17, 51],
] as const;

const cornerColors = [
  ["U", "R", "F"],
  ["U", "F", "L"],
  ["U", "L", "B"],
  ["U", "B", "R"],
  ["D", "F", "R"],
  ["D", "L", "F"],
  ["D", "B", "L"],
  ["D", "R", "B"],
] as const;

const edgeFacelets = [
  [5, 10],
  [7, 19],
  [3, 37],
  [1, 46],
  [32, 16],
  [28, 25],
  [30, 43],
  [34, 52],
  [23, 12],
  [21, 41],
  [50, 39],
  [48, 14],
] as const;

const edgeColors = [
  ["U", "R"],
  ["U", "F"],
  ["U", "L"],
  ["U", "B"],
  ["D", "R"],
  ["D", "F"],
  ["D", "L"],
  ["D", "B"],
  ["F", "R"],
  ["F", "L"],
  ["B", "L"],
  ["B", "R"],
] as const;

function permutationParity(permutation: readonly number[]): number {
  let inversions = 0;
  for (let left = 0; left < permutation.length; left += 1) {
    for (let right = left + 1; right < permutation.length; right += 1) {
      if (permutation[left] > permutation[right]) inversions += 1;
    }
  }
  return inversions % 2;
}

function hasEveryCubieOnce(
  permutation: readonly number[],
  expectedCount: number,
): boolean {
  return (
    permutation.length === expectedCount &&
    permutation.every((value) => value >= 0 && value < expectedCount) &&
    new Set(permutation).size === expectedCount
  );
}

function extractCorners(facelets: string): {
  permutation: number[];
  orientation: number[];
} {
  const permutation: number[] = [];
  const orientation: number[] = [];

  for (const position of cornerFacelets) {
    const upDownIndex = position.findIndex((faceletIndex) => {
      const color = facelets[faceletIndex];
      return color === "U" || color === "D";
    });

    if (upDownIndex === -1) {
      permutation.push(-1);
      orientation.push(-1);
      continue;
    }

    const color1 = facelets[position[(upDownIndex + 1) % 3]];
    const color2 = facelets[position[(upDownIndex + 2) % 3]];
    const cubie = cornerColors.findIndex(
      (colors) => colors[1] === color1 && colors[2] === color2,
    );
    permutation.push(cubie);
    orientation.push(upDownIndex % 3);
  }

  return { permutation, orientation };
}

function extractEdges(facelets: string): {
  permutation: number[];
  orientation: number[];
} {
  const permutation: number[] = [];
  const orientation: number[] = [];

  for (const [firstIndex, secondIndex] of edgeFacelets) {
    const firstColor = facelets[firstIndex];
    const secondColor = facelets[secondIndex];
    let cubie = edgeColors.findIndex(
      (colors) => colors[0] === firstColor && colors[1] === secondColor,
    );
    if (cubie !== -1) {
      permutation.push(cubie);
      orientation.push(0);
      continue;
    }

    cubie = edgeColors.findIndex(
      (colors) => colors[0] === secondColor && colors[1] === firstColor,
    );
    permutation.push(cubie);
    orientation.push(cubie === -1 ? -1 : 1);
  }

  return { permutation, orientation };
}

function countColors(state: CubeState): Map<CubeColor, number> {
  const counts = new Map(CUBE_COLORS.map((color) => [color, 0]));
  for (const face of FACES) {
    for (const color of state[face]) {
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }
  return counts;
}

export function validateCubeState(state: CubeState): CubeValidationResult {
  const issues: CubeValidationIssue[] = [];

  for (const face of FACES) {
    if (!Array.isArray(state[face]) || state[face].length !== 9) {
      issues.push({
        code: "INVALID_FACE_SIZE",
        message: `Mặt ${face} phải có đúng 9 sticker.`,
        details: { face, actual: state[face]?.length ?? 0 },
      });
    }
  }
  if (issues.length > 0) {
    return { valid: false, issues: Object.freeze(issues) };
  }

  const counts = countColors(state);
  for (const color of CUBE_COLORS) {
    const count = counts.get(color) ?? 0;
    if (count !== 9) {
      issues.push({
        code: "COLOR_COUNT",
        message: `Màu "${color}" có ${count}/9 sticker.`,
        details: { color, actual: count, expected: 9 },
      });
    }
  }

  const centerColors = FACES.map((face) => state[face][4]);
  if (new Set(centerColors).size !== FACES.length) {
    issues.push({
      code: "DUPLICATE_CENTERS",
      message: "Sáu mặt phải có sáu màu tâm khác nhau.",
    });
  }

  if (issues.length > 0) {
    return { valid: false, issues: Object.freeze(issues) };
  }

  let facelets: string;
  try {
    facelets = cubeToFacelets(state);
  } catch (error) {
    if (error instanceof CubeSerializationError) {
      return {
        valid: false,
        issues: Object.freeze([
          { code: "DUPLICATE_CENTERS", message: error.message },
        ]),
      };
    }
    throw error;
  }

  const corners = extractCorners(facelets);
  const edges = extractEdges(facelets);
  const validCorners = hasEveryCubieOnce(corners.permutation, 8);
  const validEdges = hasEveryCubieOnce(edges.permutation, 12);

  if (!validCorners) {
    issues.push({
      code: "INVALID_CORNER_SET",
      message: "Các mảnh góc không tạo thành đúng bộ 8 góc Rubik.",
    });
  }
  if (!validEdges) {
    issues.push({
      code: "INVALID_EDGE_SET",
      message: "Các mảnh cạnh không tạo thành đúng bộ 12 cạnh Rubik.",
    });
  }

  if (validCorners) {
    const cornerOrientation = corners.orientation.reduce(
      (sum, value) => sum + value,
      0,
    );
    if (cornerOrientation % 3 !== 0) {
      issues.push({
        code: "CORNER_ORIENTATION",
        message: "Tổng độ xoắn góc không hợp lệ.",
      });
    }
  }

  if (validEdges) {
    const edgeOrientation = edges.orientation.reduce(
      (sum, value) => sum + value,
      0,
    );
    if (edgeOrientation % 2 !== 0) {
      issues.push({
        code: "EDGE_ORIENTATION",
        message: "Tổng độ lật cạnh không hợp lệ.",
      });
    }
  }

  if (
    validCorners &&
    validEdges &&
    permutationParity(corners.permutation) !==
      permutationParity(edges.permutation)
  ) {
    issues.push({
      code: "PERMUTATION_PARITY",
      message: "Parity hoán vị góc và cạnh không khớp.",
    });
  }

  return { valid: issues.length === 0, issues: Object.freeze(issues) };
}

export function isSolvedCube(state: CubeState): boolean {
  return (
    validateCubeState(state).valid &&
    FACES.every((face) => new Set(state[face]).size === 1)
  );
}

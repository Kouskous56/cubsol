import { freezeCubeState } from "./freezeCubeState";
import { parseAlgorithm } from "./notation";
import {
  FACES,
  type CubeColor,
  type CubeState,
  type Face,
  type Move,
} from "./types";

type Axis = "x" | "y" | "z";
type Vector = readonly [number, number, number];

interface SpatialSticker {
  position: Vector;
  normal: Vector;
}

const moveGeometry: Readonly<
  Record<Face, { axis: Axis; layer: -1 | 1; quarter: -1 | 1 }>
> = {
  U: { axis: "y", layer: 1, quarter: -1 },
  R: { axis: "x", layer: 1, quarter: -1 },
  F: { axis: "z", layer: 1, quarter: -1 },
  D: { axis: "y", layer: -1, quarter: 1 },
  L: { axis: "x", layer: -1, quarter: 1 },
  B: { axis: "z", layer: -1, quarter: 1 },
};

const axisIndex: Readonly<Record<Axis, number>> = { x: 0, y: 1, z: 2 };

function stickerToSpatial(face: Face, index: number): SpatialSticker {
  const row = Math.floor(index / 3);
  const column = index % 3;

  switch (face) {
    case "U":
      return { position: [column - 1, 1, row - 1], normal: [0, 1, 0] };
    case "R":
      return { position: [1, 1 - row, 1 - column], normal: [1, 0, 0] };
    case "F":
      return { position: [column - 1, 1 - row, 1], normal: [0, 0, 1] };
    case "D":
      return { position: [column - 1, -1, 1 - row], normal: [0, -1, 0] };
    case "L":
      return { position: [-1, 1 - row, column - 1], normal: [-1, 0, 0] };
    case "B":
      return { position: [1 - column, 1 - row, -1], normal: [0, 0, -1] };
  }
}

function spatialToSticker({
  position: [x, y, z],
  normal: [nx, ny, nz],
}: SpatialSticker): { face: Face; index: number } {
  let face: Face;
  let row: number;
  let column: number;

  if (ny === 1) {
    face = "U";
    row = z + 1;
    column = x + 1;
  } else if (nx === 1) {
    face = "R";
    row = 1 - y;
    column = 1 - z;
  } else if (nz === 1) {
    face = "F";
    row = 1 - y;
    column = x + 1;
  } else if (ny === -1) {
    face = "D";
    row = 1 - z;
    column = x + 1;
  } else if (nx === -1) {
    face = "L";
    row = 1 - y;
    column = z + 1;
  } else if (nz === -1) {
    face = "B";
    row = 1 - y;
    column = 1 - x;
  } else {
    throw new Error("Vector pháp tuyến sticker không hợp lệ.");
  }

  return { face, index: row * 3 + column };
}

function rotateVector(
  [x, y, z]: Vector,
  axis: Axis,
  quarter: -1 | 1,
): Vector {
  if (axis === "x") {
    return quarter === 1 ? [x, -z, y] : [x, z, -y];
  }
  if (axis === "y") {
    return quarter === 1 ? [z, y, -x] : [-z, y, x];
  }
  return quarter === 1 ? [-y, x, z] : [y, -x, z];
}

function applyClockwiseQuarter(state: CubeState, face: Face): CubeState {
  const geometry = moveGeometry[face];
  const output = Object.fromEntries(
    FACES.map((currentFace) => [currentFace, Array<CubeColor>(9)]),
  ) as Record<Face, CubeColor[]>;

  for (const sourceFace of FACES) {
    state[sourceFace].forEach((color, sourceIndex) => {
      let spatial = stickerToSpatial(sourceFace, sourceIndex);
      if (
        spatial.position[axisIndex[geometry.axis]] === geometry.layer
      ) {
        spatial = {
          position: rotateVector(
            spatial.position,
            geometry.axis,
            geometry.quarter,
          ),
          normal: rotateVector(
            spatial.normal,
            geometry.axis,
            geometry.quarter,
          ),
        };
      }
      const target = spatialToSticker(spatial);
      output[target.face][target.index] = color;
    });
  }

  return freezeCubeState(output);
}

function moveQuarterCount(move: Move): number {
  if (move.endsWith("2")) return 2;
  if (move.endsWith("'")) return 3;
  return 1;
}

export function applyMove(state: CubeState, move: Move): CubeState {
  let next = state;
  const face = move[0] as Face;
  for (let turn = 0; turn < moveQuarterCount(move); turn += 1) {
    next = applyClockwiseQuarter(next, face);
  }
  return next;
}

export function applyAlgorithm(
  state: CubeState,
  algorithm: string | readonly Move[],
): CubeState {
  const moves =
    typeof algorithm === "string" ? parseAlgorithm(algorithm) : algorithm;
  return moves.reduce(applyMove, state);
}

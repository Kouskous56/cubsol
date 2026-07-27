import {
  CUBE_COLORS,
  FACES,
  type CubeColor,
  type CubeState,
  type Face,
  type FaceColors,
} from "./types";

const knownColors = new Set<CubeColor>(CUBE_COLORS);

export function freezeCubeState(
  faces: Readonly<Record<Face, readonly CubeColor[]>>,
): CubeState {
  const state = {} as Record<Face, FaceColors>;

  for (const face of FACES) {
    const stickers = faces[face];
    if (stickers.length !== 9) {
      throw new TypeError(`Mặt ${face} phải có đúng 9 sticker.`);
    }
    if (stickers.some((color) => !knownColors.has(color))) {
      throw new TypeError(`Mặt ${face} chứa màu không được hỗ trợ.`);
    }
    state[face] = Object.freeze([...stickers]) as FaceColors;
  }

  return Object.freeze(state);
}

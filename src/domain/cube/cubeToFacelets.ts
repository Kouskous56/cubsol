import { FACES, type CubeColor, type CubeState, type Face } from "./types";

export class CubeSerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CubeSerializationError";
  }
}

export function cubeToFacelets(state: CubeState): string {
  const colorToFace = new Map<CubeColor, Face>();

  for (const face of FACES) {
    const centerColor = state[face][4];
    if (colorToFace.has(centerColor)) {
      throw new CubeSerializationError(
        `Màu tâm "${centerColor}" xuất hiện trên nhiều mặt.`,
      );
    }
    colorToFace.set(centerColor, face);
  }

  return FACES.flatMap((face) =>
    state[face].map((color) => {
      const mappedFace = colorToFace.get(color);
      if (!mappedFace) {
        throw new CubeSerializationError(
          `Không tìm thấy mặt tương ứng với màu "${color}".`,
        );
      }
      return mappedFace;
    }),
  ).join("");
}

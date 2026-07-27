import { FACES, type CubeState } from "./types";

export function cubeToFacelets(state: CubeState): string {
  return FACES.flatMap((face) => state[face].map(() => face)).join("");
}

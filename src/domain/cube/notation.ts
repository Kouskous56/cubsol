import { FACES, type Face, type Move, type MoveSuffix } from "./types";

const MOVE_PATTERN = /^[URFDLB](?:2|')?$/;
const FACE_SET = new Set<string>(FACES);

export class MoveParseError extends Error {
  readonly token: string;
  readonly tokenIndex: number;

  constructor(token: string, tokenIndex: number) {
    super(`Nước xoay không hợp lệ tại vị trí ${tokenIndex + 1}: "${token}".`);
    this.name = "MoveParseError";
    this.token = token;
    this.tokenIndex = tokenIndex;
  }
}

export function parseAlgorithm(input: string): readonly Move[] {
  const normalized = input
    .replaceAll("’", "'")
    .replaceAll("′", "'")
    .trim()
    .toUpperCase();

  if (!normalized) return Object.freeze([]);

  const tokens = normalized.split(/\s+/);
  const moves = tokens.map((token, index) => {
    if (!MOVE_PATTERN.test(token)) {
      throw new MoveParseError(token, index);
    }
    return token as Move;
  });

  return Object.freeze(moves);
}

export function formatAlgorithm(moves: readonly Move[]): string {
  return moves.join(" ");
}

export function invertMove(move: Move): Move {
  const face = move[0] as Face;
  const suffix = move.slice(1) as MoveSuffix;
  if (suffix === "2") return move;
  return `${face}${suffix === "'" ? "" : "'"}` as Move;
}

export function invertAlgorithm(moves: readonly Move[]): readonly Move[] {
  return Object.freeze([...moves].reverse().map(invertMove));
}

const moveTurns = (move: Move): number => {
  if (move.endsWith("2")) return 2;
  if (move.endsWith("'")) return 3;
  return 1;
};

const turnsToMove = (face: Face, turns: number): Move | null => {
  const normalized = ((turns % 4) + 4) % 4;
  if (normalized === 0) return null;
  if (normalized === 1) return face;
  if (normalized === 2) return `${face}2`;
  return `${face}'`;
};

export function normalizeAlgorithm(moves: readonly Move[]): readonly Move[] {
  const result: Move[] = [];

  for (const move of moves) {
    const face = move[0];
    if (!FACE_SET.has(face)) {
      throw new MoveParseError(move, result.length);
    }
    const previous = result.at(-1);
    if (!previous || previous[0] !== face) {
      result.push(move);
      continue;
    }

    result.pop();
    const combined = turnsToMove(
      face as Face,
      moveTurns(previous) + moveTurns(move),
    );
    if (combined) result.push(combined);
  }

  return Object.freeze(result);
}

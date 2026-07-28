import { describe, expect, it } from "vitest";
import {
  MoveParseError,
  formatAlgorithm,
  invertAlgorithm,
  invertMove,
  normalizeAlgorithm,
  parseAlgorithm,
} from "./notation";

describe("WCA notation", () => {
  it("parses case, whitespace and Unicode prime marks", () => {
    expect(parseAlgorithm("  r  u’\nF′ d2 ")).toEqual([
      "R",
      "U'",
      "F'",
      "D2",
    ]);
  });

  it("formats and inverts an algorithm", () => {
    const moves = parseAlgorithm("R U R' U'");

    expect(formatAlgorithm(moves)).toBe("R U R' U'");
    expect(invertAlgorithm(moves)).toEqual(["U", "R", "U'", "R'"]);
    expect(invertMove("F2")).toBe("F2");
  });

  it("normalizes adjacent turns on the same face", () => {
    expect(normalizeAlgorithm(parseAlgorithm("R R U U' F F F"))).toEqual([
      "R2",
      "F'",
    ]);
    expect(normalizeAlgorithm(parseAlgorithm("L L2 L"))).toEqual([]);
  });

  it.each(["Rw", "R2'", "X", "R3", "U-"])(
    "rejects unsupported token %s",
    (token) => {
      expect(() => parseAlgorithm(`R ${token} U`)).toThrow(MoveParseError);
    },
  );
});

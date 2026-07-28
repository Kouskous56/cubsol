/// <reference lib="webworker" />

import { init, solve } from "kociemba-wasm";

type SolverWorkerRequest =
  | { id: number; type: "init" }
  | { facelets: string; id: number; type: "solve" };

let initialization: Promise<unknown> | null = null;

function ensureInitialized() {
  initialization ??= init();
  return initialization;
}

self.addEventListener(
  "message",
  async (event: MessageEvent<SolverWorkerRequest>) => {
    const { id } = event.data;
    try {
      await ensureInitialized();
      const result =
        event.data.type === "solve"
          ? await solve(event.data.facelets)
          : "";
      self.postMessage({ id, ok: true, result });
    } catch (error) {
      self.postMessage({
        id,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown solver error",
      });
    }
  },
);

export {};

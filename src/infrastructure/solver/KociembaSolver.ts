import { parseAlgorithm, type Move } from "@/src/domain/cube";
import {
  SolverError,
  type SolverEngine,
} from "@/src/application/solver/SolverEngine";

interface PendingRequest {
  reject: (reason: unknown) => void;
  resolve: (value: string) => void;
  timeout: ReturnType<typeof setTimeout>;
}

interface WorkerResponse {
  error?: string;
  id: number;
  ok: boolean;
  result?: string;
}

export class KociembaSolver implements SolverEngine {
  private ready = false;
  private initialization: Promise<void> | null = null;
  private worker: Worker | null = null;
  private nextRequestId = 1;
  private readonly pending = new Map<number, PendingRequest>();

  isReady() {
    return this.ready;
  }

  init() {
    this.initialization ??= this.initialize();
    return this.initialization;
  }

  async solve(facelets: string): Promise<readonly Move[]> {
    if (!/^[URFDLB]{54}$/.test(facelets)) {
      throw new SolverError(
        "Solver yêu cầu đúng 54 facelets theo thứ tự URFDLB.",
        "INVALID_INPUT",
      );
    }

    await this.init();
    try {
      let raw: string;
      if (this.worker) {
        try {
          raw = await this.requestWorker("solve", facelets);
        } catch {
          this.disposeWorker();
          raw = await this.solveOnMainThread(facelets);
        }
      } else {
        raw = await this.solveOnMainThread(facelets);
      }
      return parseAlgorithm(raw);
    } catch (error) {
      if (error instanceof SolverError) throw error;
      throw new SolverError("Không thể tìm lời giải cho khối Rubik.", "SOLVE_FAILED", {
        cause: error,
      });
    }
  }

  private async initialize() {
    try {
      if (typeof Worker === "function") {
        try {
          this.worker = new Worker(
            new URL("./kociembaSolver.worker.ts", import.meta.url),
            { type: "module" },
          );
          this.worker.addEventListener("message", this.handleMessage);
          this.worker.addEventListener("error", this.handleWorkerError);
          await this.requestWorker("init");
        } catch {
          this.disposeWorker();
          const { init } = await import("kociemba-wasm");
          await init();
        }
      } else {
        const { init } = await import("kociemba-wasm");
        await init();
      }
      this.ready = true;
    } catch (error) {
      this.disposeWorker();
      throw new SolverError(
        "Không thể khởi tạo WebAssembly solver.",
        "INITIALIZATION_FAILED",
        { cause: error },
      );
    }
  }

  private requestWorker(type: "init" | "solve", facelets?: string) {
    if (!this.worker) {
      return Promise.reject(new Error("Solver worker is unavailable."));
    }
    const id = this.nextRequestId++;
    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Solver worker timed out."));
      }, 20_000);
      this.pending.set(id, { resolve, reject, timeout });
      this.worker?.postMessage(
        type === "solve" ? { facelets, id, type } : { id, type },
      );
    });
  }

  private async solveOnMainThread(facelets: string) {
    const { solve } = await import("kociemba-wasm");
    return solve(facelets);
  }

  private readonly handleMessage = (event: MessageEvent<WorkerResponse>) => {
    const request = this.pending.get(event.data.id);
    if (!request) return;
    this.pending.delete(event.data.id);
    clearTimeout(request.timeout);
    if (event.data.ok) {
      request.resolve(event.data.result ?? "");
    } else {
      request.reject(new Error(event.data.error ?? "Solver worker failed."));
    }
  };

  private readonly handleWorkerError = (event: ErrorEvent) => {
    const error = new Error(event.message || "Solver worker failed.");
    for (const request of this.pending.values()) {
      clearTimeout(request.timeout);
      request.reject(error);
    }
    this.pending.clear();
    this.disposeWorker();
  };

  private disposeWorker() {
    this.worker?.removeEventListener("message", this.handleMessage);
    this.worker?.removeEventListener("error", this.handleWorkerError);
    this.worker?.terminate();
    this.worker = null;
  }
}

let solver: KociembaSolver | null = null;

export function getSolverEngine(): KociembaSolver {
  solver ??= new KociembaSolver();
  return solver;
}

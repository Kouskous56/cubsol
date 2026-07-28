"use client";

import { useCubSolStore } from "@/src/application/store/cubsolStore";
import { TutorialPlayer } from "./TutorialPlayer";
import styles from "./SolverResult.module.css";

interface SolverResultProps {
  onTutorialStart?: () => void;
  onTutorialExit?: () => void;
}

export function SolverResult({ onTutorialStart, onTutorialExit }: SolverResultProps) {
  const status = useCubSolStore((state) => state.status);
  const moves = useCubSolStore((state) => state.solutionMoves);
  const solvingTimeMs = useCubSolStore((state) => state.solvingTimeMs);

  if (status === "SOLVING") {
    return (
      <section className={styles.solving} aria-live="polite">
        <span aria-hidden="true" />
        <div>
          <strong>Đang khởi tạo solver và tìm lời giải…</strong>
          <p>Lần chạy đầu cần tạo bảng tìm kiếm; giao diện vẫn ở worker riêng.</p>
        </div>
      </section>
    );
  }

  if (status !== "SOLVED") return null;

  return (
    <section className={styles.result} aria-labelledby="solution-title">
      <div className={styles.resultHeader}>
        <div>
          <p>Kociemba · Kết quả đã xác minh</p>
          <h3 id="solution-title">
            {moves.length === 0
              ? "Khối Rubik đã được giải."
              : `${moves.length} bước để trở về trạng thái solved.`}
          </h3>
        </div>
        <dl>
          <div>
            <dt>Số bước</dt>
            <dd>{moves.length}</dd>
          </div>
          <div>
            <dt>Thời gian</dt>
            <dd>{Math.round(solvingTimeMs ?? 0)} ms</dd>
          </div>
        </dl>
      </div>

      <TutorialPlayer
        onTutorialStart={onTutorialStart}
        onTutorialExit={onTutorialExit}
      />
    </section>
  );
}

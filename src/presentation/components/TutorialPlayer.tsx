"use client";

import { useCallback, useRef, useState } from "react";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import {
  formatAlgorithm,
  invertAlgorithm,
  type Move,
} from "@/src/domain/cube";
import { LazyRubiksCube } from "./LazyRubiksCube";
import styles from "./SolverResult.module.css";

const FACE_LABELS: Record<string, string> = {
  U: "Trên",
  R: "Phải",
  F: "Trước",
  D: "Dưới",
  L: "Trái",
  B: "Sau",
};

interface TutorialPlayerProps {
  onTutorialStart?: () => void;
  onTutorialExit?: () => void;
}

export function TutorialPlayer({ onTutorialStart, onTutorialExit }: TutorialPlayerProps) {
  const cubeState = useCubSolStore((state) => state.cubeState);
  const solutionMoves = useCubSolStore((state) => state.solutionMoves);
  const currentStep = useCubSolStore((state) => state.currentStep);
  const scrambledState = useCubSolStore((state) => state.scrambledState);
  const solvingTimeMs = useCubSolStore((state) => state.solvingTimeMs);
  const goToStep = useCubSolStore((state) => state.goToStep);
  const startTutorial = useCubSolStore((state) => state.startTutorial);
  const exitTutorial = useCubSolStore((state) => state.exitTutorial);

  const [animMove, setAnimMove] = useState<Move | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const pendingRef = useRef(false);
  const pendingStepRef = useRef<number | null>(null);

  const hasTutorialData = Boolean(scrambledState && solutionMoves.length > 0);

  const start = useCallback(() => {
    if (!hasTutorialData) return;
    startTutorial();
    onTutorialStart?.();
    setTutorialActive(true);
    setAnimMove(null);
    setIsAnimating(false);
    pendingRef.current = false;
    pendingStepRef.current = null;
  }, [startTutorial, hasTutorialData, onTutorialStart]);

  const stop = useCallback(() => {
    exitTutorial();
    onTutorialExit?.();
    setTutorialActive(false);
    setAnimMove(null);
    setIsAnimating(false);
    pendingRef.current = false;
    pendingStepRef.current = null;
  }, [exitTutorial, onTutorialExit]);

  const stepForward = useCallback(() => {
    if (isAnimating || pendingRef.current || currentStep >= solutionMoves.length) return;
    const move = solutionMoves[currentStep];
    if (!move) return;
    pendingRef.current = true;
    pendingStepRef.current = currentStep + 1;
    setIsAnimating(true);
    setAnimMove(move);
  }, [isAnimating, currentStep, solutionMoves]);

  const stepBackward = useCallback(() => {
    if (isAnimating || pendingRef.current || currentStep <= 0) return;
    const previousMove = solutionMoves[currentStep - 1];
    if (!previousMove) return;
    pendingRef.current = true;
    pendingStepRef.current = currentStep - 1;
    setIsAnimating(true);
    setAnimMove(invertAlgorithm([previousMove])[0] ?? null);
  }, [isAnimating, currentStep, solutionMoves]);

  const handleAnimationComplete = useCallback(() => {
    pendingRef.current = false;
    setIsAnimating(false);
    setAnimMove(null);
    const targetStep = pendingStepRef.current;
    pendingStepRef.current = null;
    if (targetStep !== null) goToStep(targetStep);
  }, [goToStep]);

  if (!scrambledState || solutionMoves.length === 0) return null;

  if (!tutorialActive) {
    return (
      <div className={styles.tutorialLaunch}>
        <div className={styles.tutorialInfo}>
          <strong>Hướng dẫn từng bước</strong>
          <p>
            Xoay khối 3D để xem rõ từng nước xoay. Dùng các nút điều khiển để
            tự nghiệm bước tiếp theo.
          </p>
        </div>
        <button className={styles.tutorialStartButton} onClick={start} type="button">
          Xem hướng dẫn từng bước
        </button>
      </div>
    );
  }

  const currentMove = currentStep < solutionMoves.length
    ? solutionMoves[currentStep]
    : null;

  const displayMove = animMove ?? currentMove;

  return (
    <div className={styles.tutorial}>
      <div className={styles.tutorialHeader}>
        <div>
          <p>Hướng dẫn từng bước</p>
          <h3>
            Bước {currentStep}/{solutionMoves.length}
            {currentStep === solutionMoves.length
              ? " — Hoàn thành!"
              : displayMove
                ? ` — Thực hiện ${displayMove} (mặt ${FACE_LABELS[displayMove[0]] ?? displayMove[0]})`
                : ""}
          </h3>
        </div>
        <div className={styles.tutorialMeta}>
          <span>Thời gian giải: {Math.round(solvingTimeMs ?? 0)} ms</span>
          <span>{solutionMoves.length} bước</span>
        </div>
      </div>

      <div className={styles.tutorialCubeContainer} aria-label="Khối Rubik 3D hướng dẫn">
        <LazyRubiksCube
          cubeState={cubeState!}
          animatedMove={animMove}
          onAnimationComplete={handleAnimationComplete}
          onStickerClick={null}
        />
      </div>

      <div className={styles.tutorialMoves}>
        <ol className={styles.moves} aria-label="Chuỗi lời giải">
          {solutionMoves.map((move, index) => (
            <li
              aria-current={index === currentStep ? "step" : undefined}
              className={
                index < currentStep
                  ? styles.completed
                  : index === currentStep
                    ? styles.active
                    : undefined
              }
              key={`${index}-${move}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{move}</strong>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.controls}>
        <button
          disabled={currentStep <= 0 || isAnimating}
          onClick={stepBackward}
          type="button"
        >
          Bước trước
        </button>
        <button
          className={styles.playButton}
          disabled={currentStep >= solutionMoves.length || isAnimating}
          onClick={stepForward}
          type="button"
        >
          {isAnimating ? "Đang xoay…" : "Bước tiếp"}
        </button>
        <button
          disabled={currentStep <= 0 || isAnimating}
          onClick={() => goToStep(0)}
          type="button"
        >
          Home
        </button>
        <button onClick={stop} type="button">
          Thoát
        </button>
      </div>

      <label className={styles.progress}>
        <span>
          Tiến độ {currentStep}/{solutionMoves.length}
        </span>
        <input
          aria-label="Tiến độ lời giải"
          max={solutionMoves.length}
          min="0"
          onChange={(event) => {
            if (!isAnimating && !pendingRef.current) {
              goToStep(Number(event.target.value));
            }
          }}
          type="range"
          value={currentStep}
        />
      </label>

      <p className={styles.algorithm}>
        <span>WCA</span>
        <code>{formatAlgorithm(solutionMoves)}</code>
      </p>
    </div>
  );
}

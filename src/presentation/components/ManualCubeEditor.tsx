"use client";

import { useCallback, useState } from "react";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import type { CubeColor, Face } from "@/src/domain/cube";
import { LazyRubiksCube } from "./LazyRubiksCube";
import { ColorPalette } from "./ColorPalette";
import { ValidationSummary } from "./ValidationSummary";
import { SolverResult } from "./SolverResult";
import styles from "./ManualCubeEditor.module.css";

export function ManualCubeEditor() {
  const cubeState = useCubSolStore((state) => state.cubeState);
  const errorMessage = useCubSolStore((state) => state.errorMessage);
  const validationIssues = useCubSolStore(
    (state) => state.validationIssues,
  );
  const setSticker = useCubSolStore((state) => state.setSticker);
  const startManualEntry = useCubSolStore(
    (state) => state.startManualEntry,
  );
  const validateCube = useCubSolStore((state) => state.validateCube);
  const solveCurrentCube = useCubSolStore((state) => state.solveCurrentCube);
  const randomScramble = useCubSolStore((state) => state.randomScramble);
  const status = useCubSolStore((state) => state.status);
  const [selectedColor, setSelectedColor] = useState<CubeColor>("white");
  const [hasValidated, setHasValidated] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);

  const paintSticker = useCallback(
    (face: Face, index: number) => {
      setSticker(face, index, selectedColor);
      setHasValidated(false);
    },
    [selectedColor, setSticker],
  );

  function resetEditor() {
    startManualEntry();
    setSelectedColor("white");
    setHasValidated(false);
  }

  function runValidation() {
    validateCube();
    setHasValidated(true);
  }

  async function runSolver() {
    setHasValidated(true);
    await solveCurrentCube();
  }

  return (
    <section className={styles.editor} id="manual-entry" aria-labelledby="manual-title">
      <div className={styles.editorHeader}>
        <div>
          <p>Nhập màu thủ công</p>
          <h2 id="manual-title">Xoay khối 3D và chạm từng sticker để tô màu.</h2>
        </div>
        {!tutorialActive && (
          <button className={styles.resetButton} onClick={resetEditor} type="button">
            Đặt lại mẫu
          </button>
        )}
      </div>

      {!tutorialActive && (
        <div className={styles.workspace}>
          <div className={styles.cubeContainer} aria-label="Khối Rubik 3D tương tác">
            <LazyRubiksCube
              cubeState={cubeState!}
              onStickerClick={paintSticker}
            />
          </div>

          <aside className={styles.controls}>
            <ColorPalette
              onSelect={setSelectedColor}
              selectedColor={selectedColor}
            />
            <div className={styles.instructions}>
              <span>01</span>
              <p>Chọn màu trong palette.</p>
              <span>02</span>
              <p>Xoay khối và chạm sticker cần đổi. Tâm được khóa.</p>
              <span>03</span>
              <p>Kiểm tra đủ màu, cubie, orientation và parity.</p>
            </div>
            <button className={styles.validateButton} onClick={runValidation} type="button">
              Kiểm tra trạng thái
            </button>
            <button
              className={styles.scrambleButton}
              disabled={status === "SOLVING"}
              onClick={randomScramble}
              type="button"
            >
              Tự tô ngẫu nhiên
            </button>
            <button
              className={styles.solveButton}
              disabled={status === "SOLVING"}
              onClick={runSolver}
              type="button"
            >
              {status === "SOLVING"
                ? "Đang tìm lời giải…"
                : "Xác nhận & tìm lời giải"}
            </button>
            <ValidationSummary
              errorMessage={errorMessage}
              isValid={hasValidated && validationIssues.length === 0 && !errorMessage}
              issues={validationIssues}
            />
          </aside>
        </div>
      )}

      <SolverResult
        onTutorialStart={() => setTutorialActive(true)}
        onTutorialExit={() => setTutorialActive(false)}
      />
    </section>
  );
}

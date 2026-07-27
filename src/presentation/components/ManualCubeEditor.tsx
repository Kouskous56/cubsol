"use client";

import { useState } from "react";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import {
  FACES,
  type CubeColor,
  type Face,
} from "@/src/domain/cube";
import { ColorPalette } from "./ColorPalette";
import { FaceGrid } from "./FaceGrid";
import { ValidationSummary } from "./ValidationSummary";
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
  const [selectedColor, setSelectedColor] = useState<CubeColor>("white");
  const [hasValidated, setHasValidated] = useState(false);

  function paintSticker(face: Face, index: number) {
    setSticker(face, index, selectedColor);
    setHasValidated(false);
  }

  function resetEditor() {
    startManualEntry();
    setSelectedColor("white");
    setHasValidated(false);
  }

  function runValidation() {
    validateCube();
    setHasValidated(true);
  }

  if (!cubeState) {
    return (
      <section className={styles.launch} id="manual-entry">
        <p>Tuần 3 · Nhập màu thủ công</p>
        <h2>Tự tay mô tả chính xác khối Rubik của bạn.</h2>
        <p>
          Sáu màu tâm được cố định theo chuẩn. Chọn một màu, sau đó chạm vào
          từng sticker để cập nhật.
        </p>
        <button onClick={resetEditor} type="button">
          Mở bảng nhập 6 mặt
        </button>
      </section>
    );
  }

  return (
    <section className={styles.editor} id="manual-entry" aria-labelledby="manual-title">
      <div className={styles.editorHeader}>
        <div>
          <p>Tuần 3 · Manual Input</p>
          <h2 id="manual-title">Nhập 54 sticker, kiểm tra ngay trên thiết bị.</h2>
        </div>
        <button className={styles.resetButton} onClick={resetEditor} type="button">
          Đặt lại mẫu
        </button>
      </div>

      <div className={styles.workspace}>
        <div className={styles.faces} aria-label="Sáu mặt Rubik">
          {FACES.map((face) => (
            <FaceGrid
              colors={cubeState[face]}
              face={face}
              key={face}
              onPaint={paintSticker}
            />
          ))}
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
            <p>Chạm sticker cần đổi. Ô tâm được khóa.</p>
            <span>03</span>
            <p>Kiểm tra đủ màu, cubie, orientation và parity.</p>
          </div>
          <button className={styles.validateButton} onClick={runValidation} type="button">
            Kiểm tra trạng thái
          </button>
          <ValidationSummary
            errorMessage={errorMessage}
            isValid={hasValidated && validationIssues.length === 0 && !errorMessage}
            issues={validationIssues}
          />
        </aside>
      </div>
    </section>
  );
}

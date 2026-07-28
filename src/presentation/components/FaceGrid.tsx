import type {
  CubeColor,
  Face,
  FaceColors,
} from "@/src/domain/cube";
import styles from "./ManualCubeEditor.module.css";

const FACE_LABELS: Record<Face, string> = {
  U: "Trên",
  R: "Phải",
  F: "Trước",
  D: "Dưới",
  L: "Trái",
  B: "Sau",
};

interface FaceGridProps {
  colors: FaceColors;
  face: Face;
  onPaint: (face: Face, index: number) => void;
}

export function FaceGrid({ colors, face, onPaint }: FaceGridProps) {
  return (
    <fieldset className={styles.face}>
      <legend>
        <span>{face}</span>
        Mặt {FACE_LABELS[face]}
      </legend>
      <div className={styles.stickerGrid}>
        {colors.map((color: CubeColor, index) => {
          const isCenter = index === 4;
          return (
            <button
              aria-label={`${face}${index + 1}: ${color}${isCenter ? ", tâm cố định" : ""}`}
              className={styles.sticker}
              data-color={color}
              disabled={isCenter}
              key={`${face}-${index}`}
              onClick={() => onPaint(face, index)}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

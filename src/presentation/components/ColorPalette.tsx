import { CUBE_COLORS, type CubeColor } from "@/src/domain/cube";
import styles from "./ManualCubeEditor.module.css";

const COLOR_LABELS: Record<CubeColor, string> = {
  white: "Trắng",
  red: "Đỏ",
  green: "Xanh lá",
  yellow: "Vàng",
  orange: "Cam",
  blue: "Xanh dương",
};

interface ColorPaletteProps {
  selectedColor: CubeColor;
  onSelect: (color: CubeColor) => void;
}

export function ColorPalette({
  selectedColor,
  onSelect,
}: ColorPaletteProps) {
  return (
    <fieldset className={styles.palette}>
      <legend>Bảng màu</legend>
      <div className={styles.paletteOptions}>
        {CUBE_COLORS.map((color) => (
          <button
            aria-label={`Chọn màu ${COLOR_LABELS[color]}`}
            aria-pressed={selectedColor === color}
            className={styles.paletteButton}
            data-color={color}
            key={color}
            onClick={() => onSelect(color)}
            type="button"
          >
            <span aria-hidden="true" />
            {COLOR_LABELS[color]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

import type { CubeValidationIssue } from "@/src/domain/cube";
import styles from "./ManualCubeEditor.module.css";

interface ValidationSummaryProps {
  errorMessage: string | null;
  issues: readonly CubeValidationIssue[];
  isValid: boolean;
}

export function ValidationSummary({
  errorMessage,
  issues,
  isValid,
}: ValidationSummaryProps) {
  if (isValid) {
    return (
      <div className={styles.validMessage} role="status">
        <strong>Trạng thái hợp lệ</strong>
        <span>54 sticker tạo thành một khối Rubik có thể giải.</span>
      </div>
    );
  }

  if (!errorMessage) return null;

  return (
    <div className={styles.errorSummary} role="alert">
      <strong>{errorMessage}</strong>
      {issues.length > 0 && (
        <ul>
          {issues.map((issue) => (
            <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

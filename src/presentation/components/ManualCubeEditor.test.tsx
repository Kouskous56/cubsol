import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import { ManualCubeEditor } from "./ManualCubeEditor";

vi.mock("./LazyRubiksCube", () => ({
  LazyRubiksCube: vi.fn(() => (
    <div data-testid="mock-rubiks-cube" aria-label="Khối Rubik 3D tương tác" />
  )),
}));

describe("ManualCubeEditor", () => {
  beforeEach(() => {
    useCubSolStore.getState().clearSession();
  });

  it("renders the 3D cube automatically on mount", () => {
    render(<ManualCubeEditor />);

    expect(
      screen.getByTestId("mock-rubiks-cube"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Kiểm tra trạng thái" }),
    ).toBeInTheDocument();
  });

  it("keeps the blank template invalid after resetting", () => {
    render(<ManualCubeEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại mẫu" }));
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra trạng thái" }));

    expect(screen.getByRole("alert")).toHaveTextContent("chưa hợp lệ");
  });

  it("marks the blank cube as invalid and shows color count errors", () => {
    render(<ManualCubeEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra trạng thái" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/sticker|màu/i);
  });

  it("shows the giải button and enables it initially", () => {
    render(<ManualCubeEditor />);

    expect(
      screen.getByRole("button", { name: "Xác nhận & tìm lời giải" }),
    ).toBeEnabled();
  });
});

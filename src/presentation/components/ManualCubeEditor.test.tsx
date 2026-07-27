import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import { ManualCubeEditor } from "./ManualCubeEditor";

describe("ManualCubeEditor", () => {
  beforeEach(() => {
    useCubSolStore.getState().clearSession();
  });

  it("opens six accessible face grids with locked centers", () => {
    render(<ManualCubeEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Mở bảng nhập 6 mặt" }));

    const grids = screen.getByLabelText("Sáu mặt Rubik");
    expect(within(grids).getAllByRole("group")).toHaveLength(6);
    expect(
      screen.getByRole("button", { name: /U5: white, tâm cố định/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /U1: white/i }),
    ).toBeEnabled();
  });

  it("paints a sticker with the selected color and reports count errors", () => {
    render(<ManualCubeEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Mở bảng nhập 6 mặt" }));
    fireEvent.click(screen.getByRole("button", { name: "Chọn màu Đỏ" }));
    fireEvent.click(screen.getByRole("button", { name: /^U1: white$/i }));
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra trạng thái" }));

    expect(
      screen.getByRole("button", { name: /^U1: red$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("chưa hợp lệ");
    expect(screen.getByRole("alert")).toHaveTextContent(/8\/9 sticker|10\/9 sticker/);
  });

  it("accepts the solved template as a physically valid cube", () => {
    render(<ManualCubeEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Mở bảng nhập 6 mặt" }));
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra trạng thái" }));

    expect(screen.getByRole("status")).toHaveTextContent("Trạng thái hợp lệ");
  });
});

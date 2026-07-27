import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCubSolStore } from "@/src/application/store/cubsolStore";
import { CubSolHome } from "./CubSolHome";

describe("CubSolHome", () => {
  beforeEach(() => {
    useCubSolStore.getState().clearSession();
  });

  it("presents the Week 1 product state without fake functional controls", () => {
    render(<CubSolHome />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Từ khối Rubik đang rối/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sẵn sàng nền tảng")).toBeInTheDocument();
    expect(screen.getAllByText("Sắp ra mắt")).toHaveLength(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("exposes meaningful navigation and cube illustration labels", () => {
    render(<CubSolHome />);

    expect(
      screen.getByRole("link", { name: /Xem phương thức nhập/i }),
    ).toHaveAttribute("href", "#input-methods");
    expect(
      screen.getByRole("img", { name: /Minh họa khối Rubik CubSol/i }),
    ).toBeInTheDocument();
  });
});

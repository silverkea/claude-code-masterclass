import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "@/components/Loader";

describe("Loader", () => {
  it("renders three dots", () => {
    render(<Loader />);
    expect(document.querySelectorAll("[class*='dot']")).toHaveLength(3);
  });

  it("renders a status container", () => {
    render(<Loader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

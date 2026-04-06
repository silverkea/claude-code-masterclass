import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";

describe("HeistCardSkeleton", () => {
  it("renders without throwing", () => {
    expect(() => render(<HeistCardSkeleton />)).not.toThrow();
  });

  it("renders a card container", () => {
    const { container } = render(<HeistCardSkeleton />);
    expect(container.querySelector("[class*='card']")).not.toBeNull();
  });

  it("renders at least 3 placeholder line elements", () => {
    const { container } = render(<HeistCardSkeleton />);
    const lines = container.querySelectorAll("[class*='line']");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });
});

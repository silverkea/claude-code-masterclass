import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeistDetailSkeleton from "@/components/HeistDetailSkeleton";

describe("HeistDetailSkeleton", () => {
  it("renders without error", () => {
    const { container } = render(<HeistDetailSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });
});

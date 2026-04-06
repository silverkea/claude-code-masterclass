import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ExpiredHeistCardSkeleton from "@/components/ExpiredHeistCardSkeleton";

describe("ExpiredHeistCardSkeleton", () => {
  it("renders without error", () => {
    const { container } = render(<ExpiredHeistCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });
});

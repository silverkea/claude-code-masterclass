import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import HeistCountdown from "@/components/HeistCountdown";

const NOW = new Date("2026-01-01T12:00:00Z").getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("HeistCountdown", () => {
  it("renders digit blocks for days, hours, minutes, seconds when deadline is in the future", () => {
    const deadline = new Date(
      NOW + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
    ); // 2d 3h
    render(<HeistCountdown deadline={deadline} />);
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("H")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("renders EXPIRED when deadline is in the past", () => {
    const deadline = new Date(NOW - 1000);
    render(<HeistCountdown deadline={deadline} />);
    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });

  it("does not render digit blocks when expired", () => {
    const deadline = new Date(NOW - 1000);
    render(<HeistCountdown deadline={deadline} />);
    expect(screen.queryByText("D")).not.toBeInTheDocument();
  });

  it("updates the countdown after 1 second", () => {
    const deadline = new Date(NOW + 65 * 1000); // 1m 5s
    render(<HeistCountdown deadline={deadline} />);

    // Find the seconds value before tick
    const secondsBefore = screen.getByLabelText("seconds").textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const secondsAfter = screen.getByLabelText("seconds").textContent;
    expect(Number(secondsAfter)).toBe(Number(secondsBefore) - 1);
  });

  it("transitions to EXPIRED when deadline passes while mounted", () => {
    const deadline = new Date(NOW + 500); // expires in 0.5s
    render(<HeistCountdown deadline={deadline} />);
    expect(screen.queryByText(/expired/i)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });

  it("clears the interval on unmount", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const deadline = new Date(NOW + 60 * 1000);
    const { unmount } = render(<HeistCountdown deadline={deadline} />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});

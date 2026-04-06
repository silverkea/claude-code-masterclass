import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Heist } from "@/types/firestore/heist";
import HeistCard from "@/components/HeistCard";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const NOW = new Date("2026-01-01T12:00:00Z").getTime();

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "test-id",
    title: "The Big Score",
    description: "Rob the vault",
    createdBy: "user-1",
    createdByCodename: "NightOwl",
    assignedTo: "user-2",
    assignedToCodename: "SecretSauceAgent",
    deadline: new Date(NOW + 8 * 60 * 60 * 1000), // 8 hours from now
    finalStatus: null,
    createdAt: new Date(NOW - 24 * 60 * 60 * 1000),
    ...overrides,
  };
}

describe("HeistCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the heist title", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText("The Big Score")).toBeInTheDocument();
  });

  it("renders the assignee codename when assignedToCodename is set", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText("SecretSauceAgent")).toBeInTheDocument();
  });

  it("renders Unassigned when assignedToCodename is null", () => {
    render(
      <HeistCard
        heist={makeHeist({ assignedTo: null, assignedToCodename: null })}
      />,
    );
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("renders the creator codename", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText("NightOwl")).toBeInTheDocument();
  });

  it("renders a formatted date string", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it("renders time remaining", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText(/left/)).toBeInTheDocument();
  });

  it("clock icon does NOT have clockUrgent class when deadline is >= 4 hours away", () => {
    const { container } = render(
      <HeistCard
        heist={makeHeist({ deadline: new Date(NOW + 8 * 60 * 60 * 1000) })}
      />,
    );
    expect(container.querySelector("[class*='clockUrgent']")).toBeNull();
  });

  it("clock icon DOES have clockUrgent class when deadline is < 4 hours away", () => {
    const { container } = render(
      <HeistCard
        heist={makeHeist({ deadline: new Date(NOW + 2 * 60 * 60 * 1000) })}
      />,
    );
    expect(container.querySelector("[class*='clockUrgent']")).not.toBeNull();
  });

  it("card contains a link to /heists/:id", () => {
    render(<HeistCard heist={makeHeist()} />);
    const link = screen.getByRole("link", { name: "The Big Score" });
    expect(link).toHaveAttribute("href", "/heists/test-id");
  });
});

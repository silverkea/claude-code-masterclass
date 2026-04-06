import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SettledHeist } from "@/types/firestore/heist";
import ExpiredHeistCard from "@/components/ExpiredHeistCard";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    id,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    id?: string;
  }) => (
    <a href={href} className={className} id={id}>
      {children}
    </a>
  ),
}));

const NOW = new Date("2026-01-01T12:00:00Z").getTime();

function makeHeist(overrides: Partial<SettledHeist> = {}): SettledHeist {
  return {
    id: "test-id",
    title: "The Big Score",
    description: "Rob the vault",
    createdBy: "user-1",
    createdByCodename: "NightOwl",
    assignedTo: "user-2",
    assignedToCodename: "SecretSauceAgent",
    deadline: new Date(NOW - 2 * 60 * 60 * 1000),
    finalStatus: "success",
    createdAt: new Date(NOW - 48 * 60 * 60 * 1000),
    ...overrides,
  };
}

describe("ExpiredHeistCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the heist title", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    expect(screen.getByText("The Big Score")).toBeInTheDocument();
  });

  it("renders the assignee codename when assignedToCodename is set", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    expect(screen.getByText("SecretSauceAgent")).toBeInTheDocument();
  });

  it("renders Unassigned when assignedToCodename is null", () => {
    render(
      <ExpiredHeistCard
        heist={makeHeist({ assignedTo: null, assignedToCodename: null })}
      />,
    );
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("renders the creator codename", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    expect(screen.getByText("NightOwl")).toBeInTheDocument();
  });

  it("renders a formatted deadline date string", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    expect(screen.getByText(/Jan 1,.*\d{2}:\d{2} (AM|PM)/)).toBeInTheDocument();
  });

  it("renders SUCCESS badge for finalStatus success", () => {
    const { container } = render(
      <ExpiredHeistCard heist={makeHeist({ finalStatus: "success" })} />,
    );
    expect(screen.getByText(/success/i)).toBeInTheDocument();
    expect(container.querySelector("[class*='successBadge']")).not.toBeNull();
  });

  it("renders FAILURE badge for finalStatus failure", () => {
    const { container } = render(
      <ExpiredHeistCard heist={makeHeist({ finalStatus: "failure" })} />,
    );
    expect(screen.getByText(/failure/i)).toBeInTheDocument();
    expect(container.querySelector("[class*='failureBadge']")).not.toBeNull();
  });

  it("card title links to /heists/:id", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    const link = screen.getByRole("link", { name: "The Big Score" });
    expect(link).toHaveAttribute("href", "/heists/test-id");
  });
});

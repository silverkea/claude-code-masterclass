import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useUser } from "@/context/AuthContext";

import Navbar from "@/components/Navbar";

vi.mock("@/lib/firebase", () => ({ auth: {} }));
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }));
vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }));

const mockUseUser = vi.mocked(useUser);
const mockSignOut = vi.mocked(signOut);

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUser.mockReturnValue({ user: null, loading: false });
});

describe("Navbar", () => {
  it("renders the main heading", () => {
    render(<Navbar />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Create Heist link", () => {
    render(<Navbar />);
    const createLink = screen.getByRole("link", { name: /create heist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/heists/create");
  });

  it("renders the logout button when a user is signed in", () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("does not render the logout button when signed out", () => {
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render the logout button while auth is loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("disables the logout button and calls signOut when clicked", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    mockSignOut.mockReturnValue(new Promise(() => {}));
    render(<Navbar />);
    const button = screen.getByRole("button", { name: /logout/i });
    await userEvent.click(button);
    expect(mockSignOut).toHaveBeenCalledWith({});
    expect(button).toBeDisabled();
  });

  it("re-enables the logout button if sign-out fails", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    mockSignOut.mockRejectedValue(new Error("network error"));
    render(<Navbar />);
    const button = screen.getByRole("button", { name: /logout/i });
    await userEvent.click(button);
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("hides the logout button after successful sign-out", () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    const { rerender } = render(<Navbar />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    mockUseUser.mockReturnValue({ user: null, loading: false });
    rerender(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });
});

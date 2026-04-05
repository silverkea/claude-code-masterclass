import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/AuthContext";
import { User } from "firebase/auth";
import DashboardLayout from "@/app/(dashboard)/layout";

vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@/components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));
vi.mock("@/components/Loader", () => ({
  default: () => <div data-testid="loader" />,
}));

const mockUseUser = vi.mocked(useUser);
const mockUseRouter = vi.mocked(useRouter);
let mockReplace: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockReplace = vi.fn();
  mockUseRouter.mockReturnValue({ replace: mockReplace } as never);
  mockUseUser.mockReturnValue({ user: null, loading: false });
});

describe("DashboardLayout", () => {
  it("shows the loader while auth is loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("shows the loader and redirects a signed-out user to /", () => {
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("renders navbar and children for a signed-in user", () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    render(<DashboardLayout>content</DashboardLayout>);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });
});

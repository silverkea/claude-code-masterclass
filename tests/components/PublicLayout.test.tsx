import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/AuthContext";
import { User } from "firebase/auth";
import PublicLayout from "@/app/(public)/layout";

vi.mock("@/context/AuthContext", () => ({ useUser: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));
vi.mock("@/components/Loader", () => ({
  default: () => <div data-testid="loader" />,
}));

const mockUseUser = vi.mocked(useUser);
const mockUsePathname = vi.mocked(usePathname);
const mockUseRouter = vi.mocked(useRouter);
let mockReplace: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockReplace = vi.fn();
  mockUseRouter.mockReturnValue({ replace: mockReplace } as never);
  mockUsePathname.mockReturnValue("/login");
  mockUseUser.mockReturnValue({ user: null, loading: false });
});

describe("PublicLayout", () => {
  it("shows the loader while auth is loading", () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("renders children for a signed-out user", () => {
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("shows the loader and redirects a signed-in user to /heists", async () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/heists");
  });

  it("renders children for a signed-in user on /preview", () => {
    mockUseUser.mockReturnValue({ user: { uid: "1" } as User, loading: false });
    mockUsePathname.mockReturnValue("/preview");
    render(<PublicLayout>content</PublicLayout>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });
});

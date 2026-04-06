import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onAuthStateChanged, User } from "firebase/auth";
import { AuthProvider, useUser } from "@/context/AuthContext";

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);

beforeEach(() => {
  mockOnAuthStateChanged.mockReset();
});

function TestConsumer() {
  const { user, loading } = useUser();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "null"}</span>
    </div>
  );
}

describe("useUser", () => {
  it("throws when used outside of AuthProvider", () => {
    const TestComponent = () => {
      useUser();
      return null;
    };
    expect(() => render(<TestComponent />)).toThrow(
      "useUser must be used within an AuthProvider",
    );
  });

  it("returns { user: null, loading: false } when auth resolves to no user", () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      (callback as (user: User | null) => void)(null);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("returns { user: mockUser, loading: false } when auth resolves to a signed-in user", () => {
    const mockUser = { uid: "test-uid", email: "test@example.com" } as User;

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      (callback as (user: User | null) => void)(mockUser);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("test@example.com");
  });

  it("loading is true before the first onAuthStateChanged callback fires", () => {
    mockOnAuthStateChanged.mockImplementation(() => vi.fn());

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

import AuthForm from "@/components/AuthForm";

vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  setDoc: vi.fn(),
  doc: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/lib/codename", () => ({
  generateCodename: () => "SwiftFoxVault",
}));

const mockCreateUser = vi.mocked(createUserWithEmailAndPassword);
const mockUpdateProfile = vi.mocked(updateProfile);
const mockSetDoc = vi.mocked(setDoc);
const mockSignIn = vi.mocked(signInWithEmailAndPassword);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthForm", () => {
  it("renders login mode with email, password, and Log In button", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Log In" })).toBeDefined();
  });

  it("renders signup mode with email, password, and Sign Up button", () => {
    render(<AuthForm mode="signup" />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });

  it("toggles password visibility when toggle button is clicked", () => {
    render(<AuthForm mode="login" />);
    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", {
      name: /toggle password/i,
    });

    expect(passwordInput.getAttribute("type")).toBe("password");
    fireEvent.click(toggleButton);
    expect(passwordInput.getAttribute("type")).toBe("text");
  });

  it("does not clear password value when toggling visibility", () => {
    render(<AuthForm mode="login" />);
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", {
      name: /toggle password/i,
    });

    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(toggleButton);
    expect(passwordInput.value).toBe("secret123");
  });
});

describe("AuthForm login", () => {
  function fillAndSubmitLogin() {
    render(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Log In" }).closest("form")!,
    );
  }

  it("calls signInWithEmailAndPassword with entered credentials", async () => {
    mockSignIn.mockResolvedValue({} as never);
    fillAndSubmitLogin();
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "password123",
      );
    });
  });

  it("shows an inline success message after successful login", async () => {
    mockSignIn.mockResolvedValue({} as never);
    fillAndSubmitLogin();
    await waitFor(() => {
      expect(screen.getByText("You're logged in!")).toBeDefined();
    });
  });

  it("clears both fields after successful login", async () => {
    mockSignIn.mockResolvedValue({} as never);
    fillAndSubmitLogin();
    await waitFor(() => {
      expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
        "",
      );
      expect(
        (screen.getByLabelText("Password") as HTMLInputElement).value,
      ).toBe("");
    });
  });

  it("shows a specific error for invalid credentials", async () => {
    mockSignIn.mockRejectedValue({ code: "auth/invalid-credential" });
    fillAndSubmitLogin();
    await waitFor(() => {
      expect(screen.getByText("Incorrect email or password.")).toBeDefined();
    });
  });

  it("shows a generic error for non-credential failures", async () => {
    mockSignIn.mockRejectedValue({ code: "auth/network-request-failed" });
    fillAndSubmitLogin();
    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeDefined();
    });
  });

  it("disables the submit button while login is in progress", async () => {
    mockSignIn.mockReturnValue(new Promise(() => {}));
    fillAndSubmitLogin();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Logging in…" }),
      ).toHaveProperty("disabled", true);
    });
  });

  it("shows loading text on button while login is in progress", async () => {
    mockSignIn.mockReturnValue(new Promise(() => {}));
    fillAndSubmitLogin();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Logging in…" })).toBeDefined();
    });
  });
});

describe("AuthForm signup", () => {
  function fillAndSubmit() {
    render(<AuthForm mode="signup" />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign Up" }).closest("form")!,
    );
  }

  it("calls createUserWithEmailAndPassword with entered email and password", async () => {
    const mockUser = { uid: "uid-123" };
    mockCreateUser.mockResolvedValue({ user: mockUser } as never);
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);

    fillAndSubmit();

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        {},
        "test@example.com",
        "password123",
      );
    });
  });

  it("writes a Firestore doc with id and codename after successful signup", async () => {
    const mockUser = { uid: "uid-123" };
    mockCreateUser.mockResolvedValue({ user: mockUser } as never);
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);

    fillAndSubmit();

    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalledWith(
        undefined, // doc() is mocked and returns undefined
        { id: "uid-123", codename: "SwiftFoxVault" },
      );
      const setDocCall = mockSetDoc.mock.calls[0][1] as Record<string, unknown>;
      expect(setDocCall).not.toHaveProperty("email");
    });
  });

  it("renders an error message when createUserWithEmailAndPassword rejects", async () => {
    mockCreateUser.mockRejectedValue({ code: "auth/email-already-in-use" });

    fillAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText("An account with this email already exists."),
      ).toBeDefined();
    });
  });

  it("disables the submit button while signup is in progress", async () => {
    mockCreateUser.mockReturnValue(new Promise(() => {}));

    fillAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Signing up…" }),
      ).toHaveProperty("disabled", true);
    });
  });
});

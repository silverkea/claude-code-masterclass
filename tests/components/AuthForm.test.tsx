import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

import AuthForm from "@/components/AuthForm";

vi.mock("@/lib/firebase", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
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
      expect(screen.getByRole("button", { name: "Sign Up" })).toHaveProperty(
        "disabled",
        true,
      );
    });
  });
});

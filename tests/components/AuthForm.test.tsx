import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import AuthForm from "@/components/AuthForm";

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

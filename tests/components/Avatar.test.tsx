import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

// component imports for avatar
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeDefined()
  })

  it("uppercases the first letter of a lowercase name", () => {
    render(<Avatar name="terry" />)
    expect(screen.getByText("T")).toBeDefined()
  })

  it("shows first 2 uppercase letters for PascalCase names", () => {
    render(<Avatar name="PocketHeist" />)
    expect(screen.getByText("PH")).toBeDefined()
  })

  it("handles single-word PascalCase (only one uppercase letter)", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeDefined()
  })
})

import { describe, it, expect } from "vitest"
import { generateCodename } from "@/lib/codename"

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(generateCodename().length).toBeGreaterThan(0)
  })

  it("returns a PascalCase string composed of exactly three capitalised words", () => {
    const codename = generateCodename()
    // Matches e.g. SwiftFoxVault — three segments each starting with a capital letter
    expect(codename).toMatch(/^([A-Z][a-z]+){3}$/)
  })

  it("can return different values on successive calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => generateCodename()))
    expect(results.size).toBeGreaterThan(1)
  })
})

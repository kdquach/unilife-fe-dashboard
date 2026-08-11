import { describe, it, expect } from "vitest";
import { formatDateTime, formatDate, normalizePhone } from "../format";

describe("format utilities", () => {
  it("should format dateTime in Vietnam timezone or return dash if falsy", () => {
    expect(formatDateTime(null)).toBe("-");
    expect(formatDateTime(undefined)).toBe("-");
    expect(formatDateTime("2026-08-11T12:00:00Z")).toContain("2026");
  });

  it("should format date correctly", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("2026-08-11")).toBe("11/08/2026");
  });

  it("should normalize phone number removing spaces", () => {
    expect(normalizePhone("0988 776 655")).toBe("0988776655");
    expect(normalizePhone("  0901 234 567  ")).toBe("0901234567");
    expect(normalizePhone("")).toBe("");
  });
});

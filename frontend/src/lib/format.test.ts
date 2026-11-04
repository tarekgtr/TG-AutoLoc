import { describe, expect, it } from "vitest";
import { formatPhone, formatPrice, localized } from "./format";

describe("formatPrice", () => {
  it("formats dinars per locale with Latin digits", () => {
    expect(formatPrice(4500, "fr").replace(/\s/g, " ")).toBe("4 500 DA");
    expect(formatPrice(4500, "ar")).toMatch(/^4.?500 دج$/);
  });
});

describe("formatPhone", () => {
  it("groups Algerian numbers", () => {
    expect(formatPhone("213552123456")).toBe("+213 552 12 34 56");
  });
  it("prefixes other international numbers", () => {
    expect(formatPhone("33612345678")).toBe("+33612345678");
  });
});

describe("localized", () => {
  const car = { descriptionFr: "Bonjour", descriptionAr: "مرحبا" };
  it("picks the current language", () => {
    expect(localized(car, "description", "fr")).toBe("Bonjour");
    expect(localized(car, "description", "ar")).toBe("مرحبا");
  });
  it("falls back to the other language", () => {
    expect(localized({ descriptionFr: "Bonjour", descriptionAr: null }, "description", "ar")).toBe("Bonjour");
    expect(localized({ descriptionFr: null, descriptionAr: null }, "description", "fr")).toBeNull();
  });
});

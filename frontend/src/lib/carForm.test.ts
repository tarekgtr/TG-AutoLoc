import { describe, expect, it } from "vitest";
import { initialCarForm, maxYear, toCarRequest, validateCarForm } from "./carForm";

const valid = { ...initialCarForm(), brand: "Renault", model: "Clio 5", year: "2023", dailyPrice: "5000" };

describe("validateCarForm", () => {
  it("accepts a valid vehicle", () => {
    expect(validateCarForm(valid)).toEqual({});
  });

  it("reports the same codes as the backend", () => {
    const errors = validateCarForm({
      ...valid,
      brand: " ",
      model: "x".repeat(81),
      year: String(maxYear() + 1),
      dailyPrice: "-1",
      seats: "12",
    });
    expect(errors).toEqual({
      brand: "required",
      model: "too_long",
      year: "year_range",
      dailyPrice: "price_range",
      seats: "seats_range",
    });
  });

  it("allows an empty price (price on request)", () => {
    expect(validateCarForm({ ...valid, dailyPrice: "" })).toEqual({});
  });
});

describe("toCarRequest", () => {
  it("trims text and converts numbers", () => {
    const req = toCarRequest({ ...valid, brand: "  Renault ", dailyPrice: "", descriptionFr: "   " });
    expect(req).toMatchObject({ brand: "Renault", year: 2023, seats: 5, dailyPrice: null, descriptionFr: null });
  });
});

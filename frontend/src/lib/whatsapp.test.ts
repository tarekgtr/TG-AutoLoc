import { describe, expect, it } from "vitest";
import { contactMessage, normalizeWhatsAppNumber, rentalMessage, whatsAppUrl } from "./whatsapp";

describe("normalizeWhatsAppNumber", () => {
  it("keeps international digits only", () => {
    expect(normalizeWhatsAppNumber("213555000000")).toBe("213555000000");
    expect(normalizeWhatsAppNumber("+213 555 00 00 00")).toBe("213555000000");
  });

  it("rejects missing or implausible numbers", () => {
    expect(normalizeWhatsAppNumber(null)).toBeNull();
    expect(normalizeWhatsAppNumber("")).toBeNull();
    expect(normalizeWhatsAppNumber("12345")).toBeNull();
    expect(normalizeWhatsAppNumber("0555000000")).toBeNull(); // national format is not valid for wa.me
  });
});

describe("rentalMessage", () => {
  it("builds the French rental request with the selected vehicle", () => {
    expect(rentalMessage("fr", "Seat Ibiza (2020)")).toBe(
      "Bonjour TG AutoLoc, je souhaite louer cette voiture : Seat Ibiza (2020). Pouvez-vous me communiquer les disponibilités et les conditions de location ?",
    );
  });

  it("builds the Arabic rental request with the selected vehicle", () => {
    expect(rentalMessage("ar", "Seat Ibiza (2020)")).toBe(
      "السلام عليكم TG AutoLoc، أريد كراء هذه السيارة: Seat Ibiza (2020). هل يمكنكم إعلامي بالتوفر وشروط الكراء؟",
    );
  });

  it("asks about future availability instead of renting when the car is unavailable", () => {
    expect(rentalMessage("fr", "Seat Ibiza", false)).toContain("Quand sera-t-elle de nouveau disponible");
    expect(rentalMessage("fr", "Seat Ibiza", false)).not.toContain("je souhaite louer");
    expect(rentalMessage("ar", "Seat Ibiza", false)).toContain("متى ستكون متوفرة");
  });
});

describe("whatsAppUrl", () => {
  it("produces a wa.me link with an encoded message", () => {
    const url = whatsAppUrl("213555000000", rentalMessage("fr", "Peugeot 208 (2022)"));
    expect(url).not.toBeNull();
    const parsed = new URL(url!);
    expect(parsed.origin).toBe("https://wa.me");
    expect(parsed.pathname).toBe("/213555000000");
    expect(parsed.searchParams.get("text")).toBe(rentalMessage("fr", "Peugeot 208 (2022)"));
    expect(url).not.toMatch(/[ ?]text=.* /); // spaces are encoded
  });

  it("round-trips Arabic text through URL encoding", () => {
    const msg = contactMessage("ar");
    const url = whatsAppUrl("213555000000", msg)!;
    expect(url).toContain("%D8%A7"); // percent-encoded UTF-8
    expect(new URL(url).searchParams.get("text")).toBe(msg);
  });

  it("returns null when no number is configured", () => {
    expect(whatsAppUrl(null, "hello")).toBeNull();
    expect(whatsAppUrl("", "hello")).toBeNull();
  });
});

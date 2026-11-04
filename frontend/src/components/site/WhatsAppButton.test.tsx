import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import fr from "../../../messages/fr.json";
import ar from "../../../messages/ar.json";
import { WhatsAppButton } from "./WhatsAppButton";
import { rentalMessage, whatsAppUrl } from "@/lib/whatsapp";

function renderIn(locale: "fr" | "ar", ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "fr" ? fr : ar}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("WhatsAppButton", () => {
  it("opens the prefilled rental message in a new tab (French)", () => {
    const href = whatsAppUrl("213555000000", rentalMessage("fr", "Renault Clio 5 (2023)"));
    renderIn("fr", <WhatsAppButton href={href} label={fr.car.rent} />);
    const link = screen.getByRole("link", { name: /Louer cette voiture/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(text).toContain("je souhaite louer cette voiture : Renault Clio 5 (2023)");
  });

  it("uses the Arabic message on Arabic pages", () => {
    const href = whatsAppUrl("213555000000", rentalMessage("ar", "Renault Clio 5 (2023)"));
    renderIn("ar", <WhatsAppButton href={href} label={ar.car.rent} />);
    const link = screen.getByRole("link", { name: /استأجر هذه السيارة/ });
    expect(new URL(link.getAttribute("href")!).searchParams.get("text")).toContain("أريد كراء هذه السيارة: Renault Clio 5 (2023)");
  });

  it("is disabled with an explanation when no number is configured", () => {
    renderIn("fr", <WhatsAppButton href={null} label={fr.car.rent} />);
    expect(screen.queryByRole("link")).toBeNull();
    const button = screen.getByRole("button", { name: /Louer cette voiture/ });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveTextContent(fr.whatsapp.notConfigured);
  });
});

import type { CarDetail, CarRequest, FuelType, Transmission } from "@/lib/types";

/** Raw form state (strings for inputs). Rules mirror the backend Bean Validation constraints. */
export interface CarFormValues {
  brand: string;
  model: string;
  year: string;
  dailyPrice: string;
  transmission: Transmission;
  fuelType: FuelType;
  seats: string;
  descriptionFr: string;
  descriptionAr: string;
  available: boolean;
  featured: boolean;
}

export type CarFormErrors = Partial<Record<keyof CarFormValues, string>>;

export const MIN_YEAR = 1990;
export const maxYear = () => new Date().getFullYear() + 1;

export function initialCarForm(car?: CarDetail | null): CarFormValues {
  return {
    brand: car?.brand ?? "",
    model: car?.model ?? "",
    year: car ? String(car.year) : String(new Date().getFullYear()),
    dailyPrice: car?.dailyPrice != null ? String(car.dailyPrice) : "",
    transmission: car?.transmission ?? "MANUAL",
    fuelType: car?.fuelType ?? "PETROL",
    seats: car ? String(car.seats) : "5",
    descriptionFr: car?.descriptionFr ?? "",
    descriptionAr: car?.descriptionAr ?? "",
    available: car?.available ?? true,
    featured: car?.featured ?? false,
  };
}

/** @returns error codes per field (translated with admin.validation.*); empty when valid. */
export function validateCarForm(v: CarFormValues): CarFormErrors {
  const errors: CarFormErrors = {};
  if (!v.brand.trim()) errors.brand = "required";
  else if (v.brand.trim().length > 60) errors.brand = "too_long";
  if (!v.model.trim()) errors.model = "required";
  else if (v.model.trim().length > 80) errors.model = "too_long";

  const year = Number(v.year);
  if (!v.year.trim()) errors.year = "required";
  else if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear()) errors.year = "year_range";

  if (v.dailyPrice.trim()) {
    const price = Number(v.dailyPrice);
    if (!Number.isFinite(price) || price < 0 || price > 10_000_000) errors.dailyPrice = "price_range";
    else if (!/^\d+(\.\d{1,2})?$/.test(v.dailyPrice.trim())) errors.dailyPrice = "price_format";
  }

  const seats = Number(v.seats);
  if (!v.seats.trim()) errors.seats = "required";
  else if (!Number.isInteger(seats) || seats < 1 || seats > 9) errors.seats = "seats_range";

  if (v.descriptionFr.length > 5000) errors.descriptionFr = "too_long";
  if (v.descriptionAr.length > 5000) errors.descriptionAr = "too_long";
  return errors;
}

export function toCarRequest(v: CarFormValues): CarRequest {
  return {
    brand: v.brand.trim(),
    model: v.model.trim(),
    year: Number(v.year),
    dailyPrice: v.dailyPrice.trim() ? Number(v.dailyPrice) : null,
    transmission: v.transmission,
    fuelType: v.fuelType,
    seats: Number(v.seats),
    descriptionFr: v.descriptionFr.trim() || null,
    descriptionAr: v.descriptionAr.trim() || null,
    available: v.available,
    featured: v.featured,
  };
}

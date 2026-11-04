/** API contracts mirrored from the Spring Boot DTOs. */

export type Transmission = "MANUAL" | "AUTOMATIC";
export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC" | "LPG";

export const TRANSMISSIONS: Transmission[] = ["MANUAL", "AUTOMATIC"];
export const FUEL_TYPES: FuelType[] = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC", "LPG"];

export interface CarImage {
  id: number;
  url: string;
  main: boolean;
  position: number;
}

export interface CarSummary {
  id: number;
  slug: string;
  brand: string;
  model: string;
  year: number;
  dailyPrice: number | null;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  available: boolean;
  featured: boolean;
  mainImage: CarImage | null;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarDetail extends Omit<CarSummary, "imageCount"> {
  descriptionFr: string | null;
  descriptionAr: string | null;
  images: CarImage[];
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BusinessSettings {
  whatsappNumber: string | null;
  phoneNumber: string | null;
  secondaryPhone: string | null;
  email: string | null;
  locationFr: string | null;
  locationAr: string | null;
  openingHoursFr: string | null;
  openingHoursAr: string | null;
  mapsUrl: string | null;
  facebookUrl: string | null;
  updatedAt?: string;
}

export interface AdminStats {
  totalCars: number;
  availableCars: number;
  unavailableCars: number;
  addedLast30Days: number;
  recentCars: CarSummary[];
}

export interface CarRequest {
  brand: string;
  model: string;
  year: number;
  descriptionFr: string | null;
  descriptionAr: string | null;
  dailyPrice: number | null;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  available: boolean;
  featured: boolean;
}

export interface ApiErrorBody {
  status: number;
  code: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export type PublicSort = "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "YEAR_DESC" | "BRAND_ASC";
export const PUBLIC_SORTS: PublicSort[] = ["NEWEST", "PRICE_ASC", "PRICE_DESC", "YEAR_DESC", "BRAND_ASC"];

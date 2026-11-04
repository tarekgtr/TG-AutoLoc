/** Public catalogue filters, shared by the server page (parsing) and the client filter form. */
export interface FilterValues {
  q: string;
  brand: string;
  transmission: string;
  fuelType: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export const FILTER_KEYS: (keyof FilterValues)[] = ["q", "brand", "transmission", "fuelType", "minPrice", "maxPrice", "sort"];

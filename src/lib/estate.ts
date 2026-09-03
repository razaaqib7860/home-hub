import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import type { Database } from "@/integrations/supabase/types";

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];

export const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Plot",
  "Commercial",
] as const;

export const LISTING_TYPES = ["Sale", "Rent"] as const;
export const PROPERTY_STATUSES = ["Active", "Pending", "Sold"] as const;
export const INQUIRY_STATUSES = ["New", "Contacted", "Closed"] as const;

export const CITIES = [
  { name: "Ranchi", image: "/images/city-ranchi.jpg" },
  { name: "Delhi", image: "/images/city-delhi.jpg" },
  { name: "Mumbai", image: "/images/city-mumbai.jpg" },
  { name: "Bangalore", image: "/images/city-bangalore.jpg" },
  { name: "Hyderabad", image: "/images/city-hyderabad.jpg" },
];

export const TYPE_IMAGES: Record<string, string> = {
  Apartment: "/images/property-apartment-living.jpg",
  House: "/images/property-house-front.jpg",
  Villa: "/images/property-villa-lawn.jpg",
  Plot: "/images/property-plot-land.jpg",
  Commercial: "/images/property-commercial-office.jpg",
};

export function fallbackImage(propertyType: string) {
  return TYPE_IMAGES[propertyType] ?? "/images/property-terrace.jpg";
}

export function formatPrice(value: number, listingType?: string) {
  const suffix = listingType === "Rent" ? "/mo" : "";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr${suffix}`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L${suffix}`;
  return `₹${value.toLocaleString("en-IN")}${suffix}`;
}

export function formatArea(area: number) {
  return `${area.toLocaleString("en-IN")} sq.ft`;
}

export type PropertySearch = {
  location: string;
  city: string;
  listingType: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
};

export const propertySearchSchema = z.object({
  location: fallback(z.string(), "").default(""),
  city: fallback(z.string(), "").default(""),
  listingType: fallback(z.string(), "").default(""),
  propertyType: fallback(z.string(), "").default(""),
  minPrice: fallback(z.number(), 0).default(0),
  maxPrice: fallback(z.number(), 0).default(0),
  bedrooms: fallback(z.number(), 0).default(0),
});

export const parsePropertySearch = zodValidator(propertySearchSchema);

export const redirectSearchSchema = z.object({
  redirect: fallback(z.string(), "").default(""),
});

export const parseRedirectSearch = zodValidator(redirectSearchSchema);

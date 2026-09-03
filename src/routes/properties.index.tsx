import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  parsePropertySearch,
  type Property,
} from "@/lib/estate";

export const Route = createFileRoute("/properties/")({
  validateSearch: parsePropertySearch,
  head: () => ({
    meta: [
      { title: "Properties for Sale & Rent in India | EstateFlow" },
      {
        name: "description",
        content:
          "Filter verified apartments, villas, plots and commercial spaces by city, budget, bedrooms and listing type on EstateFlow.",
      },
      { property: "og:title", content: "Properties for Sale & Rent in India | EstateFlow" },
      {
        property: "og:description",
        content: "Filter verified Indian property listings by city, budget, bedrooms and type.",
      },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const { data: favoriteIds } = useFavoriteIds();
  const { toggle } = useToggleFavorite();

  const setSearch = (patch: Record<string, string | number>) => {
    void navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }) });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["properties", search],
    queryFn: async () => {
      let query = supabase.from("properties").select("*").eq("status", "Active");
      if (search.city) query = query.eq("city", search.city);
      if (search.listingType) query = query.eq("listing_type", search.listingType);
      if (search.propertyType) query = query.eq("property_type", search.propertyType);
      if (search.minPrice) query = query.gte("price", search.minPrice);
      if (search.maxPrice) query = query.lte("price", search.maxPrice);
      if (search.bedrooms) query = query.gte("bedrooms", search.bedrooms);
      if (search.location) {
        const term = `%${search.location}%`;
        query = query.or(`title.ilike.${term},location.ilike.${term},city.ilike.${term}`);
      }
      const { data: rows, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return rows as Property[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl font-semibold">Browse properties</h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading ? "Loading listings…" : `${data?.length ?? 0} listings match your filters.`}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <SlidersHorizontal className="size-4" /> Filters
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="q">Search</Label>
                <Input
                  id="q"
                  className="mt-1"
                  placeholder="Locality, city or title"
                  defaultValue={search.location}
                  onBlur={(e) => setSearch({ location: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSearch({ location: e.currentTarget.value });
                  }}
                />
              </div>

              <div>
                <Label>Listing type</Label>
                <Select
                  value={search.listingType || "any"}
                  onValueChange={(v) => setSearch({ listingType: v === "any" ? "" : v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        For {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Property type</Label>
                <Select
                  value={search.propertyType || "any"}
                  onValueChange={(v) => setSearch({ propertyType: v === "any" ? "" : v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="min">Min ₹</Label>
                  <Input
                    id="min"
                    className="mt-1"
                    type="number"
                    defaultValue={search.minPrice || ""}
                    onBlur={(e) => setSearch({ minPrice: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="max">Max ₹</Label>
                  <Input
                    id="max"
                    className="mt-1"
                    type="number"
                    defaultValue={search.maxPrice || ""}
                    onBlur={(e) => setSearch({ maxPrice: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>Bedrooms (min)</Label>
                <Select
                  value={String(search.bedrooms || 0)}
                  onValueChange={(v) => setSearch({ bedrooms: Number(v) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  void navigate({
                    to: ".",
                    search: {
                      location: "",
                      city: "",
                      listingType: "",
                      propertyType: "",
                      minPrice: 0,
                      maxPrice: 0,
                      bedrooms: 0,
                    },
                  })
                }
              >
                Reset filters
              </Button>
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : data && data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {data.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favoriteIds?.includes(property.id) ?? false}
                    onToggleFavorite={toggle}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                <p className="font-display text-xl font-semibold">No properties found</p>
                <p className="mt-2 text-muted-foreground">Try widening your filters or budget.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

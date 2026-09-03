import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bath, BedDouble, CheckCircle2, Heart, MapPin, Ruler } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyImage } from "@/components/PropertyImage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { fallbackImage, formatArea, formatPrice, type Property } from "@/lib/estate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({
    meta: [
      { title: "Property details | EstateFlow" },
      {
        name: "description",
        content: "See photos, pricing, amenities and contact details for this EstateFlow listing.",
      },
      { property: "og:title", content: "Property details | EstateFlow" },
      {
        property: "og:description",
        content: "Photos, pricing, amenities and direct enquiry for this EstateFlow listing.",
      },
    ],
  }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: favoriteIds } = useFavoriteIds();
  const { toggle } = useToggleFavorite();
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Property;
    },
  });

  const inquiry = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("inquiries").insert({
        property_id: id,
        user_id: user?.id ?? null,
        sender_name: form.name,
        sender_email: form.email,
        sender_phone: form.phone,
        message: form.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry sent — the owner will get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Property not found</h1>
          <Button asChild className="mt-6">
            <Link to="/properties" search={{}}>
              Back to listings
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isFavorite = favoriteIds?.includes(property.id) ?? false;
  const images = property.images.length > 0 ? property.images : [fallbackImage(property.property_type)];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex gap-2">
              <Badge className="bg-primary text-primary-foreground">For {property.listing_type}</Badge>
              <Badge variant="secondary">{property.property_type}</Badge>
              <Badge variant="outline">{property.status}</Badge>
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-4" /> {property.location}, {property.city}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold text-primary">
              {formatPrice(property.price, property.listing_type)}
            </p>
            <Button
              variant="outline"
              className="mt-3 gap-2"
              onClick={() => toggle(property.id, isFavorite)}
            >
              <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
              {isFavorite ? "Saved" : "Save property"}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <PropertyImage
                src={images[active]}
                fallback={fallbackImage(property.property_type)}
                alt={property.title}
                eager
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "size-20 shrink-0 overflow-hidden rounded-lg border-2",
                      i === active ? "border-primary" : "border-transparent",
                    )}
                  >
                    <PropertyImage
                      src={img}
                      fallback={fallbackImage(property.property_type)}
                      alt={`${property.title} photo ${i + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-5 text-center">
              <div>
                <BedDouble className="mx-auto size-5 text-primary" />
                <p className="mt-1 font-semibold">{property.bedrooms}</p>
                <p className="text-xs text-muted-foreground">Bedrooms</p>
              </div>
              <div>
                <Bath className="mx-auto size-5 text-primary" />
                <p className="mt-1 font-semibold">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Bathrooms</p>
              </div>
              <div>
                <Ruler className="mx-auto size-5 text-primary" />
                <p className="mt-1 font-semibold">{formatArea(property.area)}</p>
                <p className="text-xs text-muted-foreground">Built-up area</p>
              </div>
            </div>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold">About this property</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{property.description}</p>
            </section>

            {property.amenities.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-2xl font-semibold">Amenities</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {property.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4 text-leaf" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Enquire about this property</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                inquiry.mutate();
              }}
            >
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  className="mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-1"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  className="mt-1"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={4}
                  className="mt-1"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={inquiry.isPending}>
                {inquiry.isPending ? "Sending…" : "Send enquiry"}
              </Button>
            </form>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

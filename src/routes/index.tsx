import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { CITIES, PROPERTY_TYPES, TYPE_IMAGES, type Property } from "@/lib/estate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EstateFlow — Buy, Rent & List Property in India" },
      {
        name: "description",
        content:
          "Browse verified apartments, villas, plots and offices across Ranchi, Delhi, Mumbai, Bangalore and Hyderabad on EstateFlow.",
      },
      { property: "og:title", content: "EstateFlow — Buy, Rent & List Property in India" },
      {
        property: "og:description",
        content: "Verified homes, plots and offices across India. Search, save and enquire in minutes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as Property[];
    },
  });
  const { data: favoriteIds } = useFavoriteIds();
  const { toggle } = useToggleFavorite();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border">
        <img
          src="/images/why-keys.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-15"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> 14+ verified listings live today
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight font-semibold sm:text-6xl">
              Find a place that feels like your neighbourhood.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              EstateFlow brings together homes, plots and workspaces across India — with honest
              pricing, real photos and direct owner enquiries.
            </p>
          </div>
          <div className="mt-8 max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">Featured properties</h2>
            <p className="mt-1 text-muted-foreground">Fresh listings picked from across the country.</p>
          </div>
          <Button asChild variant="ghost" className="gap-1">
            <Link to="/properties" search={{}}>
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured?.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favoriteIds?.includes(property.id) ?? false}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-semibold">Popular locations</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {CITIES.map((city) => (
              <Link
                key={city.name}
                to="/properties"
                search={{ city: city.name }}
                className="group relative overflow-hidden rounded-2xl border border-border"
              >
                <img
                  src={city.image}
                  alt={`Property in ${city.name}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 font-display text-lg font-semibold text-white">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-semibold">Browse by property type</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PROPERTY_TYPES.map((type) => (
            <Link
              key={type}
              to="/properties"
              search={{ propertyType: type }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <img
                src={TYPE_IMAGES[type]}
                alt={type}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <p className="p-4 font-display text-lg font-semibold">{type}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified listings", body: "Every property is reviewed before it goes live." },
            { icon: KeyRound, title: "Direct enquiries", body: "Reach owners without middlemen or hidden fees." },
            { icon: Sparkles, title: "Saved searches", body: "Favourite homes and pick up where you left off." },
          ].map((item) => (
            <div key={item.title}>
              <item.icon className="size-8 text-primary" />
              <h3 className="mt-4 font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to list your property?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Create a free EstateFlow account, add your listing details and start receiving enquiries.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/register">Create free account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/properties" search={{}}>
              Browse listings
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

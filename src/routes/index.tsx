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

      {/* Hero — refined editorial luxury */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0">
          <img
            src="/images/hero-luxury.jpg"
            alt=""
            aria-hidden
            className="size-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </div>

        <div className="relative z-10 w-full max-w-4xl space-y-12 text-center">
          <header className="space-y-6 fade-up">
            <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-primary">
              EstateFlow &bull; The Curated Collection
            </span>
            <h1 className="font-display text-5xl font-light leading-[1.08] tracking-tight sm:text-7xl">
              Find a place that feels
              <br />
              like <span className="italic text-primary">your</span>{" "}
              <span className="font-semibold">neighbourhood.</span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground">
              Homes, plots and workspaces across India — with honest pricing, real photos and
              direct owner enquiries.
            </p>
          </header>

          <div className="mx-auto max-w-3xl fade-up">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured residences */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl font-light italic sm:text-4xl">
            Featured Residences
          </h2>
          <Link
            to="/properties"
            search={{}}
            className="border-b border-primary/40 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-primary hover:text-primary"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Popular locations */}
      <section className="border-y border-border bg-secondary/40 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 border-b border-border pb-6">
            <h2 className="font-display text-3xl font-light italic sm:text-4xl">
              Popular locations
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
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
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 font-display text-lg font-semibold text-white">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by type */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16 border-b border-border pb-6">
          <h2 className="font-display text-3xl font-light italic sm:text-4xl">
            Browse by property type
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <p className="p-4 font-display text-lg font-semibold">{type}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified listings", body: "Every property is reviewed before it goes live." },
            { icon: KeyRound, title: "Direct enquiries", body: "Reach owners without middlemen or hidden fees." },
            { icon: Sparkles, title: "Saved searches", body: "Favourite homes and pick up where you left off." },
          ].map((item) => (
            <div key={item.title}>
              <item.icon className="size-7 text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-xl font-medium">{item.title}</h3>
              <div className="mt-3 h-px w-10 bg-primary/50" />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-28 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-primary">
          List with us
        </span>
        <h2 className="mt-5 font-display text-3xl font-light sm:text-5xl">
          Ready to list <span className="italic">your property?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Create a free EstateFlow account, add your listing details and start receiving enquiries.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/register">Create free account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link to="/properties" search={{}}>
              Browse listings <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

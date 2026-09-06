import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, KeyRound, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/useFavorites";
import { useReveal } from "@/hooks/useReveal";
import { CITIES, PROPERTY_TYPES, TYPE_IMAGES, formatPrice, type Property } from "@/lib/estate";

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
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const onHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { innerWidth, innerHeight } = window;
    setParallax({
      x: (e.clientX / innerWidth - 0.5) * 18,
      y: (e.clientY / innerHeight - 0.5) * 12,
    });
  }, []);
  const featuredRef = useReveal<HTMLElement>();
  const citiesRef = useReveal<HTMLElement>();
  const typesRef = useReveal<HTMLElement>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — immersive animated luxury */}
      <section
        className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6"
        onMouseMove={onHeroMouseMove}
      >
        {/* Backdrop: photo + drifting warm light */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-luxury.jpg"
            alt=""
            aria-hidden
            className="size-full scale-105 object-cover opacity-40"
            style={{
              transform: `scale(1.08) translate(${parallax.x}px, ${parallax.y}px)`,
              transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          <div className="absolute inset-0 bg-background/70" />
          <div className="drift absolute -left-32 top-10 size-[34rem] rounded-full bg-primary/15 blur-3xl" />
          <div className="drift-alt absolute -right-40 bottom-0 size-[38rem] rounded-full bg-[oklch(0.828_0.189_84.429/0.14)] blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
        </div>

        {/* Floating accent cards */}
        <div
          className="float-slow absolute left-[6%] top-[22%] z-10 hidden rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur lg:block"
          style={{ "--tilt": "-4deg" } as React.CSSProperties}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">Verified listing</p>
              <p className="text-xs text-muted-foreground">Reviewed before going live</p>
            </div>
          </div>
        </div>
        <div
          className="float-slower absolute right-[7%] top-[30%] z-10 hidden rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur lg:block"
          style={{ "--tilt": "3deg" } as React.CSSProperties}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Star className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">4.9 owner rating</p>
              <p className="text-xs text-muted-foreground">Across 5 cities</p>
            </div>
          </div>
        </div>
        <div
          className="float-slow absolute bottom-[18%] left-[12%] z-10 hidden rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur lg:block"
          style={{ "--tilt": "2deg", animationDelay: "1.4s" } as React.CSSProperties}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">From {formatPrice(4500000, "Sale")}</p>
              <p className="text-xs text-muted-foreground">Homes across India</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-4xl space-y-12 text-center">
          <header className="space-y-6">
            <span className="rise-in inline-block rounded-full border border-primary/30 bg-card/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.4em] text-primary backdrop-blur">
              EstateFlow &bull; The Curated Collection
            </span>
            <h1
              className="rise-in font-display text-5xl font-light leading-[1.08] tracking-tight sm:text-7xl"
              style={{ animationDelay: "0.15s" }}
            >
              Find a place that feels
              <br />
              like <span className="italic text-primary">your</span>{" "}
              <span className="font-semibold">neighbourhood.</span>
            </h1>
            <p
              className="rise-in mx-auto max-w-xl text-base text-muted-foreground"
              style={{ animationDelay: "0.3s" }}
            >
              Homes, plots and workspaces across India — with honest pricing, real photos and
              direct owner enquiries.
            </p>
          </header>

          <div className="rise-in mx-auto max-w-3xl" style={{ animationDelay: "0.45s" }}>
            <SearchBar />
          </div>
        </div>

        {/* Marquee strip */}
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background/70 py-3 backdrop-blur">
          <div className="flex overflow-hidden">
            <div className="marquee flex shrink-0 items-center gap-10 pr-10 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {[...CITIES.map((c) => c.name), "Verified Listings", "Direct Owners", "Honest Pricing", ...CITIES.map((c) => c.name), "Verified Listings", "Direct Owners", "Honest Pricing"].map((label, i) => (
                <span key={i} className="flex items-center gap-10 whitespace-nowrap">
                  {label} <Sparkles className="size-3 text-primary/60" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured residences */}
      <section ref={featuredRef} className="mx-auto max-w-6xl px-4 py-24">
        <div className="reveal mb-16 flex items-baseline justify-between gap-4">
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
          {featured?.map((property, i) => (
            <div
              key={property.id}
              className="reveal"
              style={{ transitionDelay: `${(i % 3) * 120}ms` }}
            >
              <PropertyCard
                property={property}
                isFavorite={favoriteIds?.includes(property.id) ?? false}
                onToggleFavorite={toggle}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Popular locations */}
      <section ref={citiesRef} className="border-y border-border bg-secondary/40 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="reveal mb-16 border-b border-border pb-6">
            <h2 className="font-display text-3xl font-light italic sm:text-4xl">
              Popular locations
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {CITIES.map((city, i) => (
              <Link
                key={city.name}
                to="/properties"
                search={{ city: city.name }}
                className="reveal group relative overflow-hidden rounded-2xl border border-border"
                style={{ transitionDelay: `${i * 100}ms` }}
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
      <section ref={typesRef} className="mx-auto max-w-6xl px-4 py-24">
        <div className="reveal mb-16 border-b border-border pb-6">
          <h2 className="font-display text-3xl font-light italic sm:text-4xl">
            Browse by property type
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PROPERTY_TYPES.map((type, i) => (
            <Link
              key={type}
              to="/properties"
              search={{ propertyType: type }}
              className="reveal group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
              style={{ transitionDelay: `${i * 100}ms` }}
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

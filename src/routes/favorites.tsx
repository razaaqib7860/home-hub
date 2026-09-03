import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteIds, useFavoriteProperties, useToggleFavorite } from "@/hooks/useFavorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your saved properties | EstateFlow" },
      { name: "description", content: "Review every property you have saved on EstateFlow in one place." },
      { property: "og:title", content: "Your saved properties | EstateFlow" },
      { property: "og:description", content: "All the homes you bookmarked on EstateFlow." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user, loading } = useAuth();
  const { data, isLoading } = useFavoriteProperties();
  const { data: favoriteIds } = useFavoriteIds();
  const { toggle } = useToggleFavorite();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-4xl font-semibold">Saved properties</h1>

        {!loading && !user ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="font-display text-xl font-semibold">Sign in to see your favourites</p>
            <Button asChild className="mt-5">
              <Link to="/login" search={{ redirect: "/favorites" }}>
                Sign in
              </Link>
            </Button>
          </div>
        ) : isLoading || loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds?.includes(property.id) ?? true}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-16 text-center">
            <p className="font-display text-xl font-semibold">No saved properties yet</p>
            <Button asChild className="mt-5">
              <Link to="/properties" search={{}}>
                Browse listings
              </Link>
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

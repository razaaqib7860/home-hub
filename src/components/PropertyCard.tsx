import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyImage } from "@/components/PropertyImage";
import { fallbackImage, formatArea, formatPrice, type Property } from "@/lib/estate";
import { cn } from "@/lib/utils";

type Props = {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
};

export function PropertyCard({ property, isFavorite = false, onToggleFavorite }: Props) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          to="/properties/$id"
          params={{ id: property.id }}
          aria-label={property.title}
          className="block size-full"
        >
          <PropertyImage
            src={property.images[0]}
            fallback={fallbackImage(property.property_type)}
            alt={property.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground">For {property.listing_type}</Badge>
          <Badge variant="secondary">{property.property_type}</Badge>
        </div>
        {onToggleFavorite && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={isFavorite ? "Remove from favorites" : "Save property"}
            className="absolute right-3 top-3 rounded-full"
            onClick={() => onToggleFavorite(property.id, isFavorite)}
          >
            <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
          </Button>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-semibold text-primary">
            {formatPrice(property.price, property.listing_type)}
          </p>
        </div>
        <h3 className="line-clamp-1 font-display text-lg font-semibold">{property.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {property.location}, {property.city}
        </p>
        <div className="flex flex-wrap gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" /> {property.bedrooms} Beds
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="size-4" /> {property.bathrooms} Baths
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler className="size-4" /> {formatArea(property.area)}
          </span>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/properties/$id" params={{ id: property.id }}>
            View details
          </Link>
        </Button>
      </div>
    </article>
  );
}

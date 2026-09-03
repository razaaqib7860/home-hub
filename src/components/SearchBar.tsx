import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/estate";

export function SearchBar() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [listingType, setListingType] = useState("Sale");
  const [propertyType, setPropertyType] = useState("any");

  return (
    <form
      className="grid gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lg sm:grid-cols-[1.6fr_1fr_1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        void navigate({
          to: "/properties",
          search: {
            location,
            listingType,
            propertyType: propertyType === "any" ? "" : propertyType,
          },
        });
      }}
    >
      <Input
        placeholder="Search by locality, city or project"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label="Search location"
      />
      <Select value={listingType} onValueChange={setListingType}>
        <SelectTrigger aria-label="Listing type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LISTING_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              For {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={propertyType} onValueChange={setPropertyType}>
        <SelectTrigger aria-label="Property type">
          <SelectValue placeholder="Any type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any type</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" className="gap-2">
        <Search className="size-4" /> Search
      </Button>
    </form>
  );
}

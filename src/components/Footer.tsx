import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { CITIES } from "@/lib/estate";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Home className="size-4" />
            </span>
            <span className="font-display text-xl font-semibold">EstateFlow</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Homes, plots and offices across India — listed, verified and easy to reach.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/properties" search={{ listingType: "Sale" }} className="hover:text-primary">
                Properties for sale
              </Link>
            </li>
            <li>
              <Link to="/properties" search={{ listingType: "Rent" }} className="hover:text-primary">
                Properties for rent
              </Link>
            </li>
            <li>
              <Link to="/properties" search={{}} className="hover:text-primary">
                All listings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Cities</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {CITIES.map((city) => (
              <li key={city.name}>
                <Link to="/properties" search={{ city: city.name }} className="hover:text-primary">
                  {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/login" search={{ redirect: "" }} className="hover:text-primary">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-primary">
                Create account
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-primary">
                Saved properties
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EstateFlow. All rights reserved.
      </div>
    </footer>
  );
}

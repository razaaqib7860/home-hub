import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  src?: string | undefined;
  alt: string;
  className?: string;
  fallback: string;
  eager?: boolean;
};

export function PropertyImage({ src, alt, className, fallback, eager }: Props) {
  const [resolved, setResolved] = useState(() =>
    !src || src.startsWith("/") || src.startsWith("http") ? (src ?? fallback) : "",
  );

  useEffect(() => {
    let active = true;
    if (!src) {
      setResolved(fallback);
      return;
    }
    if (src.startsWith("/") || src.startsWith("http")) {
      setResolved(src);
      return;
    }
    void supabase.storage
      .from("property-images")
      .createSignedUrl(src, 3600)
      .then(({ data }) => {
        if (active) setResolved(data?.signedUrl ?? fallback);
      });
    return () => {
      active = false;
    };
  }, [src, fallback]);

  return (
    <img
      src={resolved || fallback}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

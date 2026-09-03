import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavoriteIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-ids", user?.id ?? null],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("property_id");
      if (error) throw error;
      return data.map((row) => row.property_id);
    },
  });
}

export function useFavoriteProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-properties", user?.id ?? null],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("created_at, properties(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.flatMap((row) => (row.properties ? [row.properties] : []));
    },
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ propertyId, isFavorite }: { propertyId: string; isFavorite: boolean }) => {
      if (!user) throw new Error("Not signed in");
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("property_id", propertyId)
          .eq("user_id", user.id);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("favorites")
        .insert({ property_id: propertyId, user_id: user.id });
      if (error) throw error;
      return true;
    },
    onSuccess: (added) => {
      void queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
      void queryClient.invalidateQueries({ queryKey: ["favorite-properties"] });
      toast.success(added ? "Saved to favorites" : "Removed from favorites");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    isPending: mutation.isPending,
    toggle: (propertyId: string, isFavorite: boolean) => {
      if (!user) {
        toast.info("Sign in to save properties");
        void navigate({
          to: "/login",
          search: { redirect: window.location.pathname + window.location.search },
        });
        return;
      }
      mutation.mutate({ propertyId, isFavorite });
    },
  };
}

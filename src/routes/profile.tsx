import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/lib/estate";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your EstateFlow profile" },
      { name: "description", content: "Update your name, phone number and contact details on EstateFlow." },
      { property: "og:title", content: "Your EstateFlow profile" },
      { property: "og:description", content: "Manage your EstateFlow account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "" });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id ?? null],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  useEffect(() => {
    if (profile) setForm({ name: profile.name, phone: profile.phone });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ name: form.name, phone: form.phone })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-14">
        <h1 className="font-display text-4xl font-semibold">Your profile</h1>
        {!loading && !user ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-14 text-center">
            <p className="font-display text-xl font-semibold">Sign in to manage your profile</p>
            <Button asChild className="mt-5">
              <Link to="/login" search={{ redirect: "/profile" }}>
                Sign in
              </Link>
            </Button>
          </div>
        ) : (
          <form
            className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" className="mt-1" value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}

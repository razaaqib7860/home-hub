import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  INQUIRY_STATUSES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  formatPrice,
  type Inquiry,
  type Profile,
  type Property,
} from "@/lib/estate";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | EstateFlow" },
      { name: "description", content: "Manage EstateFlow listings, enquiries and registered users." },
      { property: "og:title", content: "Admin dashboard | EstateFlow" },
      { property: "og:description", content: "Manage listings, enquiries and users on EstateFlow." },
    ],
  }),
  component: AdminPage,
});

const emptyForm = {
  id: "",
  title: "",
  description: "",
  price: "",
  location: "",
  city: "",
  property_type: "Apartment",
  listing_type: "Sale",
  bedrooms: "0",
  bathrooms: "0",
  area: "0",
  amenities: "",
  images: "",
  status: "Active",
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const properties = useQuery({
    queryKey: ["admin-properties"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const inquiries = useQuery({
    queryKey: ["admin-inquiries"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
    },
  });

  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const saveProperty = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price) || 0,
        location: form.location,
        city: form.city,
        property_type: form.property_type,
        listing_type: form.listing_type,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area: Number(form.area) || 0,
        amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        status: form.status,
      };
      if (form.id) {
        const { error } = await supabase.from("properties").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("properties")
          .insert({ ...payload, owner: user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(form.id ? "Listing updated" : "Listing created");
      setOpen(false);
      setForm(emptyForm);
      void queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["featured-properties"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateInquiry = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <p className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in with an administrator account to manage EstateFlow.
          </p>
          <Button asChild className="mt-6">
            <Link to="/login" search={{ redirect: "/admin" }}>
              Sign in
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold">Admin dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage listings, enquiries and users.</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Add property
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Listings", value: properties.data?.length ?? 0 },
            { label: "Enquiries", value: inquiries.data?.length ?? 0 },
            { label: "Users", value: users.data?.length ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="font-display text-3xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="properties" className="mt-8">
          <TabsList>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="inquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.data?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.city}</TableCell>
                    <TableCell>{formatPrice(p.price, p.listing_type)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Edit listing"
                        onClick={() => {
                          setForm({
                            id: p.id,
                            title: p.title,
                            description: p.description,
                            price: String(p.price),
                            location: p.location,
                            city: p.city,
                            property_type: p.property_type,
                            listing_type: p.listing_type,
                            bedrooms: String(p.bedrooms),
                            bathrooms: String(p.bathrooms),
                            area: String(p.area),
                            amenities: p.amenities.join(", "),
                            images: p.images.join(", "),
                            status: p.status,
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Delete listing"
                        onClick={() => deleteProperty.mutate(p.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="inquiries" className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.data?.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.sender_name}</TableCell>
                    <TableCell>
                      <span className="block text-sm">{i.sender_email}</span>
                      <span className="block text-xs text-muted-foreground">{i.sender_phone}</span>
                    </TableCell>
                    <TableCell className="max-w-sm text-sm text-muted-foreground">{i.message}</TableCell>
                    <TableCell>
                      <Select
                        value={i.status}
                        onValueChange={(status) => updateInquiry.mutate({ id: i.id, status })}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INQUIRY_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="users" className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || "—"}</TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit property" : "Add property"}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveProperty.mutate();
            }}
          >
            <div className="sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                className="mt-1"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                required
                className="mt-1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="area">Area (sq.ft)</Label>
              <Input
                id="area"
                type="number"
                className="mt-1"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location">Locality</Label>
              <Input
                id="location"
                required
                className="mt-1"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                className="mt-1"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <Label>Property type</Label>
              <Select
                value={form.property_type}
                onValueChange={(v) => setForm({ ...form, property_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Listing type</Label>
              <Select
                value={form.listing_type}
                onValueChange={(v) => setForm({ ...form, listing_type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                className="mt-1"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                className="mt-1"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="amenities">Amenities (comma separated)</Label>
              <Input
                id="amenities"
                className="mt-1"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="images">Image paths or URLs (comma separated)</Label>
              <Input
                id="images"
                className="mt-1"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="submit" disabled={saveProperty.isPending}>
                {saveProperty.isPending ? "Saving…" : "Save property"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

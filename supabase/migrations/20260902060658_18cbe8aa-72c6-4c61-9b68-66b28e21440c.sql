-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('user','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN NEW.email = 'admin@estateflow.in' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROPERTIES ----------------------------------------------------------
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  city text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('Apartment','House','Villa','Plot','Commercial')),
  listing_type text NOT NULL CHECK (listing_type IN ('Sale','Rent')),
  bedrooms int NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms int NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  area int NOT NULL DEFAULT 0 CHECK (area >= 0),
  amenities text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  owner uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Pending','Sold')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_public_read_active" ON public.properties FOR SELECT TO anon
  USING (status = 'Active');
CREATE POLICY "properties_auth_read" ON public.properties FOR SELECT TO authenticated
  USING (status = 'Active' OR owner = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "properties_insert" ON public.properties FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR owner = auth.uid());
CREATE POLICY "properties_update" ON public.properties FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR owner = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR owner = auth.uid());
CREATE POLICY "properties_delete" ON public.properties FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR owner = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER properties_touch BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- FAVORITES -----------------------------------------------------------
CREATE TABLE public.favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON public.favorites FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- INQUIRIES -----------------------------------------------------------
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  sender_phone text NOT NULL DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries_insert_anon" ON public.inquiries FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "inquiries_insert_auth" ON public.inquiries FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "inquiries_select" ON public.inquiries FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "inquiries_update_admin" ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "inquiries_delete_admin" ON public.inquiries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- STORAGE POLICIES ----------------------------------------------------
CREATE POLICY "property_images_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'property-images');
CREATE POLICY "property_images_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images');
CREATE POLICY "property_images_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

-- SEED ----------------------------------------------------------------
INSERT INTO public.properties (title, description, price, location, city, property_type, listing_type, bedrooms, bathrooms, area, amenities, images, status) VALUES
('Sunlit 2 BHK in Indiranagar','A bright, airy two-bedroom home on a quiet tree-lined lane, with wooden floors, deep window seats and morning light in every room. Walking distance to cafes and the metro.',14200000,'Indiranagar','Bangalore','Apartment','Sale',2,2,1180,ARRAY['Covered Parking','Lift','Power Backup','24x7 Security','Gym'],ARRAY['/images/property-apartment-living.jpg','/images/property-terrace.jpg','/images/property-villa-lawn.jpg'],'Active'),
('Garden villa in Jubilee Hills','Four-bedroom villa set behind a manicured lawn, with a shaded verandah, servant quarters and a private garden that stays green all year.',185000,'Jubilee Hills','Hyderabad','Villa','Rent',4,4,3240,ARRAY['Private Garden','Covered Parking','Modular Kitchen','24x7 Security','Servant Room'],ARRAY['/images/property-villa-lawn.jpg','/images/property-apartment-living.jpg'],'Active'),
('Rooftop 3 BHK with skyline terrace','Top-floor apartment with an exclusive rooftop terrace, perfect for evening dinners under string lights. Freshly renovated interiors throughout.',27500000,'DLF Phase 3','Delhi','Apartment','Sale',3,3,1950,ARRAY['Terrace','Club House','Swimming Pool','Covered Parking','Power Backup'],ARRAY['/images/property-terrace.jpg','/images/property-apartment-living.jpg'],'Active'),
('Riverside 3 BHK in Kanke','Spacious family apartment overlooking the Kanke dam, in one of Ranchi''s calmest neighbourhoods. Big balconies and cross ventilation throughout.',6800000,'Kanke Road','Ranchi','Apartment','Sale',3,2,1560,ARRAY['Balcony','Lift','Power Backup','Children Play Area'],ARRAY['/images/property-apartment-living.jpg','/images/property-house-front.jpg'],'Active'),
('Independent house near Harmu','A well-built independent house with a small front yard, ideal for a growing family. Quiet street, close to schools and the main market.',9500000,'Harmu Colony','Ranchi','House','Sale',4,3,2400,ARRAY['Car Parking','Borewell','Modular Kitchen','Garden'],ARRAY['/images/property-house-front.jpg','/images/property-villa-lawn.jpg'],'Active'),
('Sea-facing 2 BHK at Worli','High-floor apartment with uninterrupted views of the sea link. Premium fittings, concierge service and a residents-only sky lounge.',68000,'Worli','Mumbai','Apartment','Rent',2,2,980,ARRAY['Sea View','Gym','Concierge','Covered Parking','Swimming Pool'],ARRAY['/images/property-terrace.jpg','/images/property-apartment-living.jpg'],'Active'),
('Bandra West studio for rent','Compact, beautifully finished studio in the heart of Bandra. Fully furnished and ready to move into, steps from Carter Road.',45000,'Bandra West','Mumbai','Apartment','Rent',1,1,520,ARRAY['Furnished','Lift','Power Backup','24x7 Security'],ARRAY['/images/property-apartment-living.jpg'],'Active'),
('Corner plot in Whitefield','A clean, fully approved corner plot in a gated layout with wide internal roads, ready for construction. Clear title and khata.',9200000,'Whitefield','Bangalore','Plot','Sale',0,0,2400,ARRAY['Gated Layout','Corner Plot','Clear Title','Water Connection'],ARRAY['/images/property-plot-land.jpg'],'Active'),
('Office floor on MG Road','Full floor commercial space with an efficient layout, central air conditioning and two dedicated lifts. Suits a 60-90 person team.',320000,'MG Road','Bangalore','Commercial','Rent',0,4,4800,ARRAY['Central AC','Two Lifts','Power Backup','Parking','Cafeteria'],ARRAY['/images/property-commercial-office.jpg'],'Active'),
('Heritage bungalow in Banjara Hills','A restored mid-century bungalow with high ceilings, mosaic flooring and a mature mango tree in the courtyard.',42000000,'Banjara Hills','Hyderabad','House','Sale',5,4,4100,ARRAY['Courtyard','Car Parking','Servant Room','Borewell','Garden'],ARRAY['/images/property-house-front.jpg','/images/property-villa-lawn.jpg'],'Active'),
('Modern 3 BHK in Gachibowli','Brand new apartment in a well-run tower close to the financial district, with a clubhouse, pool and generous balconies.',11800000,'Gachibowli','Hyderabad','Apartment','Sale',3,3,1740,ARRAY['Club House','Swimming Pool','Gym','Covered Parking','Power Backup'],ARRAY['/images/property-apartment-living.jpg','/images/property-terrace.jpg'],'Active'),
('Farmhouse villa in Chattarpur','A private farmhouse villa on half an acre, with an open lawn, outdoor dining pavilion and staff accommodation.',450000,'Chattarpur','Delhi','Villa','Rent',5,5,6200,ARRAY['Private Lawn','Swimming Pool','Servant Room','Car Parking','Power Backup'],ARRAY['/images/property-villa-lawn.jpg','/images/property-house-front.jpg'],'Active'),
('Retail showroom in Karol Bagh','Ground-floor showroom on a high-footfall market street, with a glass frontage and a mezzanine storage level.',26000000,'Karol Bagh','Delhi','Commercial','Sale',0,2,1800,ARRAY['Glass Frontage','Mezzanine','High Footfall','Power Backup'],ARRAY['/images/property-commercial-office.jpg'],'Active'),
('Hill-view plot in Ormanjhi','Elevated plot with a clear view of the surrounding hills, in a fast-developing pocket just off the ring road.',2400000,'Ormanjhi','Ranchi','Plot','Sale',0,0,3200,ARRAY['Hill View','Road Access','Clear Title'],ARRAY['/images/property-plot-land.jpg'],'Active');
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS properties_auth_read ON public.properties;
CREATE POLICY properties_auth_read ON public.properties FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS properties_insert ON public.properties;
CREATE POLICY properties_insert ON public.properties FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR owner = auth.uid());

DROP POLICY IF EXISTS properties_update ON public.properties;
CREATE POLICY properties_update ON public.properties FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR owner = auth.uid())
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR owner = auth.uid());

DROP POLICY IF EXISTS properties_delete ON public.properties;
CREATE POLICY properties_delete ON public.properties FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR owner = auth.uid());

DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS profiles_update_own_or_admin ON public.profiles;
CREATE POLICY profiles_update_own_or_admin ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS profiles_delete_admin ON public.profiles;
CREATE POLICY profiles_delete_admin ON public.profiles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS inquiries_select ON public.inquiries;
CREATE POLICY inquiries_select ON public.inquiries FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS inquiries_update_admin ON public.inquiries;
CREATE POLICY inquiries_update_admin ON public.inquiries FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS inquiries_delete_admin ON public.inquiries;
CREATE POLICY inquiries_delete_admin ON public.inquiries FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS roles_select_own_or_admin ON public.user_roles;
CREATE POLICY roles_select_own_or_admin ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS roles_admin_manage ON public.user_roles;
CREATE POLICY roles_admin_manage ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS property_images_delete ON storage.objects;
CREATE POLICY property_images_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
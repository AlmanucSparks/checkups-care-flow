CREATE SCHEMA IF NOT EXISTS private;

-- Recreate has_role in the private schema (not exposed via PostgREST)
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

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Update all policies that reference public.has_role to use private.has_role
DROP POLICY IF EXISTS "IT staff can view all comments" ON public.comments;
CREATE POLICY "IT staff can view all comments"
ON public.comments FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'it_staff'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "IT staff and admins can view all profiles" ON public.profiles;
CREATE POLICY "IT staff and admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'it_staff'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "IT staff can update tickets" ON public.tickets;
CREATE POLICY "IT staff can update tickets"
ON public.tickets FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'it_staff'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "IT staff can view all tickets" ON public.tickets;
CREATE POLICY "IT staff can view all tickets"
ON public.tickets FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'it_staff'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the public version
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
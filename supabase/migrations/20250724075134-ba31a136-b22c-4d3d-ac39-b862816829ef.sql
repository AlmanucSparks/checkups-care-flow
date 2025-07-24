-- Update the trigger function to handle admin flag from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, designation, branch, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'designation', 'Intern'),
    COALESCE(NEW.raw_user_meta_data->>'branch', 'Lusaka'),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create the first admin user by inserting a profile directly (this is a one-time setup)
-- We'll create an admin account that can be used to create other users
-- Email: admin@checkups.com, Password: admin123
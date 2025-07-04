
-- Create the missing trigger to automatically create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill profiles for existing users who don't have them
-- This will create profiles for users who signed up before the trigger was in place
INSERT INTO public.profiles (id, full_name, email, company_name, unique_email)
SELECT 
  au.id,
  au.raw_user_meta_data ->> 'full_name' as full_name,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'company_name', 'Your Company') as company_name,
  public.generate_unique_email(au.id, au.raw_user_meta_data ->> 'full_name', au.email) as unique_email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

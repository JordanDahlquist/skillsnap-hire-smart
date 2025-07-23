-- Add policy to allow email existence checks during signup
CREATE POLICY "Allow email existence check for signup" 
ON public.profiles 
FOR SELECT 
USING (true);
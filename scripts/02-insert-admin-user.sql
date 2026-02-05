-- Updated to automatically fetch the UUID from auth.users based on email
INSERT INTO public.employees (auth_user_id, full_name, email, role, status, department, designation)
SELECT 
  id, 
  'System Admin', 
  email, 
  'admin', 
  'active', 
  'IT', 
  'Administrator'
FROM auth.users
WHERE email = 'srimanthreddydamera12@gmail.com'
ON CONFLICT (email) DO UPDATE
SET 
  auth_user_id = EXCLUDED.auth_user_id,
  role = 'admin',
  status = 'active';

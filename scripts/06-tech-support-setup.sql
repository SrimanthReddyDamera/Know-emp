-- Add tech_support to the check constraint for role
-- Note: We can't easily alter a text check constraint without dropping it first.
-- Assuming the constraint name is 'employees_role_check' or similar, but to be safe, we'll try to drop the constraint if we know the name, 
-- OR just verify if we can simply insert 'tech_support'. 
-- IF it is an ENUM type, we need to alter the enum.
-- Based on previous conversations, it's likely a text column with a check constraint or just text.

-- Attempt to add 'tech_support' to the check constraint if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_role_check') THEN
        ALTER TABLE employees DROP CONSTRAINT employees_role_check;
        ALTER TABLE employees ADD CONSTRAINT employees_role_check CHECK (role IN ('admin', 'employee', 'tech_support'));
    END IF;
END $$;

-- If it's a Supabase Enum called 'user_role' (common pattern), we try to add the value.
-- Uncomment the following block if you are using Postgres Enums:
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tech_support';


-- Create password_requests table
CREATE TABLE IF NOT EXISTS password_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES employees(id)
);

-- Enable RLS
ALTER TABLE password_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Tech Support and Admin can view all requests
CREATE POLICY "Tech Support and Admin can view all password requests"
ON password_requests
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM employees
        WHERE employees.auth_user_id = auth.uid()
        AND employees.role IN ('admin', 'tech_support')
    )
);

-- 2. Employees can view their own requests (optional, but good for UI)
CREATE POLICY "Employees can view their own password requests"
ON password_requests
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM employees
        WHERE employees.id = password_requests.employee_id
        AND employees.auth_user_id = auth.uid()
    )
);

-- 3. Any logged in user (or at least employees) can create a request
-- Wait, if they are locked out, they can't be logged in to create a request via RLS if it relies on auth.uid().
-- BUT the requirement says "employees will have option as request password change at login page".
-- This implies they are NOT logged in.
-- So the insertion must be done via a server action using SERVICE ROLE key (bypassing RLS), OR we need a public policy.
-- Using Service Role is safer. 
-- So we won't add an INSERT policy for public/authenticator unless necessary.
-- We will stick to SELECT policies for now.

-- 4. Tech Support and Admin can update requests (to resolve them)
CREATE POLICY "Tech Support and Admin can update password requests"
ON password_requests
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM employees
        WHERE employees.auth_user_id = auth.uid()
        AND employees.role IN ('admin', 'tech_support')
    )
);

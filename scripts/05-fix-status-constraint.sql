-- Fix the status check constraint on employees table
-- This ensures that 'inactive' is a valid status

-- Drop the existing constraint if it exists
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;

-- Re-add the constraint with the correct values
ALTER TABLE employees ADD CONSTRAINT employees_status_check CHECK (status IN ('active', 'inactive'));

-- Also ensure role constraint is correct
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE employees ADD CONSTRAINT employees_role_check CHECK (role IN ('admin', 'employee'));

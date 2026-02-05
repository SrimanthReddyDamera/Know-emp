-- Create employees table if not exists
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  phone TEXT,
  department TEXT,
  designation TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE -- Added updated_at column for future installations
);

-- Create knowledge_entries table if not exists
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  solution_steps TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE -- Added updated_at column for future installations
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created_by ON knowledge_entries(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_status ON knowledge_entries(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created_at ON knowledge_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_updated_at ON knowledge_entries(updated_at DESC); -- Added index for updated_at column

-- Add comments for documentation
COMMENT ON TABLE employees IS 'Stores employee information linked to Supabase auth users';
COMMENT ON TABLE knowledge_entries IS 'Stores knowledge base entries created by employees';

COMMENT ON COLUMN employees.status IS 'active or inactive - controls login access';
COMMENT ON COLUMN employees.role IS 'admin or employee - determines permissions';
COMMENT ON COLUMN knowledge_entries.status IS 'pending, approved, or rejected - approval workflow';
COMMENT ON COLUMN employees.updated_at IS 'Timestamp of the last update to the employee record';
COMMENT ON COLUMN knowledge_entries.updated_at IS 'Timestamp of the last update to the knowledge entry record';

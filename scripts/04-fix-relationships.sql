-- Fix foreign key relationship for knowledge_entries
ALTER TABLE knowledge_entries
DROP CONSTRAINT IF EXISTS knowledge_entries_created_by_fkey;

ALTER TABLE knowledge_entries
ADD CONSTRAINT knowledge_entries_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES employees(id)
ON DELETE CASCADE;

-- Ensure updated_at column exists
ALTER TABLE knowledge_entries
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

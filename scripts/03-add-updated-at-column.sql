-- Run this script if you want to add the updated_at column to your existing table
ALTER TABLE knowledge_entries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

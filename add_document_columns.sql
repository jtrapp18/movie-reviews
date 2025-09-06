-- Add document-related columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS has_document BOOLEAN DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS document_filename VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS document_path VARCHAR(500);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS document_type VARCHAR(10);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Optionally, update existing rows to set their updated_at to their created_at if updated_at is null
-- This ensures all rows have a value, especially if they existed before this column was added.
UPDATE orders
SET updated_at = created_at
WHERE updated_at IS NULL;

SELECT 'updated_at column added to orders table successfully!' as message;

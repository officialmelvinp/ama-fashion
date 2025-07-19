import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function runMigration() {
  const migrationSql = `
-- Step 1: Add 'id' column and make it the primary key
-- First, ensure the 'id' column exists and has a default UUID
ALTER TABLE products ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Update existing rows to ensure 'id' is populated for all
UPDATE products SET id = gen_random_uuid() WHERE id IS NULL;

-- Drop existing primary key constraint if it exists (it's likely on product_id)
-- Find the actual primary key constraint name for 'products' table
DO $$
DECLARE
    pk_constraint_name TEXT;
BEGIN
    SELECT constraint_name
    INTO pk_constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_type = 'PRIMARY KEY'
    LIMIT 1;

    IF pk_constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE products DROP CONSTRAINT ' || pk_constraint_name || ';';
        RAISE NOTICE 'Dropped existing primary key constraint: %', pk_constraint_name;
    ELSE
        RAISE NOTICE 'No existing primary key constraint found on products table.';
    END IF;
END $$;

-- Add new primary key on the 'id' column
ALTER TABLE products ADD PRIMARY KEY (id);

-- Step 1.5: Drop the 'new_id' column if it exists, as 'id' is now the primary key
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'new_id') THEN
        ALTER TABLE products DROP COLUMN new_id;
        RAISE NOTICE 'Dropped redundant new_id column.';
    ELSE
        RAISE NOTICE 'new_id column not found, skipping drop.';
    END IF;
END $$;


-- Step 2: Rename existing columns
ALTER TABLE products RENAME COLUMN product_id TO product_code;
ALTER TABLE products RENAME COLUMN product_name TO name;
ALTER TABLE products RENAME COLUMN stock_quantity TO quantity_available;
ALTER TABLE products RENAME COLUMN preorder_eta TO pre_order_date;

-- Step 3: Add unique constraint to product_code
ALTER TABLE products ADD CONSTRAINT unique_product_code UNIQUE (product_code);

-- Step 4: Add new columns with appropriate types and defaults
ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS essences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_ready_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- Using TEXT for status for now, as enum might not exist yet

-- Step 5: Convert existing single image_url to image_urls JSONB array and drop old column
-- Only run if image_url column still exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        UPDATE products SET image_urls = jsonb_build_array(image_url) WHERE image_url IS NOT NULL;
        ALTER TABLE products DROP COLUMN image_url;
        RAISE NOTICE 'Converted image_url to image_urls and dropped old column.';
    ELSE
        RAISE NOTICE 'image_url column not found, skipping conversion.';
    END IF;
END $$;

-- Step 6: Ensure price and quantity columns have correct types
ALTER TABLE products ALTER COLUMN price_aed TYPE NUMERIC(10, 2) USING price_aed::NUMERIC(10, 2);
ALTER TABLE products ALTER COLUMN price_gbp TYPE NUMERIC(10, 2) USING price_gbp::NUMERIC(10, 2);
ALTER TABLE products ALTER COLUMN quantity_available TYPE INTEGER USING quantity_available::INTEGER;
ALTER TABLE products ALTER COLUMN total_quantity TYPE INTEGER USING total_quantity::INTEGER;
ALTER TABLE products ALTER COLUMN pre_order_date TYPE DATE USING pre_order_date::DATE;
ALTER TABLE products ALTER COLUMN preorder_ready_date TYPE DATE USING preorder_ready_date::DATE;

-- Step 7: Recreate or update the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it has a different name or needs recreation
DO $$
DECLARE
    trigger_name TEXT;
BEGIN
    SELECT tgname
    INTO trigger_name
    FROM pg_trigger
    WHERE tgrelid = 'products'::regclass AND tgfoid = 'update_updated_at_column'::regproc
    LIMIT 1;

    IF trigger_name IS NOT NULL THEN
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON products;';
        RAISE NOTICE 'Dropped existing trigger: %', trigger_name;
    END IF;
END $$;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
  `

  try {
    console.log("Starting database schema migration...")
    await sql.unsafe(migrationSql)
    console.log("Database schema migration completed successfully!")
  } catch (error) {
    console.error("Error during database schema migration:", error)
    process.exit(1) // Exit with an error code
  } finally {
    // In a real application, you might want to close the connection pool here.
    // For a simple script, it often closes automatically.
  }
}

runMigration()

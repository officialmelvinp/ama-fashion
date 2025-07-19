
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid duplicates before recreating
DROP TRIGGER IF EXISTS set_products_updated_at ON products;

-- Create trigger
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Part 2: Main Schema Alteration (inside DO block for atomicity of column changes)
DO $$
DECLARE
    pk_name TEXT;
    col_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'Starting products table alteration...';

    -- Step 0: Drop the existing 'id' column if it was partially added in a previous attempt
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'id'
    ) INTO col_exists;

    IF col_exists THEN
        RAISE NOTICE 'Dropping existing "id" column.';
        ALTER TABLE products DROP COLUMN id;
    END IF;

    -- Step 0.1: Drop the existing 'new_id' column if it was partially added in a previous attempt
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'new_id'
    ) INTO col_exists;

    IF col_exists THEN
        RAISE NOTICE 'Dropping existing "new_id" column.';
        ALTER TABLE products DROP COLUMN new_id;
    END IF;

    -- Step 1: Add a new 'id' column as UUID and set it as primary key
    RAISE NOTICE 'Adding "id" column as UUID PRIMARY KEY.';
    ALTER TABLE products ADD COLUMN id UUID DEFAULT gen_random_uuid();

    -- Find and drop existing primary key constraint on product_id if it exists
    SELECT constraint_name
    INTO pk_name
    FROM information_schema.table_constraints
    WHERE table_name = 'products' AND constraint_type = 'PRIMARY KEY';

    IF pk_name IS NOT NULL THEN
        RAISE NOTICE 'Dropping existing primary key constraint "%" on "product_id".', pk_name;
        EXECUTE 'ALTER TABLE products DROP CONSTRAINT ' || quote_ident(pk_name);
    END IF;

    -- Set the new 'id' column as the primary key
    RAISE NOTICE 'Setting "id" as the new primary key.';
    ALTER TABLE products ADD PRIMARY KEY (id);

    -- Step 2: Rename existing columns
    RAISE NOTICE 'Renaming columns: product_id to product_code, product_name to name, stock_quantity to quantity_available, preorder_eta to pre_order_date.';
    ALTER TABLE products RENAME COLUMN product_id TO product_code;
    ALTER TABLE products RENAME COLUMN product_name TO name;
    ALTER TABLE products RENAME COLUMN stock_quantity TO quantity_available;
    ALTER TABLE products RENAME COLUMN preorder_eta TO pre_order_date;

    -- Step 3: Add new columns
    RAISE NOTICE 'Adding new columns: subtitle, materials, essences, colors, total_quantity, preorder_ready_date, status.';
    ALTER TABLE products ADD COLUMN subtitle VARCHAR(255);
    ALTER TABLE products ADD COLUMN materials JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE products ADD COLUMN essences JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE products ADD COLUMN colors JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE products ADD COLUMN total_quantity INTEGER;
    ALTER TABLE products ADD COLUMN preorder_ready_date TIMESTAMP WITH TIME ZONE;

    -- Add product_status ENUM type if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'product_status'
    ) INTO col_exists;

    IF NOT col_exists THEN
        RAISE NOTICE 'Creating ENUM type "product_status".';
        CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out-of-stock', 'pre-order');
    END IF;

    ALTER TABLE products ADD COLUMN status product_status DEFAULT 'active';

    -- Step 4: Convert image_url to image_urls (JSONB array)
    RAISE NOTICE 'Converting "image_url" to "image_urls" (JSONB array).';
    ALTER TABLE products ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
    UPDATE products SET image_urls = jsonb_build_array(image_url) WHERE image_url IS NOT NULL;
    ALTER TABLE products DROP COLUMN image_url;

    -- Step 5: Add unique constraint to product_code
    RAISE NOTICE 'Adding unique constraint to "product_code".';
    ALTER TABLE products ADD CONSTRAINT products_product_code_key UNIQUE (product_code);

    -- Step 6: Ensure price and quantity columns have correct types
    RAISE NOTICE 'Ensuring price and quantity columns have correct types.';
    ALTER TABLE products ALTER COLUMN price_aed TYPE NUMERIC(10, 2) USING price_aed::NUMERIC(10, 2);
    ALTER TABLE products ALTER COLUMN price_gbp TYPE NUMERIC(10, 2) USING price_gbp::NUMERIC(10, 2);
    ALTER TABLE products ALTER COLUMN quantity_available TYPE INTEGER USING quantity_available::INTEGER;
    ALTER TABLE products ALTER COLUMN total_quantity TYPE INTEGER USING total_quantity::INTEGER;
    ALTER TABLE products ALTER COLUMN pre_order_date TYPE DATE USING pre_order_date::DATE;
    ALTER TABLE products ALTER COLUMN preorder_ready_date TYPE DATE USING preorder_ready_date::DATE;

    RAISE NOTICE 'Products table alteration completed successfully.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error during products table alteration: %', SQLERRM;
END $$;

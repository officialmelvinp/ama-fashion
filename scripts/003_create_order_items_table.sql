-- Create the order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_display_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Add an index to order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Optional: Remove single-product specific columns from the 'orders' table
-- This step is optional but recommended for a cleaner schema if you're fully moving to order_items
-- Make sure your application code is updated to fetch item details from order_items
DO $$ BEGIN
    ALTER TABLE orders DROP COLUMN IF EXISTS product_id;
    ALTER TABLE orders DROP COLUMN IF EXISTS quantity_ordered;
    ALTER TABLE orders DROP COLUMN IF EXISTS quantity_in_stock;
    ALTER TABLE orders DROP COLUMN IF EXISTS quantity_preorder;
    ALTER TABLE orders DROP COLUMN IF EXISTS amount_paid;
    ALTER TABLE orders DROP COLUMN IF EXISTS currency;
    ALTER TABLE orders DROP COLUMN IF EXISTS total_amount;
    -- Keep payment_id, customer_email, customer_name, shipping_address, phone_number, notes, etc.
EXCEPTION
    WHEN undefined_column THEN RAISE NOTICE 'One or more columns not found, skipping DROP COLUMN.';
END $$;

-- Add a total_amount column to the orders table if it was dropped or doesn't exist,
-- as it's still useful for the overall order total.
DO $$ BEGIN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10);
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column total_amount or currency already exists.';
END $$;

-- Update the updated_at column automatically on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
CREATE TRIGGER update_order_items_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

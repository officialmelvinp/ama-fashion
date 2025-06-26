-- Add preorder_ready_date column to product_inventory table
ALTER TABLE product_inventory 
ADD COLUMN IF NOT EXISTS preorder_ready_date DATE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_inventory_preorder_date 
ON product_inventory(preorder_ready_date);

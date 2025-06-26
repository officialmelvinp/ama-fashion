-- Add new columns to orders table for enhanced functionality
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS quantity_ordered INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quantity_in_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantity_preorder INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'paid',
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Update existing records to have proper quantity values
UPDATE orders SET 
  quantity_ordered = COALESCE(quantity, 1),
  quantity_in_stock = COALESCE(quantity, 1),
  quantity_preorder = 0,
  order_status = CASE 
    WHEN payment_status = 'completed' THEN 'paid'
    WHEN payment_status = 'pending' THEN 'pending'
    ELSE 'failed'
  END
WHERE quantity_ordered IS NULL;

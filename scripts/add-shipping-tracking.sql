-- Add shipping and delivery tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);

-- Update existing orders to have proper shipping status
UPDATE orders SET 
  shipping_status = CASE 
    WHEN payment_status = 'completed' THEN 'paid'
    WHEN payment_status = 'pending' THEN 'pending'
    ELSE 'pending'
  END
WHERE shipping_status = 'pending';

SELECT 'Shipping tracking columns added successfully!' as message;

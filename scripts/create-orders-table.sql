-- Create orders tracking table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  order_type VARCHAR(50) NOT NULL, -- 'purchase' or 'preorder'
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  payment_id VARCHAR(255), -- PayPal/Stripe transaction ID
  amount_paid DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'AED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

SELECT 'Orders table created successfully!' as message;

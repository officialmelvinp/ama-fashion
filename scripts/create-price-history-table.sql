-- Create price history table for tracking price changes
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  old_price_aed DECIMAL(10,2),
  new_price_aed DECIMAL(10,2),
  old_price_gbp DECIMAL(10,2),
  new_price_gbp DECIMAL(10,2),
  change_reason TEXT,
  changed_by VARCHAR(255) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history(created_at);

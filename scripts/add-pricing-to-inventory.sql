-- Add pricing columns to product_inventory table
ALTER TABLE product_inventory 
ADD COLUMN IF NOT EXISTS price_aed DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_gbp DECIMAL(10,2);

-- Update existing records with current prices (you can modify these values)
UPDATE product_inventory SET 
  price_aed = CASE 
    WHEN product_id LIKE 'ayomide%' THEN 780.00
    WHEN product_id LIKE 'manifest-set%' THEN 950.00
    WHEN product_id LIKE 'ayaba-bubu%' THEN 850.00
    WHEN product_id LIKE 'candy-combat%' THEN 650.00
    ELSE 750.00
  END,
  price_gbp = CASE 
    WHEN product_id LIKE 'ayomide%' THEN 168.00
    WHEN product_id LIKE 'manifest-set%' THEN 205.00
    WHEN product_id LIKE 'ayaba-bubu%' THEN 183.00
    WHEN product_id LIKE 'candy-combat%' THEN 140.00
    ELSE 162.00
  END
WHERE price_aed IS NULL OR price_gbp IS NULL;

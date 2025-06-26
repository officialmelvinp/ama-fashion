-- Populate initial inventory for all products
-- This will insert all your current products with starting quantities

-- Ayọ̀mídé Collection (2 items)
INSERT INTO product_inventory (product_id, quantity_available, total_quantity, status) VALUES
('ayomide-blue', 0, 0, 'active'), -- This one was marked as sold out
('ayomide-purple', 5, 5, 'active')
ON CONFLICT (product_id) DO NOTHING;

-- The Manifested Set (1 item)
INSERT INTO product_inventory (product_id, quantity_available, total_quantity, status) VALUES
('manifest-set-1', 3, 3, 'active')
ON CONFLICT (product_id) DO NOTHING;

-- Àyaba Bubu Collection (12 items)
INSERT INTO product_inventory (product_id, quantity_available, total_quantity, status) VALUES
('ayaba-bubu-1', 8, 8, 'active'),
('ayaba-bubu-2', 0, 0, 'active'), -- This one was marked as sold out
('ayaba-bubu-3', 8, 8, 'active'),
('ayaba-bubu-4', 8, 8, 'active'),
('ayaba-bubu-5', 8, 8, 'active'),
('ayaba-bubu-6', 8, 8, 'active'),
('ayaba-bubu-7', 8, 8, 'active'),
('ayaba-bubu-8', 8, 8, 'active'),
('ayaba-bubu-9', 8, 8, 'active'),
('ayaba-bubu-10', 8, 8, 'active'),
('ayaba-bubu-11', 8, 8, 'active'),
('ayaba-bubu-12', 8, 8, 'active')
ON CONFLICT (product_id) DO NOTHING;

-- Candy Combat Collection (12 items)
INSERT INTO product_inventory (product_id, quantity_available, total_quantity, status) VALUES
('candy-combat-1', 6, 6, 'active'),
('candy-combat-2', 6, 6, 'active'),
('candy-combat-3', 6, 6, 'active'),
('candy-combat-4', 6, 6, 'active'),
('candy-combat-5', 6, 6, 'active'),
('candy-combat-6', 6, 6, 'active'),
('candy-combat-7', 6, 6, 'active'),
('candy-combat-8', 6, 6, 'active'),
('candy-combat-9', 6, 6, 'active'),
('candy-combat-10', 6, 6, 'active'),
('candy-combat-11', 6, 6, 'active'),
('candy-combat-12', 6, 6, 'active')
ON CONFLICT (product_id) DO NOTHING;

SELECT 'Initial inventory populated successfully!' as message;
SELECT 'Total products added: ' || COUNT(*) as summary FROM product_inventory;

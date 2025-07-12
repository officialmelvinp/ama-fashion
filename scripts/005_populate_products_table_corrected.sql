-- Insert or update product details into the products table
INSERT INTO products (product_id, product_name, description, image_url, category) VALUES
('ayomide-blue', 'Ayọ̀mídé', 'Joy woven into form. A dress that carries the lightness of being.', '/images/ama6.jpeg', 'ayomide'),
('ayomide-purple', 'Ayọ̀mídé', 'Joy woven into form. A dress that carries the lightness of being.', '/images/ama6.jpeg', 'ayomide'),
('manifest-set-1', 'The Manifest Set', 'A pairing of ease and presence. One-size drape, bound by craft.', '/images/ama5.jpeg', 'the-manifested-set'),
('ayaba-bubu-1', 'Àyaba 01', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-2', 'Àyaba 02', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-3', 'Àyaba 03', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-4', 'Àyaba 04', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-5', 'Àyaba 05', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-6', 'Àyaba 06', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-7', 'Àyaba 07', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-8', 'Àyaba 08', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-9', 'Àyaba 09', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-10', 'Àyaba 10', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-11', 'Àyaba 11', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('ayaba-bubu-12', 'Àyaba 12', 'Freedom in form. A kaftan stitched with lineage, worn in ease.', '/images/ama3.jpeg', 'ayaba-bubu'),
('candy-combat-1', 'Candy Combat 01', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-2', 'Candy Combat 02', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-3', 'Candy Combat 03', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-4', 'Candy Combat 04', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-5', 'Candy Combat 05', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-6', 'Candy Combat 06', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-7', 'Candy Combat 07', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-8', 'Candy Combat 08', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-9', 'Candy Combat 09', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-10', 'Candy Combat 10', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-11', 'Candy Combat 11', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat'),
('candy-combat-12', 'Candy Combat 12', 'Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.', '/images/ama4.jpeg', 'candy-combat')
ON CONFLICT (product_id) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    updated_at = CURRENT_TIMESTAMP;

SELECT 'Products table populated and updated with correct details!' as message;

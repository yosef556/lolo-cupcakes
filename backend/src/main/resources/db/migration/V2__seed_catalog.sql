-- =============================================================================
-- Migration V2: Clean Baseline Technical Catalog
-- =============================================================================

INSERT INTO categories (id, name_ar, name_en, slug, display_order, is_active) VALUES
('c0000001-0000-0000-0000-000000000001', 'كب كيك', 'Cupcakes', 'cupcakes', 1, TRUE),
('c0000001-0000-0000-0000-000000000002', 'كيك وتورتات', 'Cakes', 'cakes', 2, TRUE),
('c0000001-0000-0000-0000-000000000003', 'قطع جاتوه', 'Gateaux', 'gateaux', 3, TRUE),
('c0000001-0000-0000-0000-000000000004', 'حلويات شرقية', 'Oriental', 'oriental', 4, TRUE),
('c0000001-0000-0000-0000-000000000005', 'بوكسات مشكلة', 'Boxes', 'boxes', 5, TRUE);

INSERT INTO option_groups (id, name_ar, name_en, selection_type, is_required, min_selections, max_selections) VALUES
('d0000001-0000-0000-0000-000000000001', 'الحجم', 'Size', 'SINGLE', TRUE, 1, 1),
('d0000001-0000-0000-0000-000000000002', 'الحشوة', 'Filling', 'SINGLE', FALSE, 0, 1);

INSERT INTO option_values (id, option_group_id, name_ar, name_en, price_modifier, display_order, is_active) VALUES
('d0000002-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'حجم صغير', 'Small', 0.00, 1, TRUE),
('d0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'حجم متوسط', 'Medium', 120.00, 2, TRUE),
('d0000002-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', 'حجم كبير', 'Large', 250.00, 3, TRUE),
('d0000002-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000002', 'فانيليا', 'Vanilla', 0.00, 1, TRUE),
('d0000002-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000002', 'شوكولاتة', 'Chocolate', 40.00, 2, TRUE),
('d0000002-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000002', 'كراميل', 'Caramel', 45.00, 3, TRUE);

INSERT INTO product_addons (id, name_ar, name_en, price, display_order, is_active) VALUES
('e0000001-0000-0000-0000-000000000001', 'شموع احتفال', 'Candles', 25.00, 1, TRUE),
('e0000001-0000-0000-0000-000000000002', 'بطاقة إهداء', 'Card', 20.00, 2, TRUE),
('e0000001-0000-0000-0000-000000000003', 'أدوات مائدة', 'Cutlery', 15.00, 3, TRUE);

INSERT INTO products (id, category_id, name_ar, name_en, slug, description_ar, product_type, selling_unit, base_price, prep_lead_hours, is_active, is_featured, is_customizable, display_order) VALUES
('f0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'كب كيك الفانيليا المخملية', 'Vanilla Cupcake', 'classic-vanilla-cupcake', 'كب كيك فانيليا هش مغطى بالكريمة الفاخرة.', 'CUPCAKE', 'PIECE', 45.00, 2, TRUE, TRUE, FALSE, 1),
('f0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'كعكة الشوكولاتة الفاخرة', 'Chocolate Cake', 'chocolate-delight-cake', 'كعكة شوكولاتة بطبقات غنية مع كريمة ناعمة.', 'CAKE', 'PIECE', 450.00, 4, TRUE, TRUE, TRUE, 2),
('f0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'كب كيك الكراميل', 'Caramel Cupcake', 'caramel-cupcake', 'كب كيك بنكهة الكراميل الغنية.', 'CUPCAKE', 'PIECE', 50.00, 2, TRUE, TRUE, FALSE, 3),
('f0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'كعكة الفراولة والكراميل', 'Strawberry Cake', 'strawberry-caramel-cake', 'كعكة الفراولة الطازجة مع لمسات الكراميل.', 'CAKE', 'PIECE', 420.00, 4, TRUE, TRUE, TRUE, 4),
('f0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000005', 'بوكس كب كيك مشكل 6 قطع', 'Cupcake Box 6', 'cupcake-box-6', 'تشكيلة كب كيك مشكلة مكونة من 6 قطع متنوعة.', 'BOX', 'BOX', 250.00, 2, TRUE, TRUE, FALSE, 5),
('f0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000003', 'جاتوه الفستق', 'Pistachio Gateau', 'pistachio-slice', 'شريحة جاتوه بنكهة الفستق الطبيعي.', 'GATEAU', 'PIECE', 65.00, 2, TRUE, FALSE, FALSE, 6);

INSERT INTO product_option_groups (product_id, option_group_id, display_order) VALUES
('f0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 1),
('f0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 2),
('f0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000001', 1);

INSERT INTO product_addon_assignments (product_id, addon_id) VALUES
('f0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001'),
('f0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000002'),
('f0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000001');

INSERT INTO product_images (product_id, storage_key, alt_text, display_order, is_primary) VALUES
('f0000001-0000-0000-0000-000000000001', '/placeholders/cupcake-1.jpg', 'كب كيك فانيليا', 1, TRUE),
('f0000001-0000-0000-0000-000000000002', '/placeholders/cake-1.jpg', 'كعكة شوكولاتة', 1, TRUE),
('f0000001-0000-0000-0000-000000000003', '/placeholders/cupcake-2.jpg', 'كب كيك كراميل', 1, TRUE),
('f0000001-0000-0000-0000-000000000004', '/placeholders/cake-2.jpg', 'كعكة فراولة', 1, TRUE),
('f0000001-0000-0000-0000-000000000005', '/placeholders/box-1.jpg', 'بوكس مشكل', 1, TRUE),
('f0000001-0000-0000-0000-000000000006', '/placeholders/gateau-1.jpg', 'جاتوه فستق', 1, TRUE);

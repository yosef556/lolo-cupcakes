-- =============================================================================
-- Migration V4: Stock & In-Stock/Pre-Order Tracking, Rich Categories, and Automation Integrations
-- =============================================================================

-- 1. Add Stock Quantity & Pre-Order Flag to Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 15;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_pre_order BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add New Diverse Pâtisserie Categories
INSERT INTO categories (id, name_ar, name_en, slug, display_order, is_active) VALUES
('c0000001-0000-0000-0000-000000000006', 'تارت ومخبوزات فرنسية', 'French Tarts & Pâtisserie', 'tarts-pastries', 6, TRUE),
('c0000001-0000-0000-0000-000000000007', 'تشيز كيك وموس بارد', 'Cheesecakes & Mousses', 'cheesecakes', 7, TRUE),
('c0000001-0000-0000-0000-000000000008', 'كافيه ومشروبات مختصة', 'Specialty Café & Drinks', 'cafe-drinks', 8, TRUE),
('c0000001-0000-0000-0000-000000000009', 'حلويات صحية وخفيفة', 'Healthy & Guilt-Free', 'healthy-sweets', 9, TRUE),
('c0000001-0000-0000-0000-000000000010', 'ميني سواريه وحفلات', 'Mini Soirée & Bites', 'mini-soiree', 10, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Add Signature Products for New Categories
INSERT INTO products (id, category_id, name_ar, name_en, slug, description_ar, product_type, selling_unit, base_price, prep_lead_hours, stock_quantity, is_pre_order, is_active, is_featured, is_customizable, display_order) VALUES
('f0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000006', 'تارت الفراولة الفرنسي بالباتيسيير', 'French Strawberry Tart', 'french-strawberry-tart', 'تارت باريسي مقرمش محشو بكريمة الباتيسيير الغنية وقطع الفراولة الطازجة.', 'GATEAU', 'PIECE', 85.00, 0, 20, FALSE, TRUE, TRUE, FALSE, 7),
('f0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000007', 'سان سيباستيان تشيز كيك مع الشوكولاتة', 'San Sebastian Cheesecake', 'san-sebastian-cheesecake', 'تشيز كيك محروق أسباني كريمي يذوب في الفم مع صوص الشوكولاتة البلجيكية الدافئة.', 'CAKE', 'PIECE', 490.00, 3, 8, TRUE, TRUE, TRUE, TRUE, 8),
('f0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000008', 'كولد برو الفانيليا والكراميل الملكي', 'Royal Vanilla Cold Brew', 'royal-vanilla-cold-brew', 'قهوة مختصة منقوعة باردة لمدة 18 ساعة مع لمسة فانيليا مدغشقر ورغوة الحليب الكريمية.', 'CUPCAKE', 'PIECE', 65.00, 0, 35, FALSE, TRUE, FALSE, FALSE, 9),
('f0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000004', 'بسبوسة ملكية مكرملة بالقشطة واللوز', 'Royal Almond Cream Basbousa', 'royal-cream-basbousa', 'بسبوسة مصرية أصلية بالسمن البلدي والقشطة الطازجة ورقائق اللوز المحمص.', 'ORIENTAL', 'WEIGHT', 280.00, 0, 15, FALSE, TRUE, TRUE, FALSE, 10),
('f0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000010', 'بوكس سواريه مشكل ملكي 12 قطعة', 'Royal Soirée Box 12pcs', 'royal-soiree-box-12', 'تشكيلة سواريه فاخرة من الإكلير والميني تارت وحلوى الشوكولاتة لعزوماتك الراقية.', 'BOX', 'BOX', 320.00, 2, 12, TRUE, TRUE, TRUE, FALSE, 11)
ON CONFLICT (id) DO NOTHING;

-- 4. Add Images for New Products
INSERT INTO product_images (product_id, storage_key, alt_text, display_order, is_primary) VALUES
('f0000001-0000-0000-0000-000000000007', '/placeholders/gateau-1.jpg', 'تارت الفراولة الفرنسي', 1, TRUE),
('f0000001-0000-0000-0000-000000000008', '/placeholders/cake-1.jpg', 'سان سيباستيان تشيز كيك', 1, TRUE),
('f0000001-0000-0000-0000-000000000009', '/placeholders/cupcake-1.jpg', 'كولد برو الفانيليا', 1, TRUE),
('f0000001-0000-0000-0000-000000000010', '/placeholders/cake-2.jpg', 'بسبوسة ملكية بالقشطة', 1, TRUE),
('f0000001-0000-0000-0000-000000000011', '/placeholders/box-1.jpg', 'بوكس سواريه مشكل', 1, TRUE)
ON CONFLICT DO NOTHING;

-- 5. Add Automation & Extended Store Settings
INSERT INTO store_settings (setting_key, setting_value, description) VALUES
('store_manager_whatsapp', '201099887766', 'رقم واتساب الشيف ومدير الفرع لاستلام خطة كل أوردر جديد فورياً'),
('facebook_page_url', 'https://facebook.com/LoloCupcakesOfficial', 'رابط صفحة فيسبوك الرسمية لمتجر لولو كب كيك'),
('facebook_page_id', '109283746592817', 'معرف صفحة فيسبوك لنشر البوستات والعروض'),
('n8n_webhook_url', 'http://localhost:5678/webhook/lolo-auto-post', 'رابط ويب هوك n8n لنشر المنتجات والطلبات تلقائياً على فيسبوك وواتساب'),
('store_address_ar', 'شارع 9 الرئيسي، ميدان فيكتوريا، المعادي، القاهرة', 'عنوان الفرع الرئيسي المعروض في الموقع'),
('store_phone', '01099887766', 'رقم الهاتف الرسمي للتواصل وخدمة العملاء'),
('store_working_hours', 'يومياً من 9:00 صباحاً حتى 11:30 مساءً', 'مواعيد العمل الرسمية واستقبال الطلبات')
ON CONFLICT (setting_key) DO NOTHING;

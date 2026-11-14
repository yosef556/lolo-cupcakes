-- =============================================================================
-- Lolo Cupcakes - Flyway Migration V1: Initial Schema
-- PostgreSQL Dialect, UUID Primary Keys, NUMERIC Monetary Fields, UTC Timestamps
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Identity & Permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- 2. Branches & Fulfillment Locations
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    address_ar TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    delivery_fee NUMERIC(10,2) NOT NULL CHECK (delivery_fee >= 0),
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (min_order_amount >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES delivery_zones(id) ON DELETE RESTRICT,
    title VARCHAR(100),
    street_address TEXT NOT NULL,
    building_number VARCHAR(50),
    floor_door VARCHAR(50),
    landmark TEXT,
    phone VARCHAR(50),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Catalog (Categories, Products, Variants, Options, Add-ons)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_storage_key VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    product_type VARCHAR(50) NOT NULL, -- CUPCAKE, CAKE, GATEAU, ORIENTAL, WESTERN, BOX, CUSTOM
    selling_unit VARCHAR(50) NOT NULL DEFAULT 'PIECE', -- PIECE, BOX, WEIGHT, CONFIGURABLE
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    prep_lead_hours INT NOT NULL DEFAULT 2 CHECK (prep_lead_hours >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_customizable BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active_type ON products(is_active, product_type);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    sku VARCHAR(100) UNIQUE,
    price_override NUMERIC(10,2) CHECK (price_override >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    selection_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE', -- SINGLE, MULTIPLE
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    min_selections INT NOT NULL DEFAULT 0,
    max_selections INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price_modifier >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_option_groups (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, option_group_id)
);

CREATE TABLE product_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_addon_assignments (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES product_addons(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, addon_id)
);

-- 4. Cart
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_token VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_carts_token ON carts(cart_token);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    selected_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Scheduling & Capacity
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE business_closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason_ar VARCHAR(255)
);

CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    fulfillment_type VARCHAR(50) NOT NULL DEFAULT 'BOTH', -- DELIVERY, PICKUP, BOTH
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_time_slots_date_branch ON time_slots(slot_date, branch_id, is_active);

-- 6. Orders, Items, Status History & Capacity Reservation
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_order_number VARCHAR(50) NOT NULL UNIQUE,
    tracking_token VARCHAR(128) NOT NULL UNIQUE,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    fulfillment_type VARCHAR(50) NOT NULL, -- DELIVERY, PICKUP
    branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
    delivery_zone_id UUID REFERENCES delivery_zones(id) ON DELETE RESTRICT,
    delivery_address_snapshot JSONB,
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
    scheduled_for_date DATE NOT NULL,
    scheduled_for_time_range VARCHAR(100) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'EGP',
    order_status VARCHAR(50) NOT NULL, -- PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, COMPLETED, CANCELLED, REJECTED
    payment_status VARCHAR(50) NOT NULL, -- UNPAID, PENDING_VERIFICATION, PAID, REJECTED, REFUNDED
    payment_method VARCHAR(50) NOT NULL, -- CASH, MANUAL_TRANSFER
    customer_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_public_number ON orders(public_order_number);
CREATE INDEX idx_orders_tracking_token ON orders(tracking_token);
CREATE INDEX idx_orders_status_date ON orders(order_status, scheduled_for_date);

CREATE TABLE capacity_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    reserved_count INT NOT NULL DEFAULT 1 CHECK (reserved_count > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    variant_name_snapshot VARCHAR(255),
    unit_price_snapshot NUMERIC(10,2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0),
    options_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    addons_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    custom_details_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payments & Proofs
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'EGP',
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID', -- UNPAID, PENDING_VERIFICATION, PAID, REJECTED, REFUNDED
    payment_reference VARCHAR(255),
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Custom Cake Requests & Quotations
CREATE TABLE custom_cake_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_reference VARCHAR(50) NOT NULL UNIQUE,
    access_token VARCHAR(128) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    requested_date DATE NOT NULL,
    servings_needed INT,
    flavor_preference VARCHAR(255),
    message_on_cake TEXT,
    notes TEXT,
    reference_image_storage_key VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, QUOTED, ACCEPTED, DECLINED, EXPIRED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_cake_ref ON custom_cake_requests(public_reference);

CREATE TABLE custom_cake_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES custom_cake_requests(id) ON DELETE CASCADE,
    quoted_price NUMERIC(10,2) NOT NULL CHECK (quoted_price > 0),
    terms_and_details TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, EXPIRED
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Marketing (Coupons), Settings & Audit Logs
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(30) NOT NULL, -- PERCENTAGE, FIXED
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (min_order_amount >= 0),
    max_uses INT,
    uses_count INT NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Initial Seed Data (Roles & Core Settings Placeholders)
INSERT INTO roles (code, name_ar, description) VALUES
('ROLE_OWNER', 'المالك', 'صلاحيات كاملة لإدارة المتجر والإعدادات والموظفين'),
('ROLE_MANAGER', 'مدير الفرع', 'صلاحيات تشغيلية لإدارة الطلبات والكتالوج والجدولة'),
('ROLE_STAFF', 'موظف تشغيل', 'صلاحيات محدودة لعرض ومتابعة مراحل تجهيز الطلبات'),
('ROLE_CUSTOMER', 'عميل مسجل', 'صلاحيات حساب العميل والطلبات والعناوين السابقة');

INSERT INTO branches (name_ar, name_en, address_ar, phone, is_active) VALUES
('فرع القاهرة الرئيسي', 'Cairo Main Branch', 'المعادي، القاهرة - شارع 9', '01000000000', TRUE);

INSERT INTO delivery_zones (name_ar, name_en, delivery_fee, min_order_amount, is_active, display_order) VALUES
('المعادي والمقطم', 'Maadi & Mokattam', 40.00, 150.00, TRUE, 1),
('التجمع والقاهرة الجديدة', 'New Cairo', 60.00, 200.00, TRUE, 2),
('مدينة نصر ومصر الجديدة', 'Nasr City & Heliopolis', 50.00, 200.00, TRUE, 3),
('الزمالك والمهندسين والدقي', 'Zamalek & Dokki', 55.00, 200.00, TRUE, 4);

INSERT INTO store_settings (setting_key, setting_value, description) VALUES
('store_name_ar', 'لولو كب كيك - Lolo Cupcakes', 'اسم المتجر الرسمي بالعربية'),
('currency', 'EGP', 'العملة المعتمدة'),
('business_timezone', 'Africa/Cairo', 'المنطقة الزمنية التشغيلية'),
('contact_phone', '01000000000', 'رقم الهاتف الرسمي للتواصل وخدمة العملاء'),
('contact_whatsapp', '201000000000', 'رقم الواتساب الرسمي للمتجر'),
('transfer_instructions', 'يرجى التحويل إلى حساب إنستاباي أو المحفظة الإلكترونية على الرقم 01000000000 ورفع صورة إشعار التحويل لتأكيد الطلب.', 'تعليمات التحويل البنكي المعروضة للعميل');

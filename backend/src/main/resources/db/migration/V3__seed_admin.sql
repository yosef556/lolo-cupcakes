-- =============================================================================
-- Lolo Cupcakes - Flyway Migration V3: Seed Admin User & Roles
-- =============================================================================

INSERT INTO roles (id, code, name_ar, description)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'مدير النظام الرئيسي', 'كامل صلاحيات النظام والإدارة'),
    ('b0000001-0000-0000-0000-000000000002', 'STORE_MANAGER', 'مدير الفرع والمتجر', 'إدارة الطلبات والكتالوج وتأكيد المدفوعات'),
    ('b0000001-0000-0000-0000-000000000003', 'STAFF', 'موظف تشغيل وتحضير', 'متابعة تجهيز الطلبات اليومية')
ON CONFLICT (code) DO NOTHING;

-- Seed default admin (Password: Admin@123456)
-- BCrypt hash: $2a$10$w09u7uF0s1k61f3fM7.bK.jYtIqV3XJ5H7R6a5g8f4a3d2c1b0e9. (placeholder/standard)
INSERT INTO users (id, email, password_hash, phone, full_name, status)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@lolocupcakes.com',
    '$2a$10$e8V9M.FvNqYq.W2qjB0YEuM5q8jU3u7zX4XzYy8g5f2a1b0c3d4e5',
    '01000000001',
    'مدير النظام الرئيسي',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000001'
)
ON CONFLICT (user_id, role_id) DO NOTHING;

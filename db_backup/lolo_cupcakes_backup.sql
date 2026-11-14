--
-- PostgreSQL database dump
--

\restrict jWCmaH42aorVlK518ccD6AxPx7jesQjPoD0U7qfHMwmxHVQdAcNASevF4fCGmMf

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100),
    ip_address character varying(100),
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    address_ar text NOT NULL,
    phone character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: business_closures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_closures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    reason_ar character varying(255)
);


--
-- Name: business_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    open_time time without time zone NOT NULL,
    close_time time without time zone NOT NULL,
    is_closed boolean DEFAULT false NOT NULL,
    CONSTRAINT business_hours_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: capacity_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capacity_reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    time_slot_id uuid NOT NULL,
    order_id uuid NOT NULL,
    reserved_count integer DEFAULT 1 NOT NULL,
    status character varying(50) DEFAULT 'CONFIRMED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT capacity_reservations_reserved_count_check CHECK ((reserved_count > 0))
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    quantity integer NOT NULL,
    selected_configuration jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_token character varying(100) NOT NULL,
    customer_id uuid,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    slug character varying(255) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    image_storage_key character varying(500),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(30) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_order_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    max_uses integer,
    uses_count integer DEFAULT 0 NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric)),
    CONSTRAINT coupons_min_order_amount_check CHECK ((min_order_amount >= (0)::numeric))
);


--
-- Name: custom_cake_quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_cake_quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    quoted_price numeric(10,2) NOT NULL,
    terms_and_details text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    created_by_user_id uuid NOT NULL,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT custom_cake_quotes_quoted_price_check CHECK ((quoted_price > (0)::numeric))
);


--
-- Name: custom_cake_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_cake_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    public_reference character varying(50) NOT NULL,
    access_token character varying(128) NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(50) NOT NULL,
    customer_email character varying(255),
    requested_date date NOT NULL,
    servings_needed integer,
    flavor_preference character varying(255),
    message_on_cake text,
    notes text,
    reference_image_storage_key character varying(500),
    status character varying(50) DEFAULT 'SUBMITTED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    zone_id uuid NOT NULL,
    title character varying(100),
    street_address text NOT NULL,
    building_number character varying(50),
    floor_door character varying(50),
    landmark text,
    phone character varying(50),
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    full_name character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(255),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    delivery_fee numeric(10,2) NOT NULL,
    min_order_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT delivery_zones_delivery_fee_check CHECK ((delivery_fee >= (0)::numeric)),
    CONSTRAINT delivery_zones_min_order_amount_check CHECK ((min_order_amount >= (0)::numeric))
);


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: option_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    selection_type character varying(30) DEFAULT 'SINGLE'::character varying NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    min_selections integer DEFAULT 0 NOT NULL,
    max_selections integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: option_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_values (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    option_group_id uuid NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    price_modifier numeric(10,2) DEFAULT 0.00 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT option_values_price_modifier_check CHECK ((price_modifier >= (0)::numeric))
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    variant_id uuid,
    product_name_snapshot character varying(255) NOT NULL,
    variant_name_snapshot character varying(255),
    unit_price_snapshot numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    line_total numeric(10,2) NOT NULL,
    options_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    addons_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    custom_details_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT order_items_line_total_check CHECK ((line_total >= (0)::numeric)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_unit_price_snapshot_check CHECK ((unit_price_snapshot >= (0)::numeric))
);


--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    previous_status character varying(50),
    new_status character varying(50) NOT NULL,
    changed_by_user_id uuid,
    note text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    public_order_number character varying(50) NOT NULL,
    tracking_token character varying(128) NOT NULL,
    idempotency_key character varying(128) NOT NULL,
    customer_id uuid,
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(50) NOT NULL,
    fulfillment_type character varying(50) NOT NULL,
    branch_id uuid,
    delivery_zone_id uuid,
    delivery_address_snapshot jsonb,
    time_slot_id uuid NOT NULL,
    scheduled_for_date date NOT NULL,
    scheduled_for_time_range character varying(100) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EGP'::character varying NOT NULL,
    order_status character varying(50) NOT NULL,
    payment_status character varying(50) NOT NULL,
    payment_method character varying(50) NOT NULL,
    customer_notes text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT orders_delivery_fee_check CHECK ((delivery_fee >= (0)::numeric)),
    CONSTRAINT orders_discount_amount_check CHECK ((discount_amount >= (0)::numeric)),
    CONSTRAINT orders_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


--
-- Name: payment_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_proofs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    storage_key character varying(500) NOT NULL,
    original_filename character varying(255),
    file_size integer,
    mime_type character varying(100),
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    payment_method character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EGP'::character varying NOT NULL,
    status character varying(50) DEFAULT 'UNPAID'::character varying NOT NULL,
    payment_reference character varying(255),
    reviewed_by_user_id uuid,
    reviewed_at timestamp with time zone,
    review_note text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payments_amount_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_addon_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_addon_assignments (
    product_id uuid NOT NULL,
    addon_id uuid NOT NULL
);


--
-- Name: product_addons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_addons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT product_addons_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    storage_key character varying(500) NOT NULL,
    alt_text character varying(255),
    display_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_option_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_option_groups (
    product_id uuid NOT NULL,
    option_group_id uuid NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid,
    customer_name character varying(150) NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT product_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    sku character varying(100),
    price_override numeric(10,2),
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT product_variants_price_override_check CHECK ((price_override >= (0)::numeric))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255),
    slug character varying(255) NOT NULL,
    description_ar text,
    description_en text,
    product_type character varying(50) NOT NULL,
    selling_unit character varying(50) DEFAULT 'PIECE'::character varying NOT NULL,
    base_price numeric(10,2) NOT NULL,
    prep_lead_hours integer DEFAULT 2 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_customizable boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    stock_quantity integer DEFAULT 15 NOT NULL,
    is_pre_order boolean DEFAULT false NOT NULL,
    CONSTRAINT products_base_price_check CHECK ((base_price >= (0)::numeric)),
    CONSTRAINT products_prep_lead_hours_check CHECK ((prep_lead_hours >= 0))
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: store_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    slot_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    fulfillment_type character varying(50) DEFAULT 'BOTH'::character varying NOT NULL,
    max_capacity integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT time_slots_max_capacity_check CHECK ((max_capacity > 0))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(50),
    full_name character varying(255) NOT NULL,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    avatar_url text
);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, actor_user_id, action, entity_type, entity_id, ip_address, details, created_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, name_ar, name_en, address_ar, phone, is_active, created_at, updated_at) FROM stdin;
2d0be48c-7fe8-4b42-9df8-865931fe9e77	فرع القاهرة الرئيسي	Cairo Main Branch	الشيخ زايد	01069915609	t	2026-11-12 01:45:19.101444+02	2026-11-12 01:45:19.101444+02
\.


--
-- Data for Name: business_closures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_closures (id, branch_id, start_datetime, end_datetime, reason_ar) FROM stdin;
\.


--
-- Data for Name: business_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_hours (id, branch_id, day_of_week, open_time, close_time, is_closed) FROM stdin;
\.


--
-- Data for Name: capacity_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capacity_reservations (id, time_slot_id, order_id, reserved_count, status, created_at) FROM stdin;
c7a333f6-20f2-4e03-b31a-4de02e845149	a8d8d4ae-477f-4e0d-90bb-524634d8e354	dc4bce67-2638-478e-9118-bb94e1128e9a	1	CONFIRMED	2026-11-12 01:58:48.457226+02
db087de7-a46b-4d59-bed6-34285ef9719c	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	d88d6c23-1761-485c-b5d9-a3b023fb6b94	1	CONFIRMED	2026-11-12 01:59:41.475616+02
fe401e25-a6ed-4af6-9c97-449ae4d1f490	de756477-ed91-4e5f-a576-4dc2cfe6b08a	bc709a4a-4832-46e5-97c3-1ee2a5076691	1	CONFIRMED	2026-11-12 05:30:55.781249+02
fbf3ff2b-a4c1-499d-880c-5a901f8a7056	26b36ae2-0e8c-46de-9768-5cb32bdd30b3	c9015c25-485a-4657-9c80-5f5a3ddc4dad	1	CONFIRMED	2026-11-12 05:40:28.908425+02
5adbd09a-8df7-46fb-b91b-c77fc21cce39	74604000-8370-44c4-9c79-66f4f715d140	6635ce6b-fc82-4fc6-84bd-31c604465ce4	1	CONFIRMED	2026-11-13 20:33:53.369165+02
cab6cc13-2b85-4f43-a9e0-d0769c9647e4	26b36ae2-0e8c-46de-9768-5cb32bdd30b3	c3e6654f-2f1e-4294-82bb-f3442af9cce7	1	CONFIRMED	2026-11-13 20:36:18.520656+02
b8493bd9-1267-49e7-adc9-e0817e7b3ad6	a8d8d4ae-477f-4e0d-90bb-524634d8e354	feb5368b-a6ad-481e-b883-8eae582aed60	1	CONFIRMED	2026-11-12 01:53:23.301159+02
d8e4dffd-0048-4caf-82a9-f942d694a841	a8d8d4ae-477f-4e0d-90bb-524634d8e354	8c25bf96-ad6d-4628-95f9-ef51514e64a1	1	CONFIRMED	2026-11-12 02:01:39.861555+02
11cc1747-85ea-4f4d-9384-b8b740f64088	a8d8d4ae-477f-4e0d-90bb-524634d8e354	db93ac50-bb61-4654-bbb8-37d74cb533f8	1	CONFIRMED	2026-11-12 02:08:07.229331+02
eab98ee7-51ba-4d84-b793-62796d34811e	a8d8d4ae-477f-4e0d-90bb-524634d8e354	6d71060d-156b-4bef-8e65-1dfca726bdc0	1	CONFIRMED	2026-11-12 02:22:07.847184+02
13fc9f1e-82a6-4286-bd96-7bfe5a5688ba	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2ba7e40c-69f6-4b34-898b-7d011a7dbe9e	1	CONFIRMED	2026-11-12 04:41:59.078398+02
23c75f70-16b9-4336-8fc3-eb2a21103db6	a8d8d4ae-477f-4e0d-90bb-524634d8e354	083c69f2-723f-4ce6-9706-3b81b99248b2	1	CONFIRMED	2026-11-12 04:42:40.0665+02
bc95ccd7-6daa-47a5-97a9-eca5767ff133	a8d8d4ae-477f-4e0d-90bb-524634d8e354	c6e0fa25-90f1-4340-b281-2887cc7d31de	1	CONFIRMED	2026-11-12 05:09:24.170145+02
744a2126-8064-4b42-976b-35c9a7940bcc	a8d8d4ae-477f-4e0d-90bb-524634d8e354	10a90aa2-f3d5-49c9-b743-a1f8133d4093	1	CONFIRMED	2026-11-12 05:12:05.983423+02
918ca89a-5aa2-4bce-bc98-5254870091b0	a8d8d4ae-477f-4e0d-90bb-524634d8e354	5fec6b87-1c5d-4b53-ba3d-dc8a8fd52935	1	CONFIRMED	2026-11-12 05:29:19.600965+02
64472612-3b52-40ee-ae62-36db0f55f7ac	a8d8d4ae-477f-4e0d-90bb-524634d8e354	5bf733c4-fbf4-4db9-831b-a553864237f1	1	CONFIRMED	2026-11-12 05:55:32.481354+02
e9ae5971-f669-4dda-9882-af5d3b4b3c1c	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	87576b49-1472-46d9-8743-6ae302782e72	1	CONFIRMED	2026-11-12 02:01:16.551455+02
e51c58ea-7140-4c58-addf-ad5f1a01a873	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	d4f21374-b123-43c6-a615-f6a4649927f5	1	CONFIRMED	2026-11-12 02:01:40.0112+02
d44a2889-70e0-4b5c-8a22-915f50b34157	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	8b5272cf-530a-4ba7-9300-525027018c15	1	CONFIRMED	2026-11-12 02:08:07.511289+02
0003c0bb-d1fe-415d-8a15-2690631befc0	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	dc82a25f-fdc7-40d9-af66-67ff25f6b400	1	CONFIRMED	2026-11-12 02:22:08.151425+02
a1fab13b-a881-4ed6-ab31-0442ec24a1f6	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	de62d236-843f-471a-8385-486920edca3b	1	CONFIRMED	2026-11-12 04:41:59.385338+02
f149fd81-2774-4992-8958-de1ddab8cd84	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	1	CONFIRMED	2026-11-12 04:42:40.322079+02
3c4f910e-e826-41a6-9929-3a5eec39f0ec	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	d2620254-0a4f-46c3-bd8f-49b60dcbc800	1	CONFIRMED	2026-11-12 05:09:24.488593+02
cef65bcc-bba4-4799-9b74-cd91ead77d5f	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	e6b9b5a2-d012-48f8-9224-7142102dd049	1	CONFIRMED	2026-11-12 05:12:06.267257+02
5b076bcf-8f86-4f06-80cc-68d91f6a62aa	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	9156e9aa-ed5e-4537-8ecf-0dd1311fc593	1	CONFIRMED	2026-11-12 05:29:19.886153+02
043a4e21-095f-4bdf-bc42-aaa523979e3a	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	3e43e665-9782-4ad5-8864-2b8c34afd8a4	1	CONFIRMED	2026-11-12 05:55:33.092325+02
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, cart_id, product_id, variant_id, quantity, selected_configuration, created_at, updated_at) FROM stdin;
97734cb2-b6d1-482b-8095-5e4213160e19	7714aa68-4f00-495b-b6e0-e04c86ed3a61	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 01:46:17.073337+02	2026-11-12 01:46:17.073346+02
428ebe4d-9dc2-448b-8e50-973c10473713	7714aa68-4f00-495b-b6e0-e04c86ed3a61	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 01:46:17.113779+02	2026-11-12 01:46:17.113779+02
bda94c49-59ed-4701-8d3e-5728520a8ebe	6d9888c7-ca33-4a23-91de-af0890e9e4bb	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 01:48:34.051243+02	2026-11-12 01:48:34.051245+02
d4647b10-5397-492d-b5ce-6adb9f2cf4c2	6d9888c7-ca33-4a23-91de-af0890e9e4bb	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 01:48:34.093407+02	2026-11-12 01:48:34.093407+02
c80b4fef-f046-4094-b3a1-743ce7d3dde9	7fda47a1-a31f-4855-9cb4-1ce82868bdaa	f0000001-0000-0000-0000-000000000001	\N	2	{"addonIds": [], "optionValueIds": []}	2026-11-12 01:58:19.60731+02	2026-11-12 01:58:19.607312+02
c972d82d-fdad-48fb-ad72-379c1901a082	fe86b69a-36b2-47fd-9b72-10b2fd4779fb	f0000001-0000-0000-0000-000000000001	\N	2	{"addonIds": [], "optionValueIds": []}	2026-11-12 01:59:14.253864+02	2026-11-12 01:59:14.253867+02
b043c7e0-9f3e-4323-bb5d-67639f43b1e1	1f3eaeec-83d8-4630-b9f1-37139b9d5f0c	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 02:01:37.605749+02	2026-11-12 02:01:37.605751+02
1cad0943-c727-4d64-a181-440f5ec0f5c4	1f3eaeec-83d8-4630-b9f1-37139b9d5f0c	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 02:01:37.644085+02	2026-11-12 02:01:37.644085+02
97241102-be94-4423-97a3-25cb2e3a37fa	a7f32011-efc3-468d-8cec-9ef493067d8f	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 02:08:04.669142+02	2026-11-12 02:08:04.669143+02
2e57a45f-2c15-4496-80c7-039ae44b1096	a7f32011-efc3-468d-8cec-9ef493067d8f	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 02:08:04.706318+02	2026-11-12 02:08:04.706318+02
5d29834e-61b8-4b24-a219-2c1249ab4e20	62a312ae-b7c4-434d-86e5-1ae317839238	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 02:22:05.40866+02	2026-11-12 02:22:05.408661+02
09e46fa1-dfab-44a6-9424-ef7a9a149271	62a312ae-b7c4-434d-86e5-1ae317839238	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 02:22:05.444102+02	2026-11-12 02:22:05.444102+02
df393155-3fb0-4623-86fd-4a7f2de15079	be221347-0908-4d90-9b28-a12959a9c929	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 04:41:56.927332+02	2026-11-12 04:41:56.927333+02
030112a8-5a28-4c67-8c22-2c18718536b7	be221347-0908-4d90-9b28-a12959a9c929	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 04:41:56.956906+02	2026-11-12 04:41:56.956906+02
717a4001-3cd5-472e-8f0c-cddc437af94d	4b0f49d6-1531-4e7a-a445-5e6fe1b0a22f	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 04:42:38.057963+02	2026-11-12 04:42:38.057965+02
ec2e0bb4-a68a-41d2-a5ff-6df6a3cb9c07	4b0f49d6-1531-4e7a-a445-5e6fe1b0a22f	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 04:42:38.090813+02	2026-11-12 04:42:38.090813+02
a5a317c4-fd65-45b6-b74a-e0c4dd37c12c	46a6c9e7-750c-42d3-84d2-92ccaaa7e2ad	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 05:09:21.768197+02	2026-11-12 05:09:21.768197+02
576bfdd0-54ea-4208-b567-865845fd9cfb	46a6c9e7-750c-42d3-84d2-92ccaaa7e2ad	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 05:09:21.802023+02	2026-11-12 05:09:21.802023+02
978e8f8c-5cd5-4236-9c72-8d894297aa0c	94a561ff-abbc-4afc-8b0c-2d44ac4c1b5d	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 05:12:03.291315+02	2026-11-12 05:12:03.291317+02
cd11c8d4-04df-4d85-9da8-474ba51341b5	94a561ff-abbc-4afc-8b0c-2d44ac4c1b5d	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 05:12:03.336433+02	2026-11-12 05:12:03.336434+02
7fc4bf84-78df-4ec8-bcff-abd82496f652	1efb3d01-7c14-4ef7-ab54-fc0d9afdf7c6	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 05:29:17.474388+02	2026-11-12 05:29:17.474389+02
3cc9bde1-ac7f-4e54-b577-d6e7b31a4f43	1efb3d01-7c14-4ef7-ab54-fc0d9afdf7c6	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 05:29:17.533437+02	2026-11-12 05:29:17.533437+02
280eb6e9-9d3a-450f-9cc3-dbf61e3e43ef	d18d95a7-6ba8-4bd3-b3aa-cdc29b1b0437	f0000001-0000-0000-0000-000000000001	\N	1	{}	2026-11-12 05:30:33.345916+02	2026-11-12 05:30:33.345917+02
72fee8d1-29b0-4e82-92ef-0a34f7e47b5a	0e66fe32-29b3-4721-a2e9-c5c1467d6b1d	f0000001-0000-0000-0000-000000000001	\N	2	{"note": "Sample Note", "addonIds": [], "optionValueIds": []}	2026-11-12 05:55:30.368952+02	2026-11-12 05:55:30.368953+02
4afc1f31-b6b9-4c4c-906a-90fef79d5bff	0e66fe32-29b3-4721-a2e9-c5c1467d6b1d	f0000001-0000-0000-0000-000000000002	\N	1	{"note": "Custom message on cake test", "addonIds": ["e0000001-0000-0000-0000-000000000001"], "optionValueIds": ["d0000002-0000-0000-0000-000000000002", "d0000002-0000-0000-0000-000000000005"]}	2026-11-12 05:55:30.403458+02	2026-11-12 05:55:30.403459+02
7ddb579e-8fde-4f20-add1-196deb27d841	d8616da2-2b6f-4be6-92a7-04ec52462228	e7e876da-744c-4261-9f33-dd9aa05b20e2	\N	1	{"addonIds": [], "optionValueIds": []}	2026-11-14 00:14:51.721373+02	2026-11-14 00:14:51.721373+02
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, cart_token, customer_id, expires_at, created_at, updated_at) FROM stdin;
64d42b8c-894e-47f1-bb8c-53724420e4dd	39658c17-eb7b-4b1d-8825-92a5995dfc6c	\N	2026-11-26 01:45:23.967864+02	2026-11-12 01:45:23.967787+02	2026-11-12 01:45:23.967789+02
07cbfb12-fdab-4937-9dec-c942619ec972	d57ceaee-46b7-493e-a33f-ef8e23d11dd8	\N	2026-11-26 01:45:53.178482+02	2026-11-12 01:45:53.178418+02	2026-11-12 01:45:53.17842+02
7714aa68-4f00-495b-b6e0-e04c86ed3a61	76fc35b6-2491-4d92-97c9-39422993b493	\N	2026-11-26 01:46:16.827734+02	2026-11-12 01:46:16.827675+02	2026-11-12 01:46:16.827676+02
6d9888c7-ca33-4a23-91de-af0890e9e4bb	357caf1d-3996-4562-8ca1-c1b2e3a83511	\N	2026-11-26 01:48:33.784616+02	2026-11-12 01:48:33.784525+02	2026-11-12 01:48:33.784527+02
7fda47a1-a31f-4855-9cb4-1ce82868bdaa	3bd0032b-8017-41af-95bf-285965defbff	\N	2026-11-26 01:58:19.457829+02	2026-11-12 01:58:19.457786+02	2026-11-12 01:58:19.457788+02
715d55a7-1c02-4b2e-a058-c86f08cd5e35	227493e4-ff33-4336-9099-37cfb71c62d4	\N	2026-11-26 01:58:48.152729+02	2026-11-12 01:58:48.152672+02	2026-11-12 01:58:48.152673+02
fe86b69a-36b2-47fd-9b72-10b2fd4779fb	7bdbb2df-9160-41e2-a373-72aaa2201936	\N	2026-11-26 01:59:14.087955+02	2026-11-12 01:59:14.087906+02	2026-11-12 01:59:14.087907+02
75d06671-7330-427a-a66d-53912356d23b	eebc205d-aaf7-4421-bbb8-45f30b882014	\N	2026-11-26 01:59:41.243351+02	2026-11-12 01:59:41.24331+02	2026-11-12 01:59:41.243316+02
54e48f53-146f-41b8-b265-13492db38746	772f033d-7e48-40a3-965b-2246aaa33591	\N	2026-11-26 02:01:16.299297+02	2026-11-12 02:01:16.299256+02	2026-11-12 02:01:16.299258+02
1f3eaeec-83d8-4630-b9f1-37139b9d5f0c	07d96733-b2fb-4607-b159-9526f7c62aa5	\N	2026-11-26 02:01:37.32911+02	2026-11-12 02:01:37.329044+02	2026-11-12 02:01:37.329046+02
a1d66c2a-fc9b-4a51-b66a-749ce9877dae	53e69143-c274-4ce3-a3ee-ed842c84d751	\N	2026-11-26 02:01:39.932216+02	2026-11-12 02:01:39.932197+02	2026-11-12 02:01:39.932197+02
a7f32011-efc3-468d-8cec-9ef493067d8f	1fca8f66-93e3-464f-bb70-89764b6c1d95	\N	2026-11-26 02:08:04.409059+02	2026-11-12 02:08:04.409013+02	2026-11-12 02:08:04.409016+02
87cfe7e0-032a-4d37-8078-2d90fb0f4e1d	4c402723-d0ee-4b28-8c46-eef721731e86	\N	2026-11-26 02:08:07.455339+02	2026-11-12 02:08:07.45531+02	2026-11-12 02:08:07.45531+02
62a312ae-b7c4-434d-86e5-1ae317839238	0bdb7394-b218-4f3f-9dbd-3105df83313e	\N	2026-11-26 02:22:05.125684+02	2026-11-12 02:22:05.125627+02	2026-11-12 02:22:05.125628+02
8c08855a-3f48-49be-a396-ee7582e8602a	6c4870c3-5ba8-4da1-b0bb-af788f70ecdf	\N	2026-11-26 02:22:08.099558+02	2026-11-12 02:22:08.099519+02	2026-11-12 02:22:08.099519+02
627c6a0d-b92d-40ce-932c-3ec8a58bdf29	c736bdf6-1e38-4246-8cdd-77effa218584	\N	2026-11-26 02:23:49.767865+02	2026-11-12 02:23:49.76783+02	2026-11-12 02:23:49.767831+02
d8616da2-2b6f-4be6-92a7-04ec52462228	f96ac079-0e86-4256-b5e0-76796fcd88aa	\N	2026-11-26 02:23:49.841748+02	2026-11-12 02:23:49.84171+02	2026-11-12 02:23:49.841711+02
be221347-0908-4d90-9b28-a12959a9c929	7fc01367-0c83-40fd-89c3-dbec00a5b8ac	\N	2026-11-26 04:41:56.709108+02	2026-11-12 04:41:56.709086+02	2026-11-12 04:41:56.709087+02
b01a5af5-97b3-480f-916b-8b65c419de8b	3f8abd2e-7bce-49fe-9142-6f7fe7a421b0	\N	2026-11-26 04:41:59.330114+02	2026-11-12 04:41:59.3301+02	2026-11-12 04:41:59.3301+02
4b0f49d6-1531-4e7a-a445-5e6fe1b0a22f	432cb8c8-48e2-4811-8de8-e4d0b89c122d	\N	2026-11-26 04:42:37.801983+02	2026-11-12 04:42:37.801923+02	2026-11-12 04:42:37.801931+02
509e3d0e-9ef6-412b-b317-85570bd2314e	69c9e65b-952f-4798-a9ad-f8aab07f1fdb	\N	2026-11-26 04:42:40.265026+02	2026-11-12 04:42:40.265002+02	2026-11-12 04:42:40.265003+02
46a6c9e7-750c-42d3-84d2-92ccaaa7e2ad	35eb5212-88a1-4394-9f08-214bfd787604	\N	2026-11-26 05:09:21.518731+02	2026-11-12 05:09:21.518674+02	2026-11-12 05:09:21.518674+02
26f62bfe-1c4a-4b7e-8e21-1b78be147b9f	2d277613-b548-4b40-84c1-2eec5806b1ad	\N	2026-11-26 05:09:24.428499+02	2026-11-12 05:09:24.428452+02	2026-11-12 05:09:24.428452+02
94a561ff-abbc-4afc-8b0c-2d44ac4c1b5d	971b6249-260a-4c99-8039-fbe7946698ee	\N	2026-11-26 05:12:02.971648+02	2026-11-12 05:12:02.971601+02	2026-11-12 05:12:02.971602+02
c8c11940-8daa-43e4-9392-93847c57e2ef	85da9ffc-bf89-4810-822b-b494f2b28a58	\N	2026-11-26 05:12:06.201804+02	2026-11-12 05:12:06.201761+02	2026-11-12 05:12:06.201761+02
1efb3d01-7c14-4ef7-ab54-fc0d9afdf7c6	9491ac88-d616-499a-846f-776a2ab45a5d	\N	2026-11-26 05:29:17.249761+02	2026-11-12 05:29:17.249731+02	2026-11-12 05:29:17.249738+02
c96751d6-7c7a-4fcf-a3cc-1a7d38780499	faacc411-d355-4d6c-8c73-2da5c2628419	\N	2026-11-26 05:29:19.827588+02	2026-11-12 05:29:19.827548+02	2026-11-12 05:29:19.827549+02
d18d95a7-6ba8-4bd3-b3aa-cdc29b1b0437	e7f7bc5b-43c9-4e37-8207-7f0aa7c9d4c6	\N	2026-11-26 05:30:33.219156+02	2026-11-12 05:30:33.219135+02	2026-11-12 05:30:33.219136+02
a8c217f7-f1a6-468b-b3c6-0dc9853c2fa5	89350246-f2d2-4257-9cf4-580aa94b56d8	\N	2026-11-26 05:30:55.712897+02	2026-11-12 05:30:55.712862+02	2026-11-12 05:30:55.712862+02
0e66fe32-29b3-4721-a2e9-c5c1467d6b1d	10351e11-02c3-46d8-92ef-0dfdfacb79a2	\N	2026-11-26 05:55:30.120848+02	2026-11-12 05:55:30.120776+02	2026-11-12 05:55:30.120782+02
f976213d-6ab1-4ed5-bef8-4c768b225f7d	c84bc3e4-7a2e-452d-b50c-0d993167609a	\N	2026-11-26 05:55:33.039303+02	2026-11-12 05:55:33.039271+02	2026-11-12 05:55:33.039272+02
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, parent_id, name_ar, name_en, slug, display_order, is_active, image_storage_key, created_at, updated_at) FROM stdin;
c0000001-0000-0000-0000-000000000001	\N	كب كيك	Cupcakes	cupcakes	1	t	\N	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02
c0000001-0000-0000-0000-000000000002	\N	كيك وتورتات	Cakes	cakes	2	t	\N	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02
c0000001-0000-0000-0000-000000000003	\N	قطع جاتوه	Gateaux	gateaux	3	t	\N	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02
c0000001-0000-0000-0000-000000000004	\N	حلويات شرقية	Oriental	oriental	4	t	\N	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02
c0000001-0000-0000-0000-000000000005	\N	بوكسات مشكلة	Boxes	boxes	5	t	\N	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02
8ced3c5f-4620-429f-9be8-c0641c0b68e3	\N	غربي	sjgydsg	ع	1	t	\N	2026-11-12 03:54:39.144927+02	2026-11-12 03:54:39.144927+02
c0000001-0000-0000-0000-000000000006	\N	تارت ومخبوزات فرنسية	French Tarts & Pâtisserie	tarts-pastries	6	t	\N	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02
c0000001-0000-0000-0000-000000000007	\N	تشيز كيك وموس بارد	Cheesecakes & Mousses	cheesecakes	7	t	\N	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02
c0000001-0000-0000-0000-000000000008	\N	كافيه ومشروبات مختصة	Specialty Café & Drinks	cafe-drinks	8	t	\N	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02
c0000001-0000-0000-0000-000000000009	\N	حلويات صحية وخفيفة	Healthy & Guilt-Free	healthy-sweets	9	t	\N	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02
c0000001-0000-0000-0000-000000000010	\N	ميني سواريه وحفلات	Mini Soirée & Bites	mini-soiree	10	t	\N	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, code, discount_type, discount_value, min_order_amount, max_uses, uses_count, start_date, end_date, is_active, created_at) FROM stdin;
dc78f16d-77c9-47af-b2c2-abb58e9cd4bc	LOLO50	FIXED	50.00	300.00	\N	0	\N	\N	t	2026-11-13 20:52:40.693971+02
dfd60b12-739d-41fe-9195-1c252f49f6bb	EID2026	PERCENTAGE	15.00	200.00	\N	0	\N	\N	t	2026-11-13 20:52:40.693971+02
8a183979-ff9c-48e4-a945-35937e37a2bb	WELCOME10	PERCENTAGE	10.00	150.00	\N	0	\N	\N	t	2026-11-13 20:52:40.693971+02
\.


--
-- Data for Name: custom_cake_quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.custom_cake_quotes (id, request_id, quoted_price, terms_and_details, expires_at, status, created_by_user_id, responded_at, created_at) FROM stdin;
2d5f0a40-a276-4d5e-a8ce-4b99d61dcf5e	ce652a08-56e4-41d0-b38d-9267af4c876e	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 02:05:11.816386+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 02:05:11.816411+02
faedadec-c6f6-48f7-99fb-ce2d9244ddde	4e3412c5-15e4-4e17-ab93-aae0d741d96a	500.00	عرض منتهي	2026-11-12 00:05:11.869158+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 02:05:11.869184+02
c1e67fa4-4a9c-441c-b303-b17c9b95cd57	0deab735-66f1-4da5-b3b8-d588bd7fc9d0	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 02:05:43.648865+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 02:05:43.689275+02	2026-11-12 02:05:43.64888+02
8936dd10-d298-4566-babf-ccd17c4ae218	8baff268-7074-48ce-8af6-42368a2e9d14	500.00	عرض منتهي	2026-11-12 00:05:43.727274+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 02:05:43.727296+02
4c152353-81c5-4e21-9f3a-afe3b435ef77	b9c7960e-61b0-4b05-9365-58a2c20aa4f0	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 02:08:07.367783+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 02:08:07.388356+02	2026-11-12 02:08:07.367803+02
bf1771f8-ca4e-469c-8e38-d77efb8230e8	ff7f8ca5-a856-4028-8d02-ba7c6372f73f	500.00	عرض منتهي	2026-11-12 00:08:07.415251+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 02:08:07.415278+02
e454a593-497b-4b89-b6e6-ca526a097d64	8acbffaa-60be-4ec2-90b8-b5556bed31c8	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 02:22:07.986128+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 02:22:08.017265+02	2026-11-12 02:22:07.986148+02
710c7166-56d6-49f3-8ef6-1820f43000bf	bd3b001e-ee73-4e54-9af9-5c31feab71e5	500.00	عرض منتهي	2026-11-12 00:22:08.048295+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 02:22:08.048323+02
9a0eed3a-89db-4c93-a5e8-3d5b07491b4a	e3c4a10d-ce1e-404b-b465-7de8a717ff62	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 04:41:59.206786+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 04:41:59.260027+02	2026-11-12 04:41:59.20681+02
66cad4e9-c303-4d32-8ec5-f8791db895dc	3eb34c06-d8f4-47d5-8c0d-7ad2aafe4e7b	500.00	عرض منتهي	2026-11-12 02:41:59.287836+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 04:41:59.287873+02
ee0f2843-c1cf-40d2-8e02-f1de2bf99367	0ba5079d-4877-4e03-8bd9-a15f93d7d0f0	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 04:42:40.171652+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 04:42:40.193409+02	2026-11-12 04:42:40.171666+02
f9b072b1-04e2-47b4-a021-c892a3a474d8	ab1b3f78-a19a-4457-b75e-1acd7c2005b5	500.00	عرض منتهي	2026-11-12 02:42:40.220637+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 04:42:40.220669+02
2ef68e8a-f76d-46d6-8eec-c3be071720bf	b5e32863-2cfa-4379-94d3-c0ccde01db89	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 05:09:24.324195+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 05:09:24.359959+02	2026-11-12 05:09:24.324216+02
61956adc-dd89-41f8-be53-7d1f84238bbb	b73e3c6b-e45b-4e01-aa8a-8420dd31c447	500.00	عرض منتهي	2026-11-12 03:09:24.385805+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 05:09:24.385837+02
9091a253-8fe1-4f94-979a-a3e1f601b1ac	a88cf1c0-2f2a-4176-8801-b6d868e496d4	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 05:12:06.113371+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 05:12:06.140189+02	2026-11-12 05:12:06.113396+02
ff35137a-b03b-42e1-a4fb-cc7cf4b7505e	995dc7dd-943a-437b-a80e-e821e7b90b6b	500.00	عرض منتهي	2026-11-12 03:12:06.16308+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 05:12:06.163103+02
7ee08d4a-64d9-4c4a-bf28-ec96b58282de	60671d82-8976-40ef-84ef-efd07d70b740	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 05:29:19.726206+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 05:29:19.750483+02	2026-11-12 05:29:19.726222+02
8b93be20-17ce-4118-bdeb-436f11f4de85	5509b307-0f45-4ef2-bacd-deacc9d42b44	500.00	عرض منتهي	2026-11-12 03:29:19.780216+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 05:29:19.780241+02
51f1796b-3f96-42ce-b194-a9f3928e219a	6b89625b-5416-43c1-bf89-e2edefd5f6f7	850.00	تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.	2026-11-14 05:55:32.95379+02	ACCEPTED	a0000000-0000-0000-0000-000000000001	2026-11-12 05:55:32.97247+02	2026-11-12 05:55:32.953803+02
68daaf53-6cfc-46c0-b0a5-247719369d28	1fe27976-9f9a-49ad-895a-b0415c23f288	500.00	عرض منتهي	2026-11-12 03:55:32.996755+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 05:55:32.996788+02
19d3a03e-ce94-405d-9023-f1c1132b25ae	60671d82-8976-40ef-84ef-efd07d70b740	10000.00	تورتة مخصصة حسب المواصفات المطلوبة، صالحة لمدة 48 ساعة.kruhuhijgos	2026-11-14 22:35:08.05755+02	PENDING	a0000000-0000-0000-0000-000000000001	\N	2026-11-12 22:35:08.057741+02
\.


--
-- Data for Name: custom_cake_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.custom_cake_requests (id, public_reference, access_token, customer_name, customer_phone, customer_email, requested_date, servings_needed, flavor_preference, message_on_cake, notes, reference_image_storage_key, status, created_at, updated_at) FROM stdin;
ce652a08-56e4-41d0-b38d-9267af4c876e	CCR-20261112-9655	34f6c9bc6187437abe7ef02391405114	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-9655_e1e14609-ac28-4597-930f-bbbbc319cb47.jpg	QUOTED	2026-11-12 02:05:11.609574+02	2026-11-12 02:05:11.822043+02
4e3412c5-15e4-4e17-ab93-aae0d741d96a	CCR-EXP-81c42a1c	3eba9cdc77e441d492e6b224014582db	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 02:05:11.862448+02	2026-11-12 02:05:11.862449+02
0ba5079d-4877-4e03-8bd9-a15f93d7d0f0	CCR-20261112-9618	5477f6ba99e44fd3bcaccccdeffd5b34	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-9618_b2403811-1a79-48e5-bf86-64f3500b6d32.jpg	ACCEPTED	2026-11-12 04:42:40.127744+02	2026-11-12 04:42:40.195037+02
0deab735-66f1-4da5-b3b8-d588bd7fc9d0	CCR-20261112-6954	c3ce8bcbaf6748e49f0eeb46b07661d7	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-6954_b8a6d082-e928-4860-a1f6-ed67bf41fe3f.jpg	ACCEPTED	2026-11-12 02:05:43.387941+02	2026-11-12 02:05:43.692442+02
8baff268-7074-48ce-8af6-42368a2e9d14	CCR-EXP-169c2979	425390ab35a142e18b1b2328e9bffdf9	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 02:05:43.722538+02	2026-11-12 02:05:43.722538+02
ab1b3f78-a19a-4457-b75e-1acd7c2005b5	CCR-EXP-19bca2e9	1cda5374342649128fd4ddcf43bb2cf8	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 04:42:40.215672+02	2026-11-12 04:42:40.215674+02
b9c7960e-61b0-4b05-9365-58a2c20aa4f0	CCR-20261112-8624	5b4ffebb6af742b1ad55c51d3978a19c	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-8624_99075333-8506-42fd-9543-7eac025484e8.jpg	ACCEPTED	2026-11-12 02:08:07.302831+02	2026-11-12 02:08:07.389752+02
ff7f8ca5-a856-4028-8d02-ba7c6372f73f	CCR-EXP-60a54ee0	2a7cc6fc81004774b8ff65e6ecad4c26	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 02:08:07.409679+02	2026-11-12 02:08:07.409679+02
8acbffaa-60be-4ec2-90b8-b5556bed31c8	CCR-20261112-9923	7df8d6fe4d0a46dd9c08eb74e570511d	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-9923_5b3af6ba-ab26-4b11-a1f9-a0728d84c261.jpg	ACCEPTED	2026-11-12 02:22:07.917708+02	2026-11-12 02:22:08.019286+02
bd3b001e-ee73-4e54-9af9-5c31feab71e5	CCR-EXP-a01e44f7	fd14557657fb44b0b571d0a2e6694ab1	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 02:22:08.043973+02	2026-11-12 02:22:08.043974+02
e3c4a10d-ce1e-404b-b465-7de8a717ff62	CCR-20261112-5333	c4e183e82ce34554907ae4ff14ba10c5	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-5333_f8028758-b29b-43e6-947e-b68a337001cb.jpg	ACCEPTED	2026-11-12 04:41:59.147865+02	2026-11-12 04:41:59.262027+02
3eb34c06-d8f4-47d5-8c0d-7ad2aafe4e7b	CCR-EXP-36613442	a414f3f1a7f142ac8922617078f93be6	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 04:41:59.283287+02	2026-11-12 04:41:59.283287+02
5509b307-0f45-4ef2-bacd-deacc9d42b44	CCR-EXP-845c90e1	3a182a9a875541f6a67b0e62fda97d5e	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 05:29:19.7755+02	2026-11-12 05:29:19.775501+02
b5e32863-2cfa-4379-94d3-c0ccde01db89	CCR-20261112-7191	3f9de240695149c5aa8c45749688f117	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-7191_5d322961-9057-4ba7-bffc-7285ff0271b6.jpg	ACCEPTED	2026-11-12 05:09:24.232703+02	2026-11-12 05:09:24.361785+02
b73e3c6b-e45b-4e01-aa8a-8420dd31c447	CCR-EXP-71ccc544	acb2b97756b2496a85f8979c7bcd3a51	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 05:09:24.381052+02	2026-11-12 05:09:24.381052+02
a88cf1c0-2f2a-4176-8801-b6d868e496d4	CCR-20261112-5216	74ffaabe25f74ff7ae3512c49607ca75	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-5216_82bc772b-6a8e-415d-9429-3ff73533d3fa.jpg	ACCEPTED	2026-11-12 05:12:06.058072+02	2026-11-12 05:12:06.142781+02
995dc7dd-943a-437b-a80e-e821e7b90b6b	CCR-EXP-1eaaa128	d6fde7068d934513a5715103d9b8aae1	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 05:12:06.160101+02	2026-11-12 05:12:06.160101+02
6b89625b-5416-43c1-bf89-e2edefd5f6f7	CCR-20261112-6224	689b310a6c284c549b6d09b9aa918894	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-6224_5041fc55-5273-4e1f-a162-5438688570f7.jpg	ACCEPTED	2026-11-12 05:55:32.737124+02	2026-11-12 05:55:32.97398+02
1fe27976-9f9a-49ad-895a-b0415c23f288	CCR-EXP-671e129b	4165e59ee9f644cc97fd049f5c4f3308	عميل اختبار انتهاء	01011112222	\N	2026-11-19	\N	\N	\N	\N	\N	QUOTED	2026-11-12 05:55:32.991212+02	2026-11-12 05:55:32.991213+02
60671d82-8976-40ef-84ef-efd07d70b740	CCR-20261112-3374	1a65bb0e1d4f4525b86cd015c17da005	سارة أحمد	01098765432	sara@example.com	2026-11-22	20	ريد فيلفيت مع كريمة الجبن الفاخرة	كل عام وأنتِ بخير يا ليلى	يرجى وضع ورود سكرية بلون وردي فاتح	cake_ref_CCR-20261112-3374_cdebbbb1-bc2c-4ae9-b39c-66e52d2d5e00.jpg	QUOTED	2026-11-12 05:29:19.676587+02	2026-11-12 22:35:08.121941+02
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_addresses (id, customer_id, zone_id, title, street_address, building_number, floor_door, landmark, phone, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, user_id, full_name, phone, email, notes, created_at, updated_at) FROM stdin;
e176bf96-b015-48b0-83b2-669ec74e6e0b	7efadd27-7be9-41a2-87dc-3d4ff7ab4f44	أحمد شريف	01099887766	ahmed.test@lolocupcakes.com	شارع التسعين، التجمع الخامس	2026-11-13 17:20:32.330548+02	2026-11-13 17:20:32.330548+02
0e302864-760f-40b6-b808-0dc0d1c8fedc	13dd5ac8-ca17-4b43-88d7-5dd1486124e7	yousef	01016197035	yosef@lolo.com	\N	2026-11-13 17:24:17.495617+02	2026-11-13 17:24:17.495617+02
d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	8afbbd61-bb13-4a58-a1bd-008a8069e25f	Updated Customer	01012345678	customer_1794601902@test.com	\N	2026-11-13 22:31:42.8546+02	2026-11-13 22:31:42.913707+02
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_zones (id, name_ar, name_en, delivery_fee, min_order_amount, is_active, display_order, created_at) FROM stdin;
d2bd6f6b-3b1d-4e19-8109-d5ec49c7929b	المعادي والمقطم	Maadi & Mokattam	40.00	150.00	t	1	2026-11-12 01:45:19.101444+02
5c4dbf88-58b4-457c-9866-367a5f6597de	التجمع والقاهرة الجديدة	New Cairo	60.00	200.00	t	2	2026-11-12 01:45:19.101444+02
32079e94-5235-49a8-83be-89a9a95317e6	مدينة نصر ومصر الجديدة	Nasr City & Heliopolis	50.00	200.00	t	3	2026-11-12 01:45:19.101444+02
746922c8-c4a3-4214-9c11-4edcc554446f	الزمالك والمهندسين والدقي	Zamalek & Dokki	55.00	200.00	t	4	2026-11-12 01:45:19.101444+02
f4c34817-69fa-4a04-8600-5ab30f6002d7	المعادي	\N	35.00	100.00	t	1	2026-11-12 01:58:19.632025+02
b03ed1b3-d5ef-4ac2-9fce-95b8ee3001a8	الشيخ زايد و 6 أكتوبر	Sheikh Zayed & 6th of October	65.00	250.00	t	5	2026-11-13 18:07:13.02769+02
1590f2c0-83c1-446b-b49b-edff8e94b000	شبرا الخيمه	Shoubra	45.00	150.00	t	1	2026-11-13 20:32:24.413636+02
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	initial schema	SQL	V1__initial_schema.sql	-1129247319	lolo_user	2026-11-12 01:45:19.049093	418	t
2	2	seed catalog	SQL	V2__seed_catalog.sql	-1720238915	lolo_user	2026-11-12 01:45:19.52898	13	t
3	3	seed admin	SQL	V3__seed_admin.sql	173635136	lolo_user	2026-11-12 02:05:06.080093	15	t
4	4	add stock and integrations	SQL	V4__add_stock_and_integrations.sql	-82840190	lolo_user	2026-11-12 05:11:36.140418	26	t
\.


--
-- Data for Name: option_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_groups (id, name_ar, name_en, selection_type, is_required, min_selections, max_selections, created_at) FROM stdin;
d0000001-0000-0000-0000-000000000001	الحجم	Size	SINGLE	t	1	1	2026-11-12 01:45:19.536167+02
d0000001-0000-0000-0000-000000000002	الحشوة	Filling	SINGLE	f	0	1	2026-11-12 01:45:19.536167+02
\.


--
-- Data for Name: option_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.option_values (id, option_group_id, name_ar, name_en, price_modifier, is_active, display_order, created_at) FROM stdin;
d0000002-0000-0000-0000-000000000001	d0000001-0000-0000-0000-000000000001	حجم صغير	Small	0.00	t	1	2026-11-12 01:45:19.536167+02
d0000002-0000-0000-0000-000000000002	d0000001-0000-0000-0000-000000000001	حجم متوسط	Medium	120.00	t	2	2026-11-12 01:45:19.536167+02
d0000002-0000-0000-0000-000000000003	d0000001-0000-0000-0000-000000000001	حجم كبير	Large	250.00	t	3	2026-11-12 01:45:19.536167+02
d0000002-0000-0000-0000-000000000004	d0000001-0000-0000-0000-000000000002	فانيليا	Vanilla	0.00	t	1	2026-11-12 01:45:19.536167+02
d0000002-0000-0000-0000-000000000005	d0000001-0000-0000-0000-000000000002	شوكولاتة	Chocolate	40.00	t	2	2026-11-12 01:45:19.536167+02
d0000002-0000-0000-0000-000000000006	d0000001-0000-0000-0000-000000000002	كراميل	Caramel	45.00	t	3	2026-11-12 01:45:19.536167+02
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, variant_id, product_name_snapshot, variant_name_snapshot, unit_price_snapshot, quantity, line_total, options_snapshot, addons_snapshot, custom_details_snapshot) FROM stdin;
e34ca346-f13d-4fcb-9715-a6273a649571	dc4bce67-2638-478e-9118-bb94e1128e9a	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
f8384bbb-775a-4dc6-aac8-e9c20a7df8e4	d88d6c23-1761-485c-b5d9-a3b023fb6b94	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
b05dc186-8849-401e-9a5b-6201498f6040	87576b49-1472-46d9-8743-6ae302782e72	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
47e9d61b-efee-46ba-ad2e-923328d6b04c	d4f21374-b123-43c6-a615-f6a4649927f5	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
a5081662-be34-4fd8-8c46-8a0ed0f2d9eb	8b5272cf-530a-4ba7-9300-525027018c15	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
cf2d2e57-1a76-4e23-bef9-1107a8579c91	dc82a25f-fdc7-40d9-af66-67ff25f6b400	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
43a53093-7f26-422c-97d6-d44a7a42790a	de62d236-843f-471a-8385-486920edca3b	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
ecd07fc5-ef4e-422d-acd3-168f40a6fc86	cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
3c3ce4cd-19e2-4587-9e21-c7ec51e29e0a	d2620254-0a4f-46c3-bd8f-49b60dcbc800	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
088497c2-8f13-4c55-9091-2304052d7262	e6b9b5a2-d012-48f8-9224-7142102dd049	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
34a5b620-13ac-499e-96ad-e8c282b24a96	9156e9aa-ed5e-4537-8ecf-0dd1311fc593	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
af18c7c8-56ec-4d66-a6f4-9635f5a22a44	bc709a4a-4832-46e5-97c3-1ee2a5076691	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{}	{}	{}
a9ddab40-e28e-49cd-bf2d-09969cfe29c5	c9015c25-485a-4657-9c80-5f5a3ddc4dad	f0000001-0000-0000-0000-000000000006	\N	جاتوه الفستق	\N	65.00	1	65.00	{"addonIds": [], "optionValueIds": []}	{}	{}
cfd1328e-c6b1-4b6b-b130-da29859daece	c9015c25-485a-4657-9c80-5f5a3ddc4dad	f0000001-0000-0000-0000-000000000006	\N	جاتوه الفستق	\N	65.00	1	65.00	{"addonIds": [], "optionValueIds": []}	{}	{}
92e57d83-76d1-41b0-ab14-8ce97a619c9d	3e43e665-9782-4ad5-8864-2b8c34afd8a4	f0000001-0000-0000-0000-000000000001	\N	كب كيك الفانيليا المخملية	\N	45.00	2	90.00	{"addonIds": [], "optionValueIds": []}	{}	{}
410cdd1f-d472-4388-baf0-81c5e83c6718	6635ce6b-fc82-4fc6-84bd-31c604465ce4	f0000001-0000-0000-0000-000000000002	\N	كعكة الشوكولاتة الفاخرة	\N	450.00	1	450.00	{"addonIds": [], "optionValueIds": []}	{}	{}
312b2112-8083-4211-961d-59a7b5f13b9e	c3e6654f-2f1e-4294-82bb-f3442af9cce7	f0000001-0000-0000-0000-000000000005	\N	بوكس كب كيك مشكل 6 قطع	\N	250.00	1	250.00	{"addonIds": [], "optionValueIds": []}	{}	{}
318f3106-003c-495c-8fb7-4407fb0d119e	c3e6654f-2f1e-4294-82bb-f3442af9cce7	f0000001-0000-0000-0000-000000000003	\N	كب كيك الكراميل	\N	50.00	1	50.00	{"addonIds": [], "optionValueIds": []}	{}	{}
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, order_id, previous_status, new_status, changed_by_user_id, note, created_at) FROM stdin;
ff808308-9f9f-4dad-b387-655fcc46225c	dc4bce67-2638-478e-9118-bb94e1128e9a	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار التأكيد والمراجعة	2026-11-12 01:58:48.458295+02
833582b0-e52d-4cb5-aa66-fa7879cd13aa	d88d6c23-1761-485c-b5d9-a3b023fb6b94	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار التأكيد والمراجعة	2026-11-12 01:59:41.476929+02
59d872ac-5c6a-4432-88fd-85e6116d8299	d88d6c23-1761-485c-b5d9-a3b023fb6b94	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 01:59:41.587988+02
2f12f09a-71ef-4d5b-88f0-7f8b08bdc6fa	87576b49-1472-46d9-8743-6ae302782e72	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار التأكيد والمراجعة	2026-11-12 02:01:16.552741+02
37f1ce41-5549-47eb-8a4c-90a3f6268318	87576b49-1472-46d9-8743-6ae302782e72	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 02:01:16.656978+02
e45e5c74-c2f7-454b-8f68-ea04642fecb4	87576b49-1472-46d9-8743-6ae302782e72	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 02:01:16.715864+02
5471e564-0d46-468d-98fd-64b35213d43c	d4f21374-b123-43c6-a615-f6a4649927f5	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار التأكيد والمراجعة	2026-11-12 02:01:40.012187+02
e3a9f050-d69d-45ef-b0fd-8bc4841ff38d	d4f21374-b123-43c6-a615-f6a4649927f5	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 02:01:40.092614+02
a5bfc87e-c6bf-4a27-b827-8b38b4febb4f	d4f21374-b123-43c6-a615-f6a4649927f5	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 02:01:40.148754+02
747577f3-48a0-4cfb-ad02-7800a96b229f	8b5272cf-530a-4ba7-9300-525027018c15	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار التأكيد والمراجعة	2026-11-12 02:08:07.512007+02
8430aecd-5d6b-442a-9582-4f9e87c8a201	8b5272cf-530a-4ba7-9300-525027018c15	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 02:08:07.56518+02
fd58d5c0-e006-4076-ab4a-0f2718dc3c6a	8b5272cf-530a-4ba7-9300-525027018c15	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 02:08:07.605822+02
d24936d6-fe1b-4a69-a5f4-18fb35865cb1	dc82a25f-fdc7-40d9-af66-67ff25f6b400	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار التأكيد والمراجعة	2026-11-12 02:22:08.152132+02
cf09201d-b77d-47fc-b39b-093294755420	dc82a25f-fdc7-40d9-af66-67ff25f6b400	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 02:22:08.221259+02
9805397f-8039-4e31-8aca-759456da53fc	dc82a25f-fdc7-40d9-af66-67ff25f6b400	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 02:22:08.269616+02
208ca33d-4a7e-4e42-ab75-7444531f0f02	de62d236-843f-471a-8385-486920edca3b	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-12 04:41:59.386357+02
15116f3e-b408-43e2-9ea3-9c7a6b23bd21	cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-12 04:42:40.322834+02
5f370aa0-52a4-40f4-afdc-eafdbaaaa270	cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 04:42:40.431826+02
87805c85-beb3-42f3-9778-d20112b5aaf9	cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 04:42:40.473133+02
49f7b6a5-f02e-400b-a744-6f58ce1828b0	de62d236-843f-471a-8385-486920edca3b	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 04:48:42.928006+02
5d99e32c-fa35-4124-a5de-4b4dad4223c7	d2620254-0a4f-46c3-bd8f-49b60dcbc800	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-12 05:09:24.489775+02
2a537485-4614-4a36-9867-9c123f9d917e	d2620254-0a4f-46c3-bd8f-49b60dcbc800	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 05:09:24.555201+02
cd551d2d-92f2-4219-993f-ada069b49fc8	d2620254-0a4f-46c3-bd8f-49b60dcbc800	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 05:09:24.596023+02
14afc82a-dfec-4e1a-81db-999b6c507d9f	e6b9b5a2-d012-48f8-9224-7142102dd049	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-12 05:12:06.268646+02
9b642199-3804-4d4c-8f2d-9c09e517991d	e6b9b5a2-d012-48f8-9224-7142102dd049	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 05:12:06.333512+02
8dcf4b6b-5286-4b34-b733-0f7ea60e3146	e6b9b5a2-d012-48f8-9224-7142102dd049	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 05:12:06.377277+02
4165d675-c237-417a-85eb-ecbafa78cd3a	9156e9aa-ed5e-4537-8ecf-0dd1311fc593	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-12 05:29:19.887024+02
dd8e6483-9a69-4f32-ac28-d6de12855994	9156e9aa-ed5e-4537-8ecf-0dd1311fc593	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 05:29:19.946122+02
d75eda1c-0d79-49a3-8767-f215d64bed8b	9156e9aa-ed5e-4537-8ecf-0dd1311fc593	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 05:29:20.001963+02
8e95b9c9-6749-44a3-9770-38cdd45e6449	bc709a4a-4832-46e5-97c3-1ee2a5076691	\N	CONFIRMED	\N	تم تأكيد طلب الدفع عند الاستلام وبدء الجدولة	2026-11-12 05:30:55.78304+02
6b590c6d-6b10-4f6b-b72d-768922465684	bc709a4a-4832-46e5-97c3-1ee2a5076691	CONFIRMED	CONFIRMED	\N	تم تعديل موعد التسليم من (2026-11-20 10:00 - 12:00) إلى (2026-11-21 10:00 - 12:00) - ملاحظة: تم التعديل بناء على طلب العميل	2026-11-12 05:30:55.808107+02
0a7ece8a-f865-4c20-9649-d40fe9111be6	c9015c25-485a-4657-9c80-5f5a3ddc4dad	\N	CONFIRMED	\N	تم سداد الطلب بالبطاقة البنكية أونلاين وتأكيده آلياً للبدء في التجهيز	2026-11-12 05:40:28.909203+02
ab162488-1d7b-46df-9ed2-efe4515928dd	3e43e665-9782-4ad5-8864-2b8c34afd8a4	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-12 05:55:33.09295+02
f304d4a7-8d2b-4fdd-92d6-a969d0911926	3e43e665-9782-4ad5-8864-2b8c34afd8a4	PENDING	PENDING	\N	تم إرفاق إيصال سداد إلكتروني (receipt.jpg) بانتظار مراجعة وتأكيد الإدارة - هاتف المحول: 01012345678	2026-11-12 05:55:33.144896+02
2f3ea16d-ba9d-4263-9ebd-d878c9914b62	3e43e665-9782-4ad5-8864-2b8c34afd8a4	PENDING	CONFIRMED	\N	تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً	2026-11-12 05:55:33.184688+02
ee099e92-0fae-4b27-aa11-17ab67f263ed	64e7eab2-dc8c-4352-b78a-6a4478a1cf89	PENDING	CONFIRMED	\N	تم قبول واعتماد الطلب من قبل الإدارة وجاري التجهيز فوراً	2026-11-13 20:17:40.640404+02
15de0d17-11db-4de5-a37e-a7bcc390a270	64e7eab2-dc8c-4352-b78a-6a4478a1cf89	CONFIRMED	REJECTED	\N	نعتذر لتعذر تنفيذ الطلب نظراً لعدم توفر المكونات المطلوبة اليوم	2026-11-13 20:17:45.165421+02
0261199f-6b4b-4cd1-a017-f166dcde87df	64e7eab2-dc8c-4352-b78a-6a4478a1cf89	REJECTED	REJECTED	\N	\N	2026-11-13 20:17:52.559965+02
91a0154a-e476-4dae-98dc-8f76d67bf70f	6635ce6b-fc82-4fc6-84bd-31c604465ce4	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-13 20:33:53.36983+02
61515e55-2cb1-4da6-b1f2-15d71fe01416	c3e6654f-2f1e-4294-82bb-f3442af9cce7	\N	PENDING	\N	تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة	2026-11-13 20:36:18.520817+02
2f3fdae8-cc95-40bf-a82d-3191e300a021	c3e6654f-2f1e-4294-82bb-f3442af9cce7	PENDING	CONFIRMED	\N	تم قبول واعتماد الطلب من قبل الإدارة وجاري التجهيز فوراً	2026-11-13 20:37:09.248415+02
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, public_order_number, tracking_token, idempotency_key, customer_id, customer_name, customer_phone, fulfillment_type, branch_id, delivery_zone_id, delivery_address_snapshot, time_slot_id, scheduled_for_date, scheduled_for_time_range, subtotal, discount_amount, delivery_fee, total_amount, currency, order_status, payment_status, payment_method, customer_notes, admin_notes, created_at, updated_at) FROM stdin;
feb5368b-a6ad-481e-b883-8eae582aed60	LC-TEST-32bab74c	be592ef36c8e496aabc1ee14d01f10d2	KEY-84397a9a-2fc0-4d22-929b-5c3848fd642d	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 01:53:23.229867+02	2026-11-12 01:53:23.229869+02
bf22bde0-9940-4cea-8fa1-aa794b30d751	LC-TEST-728b575f	aaee00ca15374a76b426d2b956bf7f55	KEY-a9435f26-b4ee-4337-ae08-7834766aa744	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 01:53:23.251059+02	2026-11-12 01:53:23.251067+02
b74c4c60-3801-430a-be07-6eae1d0f935f	LC-TEST-22ea0b0a	7120968482304922b427039fdf3d2d11	KEY-c3f33787-40db-4c9b-ad7d-6a82c35156df	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 01:53:23.254461+02	2026-11-12 01:53:23.254463+02
3851fd87-28e1-4ef8-ad41-7a50a9dbcb28	LC-TEST-65602f81	6b7635b4d39d444b9e1b127919d0562d	KEY-56704acb-4dd5-4d67-a571-df4f45fc8f1a	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 01:53:23.257312+02	2026-11-12 01:53:23.257313+02
895d3b86-e5b0-47cf-95b9-5755c42a8c41	LC-TEST-3baacad7	7ba478ab3569465db794326060fd2c0e	KEY-629fdbe3-e70b-47f7-b419-c156ebd695fa	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 01:53:23.259702+02	2026-11-12 01:53:23.259702+02
8c25bf96-ad6d-4628-95f9-ef51514e64a1	LC-TEST-6b6d8e33	58ab727842ba44d98f6e46bdd6cb1b25	KEY-475381fa-825c-4b9c-b45e-8c3b1d5b04c5	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:01:39.808427+02	2026-11-12 02:01:39.808428+02
5569b2eb-3f3e-4263-a8d7-15e176a70c64	LC-TEST-e6b3fcf6	240cbd499e0c4d798e99cf8cecb02979	KEY-67b84347-fd04-4f90-91c0-7d96d98a933f	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:01:39.816128+02	2026-11-12 02:01:39.816128+02
a1b0b155-cd49-4208-af69-e31d7818a364	LC-TEST-9d68dcfb	8bb7c59b6fe6413c95e4904c2c3294a9	KEY-86023307-bcaa-4508-b4d0-a81652465771	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:01:39.821713+02	2026-11-12 02:01:39.821713+02
8bf9ecf3-ce9b-45d6-a11b-f4a5e6a6e9fd	LC-TEST-ca146af0	6c72365546f14e0480d1b6c5b258b307	KEY-a860d1f8-07f1-42c1-8bb0-ee06539b0d9d	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:01:39.829986+02	2026-11-12 02:01:39.829986+02
8a36504c-f8d4-436c-9cd0-9ef2445c290c	LC-TEST-d6908751	1528f7fa336342269db0df0c2d94de4d	KEY-efe55b30-8823-4b2a-b473-c2f37a79f656	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:01:39.835206+02	2026-11-12 02:01:39.835206+02
da46c690-dabf-4562-a6fe-278c891d4dfd	LC-TEST-128ae1a5	54dd73459d664d2b8518827111b66960	KEY-11d79f35-cd85-453b-a6d6-fec1e90e1ea2	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:22:07.813399+02	2026-11-12 02:22:07.813399+02
6d71060d-156b-4bef-8e65-1dfca726bdc0	LC-TEST-15ea194e	c4b0d4ec7b3c416d866076a58d65d3e7	KEY-319ad1d9-52ca-45e5-a56b-e64b6747407e	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:22:07.817541+02	2026-11-12 02:22:07.817541+02
5e811ae0-fc23-4c85-88cc-1aebad8f190e	LC-TEST-83c5caa7	4ae276dcf58c400a9562bd3cebffffaf	KEY-21c21921-312b-4572-933a-c947f2b4466e	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:22:07.822228+02	2026-11-12 02:22:07.822228+02
0db21640-0e7d-47d7-8c67-d5ed11c116a1	LC-TEST-d31292fa	784a18fbc97f49c38be4015aec2a7a59	KEY-098f409f-711f-4768-b844-41702be15a3e	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:41:59.032752+02	2026-11-12 04:41:59.032752+02
2ba7e40c-69f6-4b34-898b-7d011a7dbe9e	LC-TEST-78a721b8	a69d13776e9d4e8dadcbccc4093a1b3d	KEY-d209b6b8-70de-4e70-a03c-e1d636a44842	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:41:59.039821+02	2026-11-12 04:41:59.039821+02
1e7f16e9-6b94-4086-a251-9a9593031ac4	LC-TEST-a91ec96b	c54e58dd704e418c89d787300a6ff753	KEY-7b3d5ca5-7f35-48eb-8acf-85c6ce48211e	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:41:59.044719+02	2026-11-12 04:41:59.04472+02
35acfc5c-c808-446e-aaf4-7a1c49804346	LC-TEST-3fee766e	8daf31f95b3b461f80be705cf372b006	KEY-cf43df86-c9ae-4dd9-bf29-c410d1817f74	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:08:07.197635+02	2026-11-12 02:08:07.197635+02
db93ac50-bb61-4654-bbb8-37d74cb533f8	LC-TEST-f5ad0ec8	e6aca62969d54aa68016752256eeca38	KEY-e64bce9b-9fc9-497c-80c5-4eb4c04ec7e6	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:08:07.200806+02	2026-11-12 02:08:07.200806+02
c77931d9-5ae3-4fea-bae1-f079b8ce270b	LC-TEST-98f5827a	ccdacc2bd3b04a938f37a03ba03344c6	KEY-9650bb7c-a464-4519-bab5-be2fa9ddf7da	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:08:07.205356+02	2026-11-12 02:08:07.205356+02
ade326d1-92e0-4d52-8ff6-43ebd6bda45b	LC-TEST-e7573cb0	1f5be78240fe4abebc2a81ea9a440d6d	KEY-d56c189d-4884-4638-807a-40bbb6769314	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:08:07.208114+02	2026-11-12 02:08:07.208114+02
a166a1a5-c80a-4e20-8276-d94856ddf64d	LC-TEST-bd2e8f16	62edaa0d0e054ba69e1756279432fca4	KEY-b43eb5bc-9294-49f8-a480-38f8ac3407bb	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:22:07.80319+02	2026-11-12 02:22:07.80319+02
1c125e8e-3406-4d78-ae3b-d41199ba9947	LC-TEST-c2d03420	4cc2ccd803904b8b828285fb24c31317	KEY-ca59f949-4fb9-4417-94e0-b21aeacdf893	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:22:07.810573+02	2026-11-12 02:22:07.810573+02
b4e7a57d-e711-4cbb-a758-7a7db3bd0cde	LC-TEST-fd6c0138	876f2ec3794945939642fe05cec3babf	KEY-2b2fcfe2-bd12-49a7-9631-66ea6b9524b2	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:41:59.048958+02	2026-11-12 04:41:59.048958+02
8a441cb9-b1f3-42b9-abb8-308e06eafebb	LC-TEST-f5458f96	27ee09903487451ba61a7bb1bd106e5b	KEY-b4d86a61-dfaf-4838-bf00-c3d675c0ff43	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:41:59.053683+02	2026-11-12 04:41:59.053683+02
f37faf3b-beed-47de-9865-b72244847cb5	LC-TEST-fc341488	504bb20afff0404387bc06cab9f10326	KEY-c1ef7065-2c0f-4a9a-a206-0980cd6c6622	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:42:40.02864+02	2026-11-12 04:42:40.028641+02
f1dbe3e3-097c-469f-a961-7f3a35fb5e20	LC-TEST-36dd9743	9e3474ed069f4e6c8654a54297dcb1c9	KEY-a3e9e268-f380-44b3-997d-1942767c3021	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:42:40.035092+02	2026-11-12 04:42:40.035093+02
b71642aa-68a6-427d-8da8-0d4142f2260e	LC-TEST-dcb016de	cc8a2318eea042da91c0e301a9553b25	KEY-80b1d7c9-566e-440a-a98b-27905a0cf56d	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:42:40.038822+02	2026-11-12 04:42:40.038824+02
275efa44-438d-46e5-a09d-0adc0148a7dd	LC-TEST-37472bbb	c5fefd5ae4e247f19a028f1329785a9b	KEY-5228536e-7c17-4fb2-800e-9c464edca0c1	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:42:40.042862+02	2026-11-12 04:42:40.042864+02
d7ec272e-ca0b-4373-ac86-e4beecd38a7b	LC-TEST-b1e87784	c7bb1e270beb441d968090a886f8797d	KEY-3aac9ecc-df40-4898-b7d8-26bee90c56a7	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:29:19.568994+02	2026-11-12 05:29:19.568995+02
9be5c0e8-934e-4571-9aec-e13123a9fcf3	LC-TEST-7b610b93	104704db21dc4f8ab41b29fe440424c5	KEY-dc214e4e-e747-4213-bf5b-4700a0817fd5	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:29:19.573599+02	2026-11-12 05:29:19.573601+02
051ddf64-e17f-4779-b96a-97f1bc6dc1a3	LC-TEST-4b696a59	02a308e657a948e19691e4b4bafa1789	KEY-33b44c62-cd5b-4ada-b971-7693b75414ba	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:09:24.150113+02	2026-11-12 05:09:24.150113+02
5bf733c4-fbf4-4db9-831b-a553864237f1	LC-TEST-15957008	8f6d6b4fd16a45d38ad4d649b50fe41a	KEY-7199bc66-62f1-4f21-80cc-93428434b30e	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:55:32.432574+02	2026-11-12 05:55:32.432575+02
e1bdebcb-eed1-4b31-9a87-3b2f382d7f6d	LC-TEST-40c901c4	03d0835f42da4bb4830e10bf6d3f8a02	KEY-2fc1ae58-948e-4ef3-ae48-5d8ea273e4ab	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:12:05.950202+02	2026-11-12 05:12:05.950202+02
854fc022-9100-4c9d-82c3-e5ee2ee9299c	LC-TEST-67c67e7a	403855c311fe4e14b18a6ee5b520d1d4	KEY-8eab2632-54da-4c89-aebc-71a051b21e5f	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:12:05.954278+02	2026-11-12 05:12:05.954278+02
a538ca16-4727-4f1d-9365-d4989f3b830d	LC-TEST-700efd40	250c250db3e8408cb9eb5ed97fa59a40	KEY-5e271976-1f8a-435a-83bd-bf9be70be90f	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:12:05.956919+02	2026-11-12 05:12:05.956919+02
afd8e554-731e-41e2-9c42-05f2f73318a3	LC-TEST-f4596973	5bb315f780f84e0aab79e0af475be7a8	KEY-ed246c03-66e5-4d62-acfb-52ceb8f6fdb6	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:12:05.959762+02	2026-11-12 05:12:05.959763+02
10a90aa2-f3d5-49c9-b743-a1f8133d4093	LC-TEST-926ee9b7	bc24e16b7c644992b3212dbf63d55292	KEY-708162d0-ee52-4e31-9477-2a75cc8873c7	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:12:05.962962+02	2026-11-12 05:12:05.962962+02
d2620254-0a4f-46c3-bd8f-49b60dcbc800	LC-20261112-6025	ab164615f0e64d8f82b0b6927a10b760	IDEM-38939fa3-6638-407c-9762-e0f5fb317b12	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "ff52e58c-0b05-4cb0-adc0-26092fc3236f", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 05:09:24.486439+02	2026-11-12 05:09:24.597965+02
dc4bce67-2638-478e-9118-bb94e1128e9a	LC-20261112-6659	2f36696db750435c9de29eb3590338d4	IDEM-783c6327-4d70-4777-8021-7ebc8069d0a0	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "0b0c3980-ecbd-4072-ae0c-593a479cd02d", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	90.00	0.00	35.00	125.00	EGP	PENDING	UNPAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 01:58:48.455061+02	2026-11-12 01:58:48.455062+02
d88d6c23-1761-485c-b5d9-a3b023fb6b94	LC-20261112-2233	9edb2ed64c5e4ddb8f0c14018970afbf	IDEM-6cab46d2-b8ea-4996-9202-ebfcce56370c	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "222bee9d-f8d6-4205-a1e2-afc404681894", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	PENDING	PENDING_VERIFICATION	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 01:59:41.472921+02	2026-11-12 01:59:41.588561+02
bc709a4a-4832-46e5-97c3-1ee2a5076691	LC-20261112-6239	40124b663db44a0e9ee4a5997a2abdd3	TEST-ORDER-77777	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد العشري	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "da155e49-b556-4900-a37b-870cd554d4b7", "landmark": "", "floorDoor": "شقة 4", "streetAddress": "شارع 9 المعادي", "buildingNumber": "12"}	de756477-ed91-4e5f-a576-4dc2cfe6b08a	2026-11-21	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	UNPAID	CASH	طلب تجريبي مؤكد	\N	2026-11-12 05:30:55.779402+02	2026-11-12 05:30:55.808986+02
083c69f2-723f-4ce6-9706-3b81b99248b2	LC-TEST-27f9eeb9	d09fb1bd6f214976b18789946180825e	KEY-9a48ab1b-76a3-4c73-a44c-4533bee0bebd	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 04:42:40.04647+02	2026-11-12 04:42:40.046471+02
3a318171-d084-42db-b420-f6375b329ab7	LC-TEST-b9d2a8c9	450949170fbc4229a95e76c7fcc34a1f	KEY-4031fd41-ec7f-4e0b-8c64-3b0e547569b7	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:09:24.12043+02	2026-11-12 05:09:24.12043+02
0f3726f1-0db8-4a87-ad8e-792b8d77b8c4	LC-TEST-8644d2a3	ae7860701f7440489567c22bcd86aa1e	KEY-1bcf09b2-4ae6-448f-afc1-e6b62f350c88	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:09:24.138504+02	2026-11-12 05:09:24.138504+02
6fe5c3b2-af18-4b31-bc29-9351fdb7db29	LC-TEST-60f4339f	e93baf306fdf4610a1736c17292dd458	KEY-8e4ed4c5-9fa6-474d-a07f-7ccceca016fb	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:09:24.14303+02	2026-11-12 05:09:24.14303+02
c6e0fa25-90f1-4340-b281-2887cc7d31de	LC-TEST-87e556be	28c6e3d543784c3ebcfe2bbcebd7bc9e	KEY-6edef5a9-fcbe-403d-8937-10118c11ab55	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:09:24.145845+02	2026-11-12 05:09:24.145845+02
c9015c25-485a-4657-9c80-5f5a3ddc4dad	LC-20261112-8711	4acbb77a66c54da6a2276a065de9a2a6	IDEM-d82ccbbd-c201-44f1-a960-37e133d2443c	\N	علي	01016190354	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "da155e49-b556-4900-a37b-870cd554d4b7", "landmark": "", "floorDoor": "", "streetAddress": "موقع GPS دقيق: [30.1237, 31.2529]", "buildingNumber": ""}	26b36ae2-0e8c-46de-9768-5cb32bdd30b3	2026-11-13	10:00 - 12:00	130.00	0.00	35.00	165.00	EGP	CONFIRMED	PAID	CARD_ONLINE	\N	\N	2026-11-12 05:40:28.90701+02	2026-11-12 05:40:28.90701+02
b3060371-5055-4f78-a972-72dd3503f06f	LC-TEST-8560b128	78a309fad2cb4ee6a11d439d27aa4cb1	KEY-7d979faa-6227-42f9-be40-287b66de2744	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:29:19.55781+02	2026-11-12 05:29:19.557811+02
6635ce6b-fc82-4fc6-84bd-31c604465ce4	LC-20261113-4603	21ad9bafce9a49f6a882d3dabcb10fa2	IDEM-8b53f66e-7b4e-4e48-9185-696cb8aeba6e	0e302864-760f-40b6-b808-0dc0d1c8fedc	يوسف مسعد	01016197035	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	1590f2c0-83c1-446b-b49b-edff8e94b000	{"zoneId": "1590f2c0-83c1-446b-b49b-edff8e94b000", "landmark": "سوبر ماركت الاسواني", "floorDoor": "2", "streetAddress": "شارع الاتحاد الاشتراكي، بهتيم، شبرا الخيمة", "buildingNumber": "15"}	74604000-8370-44c4-9c79-66f4f715d140	2026-11-15	10:00 - 12:00	450.00	0.00	45.00	495.00	EGP	PENDING	UNPAID	MANUAL_TRANSFER	عاوزها بالله عليك تكون باردة | [إضافات الحفلة: شموع أرقام ذهبية مضيئة] | [خصم نادي لولو VIP: 50 ج.م مقابل 100 نقطة] | [رقم تحويل فودافون كاش/إنستاباي المُرسِل: 01016197035] | [تم إرفاق إيصال الدفع بنجاح]	\N	2026-11-13 20:33:53.367544+02	2026-11-13 20:33:53.367545+02
c3e6654f-2f1e-4294-82bb-f3442af9cce7	LC-20261113-7298	7f10a2e13d5d49689858c7fd4d986e81	IDEM-3b4efc88-c88c-4141-b653-ee458994c6ba	0e302864-760f-40b6-b808-0dc0d1c8fedc	يوسف	01016197035	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	1590f2c0-83c1-446b-b49b-edff8e94b000	{"zoneId": "1590f2c0-83c1-446b-b49b-edff8e94b000", "landmark": "بنك", "floorDoor": "2", "streetAddress": "شارع الاتحاد الاشتراكي، بهتيم، شبرا الخيمة", "buildingNumber": "15"}	26b36ae2-0e8c-46de-9768-5cb32bdd30b3	2026-11-13	10:00 - 12:00	300.00	0.00	45.00	345.00	EGP	CONFIRMED	UNPAID	MANUAL_TRANSFER	حبيبي والله | [إضافات الحفلة: شموع أرقام ذهبية مضيئة، كارت إهداء ملكي بخط اليد، طقم تقطيع تورتة مذهب فاخر، بالون هيليوم فاخر للمناسبات، نافورة شرار نارية آمنة للحفلات] | [خصم نادي لولو VIP: 50 ج.م مقابل 100 نقطة] | [رقم تحويل فودافون كاش/إنستاباي المُرسِل: 01069915609] | [تم إرفاق إيصال الدفع بنجاح]	\N	2026-11-13 20:36:18.520012+02	2026-11-13 20:37:09.248825+02
6d264958-7031-4203-a83e-8574130f66a4	LC-TEST-774b31ef	ce99bbc3b04b42ac889bb3e370be0311	KEY-79805aa6-7412-4c59-8da7-cbc268e96815	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 02:08:07.185824+02	2026-11-12 02:08:07.185824+02
f581c816-acbe-4400-b2a7-762abf513b8f	LC-TEST-e5eccc95	c8678af0d80a49378bf33529274f3eec	KEY-df41cb66-8f90-495b-b6c9-1571baf75cb4	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:29:19.564455+02	2026-11-12 05:29:19.564457+02
5fec6b87-1c5d-4b53-ba3d-dc8a8fd52935	LC-TEST-64f74114	34c2341fc42540ecb7e05d738a0d6294	KEY-53e91849-41b8-4d96-9619-3abebc551fe0	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:29:19.578494+02	2026-11-12 05:29:19.578495+02
dc4bc66f-2ddd-4027-9d97-0268e7746f04	LC-TEST-8719910d	f36765d17bb64dab80bcc8e75c66656e	KEY-7a88e3e6-fc17-4daf-a162-48610d3cd2a8	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:55:32.441442+02	2026-11-12 05:55:32.441444+02
61eb971f-0378-4647-ba1f-70ef59abf7bb	LC-TEST-c85614c5	bdf8e15b0bf74e89af77394f8224b50f	KEY-1568a61d-4ab8-4d5c-adb6-cb20d9693988	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:55:32.445994+02	2026-11-12 05:55:32.445996+02
7de57469-f196-49ac-aa9f-3e7388b825f2	LC-TEST-ac772379	2df5187207b44eafa8a727a82971aafb	KEY-b84f6989-b49d-4bdf-b59d-161186ad0bce	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	PENDING	UNPAID	CASH	\N	\N	2026-11-12 05:55:32.450731+02	2026-11-12 05:55:32.450732+02
64e7eab2-dc8c-4352-b78a-6a4478a1cf89	LC-TEST-e1523023	d77e5d54df5b44f888214feb8a6c5e01	KEY-dcc7f39b-9c69-438d-82cd-0cb9ee1a9733	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	عميل تجريبي	01012345678	PICKUP	2d0be48c-7fe8-4b42-9df8-865931fe9e77	\N	\N	a8d8d4ae-477f-4e0d-90bb-524634d8e354	2026-11-14	14:00 - 16:00	100.00	0.00	0.00	100.00	EGP	REJECTED	UNPAID	CASH	\N	\N	2026-11-12 05:55:32.454954+02	2026-11-13 20:17:45.176065+02
cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	LC-20261112-8746	540289ac3bbd46bc86fcde89950bc0fc	IDEM-f3fb238d-c98e-41cf-a573-420c331f36ad	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "65d0fc2f-51f5-43f7-b860-d80e450bd3b7", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 04:42:40.320678+02	2026-11-12 04:42:40.474787+02
dc82a25f-fdc7-40d9-af66-67ff25f6b400	LC-20261112-7939	490c186dacc0456fa285e1ee98dc9288	IDEM-c4f64eec-5863-4347-a9bc-f14b9e4c688b	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "0bb3216c-a98f-42e7-a81d-528a49cab814", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 02:22:08.149779+02	2026-11-12 02:22:08.271217+02
d4f21374-b123-43c6-a615-f6a4649927f5	LC-20261112-7785	1e6f8c46c4a94841b36d01c2fa77c5b5	IDEM-3c856fc2-a252-4435-9ee0-ef32d76ebd20	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "5857afe7-d054-4c2d-bd95-fe63d132dc9f", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 02:01:40.00927+02	2026-11-12 02:01:40.151548+02
87576b49-1472-46d9-8743-6ae302782e72	LC-20261112-8917	d5881813d26c4953a7d2924462696ce7	IDEM-8feb9eee-8a3e-46ec-88a8-e2ccc71ec603	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "a4276e41-b6a9-46fd-a42c-eaa24248b85a", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 02:01:16.548765+02	2026-11-12 02:01:16.717926+02
8b5272cf-530a-4ba7-9300-525027018c15	LC-20261112-6096	49de74dbff734f4baf1f2681e4e33751	IDEM-0935eec7-e69c-465b-ab21-fa31a05f5b0e	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "72ff56fa-09bd-4483-aed1-fe6b32e31473", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 02:08:07.509946+02	2026-11-12 02:08:07.607652+02
de62d236-843f-471a-8385-486920edca3b	LC-20261112-5257	2bd27541ec964771a2f99da187861ba3	IDEM-78d489e8-0305-4ad0-9de2-4c9f339d97be	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "8bd9444f-f5d2-46be-b88b-1a405325f544", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 04:41:59.383468+02	2026-11-12 04:48:42.936365+02
9156e9aa-ed5e-4537-8ecf-0dd1311fc593	LC-20261112-6185	92cafcafd634494589af87563e520d7c	IDEM-eee2eca6-d672-4617-be5b-a54c75f42b88	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "da155e49-b556-4900-a37b-870cd554d4b7", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 05:29:19.884686+02	2026-11-12 05:29:20.005909+02
e6b9b5a2-d012-48f8-9224-7142102dd049	LC-20261112-7102	19af250c424e4fc0b873f4cdd6ff3c51	IDEM-57b524e7-be46-400a-97ac-f895b8cedb86	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "f703e631-a1b0-4b6a-ace9-d8970f65dbe9", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 05:12:06.264847+02	2026-11-12 05:12:06.379316+02
3e43e665-9782-4ad5-8864-2b8c34afd8a4	LC-20261112-9903	7e1ba33bc5d645e98f776413f984efcb	IDEM-ca66f225-c1da-4e50-b529-82c8c378e13c	d9ff9be5-d9c7-4af3-b437-b6be27c65ba0	أحمد محمود	01012345678	DELIVERY	2d0be48c-7fe8-4b42-9df8-865931fe9e77	f4c34817-69fa-4a04-8600-5ab30f6002d7	{"zoneId": "c75bf05e-778f-4613-b953-5b4cd6f9a088", "landmark": "بجوار محطة المترو", "floorDoor": "شقة 4 الدور الثاني", "streetAddress": "شارع 9", "buildingNumber": "عمارة 12"}	8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2026-11-17	10:00 - 12:00	90.00	0.00	35.00	125.00	EGP	CONFIRMED	PAID	MANUAL_TRANSFER	يرجى تغليف العلبة كهدية	\N	2026-11-12 05:55:33.091251+02	2026-11-12 05:55:33.186259+02
\.


--
-- Data for Name: payment_proofs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_proofs (id, payment_id, storage_key, original_filename, file_size, mime_type, uploaded_at) FROM stdin;
3d1ae008-f680-435f-90b3-891c575bf59e	7658ec38-205c-4a52-874f-75ff4b391939	proof_LC-20261112-2233_74bc1071-ebf3-440b-be5f-675c6962f45e.jpg	receipt.jpg	22	image/jpeg	2026-11-12 01:59:41.586671+02
1e9a9da0-bc4f-4dce-9024-f038343b51a1	f777fe04-6096-4aa7-a51a-37a935a109d9	proof_LC-20261112-8917_6f51531a-2a4d-484e-a000-fed55cd7c4c6.jpg	receipt.jpg	22	image/jpeg	2026-11-12 02:01:16.655511+02
22dd3f2b-45d8-4292-a24c-86542a3a3d06	ea168b8b-bcd1-4cb0-861c-8483f3f5e5e7	proof_LC-20261112-7785_b7b93d14-d3f1-4884-8713-b7fefee54576.jpg	receipt.jpg	22	image/jpeg	2026-11-12 02:01:40.091664+02
8edb86ef-d652-418b-ad64-3b6b3d48d8e9	187f9f8b-0221-4314-a082-381b7bc44553	proof_LC-20261112-6096_fec45f30-f678-47d9-adca-1415135d2286.jpg	receipt.jpg	22	image/jpeg	2026-11-12 02:08:07.563874+02
5f0c63a4-3009-4e5e-965c-28011ee382d5	6dedae43-0949-41f5-8b47-d7be12e861ae	proof_LC-20261112-7939_b334c2b4-b8c8-4568-bfd9-3296480f7a6a.jpg	receipt.jpg	22	image/jpeg	2026-11-12 02:22:08.219306+02
581eca02-3467-4d65-8ea0-6075068f4653	84831feb-9f11-4f36-9f15-02b29a90660b	proof_LC-20261112-8746_e1bc365d-42f5-4670-86f9-9f5e46072855.jpg	receipt.jpg	22	image/jpeg	2026-11-12 04:42:40.430507+02
11b1e478-4ec1-44cf-95bb-62ae37657863	2e8f4c38-e7f9-4853-980d-415587b97a23	proof_LC-20261112-6025_7cfbe95e-71a5-4a24-b6ad-a1cfea03289f.jpg	receipt.jpg	22	image/jpeg	2026-11-12 05:09:24.553824+02
1519d45c-bd4a-49bd-bf14-bfd65f3207da	7429cad5-6075-401f-b770-0a9055c96514	proof_LC-20261112-7102_bcac9343-bf63-4f32-a9de-190cc37aab56.jpg	receipt.jpg	22	image/jpeg	2026-11-12 05:12:06.33195+02
9d6892c8-04af-4562-bf18-e1e982b41c12	5f4b7c9c-bbcb-4cec-a394-b113cafa34f5	proof_LC-20261112-6185_311df980-9697-4aa5-ac36-c4eba0fcc3e3.jpg	receipt.jpg	22	image/jpeg	2026-11-12 05:29:19.944953+02
98b32fb3-879f-49a4-8cb5-28ed9ca893d9	3696094c-e04f-413a-a8a5-77e200641714	proof_LC-20261112-9903_650c9ad8-323c-4d35-a645-ab0d9a411b9e.jpg	receipt.jpg	22	image/jpeg	2026-11-12 05:55:33.143445+02
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, order_id, payment_method, amount, currency, status, payment_reference, reviewed_by_user_id, reviewed_at, review_note, created_at, updated_at) FROM stdin;
14f543cb-ade4-4cd8-a06f-29a17e44e96c	dc4bce67-2638-478e-9118-bb94e1128e9a	MANUAL_TRANSFER	125.00	EGP	UNPAID	\N	\N	\N	\N	2026-11-12 01:58:48.457756+02	2026-11-12 01:58:48.457756+02
7658ec38-205c-4a52-874f-75ff4b391939	d88d6c23-1761-485c-b5d9-a3b023fb6b94	MANUAL_TRANSFER	125.00	EGP	PENDING_VERIFICATION	IPAY-88776655	\N	\N	\N	2026-11-12 01:59:41.476243+02	2026-11-12 01:59:41.589853+02
f777fe04-6096-4aa7-a51a-37a935a109d9	87576b49-1472-46d9-8743-6ae302782e72	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 02:01:16.71161+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 02:01:16.552066+02	2026-11-12 02:01:16.717806+02
ea168b8b-bcd1-4cb0-861c-8483f3f5e5e7	d4f21374-b123-43c6-a615-f6a4649927f5	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 02:01:40.144479+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 02:01:40.011592+02	2026-11-12 02:01:40.151413+02
187f9f8b-0221-4314-a082-381b7bc44553	8b5272cf-530a-4ba7-9300-525027018c15	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 02:08:07.602346+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 02:08:07.511553+02	2026-11-12 02:08:07.607548+02
6dedae43-0949-41f5-8b47-d7be12e861ae	dc82a25f-fdc7-40d9-af66-67ff25f6b400	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 02:22:08.266766+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 02:22:08.151654+02	2026-11-12 02:22:08.271121+02
84831feb-9f11-4f36-9f15-02b29a90660b	cfb07cd1-8c92-4779-8e1f-0dd7e73f6f4f	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 04:42:40.470046+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 04:42:40.322383+02	2026-11-12 04:42:40.474696+02
ce7b6daa-e6cd-4e38-828d-3797d4183127	de62d236-843f-471a-8385-486920edca3b	MANUAL_TRANSFER	125.00	EGP	PAID	\N	\N	2026-11-12 04:48:42.922474+02	تم التحقق من مطابقة الإيصال وتأكيد السداد	2026-11-12 04:41:59.385688+02	2026-11-12 04:48:42.934155+02
2e8f4c38-e7f9-4853-980d-415587b97a23	d2620254-0a4f-46c3-bd8f-49b60dcbc800	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 05:09:24.592983+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 05:09:24.489051+02	2026-11-12 05:09:24.597879+02
7429cad5-6075-401f-b770-0a9055c96514	e6b9b5a2-d012-48f8-9224-7142102dd049	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 05:12:06.373987+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 05:12:06.267896+02	2026-11-12 05:12:06.379192+02
5f4b7c9c-bbcb-4cec-a394-b113cafa34f5	9156e9aa-ed5e-4537-8ecf-0dd1311fc593	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 05:29:19.994212+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 05:29:19.88649+02	2026-11-12 05:29:20.00573+02
c7369b51-af51-4c0e-80b6-c9a12659fc53	bc709a4a-4832-46e5-97c3-1ee2a5076691	CASH	125.00	EGP	UNPAID	\N	\N	\N	\N	2026-11-12 05:30:55.781905+02	2026-11-12 05:30:55.781905+02
16bc4d08-5143-4680-9fa2-0ecd96fad9e4	c9015c25-485a-4657-9c80-5f5a3ddc4dad	CARD_ONLINE	165.00	EGP	PAID	PAYMOB-81FA9F24	\N	\N	\N	2026-11-12 05:40:28.908736+02	2026-11-12 05:40:28.908736+02
3696094c-e04f-413a-a8a5-77e200641714	3e43e665-9782-4ad5-8864-2b8c34afd8a4	MANUAL_TRANSFER	125.00	EGP	PAID	IPAY-88776655	\N	2026-11-12 05:55:33.182075+02	تمت المطابقة مع كشف إنستاباي	2026-11-12 05:55:33.092542+02	2026-11-12 05:55:33.186185+02
7dcdfb9d-470a-490a-aca9-48649ec16106	6635ce6b-fc82-4fc6-84bd-31c604465ce4	MANUAL_TRANSFER	495.00	EGP	PENDING_VERIFICATION	\N	\N	\N	\N	2026-11-13 20:33:53.369569+02	2026-11-13 20:33:53.36957+02
d627faf2-4f66-4315-8555-c83728e10f84	c3e6654f-2f1e-4294-82bb-f3442af9cce7	MANUAL_TRANSFER	345.00	EGP	PENDING_VERIFICATION	\N	\N	\N	\N	2026-11-13 20:36:18.520718+02	2026-11-13 20:36:18.520718+02
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, code, description, created_at) FROM stdin;
\.


--
-- Data for Name: product_addon_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_addon_assignments (product_id, addon_id) FROM stdin;
f0000001-0000-0000-0000-000000000002	e0000001-0000-0000-0000-000000000001
f0000001-0000-0000-0000-000000000002	e0000001-0000-0000-0000-000000000002
f0000001-0000-0000-0000-000000000004	e0000001-0000-0000-0000-000000000001
\.


--
-- Data for Name: product_addons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_addons (id, name_ar, name_en, price, is_active, display_order, created_at) FROM stdin;
e0000001-0000-0000-0000-000000000001	شموع احتفال	Candles	25.00	t	1	2026-11-12 01:45:19.536167+02
e0000001-0000-0000-0000-000000000002	بطاقة إهداء	Card	20.00	t	2	2026-11-12 01:45:19.536167+02
e0000001-0000-0000-0000-000000000003	أدوات مائدة	Cutlery	15.00	t	3	2026-11-12 01:45:19.536167+02
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, storage_key, alt_text, display_order, is_primary, created_at) FROM stdin;
20fa500d-90c9-456a-8244-539d64a42866	f0000001-0000-0000-0000-000000000001	/placeholders/cupcake-1.jpg	كب كيك فانيليا	1	t	2026-11-12 01:45:19.536167+02
23d6cf7d-4202-4ebf-860a-8f19dab54991	f0000001-0000-0000-0000-000000000002	/placeholders/cake-1.jpg	كعكة شوكولاتة	1	t	2026-11-12 01:45:19.536167+02
c321df66-bec8-4a99-a9bb-083b1cd40121	f0000001-0000-0000-0000-000000000003	/placeholders/cupcake-2.jpg	كب كيك كراميل	1	t	2026-11-12 01:45:19.536167+02
0355b752-a137-4aaf-9e34-cbad18000785	f0000001-0000-0000-0000-000000000004	/placeholders/cake-2.jpg	كعكة فراولة	1	t	2026-11-12 01:45:19.536167+02
6c7f2797-d8f0-40f5-814e-b8fff9afd282	f0000001-0000-0000-0000-000000000005	/placeholders/box-1.jpg	بوكس مشكل	1	t	2026-11-12 01:45:19.536167+02
adf5fe9a-d302-4373-924b-4996fc96d751	f0000001-0000-0000-0000-000000000006	/placeholders/gateau-1.jpg	جاتوه فستق	1	t	2026-11-12 01:45:19.536167+02
48632409-c967-435c-902a-eaa698609fcb	f0000001-0000-0000-0000-000000000007	/placeholders/gateau-1.jpg	تارت الفراولة الفرنسي	1	t	2026-11-12 05:09:15.906115+02
eaa24f44-921b-4862-9e66-3b5d157b39f2	f0000001-0000-0000-0000-000000000008	/placeholders/cake-1.jpg	سان سيباستيان تشيز كيك	1	t	2026-11-12 05:09:15.906115+02
f898bb44-1d88-4e77-8ff0-2e94c3d6a8dc	f0000001-0000-0000-0000-000000000009	/placeholders/cupcake-1.jpg	كولد برو الفانيليا	1	t	2026-11-12 05:09:15.906115+02
db3d52da-f2d8-4983-aa77-ebb7b9f3878a	f0000001-0000-0000-0000-000000000010	/placeholders/cake-2.jpg	بسبوسة ملكية بالقشطة	1	t	2026-11-12 05:09:15.906115+02
c3d68c13-9704-486e-bfb6-d9513b7d8a81	f0000001-0000-0000-0000-000000000011	/placeholders/box-1.jpg	بوكس سواريه مشكل	1	t	2026-11-12 05:09:15.906115+02
f71085c4-bcc1-46c5-9d71-2d204b270497	f0000001-0000-0000-0000-000000000007	/placeholders/gateau-1.jpg	تارت الفراولة الفرنسي	1	t	2026-11-12 05:11:36.164751+02
09414a73-5986-43e0-a6ad-e18f4c3ea72f	f0000001-0000-0000-0000-000000000008	/placeholders/cake-1.jpg	سان سيباستيان تشيز كيك	1	t	2026-11-12 05:11:36.164751+02
8b1f3ad0-dd89-4d29-b7c6-fd27ed339696	f0000001-0000-0000-0000-000000000009	/placeholders/cupcake-1.jpg	كولد برو الفانيليا	1	t	2026-11-12 05:11:36.164751+02
a4c112a1-bef7-498e-ba16-cb79d7b3a824	f0000001-0000-0000-0000-000000000010	/placeholders/cake-2.jpg	بسبوسة ملكية بالقشطة	1	t	2026-11-12 05:11:36.164751+02
b8218bfc-9104-4aaf-9358-5f5a5ffda94f	f0000001-0000-0000-0000-000000000011	/placeholders/box-1.jpg	بوكس سواريه مشكل	1	t	2026-11-12 05:11:36.164751+02
388140ee-9606-47c5-bd37-aae54e45c98c	18cbd8da-99ad-43e6-abec-c45d5c50d432	/placeholders/cake-1.jpg	كنافة نابلسية بالقشطة البلدي والمكسرات	0	t	2026-11-13 23:48:16.979175+02
5d548ce6-f15a-4178-b189-ec59128242e1	e7e876da-744c-4261-9f33-dd9aa05b20e2	/placeholders/gateau-1.jpg	إكلير شوكولاتة بلجيكية ولوتس كرانش (4 قطع)	0	t	2026-11-13 23:48:16.979175+02
8c1a7a98-652e-4c9d-b314-d6e668f98568	e2a08b96-cc72-41cc-a454-81b04f676a18	/placeholders/cake-2.jpg	تورتة شوكولاتة كيندر فادج الملكية	0	t	2026-11-13 23:48:16.979175+02
\.


--
-- Data for Name: product_option_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_option_groups (product_id, option_group_id, display_order) FROM stdin;
f0000001-0000-0000-0000-000000000002	d0000001-0000-0000-0000-000000000001	1
f0000001-0000-0000-0000-000000000002	d0000001-0000-0000-0000-000000000002	2
f0000001-0000-0000-0000-000000000004	d0000001-0000-0000-0000-000000000001	1
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_reviews (id, product_id, user_id, customer_name, rating, comment, created_at) FROM stdin;
55a8bc0c-57a1-4fad-864a-bb1d9e53b767	f0000001-0000-0000-0000-000000000003	\N	هدى المنصوري	5	طعم خيالي جداً والزبدة طبيعية ومميزة!	2026-11-13 22:31:43.052964+02
22856db6-96a2-4339-b8f1-3110830f05ae	f0000001-0000-0000-0000-000000000003	\N	د. سارة عثمان - التجمع الخامس	5	أحلى وأخف تورتة شوكولاتة وكراميل جربتها في القاهرة! التوصيل كان في الموعد بالدقيقة والمكونات فندقية بجد.	2026-11-14 00:44:51.090144+02
5805a175-d24c-412c-97f3-52a33dc809f7	f0000001-0000-0000-0000-000000000003	\N	م. كريم الشناوي - الشيخ زايد	5	بوكس الإكلير والكب كيك كان مشرف جداً في مناسبة عائلية، طازة واللوتس كريمي وخطير! شكراً شيف لولو.	2026-11-14 00:44:51.090144+02
eab18783-cab5-44ec-9664-03a61fe1ac81	f0000001-0000-0000-0000-000000000003	\N	نوران الألفي - المعادي	5	شغل احترافي جداً والاهتمام بالتفاصيل والتغليف أنيق ومبهج، معتمدينكم دايماً في كل مناسباتنا.	2026-11-14 00:44:51.090144+02
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variants (id, product_id, name_ar, name_en, sku, price_override, is_active, display_order, created_at) FROM stdin;
52383981-f3f3-4cd4-ae85-e90ab6cca7e2	e7e876da-744c-4261-9f33-dd9aa05b20e2	قطعة فردية ميني	Single Piece	ECL-SINGLE	45.00	t	1	2026-11-14 00:56:12.692551+02
f2be76e2-f338-4ed8-aedc-755cc38420cd	e7e876da-744c-4261-9f33-dd9aa05b20e2	علبة 4 قطع مشكلة	Box of 4	ECL-BOX-4	160.00	t	2	2026-11-14 00:56:12.692551+02
a355f7a3-9ad5-4996-ab86-913df110bea6	e7e876da-744c-4261-9f33-dd9aa05b20e2	بوكس عائلي فاخر 8 قطع	Family Box 8	ECL-BOX-8	300.00	t	3	2026-11-14 00:56:12.692551+02
50af7054-773c-4aa7-b8d6-99ae52cb1617	f0000001-0000-0000-0000-000000000004	حجم وسط (تكفي 6-8 أفراد - 20 سم)	Medium 20cm	TRT-STR-MED	420.00	t	1	2026-11-14 00:56:12.692551+02
8c8f18b2-6e42-4128-a57a-cdca4241d9e0	f0000001-0000-0000-0000-000000000004	حجم كبير عائلي (تكفي 12-14 فرد - 26 سم)	Large 26cm	TRT-STR-LRG	580.00	t	2	2026-11-14 00:56:12.692551+02
6b26ac43-9d7c-4fc3-b15e-0d7433c46bfe	f0000001-0000-0000-0000-000000000004	دورين للمناسبات الملكية (تكفي 25 فرد)	2 Tiers Royal	TRT-STR-ROYAL	950.00	t	3	2026-11-14 00:56:12.692551+02
4417556d-45d2-4e65-9c44-fdc9e6f1b4e9	e2a08b96-cc72-41cc-a454-81b04f676a18	حجم وسط (تكفي 6-8 أفراد - 20 سم)	Medium 20cm	TRT-KND-MED	550.00	t	1	2026-11-14 00:56:12.692551+02
193e8a41-a7da-4891-9734-69112cefc5c0	e2a08b96-cc72-41cc-a454-81b04f676a18	حجم كبير عائلي (تكفي 12-14 فرد - 26 سم)	Large 26cm	TRT-KND-LRG	750.00	t	2	2026-11-14 00:56:12.692551+02
ff595e59-cb1b-49c9-a2d4-fc0ba162ce9e	f0000001-0000-0000-0000-000000000010	طبق نصف كيلو (500 جم)	Half Kilo	BAS-HALF	160.00	t	1	2026-11-14 00:56:12.692551+02
b4429c97-1281-4bfd-a69a-0341276c5f44	f0000001-0000-0000-0000-000000000010	صينية كيلو كامل (1 كجم)	One Kilo	BAS-1KG	280.00	t	2	2026-11-14 00:56:12.692551+02
f656a86b-c8de-4ef3-9d88-84540476fa90	f0000001-0000-0000-0000-000000000010	صينية عائلية ملكية (2 كجم)	Family 2KG	BAS-2KG	520.00	t	3	2026-11-14 00:56:12.692551+02
d7b75861-eb0c-45e6-92f9-5780bbb13319	18cbd8da-99ad-43e6-abec-c45d5c50d432	طبق نصف كيلو (500 جم)	Half Kilo	KUN-HALF	180.00	t	1	2026-11-14 00:56:12.692551+02
cbb092c1-3c75-4861-8f57-3bb7da6be2ca	18cbd8da-99ad-43e6-abec-c45d5c50d432	صينية كيلو كامل (1 كجم)	One Kilo	KUN-1KG	320.00	t	2	2026-11-14 00:56:12.692551+02
c5dfca2f-0960-4392-8bd9-4024b7b178fd	18cbd8da-99ad-43e6-abec-c45d5c50d432	صينية مناسبات ملكية (2 كجم)	Family 2KG	KUN-2KG	590.00	t	3	2026-11-14 00:56:12.692551+02
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, category_id, name_ar, name_en, slug, description_ar, description_en, product_type, selling_unit, base_price, prep_lead_hours, is_active, is_featured, is_customizable, display_order, created_at, updated_at, stock_quantity, is_pre_order) FROM stdin;
f0000001-0000-0000-0000-000000000003	c0000001-0000-0000-0000-000000000001	كب كيك الكراميل	Caramel Cupcake	caramel-cupcake	كب كيك بنكهة الكراميل الغنية.	\N	CUPCAKE	PIECE	50.00	2	t	t	f	3	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02	15	f
f0000001-0000-0000-0000-000000000005	c0000001-0000-0000-0000-000000000005	بوكس كب كيك مشكل 6 قطع	Cupcake Box 6	cupcake-box-6	تشكيلة كب كيك مشكلة مكونة من 6 قطع متنوعة.	\N	BOX	BOX	250.00	2	t	t	f	5	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02	15	f
f0000001-0000-0000-0000-000000000006	c0000001-0000-0000-0000-000000000003	جاتوه الفستق	Pistachio Gateau	pistachio-slice	شريحة جاتوه بنكهة الفستق الطبيعي.	\N	GATEAU	PIECE	65.00	2	t	f	f	6	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02	15	f
51d6c8de-1cd9-4eee-8994-49f230edcc9e	8ced3c5f-4620-429f-9be8-c0641c0b68e3	علغفبغع	ىنتا	ع	العياهنتلاغيلعتهسىععيتتي	\N	CUPCAKE	PIECE	60.00	24	f	f	t	0	2026-11-12 03:55:39.877393+02	2026-11-12 03:56:41.801713+02	15	f
f0000001-0000-0000-0000-000000000007	c0000001-0000-0000-0000-000000000006	تارت الفراولة الفرنسي بالباتيسيير	French Strawberry Tart	french-strawberry-tart	تارت باريسي مقرمش محشو بكريمة الباتيسيير الغنية وقطع الفراولة الطازجة.	\N	GATEAU	PIECE	85.00	0	t	t	f	7	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02	20	f
f0000001-0000-0000-0000-000000000008	c0000001-0000-0000-0000-000000000007	سان سيباستيان تشيز كيك مع الشوكولاتة	San Sebastian Cheesecake	san-sebastian-cheesecake	تشيز كيك محروق أسباني كريمي يذوب في الفم مع صوص الشوكولاتة البلجيكية الدافئة.	\N	CAKE	PIECE	490.00	3	t	t	t	8	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02	8	t
f0000001-0000-0000-0000-000000000009	c0000001-0000-0000-0000-000000000008	كولد برو الفانيليا والكراميل الملكي	Royal Vanilla Cold Brew	royal-vanilla-cold-brew	قهوة مختصة منقوعة باردة لمدة 18 ساعة مع لمسة فانيليا مدغشقر ورغوة الحليب الكريمية.	\N	CUPCAKE	PIECE	65.00	0	t	f	f	9	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02	35	f
f0000001-0000-0000-0000-000000000011	c0000001-0000-0000-0000-000000000010	بوكس سواريه مشكل ملكي 12 قطعة	Royal Soirée Box 12pcs	royal-soiree-box-12	تشكيلة سواريه فاخرة من الإكلير والميني تارت وحلوى الشوكولاتة لعزوماتك الراقية.	\N	BOX	BOX	320.00	2	t	t	f	11	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02	12	t
f0000001-0000-0000-0000-000000000010	c0000001-0000-0000-0000-000000000004	بسبوسة ملكية مكرملة بالقشطة واللوز	Royal Almond Cream Basbousa	royal-cream-basbousa	بسبوسة مصرية أصلية بالسمن البلدي والقشطة الطازجة ورقائق اللوز المحمص.	\N	ORIENTAL	WEIGHT	280.00	0	t	t	f	10	2026-11-12 05:09:15.906115+02	2026-11-12 05:09:15.906115+02	15	f
f0000001-0000-0000-0000-000000000001	c0000001-0000-0000-0000-000000000001	كب كيك الفانيليا المخملية	Vanilla Cupcake	classic-vanilla-cupcake	كب كيك فانيليا هش مغطى بالكريمة الفاخرة.	\N	CUPCAKE	PIECE	45.00	2	f	t	f	1	2026-11-12 01:45:19.536167+02	2026-11-12 06:12:36.745636+02	15	f
f0000001-0000-0000-0000-000000000004	c0000001-0000-0000-0000-000000000002	تورتة الفراولة والكراميل الفاخرة	Strawberry Cake	strawberry-caramel-cake	تورتة الفراولة الطازجة مع لمسات الكراميل.	\N	CAKE	PIECE	420.00	4	t	t	t	4	2026-11-12 01:45:19.536167+02	2026-11-12 01:45:19.536167+02	15	f
f0000001-0000-0000-0000-000000000002	c0000001-0000-0000-0000-000000000002	تورتة الفراولة والكراميل الفاخرة	Chocolate Cake	chocolate-delight-cake	تورتة شوكولاتة بطبقات غنية مع كريمة ناعمة.	\N	CAKE	PIECE	450.00	4	f	t	t	2	2026-11-12 01:45:19.536167+02	2026-11-12 22:28:37.659325+02	15	f
18cbd8da-99ad-43e6-abec-c45d5c50d432	c0000001-0000-0000-0000-000000000004	كنافة نابلسية بالقشطة البلدي والمكسرات	Royal Kunafa with Cream	royal-kunafa-cream	كنافة ذهبية مقرمشة محشوة بالقشطة البلدية الطازجة ومسقية بالشربات الخفيف والفستق الحلبي	\N	ORIENTAL	WEIGHT	320.00	2	t	t	f	2	2026-11-13 23:48:04.342264+02	2026-11-13 23:48:04.342264+02	20	f
e7e876da-744c-4261-9f33-dd9aa05b20e2	c0000001-0000-0000-0000-000000000006	إكلير شوكولاتة بلجيكية ولوتس كرانش (4 قطع)	Belgian Chocolate & Lotus Eclairs	belgian-chocolate-eclair-box	عجينة شو فرنسية هشة محشوة بكريمة الباتيسيير الغنية ومغطاة بشوكولاتة بلجيكية داكنة وزبدة اللوتس	\N	WESTERN	BOX	140.00	1	t	t	f	1	2026-11-13 23:48:04.342264+02	2026-11-13 23:48:04.342264+02	15	f
e2a08b96-cc72-41cc-a454-81b04f676a18	c0000001-0000-0000-0000-000000000002	تورتة شوكولاتة كيندر فادج الملكية	Royal Kinder Fudge Chocolate Cake	royal-kinder-chocolate-fudge-cake	طبقات من سبونج الشوكولاتة الغني بكريمة الكيندر والنوتيلا الأصلية ومزينة بقطع كيندر بوينو وفيريرو روشيه	\N	CAKE	PIECE	550.00	4	t	t	t	1	2026-11-13 23:48:04.342264+02	2026-11-13 23:48:04.342264+02	8	f
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, code, name_ar, description, created_at) FROM stdin;
b6a7ef11-d826-4d23-b2df-c88c8febc813	ROLE_OWNER	المالك	صلاحيات كاملة لإدارة المتجر والإعدادات والموظفين	2026-11-12 01:45:19.101444+02
01bbecaa-24d8-4fa4-9506-af4de51f0c96	ROLE_MANAGER	مدير الفرع	صلاحيات تشغيلية لإدارة الطلبات والكتالوج والجدولة	2026-11-12 01:45:19.101444+02
66b9c6dc-7a87-4ee6-8971-2700b4ea56f9	ROLE_STAFF	موظف تشغيل	صلاحيات محدودة لعرض ومتابعة مراحل تجهيز الطلبات	2026-11-12 01:45:19.101444+02
0f727f05-676b-4ecb-8812-07208bc70113	ROLE_CUSTOMER	عميل مسجل	صلاحيات حساب العميل والطلبات والعناوين السابقة	2026-11-12 01:45:19.101444+02
b0000001-0000-0000-0000-000000000001	SUPER_ADMIN	مدير النظام الرئيسي	كامل صلاحيات النظام والإدارة	2026-11-12 02:05:06.098092+02
b0000001-0000-0000-0000-000000000002	STORE_MANAGER	مدير الفرع والمتجر	إدارة الطلبات والكتالوج وتأكيد المدفوعات	2026-11-12 02:05:06.098092+02
b0000001-0000-0000-0000-000000000003	STAFF	موظف تشغيل وتحضير	متابعة تجهيز الطلبات اليومية	2026-11-12 02:05:06.098092+02
\.


--
-- Data for Name: store_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_settings (id, setting_key, setting_value, description, updated_at) FROM stdin;
525834ce-1616-47c6-8cf6-cb4f252b4585	currency	EGP	العملة المعتمدة	2026-11-12 01:45:19.101444+02
7bc395c3-cd37-48ad-83a6-526769b81bf4	business_timezone	Africa/Cairo	المنطقة الزمنية التشغيلية	2026-11-12 01:45:19.101444+02
4667941f-bab4-4430-9fb9-c9f9a0cb9c8f	hero_title	أشهى الحلويات والتورتات المخبوزة طازجة اليوم 	العنوان الرئيسي لبوست الهيرو بالصفحة الرئيسية	2026-11-14 01:58:21.529104+02
6086267d-1b00-405c-a24c-dff17f23225d	facebook_page_id	109283746592817	معرف صفحة فيسبوك لنشر البوستات والعروض	2026-11-12 05:09:15.906115+02
961f1030-fd27-4824-9ffd-57c0930534c9	n8n_webhook_url	http://localhost:5678/webhook/lolo-auto-post	رابط ويب هوك n8n لنشر المنتجات والطلبات تلقائياً على فيسبوك وواتساب	2026-11-12 05:09:15.906115+02
b1590fa3-8888-4095-8f18-d66860142697	store_manager_whatsapp	01069915609	رقم واتساب الشيف ومدير الفرع لاستلام خطة كل أوردر جديد فورياً	2026-11-12 05:33:13.634776+02
1340695b-4f26-4868-9c3f-9bb8f9d90b45	facebook_page_url	https://www.facebook.com/lolo.cupcakes.zayed?locale=ar_AR	رابط صفحة فيسبوك الرسمية لمتجر لولو كب كيك	2026-11-12 05:33:14.513188+02
dc667961-9224-4ede-aea3-1636ebdc9e97	store_name_ar	 Lolo Cupcakes 	اسم المتجر الرسمي بالعربية	2026-11-12 05:34:42.083994+02
71b833c3-343e-4156-8302-560315b22cca	store_phone	01069915609	رقم الهاتف الرسمي للتواصل وخدمة العملاء	2026-11-12 05:34:43.803451+02
8203f16c-ffed-4237-98d4-729717be5640	contact_whatsapp	201069915609	رقم الواتساب الرسمي للمتجر	2026-11-12 05:56:50.671022+02
678aa619-328a-41a2-830e-ce1e9f92beef	contact_phone	01069915609	رقم الهاتف الرسمي للتواصل وخدمة العملاء	2026-11-12 05:57:22.760536+02
8405173e-cd48-4800-af87-16e4dcf268dd	store_working_hours	يومياً من 11:00 صباحاً حتى 11:30 مساءً	مواعيد العمل الرسمية واستقبال الطلبات	2026-11-12 13:16:38.118567+02
04f25c54-7c1c-49c5-9ae1-0e701d11170a	store_address_ar	الشيخ زايد	عنوان الفرع الرئيسي المعروض في الموقع	2026-11-12 13:16:49.334447+02
9ef81451-0d53-40cd-938a-42b809f4fedc	transfer_instructions	يرجى التحويل إلى حساب إنستاباي أو المحفظة الإلكترونية على الرقم 01069915609 ورفع صورة إشعار التحويل لتأكيد الطلب.	تعليمات التحويل البنكي المعروضة للعميل	2026-11-12 13:17:16.378713+02
6654d6b9-1a29-4124-990f-433591ac30aa	min_order_amount	150.00	الحد الأدنى لقيمة الأوردر والشراء الفوري	2026-11-14 00:45:06.510853+02
6edf94f3-4cf5-441d-b572-c083f1ca7c62	hero_subtitle	نكهات أصيلة، مكونات فاخرة طبيعية 100%، وتوصيل دقيق لكافة مناطق القاهرة والشيخ زايد	الوصف التوضيحي لبوست الهيرو	2026-11-14 00:45:06.510853+02
0c769fa6-a665-489a-b314-c19514373d15	hero_badge	مخبز لولو كب كيك بالقاهرة • جودة فندقية فاخرة	البادج الترويجي العلوي للهيرو	2026-11-14 00:45:06.510853+02
57aeb0ec-8606-4adb-9b59-45babc5b5d1e	hero_cta_text	اكتشف قائمة الحلويات الشهية 🧁	نص زر الطلب في الهيرو	2026-11-14 00:45:06.510853+02
d63ddaf7-28c7-4010-8c3d-6715662640ef	hero_image_url	/placeholders/cake-1.jpg	صورة بوست الهيرو الرئيسي	2026-11-14 00:45:06.510853+02
16ed9c49-ea69-4be2-94ca-7c2bbb888e1a	promo_banner_active	true	تفعيل بنر العروض الترويجية العلوي	2026-11-14 00:45:06.510853+02
22f6cc20-ddbd-49a8-a8d0-a5c4bd41f3b8	promo_banner_text	🎉 عروض نهاية الأسبوع: خصم 15% على جميع التورتات والبوكسات العائلية بكود: LOLO15	نص بنر العروض الترويجية	2026-11-14 00:45:06.510853+02
\.


--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_slots (id, branch_id, slot_date, start_time, end_time, fulfillment_type, max_capacity, is_active, created_at) FROM stdin;
8e7be445-5dfe-407b-8ea0-e41bcd2a1e76	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-17	10:00:00	12:00:00	BOTH	15	t	2026-11-12 01:59:41.15408+02
de756477-ed91-4e5f-a576-4dc2cfe6b08a	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-20	10:00:00	12:00:00	BOTH	15	t	2026-11-12 05:30:15.417137+02
5ea5b098-f8f8-414e-9f92-690dba71597e	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-20	12:00:00	14:00:00	BOTH	15	t	2026-11-12 05:30:15.427313+02
e77b9786-dfb2-4ac5-9c4d-748bc4e10ae5	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-20	14:00:00	16:00:00	BOTH	15	t	2026-11-12 05:30:15.427572+02
a8d8d4ae-477f-4e0d-90bb-524634d8e354	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-14	14:00:00	16:00:00	BOTH	25	t	2026-11-12 01:48:35.909679+02
a05a5e70-367d-4f7a-afdb-d4ebe7f1a087	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-20	16:00:00	18:00:00	BOTH	15	t	2026-11-12 05:30:15.427708+02
6db91633-d763-486d-a517-86e22c0a1c75	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-20	18:00:00	20:00:00	BOTH	15	t	2026-11-12 05:30:15.427831+02
4556a746-849b-4408-87d3-cd9d474fb05f	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-20	20:00:00	22:00:00	BOTH	15	t	2026-11-12 05:30:15.427971+02
9c73de4b-870f-4c40-93b4-f58407d2655c	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-12	10:00:00	12:00:00	BOTH	15	t	2026-11-12 05:31:37.767151+02
38a5f47e-374c-47e0-b7b6-4d004aa0c041	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-12	12:00:00	14:00:00	BOTH	15	t	2026-11-12 05:31:37.767537+02
558b463e-6230-489d-97ca-abf2b7448d2c	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-12	14:00:00	16:00:00	BOTH	15	t	2026-11-12 05:31:37.767721+02
d9bb6b33-4273-4710-b68a-f77e67ed8802	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-12	16:00:00	18:00:00	BOTH	15	t	2026-11-12 05:31:37.767851+02
585a0ce6-012d-4050-a077-1bc32c9f8545	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-12	18:00:00	20:00:00	BOTH	15	t	2026-11-12 05:31:37.767978+02
a2f05fa7-a270-4961-93c5-1f944243d7bf	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-12	20:00:00	22:00:00	BOTH	15	t	2026-11-12 05:31:37.768119+02
26b36ae2-0e8c-46de-9768-5cb32bdd30b3	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-13	10:00:00	12:00:00	BOTH	15	t	2026-11-12 05:39:11.161585+02
53ebc48b-bb2b-4b7b-a13e-ccbc9b520cca	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-13	12:00:00	14:00:00	BOTH	15	t	2026-11-12 05:39:11.163116+02
b1a40351-0b8e-4062-82a8-8356a29fa69e	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-13	14:00:00	16:00:00	BOTH	15	t	2026-11-12 05:39:11.163384+02
e89cc681-00b4-496f-ad2e-c8ba7a4bb606	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-13	16:00:00	18:00:00	BOTH	15	t	2026-11-12 05:39:11.163521+02
63689420-6563-4f02-b42d-6ca13e260987	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-13	18:00:00	20:00:00	BOTH	15	t	2026-11-12 05:39:11.163693+02
594c97d3-dd9b-4d6b-8085-462213275dba	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-13	20:00:00	22:00:00	BOTH	15	t	2026-11-12 05:39:11.163814+02
2e904b12-d2cb-48cf-8521-dee2b5317132	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-24	10:00:00	12:00:00	BOTH	15	t	2026-11-12 05:39:45.456625+02
98e2e5af-9f03-421a-8763-3f696a78ca66	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-24	12:00:00	14:00:00	BOTH	15	t	2026-11-12 05:39:45.456952+02
a12b7046-c45f-445e-95d4-f1f8493bea32	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-24	14:00:00	16:00:00	BOTH	15	t	2026-11-12 05:39:45.457077+02
dbb21a23-f90a-4b9c-9d7d-15aba5a29b8e	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-24	16:00:00	18:00:00	BOTH	15	t	2026-11-12 05:39:45.457216+02
1ba5fed8-fdc5-4b9e-852d-055b4b9df26f	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-24	18:00:00	20:00:00	BOTH	15	t	2026-11-12 05:39:45.457322+02
64f320e8-008c-46e2-9193-a684a5cd9beb	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-24	20:00:00	22:00:00	BOTH	15	t	2026-11-12 05:39:45.45741+02
74604000-8370-44c4-9c79-66f4f715d140	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-15	10:00:00	12:00:00	BOTH	15	t	2026-11-13 16:49:26.948781+02
ea42bf7c-2332-4bba-ab1a-51e93e1e1c45	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-15	12:00:00	14:00:00	BOTH	15	t	2026-11-13 16:49:26.958601+02
f7d19678-54a1-4d81-aaba-87058114838c	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-15	14:00:00	16:00:00	BOTH	15	t	2026-11-13 16:49:26.958892+02
75a1c3a8-12b5-48fc-9000-0b9e2ac6a4fc	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-15	16:00:00	18:00:00	BOTH	15	t	2026-11-13 16:49:26.959025+02
6fd388e3-3470-48b6-93ac-f1a14d4cb553	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-15	18:00:00	20:00:00	BOTH	15	t	2026-11-13 16:49:26.959113+02
dfabf8fe-19ae-4889-b768-ae6fe8370618	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-15	20:00:00	22:00:00	BOTH	15	t	2026-11-13 16:49:26.959197+02
bc0fac91-e1cc-42de-97f7-d8e55ffe4a88	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-14	10:00:00	12:00:00	BOTH	25	t	2026-11-13 23:24:49.793065+02
9b906b13-15a9-4cdc-88e8-c7f485a9545c	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-14	12:00:00	14:00:00	BOTH	25	t	2026-11-13 23:24:49.793065+02
9af4a152-fc8e-4e77-8948-a38c45c8436f	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-14	16:00:00	18:00:00	BOTH	25	t	2026-11-13 23:24:49.793065+02
a859ed5b-d91b-4480-9bdc-9da98b2533a3	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-14	18:00:00	20:00:00	BOTH	25	t	2026-11-13 23:24:49.793065+02
d7f06b65-4ccd-45d3-969c-a4802c61d592	2d0be48c-7fe8-4b42-9df8-865931fe9e77	2026-11-14	20:00:00	22:00:00	BOTH	25	t	2026-11-13 23:24:49.793065+02
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role_id) FROM stdin;
a0000000-0000-0000-0000-000000000001	b0000001-0000-0000-0000-000000000001
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, phone, full_name, status, created_at, updated_at, avatar_url) FROM stdin;
7efadd27-7be9-41a2-87dc-3d4ff7ab4f44	ahmed.test@lolocupcakes.com	$2a$10$LeSufKq1nmax6vyth6ekPOJLNcUtiJFQHycDS6UVzXhOc2eaSR8YC	01099887766	أحمد شريف	ACTIVE	2026-11-13 17:20:32.325382+02	2026-11-13 17:20:32.325382+02	\N
13dd5ac8-ca17-4b43-88d7-5dd1486124e7	yosef@lolo.com	$2a$10$TNdT45Cqq9vbZWzLHoci4eQOWohQ7NR08m4WJpL4ZzADFiwFYVfaK	01016197035	yousef	ACTIVE	2026-11-13 17:24:17.495243+02	2026-11-13 17:24:17.495243+02	\N
a0000000-0000-0000-0000-000000000001	admin@lolocupcakes.com	$2b$10$Lysp74/80UPHRYJ0tUpsXO.ccMSN1A0hCL8lgv9JuKoFvwwnZmc9q	01000000001	مدير النظام الرئيسي	ACTIVE	2026-11-12 02:05:06.098092+02	2026-11-12 02:05:06.098092+02	\N
8afbbd61-bb13-4a58-a1bd-008a8069e25f	customer_1794601902@test.com	$2a$10$sr7on2IGxexi8lFfPEZbwectHlWHSq5.gcDX7gTjbsVkHXFi2fmUK	01012345678	Updated Customer	ACTIVE	2026-11-13 22:31:42.846264+02	2026-11-13 22:31:42.91361+02	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: business_closures business_closures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_closures
    ADD CONSTRAINT business_closures_pkey PRIMARY KEY (id);


--
-- Name: business_hours business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_pkey PRIMARY KEY (id);


--
-- Name: capacity_reservations capacity_reservations_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacity_reservations
    ADD CONSTRAINT capacity_reservations_order_id_key UNIQUE (order_id);


--
-- Name: capacity_reservations capacity_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacity_reservations
    ADD CONSTRAINT capacity_reservations_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_cart_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_cart_token_key UNIQUE (cart_token);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: custom_cake_quotes custom_cake_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_cake_quotes
    ADD CONSTRAINT custom_cake_quotes_pkey PRIMARY KEY (id);


--
-- Name: custom_cake_requests custom_cake_requests_access_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_cake_requests
    ADD CONSTRAINT custom_cake_requests_access_token_key UNIQUE (access_token);


--
-- Name: custom_cake_requests custom_cake_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_cake_requests
    ADD CONSTRAINT custom_cake_requests_pkey PRIMARY KEY (id);


--
-- Name: custom_cake_requests custom_cake_requests_public_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_cake_requests
    ADD CONSTRAINT custom_cake_requests_public_reference_key UNIQUE (public_reference);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: option_groups option_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_groups
    ADD CONSTRAINT option_groups_pkey PRIMARY KEY (id);


--
-- Name: option_values option_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_values
    ADD CONSTRAINT option_values_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_public_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_public_order_number_key UNIQUE (public_order_number);


--
-- Name: orders orders_tracking_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tracking_token_key UNIQUE (tracking_token);


--
-- Name: payment_proofs payment_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_addon_assignments product_addon_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_addon_assignments
    ADD CONSTRAINT product_addon_assignments_pkey PRIMARY KEY (product_id, addon_id);


--
-- Name: product_addons product_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_addons
    ADD CONSTRAINT product_addons_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_option_groups product_option_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_option_groups
    ADD CONSTRAINT product_option_groups_pkey PRIMARY KEY (product_id, option_group_id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: store_settings store_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_settings
    ADD CONSTRAINT store_settings_pkey PRIMARY KEY (id);


--
-- Name: store_settings store_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_settings
    ADD CONSTRAINT store_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_carts_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_carts_token ON public.carts USING btree (cart_token);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_custom_cake_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_custom_cake_ref ON public.custom_cake_requests USING btree (public_reference);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (phone);


--
-- Name: idx_customers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);


--
-- Name: idx_orders_public_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_public_number ON public.orders USING btree (public_order_number);


--
-- Name: idx_orders_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status_date ON public.orders USING btree (order_status, scheduled_for_date);


--
-- Name: idx_orders_tracking_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_tracking_token ON public.orders USING btree (tracking_token);


--
-- Name: idx_product_reviews_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_reviews_product_id ON public.product_reviews USING btree (product_id);


--
-- Name: idx_products_active_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active_type ON public.products USING btree (is_active, product_type);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_time_slots_date_branch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_time_slots_date_branch ON public.time_slots USING btree (slot_date, branch_id, is_active);


--
-- Name: audit_logs audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: business_closures business_closures_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_closures
    ADD CONSTRAINT business_closures_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: business_hours business_hours_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_hours
    ADD CONSTRAINT business_hours_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: capacity_reservations capacity_reservations_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacity_reservations
    ADD CONSTRAINT capacity_reservations_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: capacity_reservations capacity_reservations_time_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacity_reservations
    ADD CONSTRAINT capacity_reservations_time_slot_id_fkey FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(id) ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: carts carts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: custom_cake_quotes custom_cake_quotes_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_cake_quotes
    ADD CONSTRAINT custom_cake_quotes_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: custom_cake_quotes custom_cake_quotes_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_cake_quotes
    ADD CONSTRAINT custom_cake_quotes_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.custom_cake_requests(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.delivery_zones(id) ON DELETE RESTRICT;


--
-- Name: customers customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: option_values option_values_option_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_values
    ADD CONSTRAINT option_values_option_group_id_fkey FOREIGN KEY (option_group_id) REFERENCES public.option_groups(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_user_id_fkey FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: orders orders_delivery_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_zone_id_fkey FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE RESTRICT;


--
-- Name: orders orders_time_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_time_slot_id_fkey FOREIGN KEY (time_slot_id) REFERENCES public.time_slots(id) ON DELETE RESTRICT;


--
-- Name: payment_proofs payment_proofs_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments payments_reviewed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_reviewed_by_user_id_fkey FOREIGN KEY (reviewed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: product_addon_assignments product_addon_assignments_addon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_addon_assignments
    ADD CONSTRAINT product_addon_assignments_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.product_addons(id) ON DELETE CASCADE;


--
-- Name: product_addon_assignments product_addon_assignments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_addon_assignments
    ADD CONSTRAINT product_addon_assignments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_option_groups product_option_groups_option_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_option_groups
    ADD CONSTRAINT product_option_groups_option_group_id_fkey FOREIGN KEY (option_group_id) REFERENCES public.option_groups(id) ON DELETE CASCADE;


--
-- Name: product_option_groups product_option_groups_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_option_groups
    ADD CONSTRAINT product_option_groups_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: time_slots time_slots_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jWCmaH42aorVlK518ccD6AxPx7jesQjPoD0U7qfHMwmxHVQdAcNASevF4fCGmMf


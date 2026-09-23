-- ================================================================
-- WASEL PLATFORM - SUPABASE DATABASE SCHEMA
-- منصة واصل لتوصيل الطرود - مخطط قاعدة البيانات
-- ================================================================

-- 1. جدول السائقين (Drivers Table)
CREATE TABLE IF NOT EXISTS public.drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_phone TEXT NOT NULL,
    call_phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    avatar TEXT,
    emirate TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    vehicle_photo TEXT,
    license_photo TEXT,
    mulkiya_photo TEXT,
    emirates_id_photo TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    completed_deliveries INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    subscription_status TEXT DEFAULT 'active',
    subscription_plan TEXT DEFAULT 'unified',
    subscription_expiry TEXT,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. جدول طلبات التوصيل (Delivery Requests Table)
CREATE TABLE IF NOT EXISTS public.delivery_requests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_emirate TEXT NOT NULL,
    pickup_area TEXT NOT NULL,
    delivery_emirate TEXT NOT NULL,
    delivery_area TEXT NOT NULL,
    package_type TEXT NOT NULL,
    package_size TEXT NOT NULL,
    package_weight TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    urgency TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'open',
    selected_offer_id TEXT,
    is_customer_rated BOOLEAN DEFAULT false,
    customer_rating NUMERIC(3, 2),
    customer_review_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. جدول عروض الأسعار المقدمة من السائقين (Driver Offers Table)
CREATE TABLE IF NOT EXISTS public.driver_offers (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES public.delivery_requests(id) ON DELETE CASCADE,
    driver_id TEXT NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    driver_avatar TEXT,
    driver_rating NUMERIC(3, 2) DEFAULT 5.0,
    driver_vehicle TEXT NOT NULL,
    driver_vehicle_type TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    driver_whatsapp_phone TEXT NOT NULL,
    driver_call_phone TEXT NOT NULL,
    driver_completed_count INTEGER DEFAULT 0,
    driver_verified BOOLEAN DEFAULT false,
    price NUMERIC(10, 2) NOT NULL,
    estimated_delivery_time TEXT NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. جدول إشعارات السائقين (Driver Notifications Table)
CREATE TABLE IF NOT EXISTS public.driver_notifications (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES public.delivery_requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pickup_emirate TEXT NOT NULL,
    delivery_emirate TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_read BOOLEAN DEFAULT false
);

-- 5. جدول الرسائل والمحادثات (Chat Messages Table)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES public.delivery_requests(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. إنشاء الفهارس لتسريع البحث (Indexes)
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_emirates ON public.delivery_requests(pickup_emirate, delivery_emirate);
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON public.driver_offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_driver_id ON public.driver_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_request ON public.driver_notifications(request_id);
CREATE INDEX IF NOT EXISTS idx_chat_request ON public.chat_messages(request_id);

-- 7. تفعيل الحماية والوصول (Enable Row Level Security)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول العام المفتوح (Public Read & Write Policies for Platform)
CREATE POLICY "Allow public read access for drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow public insert for drivers" ON public.drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for drivers" ON public.drivers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for requests" ON public.delivery_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert for requests" ON public.delivery_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for requests" ON public.delivery_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for offers" ON public.driver_offers FOR SELECT USING (true);
CREATE POLICY "Allow public insert for offers" ON public.driver_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for offers" ON public.driver_offers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for notifications" ON public.driver_notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert for notifications" ON public.driver_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for notifications" ON public.driver_notifications FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert for chat" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- 8. تفعيل النقل اللحظي (Realtime Replication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

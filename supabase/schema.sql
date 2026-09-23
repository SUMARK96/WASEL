-- ===================================================
-- WASEL (واصل) - Supabase Database Schema
-- Project URL: https://fhhgcrrkthnhygekycre.supabase.co
-- ===================================================

-- 1. Drivers Table (جدول السائقين)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE,
    avatar TEXT,
    emirate TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    completed_deliveries INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    subscription_status TEXT DEFAULT 'active',
    subscription_plan TEXT DEFAULT 'pro',
    subscription_expiry TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    joined_date DATE DEFAULT CURRENT_DATE,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Delivery Requests Table (جدول طلبات التوصيل)
CREATE TABLE IF NOT EXISTS public.delivery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_emirate TEXT NOT NULL,
    pickup_area TEXT NOT NULL,
    delivery_emirate TEXT NOT NULL,
    delivery_area TEXT NOT NULL,
    package_type TEXT NOT NULL,
    package_size TEXT DEFAULT 'medium',
    package_weight TEXT,
    suggested_budget NUMERIC(10, 2) NOT NULL,
    delivery_date TEXT NOT NULL,
    urgency TEXT DEFAULT 'standard',
    notes TEXT,
    status TEXT DEFAULT 'open',
    selected_offer_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Driver Offers Table (جدول عروض أسعار السائقين)
CREATE TABLE IF NOT EXISTS public.driver_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.delivery_requests(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    driver_avatar TEXT,
    driver_rating NUMERIC(3, 2),
    driver_vehicle TEXT,
    driver_phone TEXT,
    price NUMERIC(10, 2) NOT NULL,
    estimated_delivery_time TEXT NOT NULL,
    note TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chat Messages Table (جدول المحادثات المباشرة)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.delivery_requests(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create Public Read / Write Policies for demo
CREATE POLICY "Allow public read access" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.drivers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.delivery_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.delivery_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.delivery_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON public.driver_offers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.driver_offers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.chat_messages FOR INSERT WITH CHECK (true);

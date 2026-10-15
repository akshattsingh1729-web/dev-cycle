-- ==============================================================================
-- DEV CYCLE - SUPABASE DATABASE & ROW LEVEL SECURITY (RLS) SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to create the user profiles table, automated triggers, and Row Level Security policies.
-- ==============================================================================

-- 1. Create Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  vip_tier TEXT DEFAULT 'APEX_MEMBER',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles RLS Policies:
-- Allow authenticated users to view only their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow authenticated users to update only their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 3. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution after auth.users insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Test Rides Reservations Table
CREATE TABLE IF NOT EXISTS public.test_rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rider_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  bike_model TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Test Rides
ALTER TABLE public.test_rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own test rides" 
ON public.test_rides FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test rides" 
ON public.test_rides FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 5. Saved 3D Custom Bike Configurations Table
CREATE TABLE IF NOT EXISTS public.saved_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bike_name TEXT NOT NULL,
  frame_color_hex TEXT NOT NULL,
  frame_color_name TEXT NOT NULL,
  accent_color TEXT,
  custom_specs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Saved Configurations
ALTER TABLE public.saved_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved 3D builds" 
ON public.saved_configurations FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved 3D builds" 
ON public.saved_configurations FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

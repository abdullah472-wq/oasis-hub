-- ==============================================================================
-- OASIS HUB / ANNOOR CMS - SUPABASE DATABASE SCHEMA & ADMIN SETUP
-- ==============================================================================
-- এই SQL স্ক্রিপ্টটি আপনার Supabase Dashboard -> SQL Editor-এ গিয়ে রান (Run) করুন।
-- এটি আপনার অ্যাডমিন প্যানেলের জন্য প্রয়োজনীয় সকল টেবিল, রোল ও পারমিশন তৈরি করবে।

-- ১. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ২. Profiles Table (অ্যাডমিন প্রোফাইল ও রোলস)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৩. Activity Logs Table (অডিট ও অ্যাক্টিভিটি হিস্ট্রি)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৪. Notices Table (নোটিশ বোর্ড)
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  content_bn TEXT NOT NULL,
  content_en TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'academic', 'admission', 'holiday', 'emergency')),
  pdf_url TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৫. Faculty Members Table (শিক্ষক ও পরিচালকমণ্ডলী)
CREATE TABLE IF NOT EXISTS public.faculty_members (
  id TEXT PRIMARY KEY,
  teacher_id TEXT,
  nid TEXT,
  joining_year TEXT,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  designation_bn TEXT NOT NULL,
  designation_en TEXT,
  category TEXT DEFAULT 'teachers' CHECK (category IN ('management', 'teachers', 'huffaz', 'staff')),
  campus TEXT DEFAULT 'both' CHECK (campus IN ('boys', 'girls', 'both')),
  qualification_bn TEXT,
  qualification_en TEXT,
  subject_bn TEXT,
  subject_en TEXT,
  experience_bn TEXT,
  experience_en TEXT,
  image_url TEXT,
  phone TEXT,
  email TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৬. News & Press Table (সংবাদ ও আপডেট)
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  content_bn TEXT NOT NULL,
  content_en TEXT,
  category TEXT DEFAULT 'academic',
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৭. Events Table (ইভেন্টস ও অনুষ্ঠান)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location_bn TEXT,
  image_url TEXT,
  is_upcoming BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৮. Downloads Table (ডাউনলোড কর্নার / সিলেবাস / রুটিন)
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  description_bn TEXT,
  description_en TEXT,
  category TEXT DEFAULT 'other',
  file_url TEXT NOT NULL,
  file_size_label TEXT,
  file_type TEXT,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৯. Admissions Table (অনলাইন ভর্তি আবেদন)
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name_bn TEXT NOT NULL,
  student_name_en TEXT,
  father_name TEXT,
  mother_name TEXT,
  phone TEXT NOT NULL,
  campus TEXT NOT NULL,
  class_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Activity Logs Policies
CREATE POLICY "Authenticated users can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Public Read Policies for Website Content
CREATE POLICY "Public can view published notices"
  ON public.notices FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage notices"
  ON public.notices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view active faculty"
  ON public.faculty_members FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage faculty"
  ON public.faculty_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view published news"
  ON public.news FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage news"
  ON public.news FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view active downloads"
  ON public.downloads FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can manage downloads"
  ON public.downloads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admissions Policies
CREATE POLICY "Public can submit admission application"
  ON public.admissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view and manage admissions"
  ON public.admissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
-- যখনই কোনো ইউজার Supabase Auth-এ সাইনআপ করবে বা তৈরি হবে, 
-- স্বয়ংক্রিয়ভাবে তার একটি প্রোফাইল public.profiles টেবিলে তৈরি হবে।

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    'super_admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKETS SETUP (Optional but recommended)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cms-notices', 'cms-notices', true),
  ('cms-gallery', 'cms-gallery', true),
  ('cms-downloads', 'cms-downloads', true),
  ('cms-branding', 'cms-branding', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

CREATE POLICY "Authenticated users can upload objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

CREATE POLICY "Authenticated users can update/delete objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

-- ==============================================================================
-- অ্যাডমিন অ্যাকাউন্ট তৈরির নির্দেশিকা:
-- ১. Supabase Dashboard -> Authentication -> Users এ যান।
-- ২. "Add user" -> "Create user" বাটনে ক্লিক করুন।
-- ৩. Email দিন: abdullahalmamon472@gmail.com
-- ৪. Password দিন: oasis2026
-- ৫. "Auto Confirm User?" অপশনে টিক দিন (Checked)।
-- ৬. "Create user" চাপুন। ওপরের Trigger ফাংশনটি স্বয়ংক্রিয়ভাবে Profiles টেবিলে সুপার অ্যাডমিন প্রোফাইল তৈরি করবে।
-- ==============================================================================

-- ==============================================================================
-- OASIS HUB / ANNOOR CMS - COMPLETE SUPABASE DATABASE SCHEMA & ADMIN SETUP
-- ==============================================================================
-- এই SQL স্ক্রিপ্টটি আপনার Supabase Dashboard -> SQL Editor-এ গিয়ে রান (Run) করুন।
-- এটি আপনার অ্যাডমিন প্যানেলের জন্য প্রয়োজনীয় সকল টেবিল, রোল ও পারমিশন তৈরি করবে।

-- ১. Enable UUID extension
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

-- ৪. Site Settings Table (সাধারণ প্রতিষ্ঠান তথ্য, যোগাযোগ, সোশ্যাল লিঙ্ক ও ব্র্যান্ডিং)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  institution_name_bn TEXT NOT NULL DEFAULT 'আননূর তাহফিজুল কুরআন মাদরাসা',
  institution_name_en TEXT DEFAULT 'Annoor Tahfizul Quran Madrasa',
  tagline_bn TEXT DEFAULT 'একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে',
  tagline_en TEXT DEFAULT 'Building Faith, Knowledge & Character Together',
  emis_code TEXT,
  founding_year TEXT DEFAULT '2021',
  phone_primary TEXT NOT NULL DEFAULT '01820811511',
  phone_secondary TEXT,
  whatsapp_number TEXT NOT NULL DEFAULT '01581818368',
  email_primary TEXT NOT NULL DEFAULT 'info@annoor.edu.bd',
  website_url TEXT DEFAULT 'https://annoor.edu.bd',
  admission_status TEXT NOT NULL DEFAULT 'open' CHECK (admission_status IN ('open', 'closed', 'upcoming')),
  address_boys_campus_bn TEXT,
  address_boys_campus_en TEXT,
  address_girls_campus_bn TEXT,
  address_girls_campus_en TEXT,
  google_maps_url TEXT,
  facebook_url TEXT,
  facebook_group_url TEXT,
  youtube_url TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  hero_image_url TEXT,
  color_palette TEXT DEFAULT 'royal-navy',
  primary_color TEXT,
  accent_color TEXT,

  -- Banking & Payment
  bank_name_bn TEXT,
  bank_name_en TEXT,
  bank_account_name TEXT,
  bank_account_no TEXT,
  bank_branch_bn TEXT,
  bank_branch_en TEXT,
  bank_routing_no TEXT,
  bkash_number TEXT,
  bkash_type TEXT DEFAULT 'personal',
  nagad_number TEXT,
  nagad_type TEXT DEFAULT 'personal',
  rocket_number TEXT,
  rocket_type TEXT DEFAULT 'personal',
  payment_instructions_bn TEXT,
  payment_instructions_en TEXT,

  -- Leadership & Administration
  founder_name_bn TEXT,
  founder_name_en TEXT,
  founder_title_bn TEXT,
  founder_title_en TEXT,
  founder_message_bn TEXT,
  founder_message_en TEXT,
  founder_image_url TEXT,
  founder_phone TEXT,

  principal_name_bn TEXT,
  principal_name_en TEXT,
  principal_title_bn TEXT,
  principal_title_en TEXT,
  principal_message_bn TEXT,
  principal_message_en TEXT,
  principal_image_url TEXT,
  principal_phone TEXT,
  principal_email TEXT,

  vice_principal_name_bn TEXT,
  vice_principal_name_en TEXT,
  vice_principal_title_bn TEXT,
  vice_principal_title_en TEXT,
  vice_principal_message_bn TEXT,
  vice_principal_message_en TEXT,
  vice_principal_image_url TEXT,
  vice_principal_phone TEXT,
  vice_principal_email TEXT,

  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent column additions for existing installations
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tagline_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tagline_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_group_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_name_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_name_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_account_no TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_branch_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_branch_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bank_routing_no TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bkash_number TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS bkash_type TEXT DEFAULT 'personal';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nagad_number TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nagad_type TEXT DEFAULT 'personal';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS rocket_number TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS rocket_type TEXT DEFAULT 'personal';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_instructions_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_instructions_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_accounts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_name_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_name_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_title_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_title_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_message_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_message_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS founder_phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_name_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_name_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_title_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_title_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_message_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_message_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS principal_email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_name_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_name_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_title_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_title_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_message_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_message_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS vice_principal_email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS color_palette TEXT DEFAULT 'royal-navy';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Seed initial row in site_settings if empty
INSERT INTO public.site_settings (
  id,
  institution_name_bn,
  institution_name_en,
  emis_code,
  founding_year,
  phone_primary,
  whatsapp_number,
  email_primary,
  admission_status
) VALUES (
  1,
  'আননূর তাহফিজুল কুরআন মাদরাসা',
  'Annoor Tahfizul Quran Madrasa',
  NULL,
  '2021',
  '01820811511',
  '01581818368',
  'info@annoor.edu.bd',
  'open'
) ON CONFLICT (id) DO NOTHING;

-- ৫. Notices Table (নোটিশ বোর্ড)
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  content_bn TEXT NOT NULL,
  content_en TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'academic', 'admission', 'holiday', 'emergency')),
  pdf_url TEXT,
  embed_code TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration for existing notices table:
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS embed_code TEXT;

-- ৬. Marquee Notices Table (হেডারের রানিং নোটিশ টিকার)
CREATE TABLE IF NOT EXISTS public.marquee_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_bn TEXT NOT NULL,
  text_en TEXT,
  link_url TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৭. Hero Banners Table (হোমপেজ ব্যানার স্লাইডার)
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  subtitle_bn TEXT,
  subtitle_en TEXT,
  image_url TEXT NOT NULL,
  cta_text_bn TEXT,
  cta_text_en TEXT,
  cta_link TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ৮. Faculty Members Table (শিক্ষক ও পরিচালকমণ্ডলী)
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

-- ৯. News & Press Table (সংবাদ ও আপডেট)
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

-- ১০. Events Table (ইভেন্টস ও অনুষ্ঠান)
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

-- ১১. Achievements Table (সাফল্য ও অর্জন)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  year TEXT NOT NULL,
  category_bn TEXT,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১২. Testimonials Table (মতামত ও রিভিউ)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  relation_title_bn TEXT NOT NULL,
  relation_title_en TEXT,
  review_text_bn TEXT NOT NULL,
  review_text_en TEXT,
  rating INTEGER DEFAULT 5,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১৩. Curriculum Table (শিক্ষা কার্যক্রম ও বিভাগ)
CREATE TABLE IF NOT EXISTS public.curriculum (
  id TEXT PRIMARY KEY,
  department_bn TEXT NOT NULL,
  department_en TEXT,
  category TEXT DEFAULT 'general',
  age_group_bn TEXT,
  age_group_en TEXT,
  duration_bn TEXT,
  duration_en TEXT,
  description_bn TEXT,
  description_en TEXT,
  subjects_bn TEXT[] DEFAULT '{}',
  subjects_en TEXT[] DEFAULT '{}',
  features_bn TEXT[] DEFAULT '{}',
  features_en TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১৪. Downloads Table (ডাউনলোড কর্নার / সিলেবাস / রুটিন)
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

-- ১৫. Gallery Items Table (ছবি গ্যালারি)
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  caption_bn TEXT,
  caption_en TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'academic',
  date_label TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১৬. Media Videos Table (ভিডিও গ্যালারি ও ইউটিউব প্লেলিস্ট)
CREATE TABLE IF NOT EXISTS public.media_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  type TEXT DEFAULT 'video' CHECK (type IN ('video', 'playlist', 'livestream')),
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১৭. Wall of Huffaz Table (হিফজ সমাপনকারী শিক্ষার্থীদের তালিকা)
CREATE TABLE IF NOT EXISTS public.wall_of_huffaz (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  father_name_bn TEXT,
  father_name_en TEXT,
  completion_year TEXT NOT NULL,
  duration_bn TEXT,
  duration_en TEXT,
  age_at_completion TEXT,
  campus TEXT DEFAULT 'boys' CHECK (campus IN ('boys', 'girls')),
  teacher_name_bn TEXT,
  teacher_name_en TEXT,
  district_bn TEXT,
  district_en TEXT,
  award_title_bn TEXT,
  award_title_en TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১৮. Fee Structures Table (ভর্তি ও বেতন কাঠামো)
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id TEXT PRIMARY KEY,
  type_bn TEXT NOT NULL,
  type_en TEXT,
  amount_bn TEXT NOT NULL,
  amount_en TEXT,
  note_bn TEXT,
  note_en TEXT,
  category TEXT DEFAULT 'tuition',
  highlight BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ১৯. Admission Rules Table (ভর্তি নিয়মাবলী ও নির্দেশিকা)
CREATE TABLE IF NOT EXISTS public.admission_rules (
  id TEXT PRIMARY KEY,
  rule_bn TEXT NOT NULL,
  rule_en TEXT,
  type TEXT DEFAULT 'rule',
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ২০. Admissions Table (অনলাইন ভর্তি আবেদন)
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
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marquee_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_of_huffaz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
CREATE POLICY "Super admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Activity Logs Policies
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Site Settings Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated admins can manage site settings" ON public.site_settings;
CREATE POLICY "Authenticated admins can manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Notices Policies
DROP POLICY IF EXISTS "Public can view published notices" ON public.notices;
CREATE POLICY "Public can view published notices"
  ON public.notices FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage notices" ON public.notices;
CREATE POLICY "Admins can manage notices"
  ON public.notices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Marquee Notices Policies
DROP POLICY IF EXISTS "Public can view active marquee notices" ON public.marquee_notices;
CREATE POLICY "Public can view active marquee notices"
  ON public.marquee_notices FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage marquee notices" ON public.marquee_notices;
CREATE POLICY "Admins can manage marquee notices"
  ON public.marquee_notices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Hero Banners Policies
DROP POLICY IF EXISTS "Public can view active hero banners" ON public.hero_banners;
CREATE POLICY "Public can view active hero banners"
  ON public.hero_banners FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage hero banners" ON public.hero_banners;
CREATE POLICY "Admins can manage hero banners"
  ON public.hero_banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Faculty Policies
DROP POLICY IF EXISTS "Public can view active faculty" ON public.faculty_members;
CREATE POLICY "Public can view active faculty"
  ON public.faculty_members FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage faculty" ON public.faculty_members;
CREATE POLICY "Admins can manage faculty"
  ON public.faculty_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. News Policies
DROP POLICY IF EXISTS "Public can view published news" ON public.news;
CREATE POLICY "Public can view published news"
  ON public.news FOR SELECT
  USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admins can manage news"
  ON public.news FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9. Events Policies
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events"
  ON public.events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 10. Achievements Policies
DROP POLICY IF EXISTS "Public can view achievements" ON public.achievements;
CREATE POLICY "Public can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;
CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 11. Testimonials Policies
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
CREATE POLICY "Public can view approved testimonials"
  ON public.testimonials FOR SELECT
  USING (is_approved = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
CREATE POLICY "Public can submit testimonials"
  ON public.testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 12. Curriculum Policies
DROP POLICY IF EXISTS "Public can view active curriculum" ON public.curriculum;
CREATE POLICY "Public can view active curriculum"
  ON public.curriculum FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage curriculum" ON public.curriculum;
CREATE POLICY "Admins can manage curriculum"
  ON public.curriculum FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 13. Downloads Policies
DROP POLICY IF EXISTS "Public can view active downloads" ON public.downloads;
CREATE POLICY "Public can view active downloads"
  ON public.downloads FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage downloads" ON public.downloads;
CREATE POLICY "Admins can manage downloads"
  ON public.downloads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 14. Gallery Items Policies
DROP POLICY IF EXISTS "Public can view gallery items" ON public.gallery_items;
CREATE POLICY "Public can view gallery items"
  ON public.gallery_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery items" ON public.gallery_items;
CREATE POLICY "Admins can manage gallery items"
  ON public.gallery_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 15. Media Videos Policies
DROP POLICY IF EXISTS "Public can view media videos" ON public.media_videos;
CREATE POLICY "Public can view media videos"
  ON public.media_videos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage media videos" ON public.media_videos;
CREATE POLICY "Admins can manage media videos"
  ON public.media_videos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 16. Wall of Huffaz Policies
DROP POLICY IF EXISTS "Public can view active huffaz" ON public.wall_of_huffaz;
CREATE POLICY "Public can view active huffaz"
  ON public.wall_of_huffaz FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage huffaz" ON public.wall_of_huffaz;
CREATE POLICY "Admins can manage huffaz"
  ON public.wall_of_huffaz FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 17. Fee Structures Policies
DROP POLICY IF EXISTS "Public can view active fee structures" ON public.fee_structures;
CREATE POLICY "Public can view active fee structures"
  ON public.fee_structures FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage fee structures" ON public.fee_structures;
CREATE POLICY "Admins can manage fee structures"
  ON public.fee_structures FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 18. Admission Rules Policies
DROP POLICY IF EXISTS "Public can view admission rules" ON public.admission_rules;
CREATE POLICY "Public can view admission rules"
  ON public.admission_rules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage admission rules" ON public.admission_rules;
CREATE POLICY "Admins can manage admission rules"
  ON public.admission_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 19. Admissions Policies
DROP POLICY IF EXISTS "Public can submit admission application" ON public.admissions;
CREATE POLICY "Public can submit admission application"
  ON public.admissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage admissions" ON public.admissions;
CREATE POLICY "Admins can view and manage admissions"
  ON public.admissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
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
-- STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cms-notices', 'cms-notices', true),
  ('cms-gallery', 'cms-gallery', true),
  ('cms-downloads', 'cms-downloads', true),
  ('cms-branding', 'cms-branding', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

DROP POLICY IF EXISTS "Authenticated users can upload objects" ON storage.objects;
CREATE POLICY "Authenticated users can upload objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

DROP POLICY IF EXISTS "Authenticated users can update/delete objects" ON storage.objects;
CREATE POLICY "Authenticated users can update/delete objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

-- ==============================================================================
-- SITE SETTINGS EXTENSIONS & BOARD AFFILIATIONS
-- ==============================================================================
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS facebook_group_url TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS befaq_name TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS befaq_reg_no TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS huffaz_name TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS huffaz_reg_no TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS nurani_name TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS nurani_reg_no TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS befaq_cert_no TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS huffaz_cert_no TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS nurani_cert_no TEXT;
ALTER TABLE IF EXISTS public.site_settings ADD COLUMN IF NOT EXISTS trade_license_no TEXT;


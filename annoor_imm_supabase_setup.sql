-- ==============================================================================
-- ANNOOR TAHFIZUL QURAN MADRASA - SUPABASE DATABASE SETUP (BRANCH: annoor-imm)
-- ==============================================================================
-- এই SQL স্ক্রিপ্টটি আপনার নতুন Supabase প্রজেক্ট (tmhjuznymgzkzxkfnlzn) এর
-- Dashboard -> SQL Editor-এ গিয়ে সম্পূর্ণ পেস্ট করে "Run" করুন।
-- 
-- বিশেষ বৈশিষ্ট্য:
-- ১. Main branch-এর সমস্ত হার্ডকোডেড ইউটিউব লিঙ্ক ও পুরোনো গুগল ম্যাপস লিঙ্ক সম্পূর্ণভাবে রিমুভ করা হয়েছে।
-- ২. অ্যাডমিন প্যানেল থেকে গতিশীলভাবে পরিবর্তনযোগ্য রিভিউ লিঙ্ক, গুগল ম্যাপস, প্রতিষ্ঠান বৈশিষ্ট্য ও ভর্তি টাইমলাইন যুক্ত করা হয়েছে।
-- ৩. সম্পূর্ণ Idempotent (পুনরায় রান করলেও কোনো ডেটা বিনষ্ট হবে না)।
-- ==============================================================================

-- ১. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- ২. PROFILES TABLE (অ্যাডমিন প্রোফাইল ও ভূমিকা)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'editor')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ৩. ACTIVITY LOGS TABLE (অডিট ও অ্যাক্টিভিটি হিস্ট্রি)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ৪. SITE SETTINGS TABLE (প্রতিষ্ঠান তথ্য, যোগাযোগ, ব্র্যান্ডিং ও রিভিউ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  institution_name_bn TEXT NOT NULL DEFAULT 'আননূর তাহফিজুল কুরআন মাদরাসা',
  institution_name_en TEXT DEFAULT 'Annoor Tahfizul Quran Madrasa',
  tagline_bn TEXT DEFAULT 'একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে',
  tagline_en TEXT DEFAULT 'Building Faith, Knowledge & Character Together',
  emis_code TEXT,
  founding_year TEXT DEFAULT '2021',
  phone_primary TEXT NOT NULL DEFAULT '01820811511',
  phone_secondary TEXT DEFAULT '01581818368',
  whatsapp_number TEXT NOT NULL DEFAULT '01581818368',
  email_primary TEXT NOT NULL DEFAULT 'info@annoor.edu.bd',
  website_url TEXT DEFAULT 'https://annoor.edu.bd',
  admission_status TEXT NOT NULL DEFAULT 'open' CHECK (admission_status IN ('open', 'closed', 'upcoming')),
  
  -- ক্যাম্পাস ঠিকানা ও অবস্থান (ম্যাপস ও ইউটিউব লিংক সম্পূর্ণ খালি রাখা হয়েছে যাতে অ্যাডমিন ইচ্ছামতো দিতে পারেন)
  address_boys_campus_bn TEXT DEFAULT 'আননূর তাহফিজুল কুরআন মাদরাসা, কাপাসিয়া বাজার রোড, কাপাসিয়া, গাজীপুর',
  address_boys_campus_en TEXT DEFAULT 'Annoor Tahfizul Quran Madrasa, Kapasia Bazar Road, Kapasia, Gazipur',
  address_girls_campus_bn TEXT,
  address_girls_campus_en TEXT,
  google_maps_url TEXT DEFAULT NULL,
  
  -- সোশ্যাল মিডিয়া (ইউটিউব লিংক খালি রাখা হয়েছে)
  facebook_url TEXT DEFAULT 'https://www.facebook.com/profile.php?id=61595529418669',
  facebook_group_url TEXT DEFAULT 'https://www.facebook.com/share/g/1Pg8FaZjsn/',
  youtube_url TEXT DEFAULT NULL,
  instagram_url TEXT DEFAULT NULL,
  tiktok_url TEXT DEFAULT NULL,
  twitter_url TEXT DEFAULT NULL,

  -- ব্র্যান্ডিং ও থিম
  logo_url TEXT DEFAULT '/site-logo.png',
  favicon_url TEXT DEFAULT '/favicon.ico',
  hero_image_url TEXT,
  color_palette TEXT DEFAULT 'royal-navy',
  primary_color TEXT,
  accent_color TEXT,

  -- রিভিউ লিংক ও ট্রাস্ট স্কোর (Google, Facebook, Trustpilot)
  google_review_url TEXT DEFAULT NULL,
  facebook_review_url TEXT DEFAULT NULL,
  trustpilot_review_url TEXT DEFAULT NULL,
  google_rating_score TEXT DEFAULT '4.9',
  google_reviews_count TEXT DEFAULT '48+',

  -- যোগাযোগ ল্যান্ডমার্ক ও অফিস সময়
  contact_office_hours_bn TEXT DEFAULT 'সকাল ৮:০০ - বিকাল ৫:০০ (শনিবার - বৃহস্পতিবার)',
  contact_office_hours_en TEXT DEFAULT '8:00 AM - 5:00 PM (Saturday - Thursday)',
  contact_landmark_bn TEXT DEFAULT 'মেইন রোড, কাপাসিয়া বাজার (পুরাতন সোনালী ব্যাংক ভবনের বিপরীতে)',
  contact_landmark_en TEXT DEFAULT 'Main Road, Kapasia Bazar (Opposite Old Sonali Bank Building)',

  -- ভর্তি সেশন ও নোটিশ ব্যানার
  admission_session_year TEXT DEFAULT '২০২৬-২০২৭',
  admission_timeline_bn TEXT DEFAULT 'চলমান শিক্ষাবর্ষের ভর্তি কার্যক্রম শুরু হয়েছে',
  admission_timeline_en TEXT DEFAULT 'Admission is now open for the current academic session',
  admission_notice_banner_bn TEXT DEFAULT 'সীমিত আসনে সরাসরি ক্যাম্পাসে অথবা অনলাইনে আবেদন গ্রহণ চলছে',
  admission_notice_banner_en TEXT DEFAULT 'Limited seats available. Apply online or visit campus',

  -- প্রাতিষ্ঠানিক বৈশিষ্ট্য ও ডাটা (JSONB)
  institutional_features JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  payment_accounts JSONB DEFAULT '[]'::jsonb,

  -- ব্যাংকিং ও পেমেন্ট
  bank_name_bn TEXT DEFAULT 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
  bank_name_en TEXT DEFAULT 'Islami Bank Bangladesh PLC',
  bank_account_name TEXT DEFAULT 'Annoor Tahfizul Quran Madrasa',
  bank_account_no TEXT DEFAULT '20503760201161316',
  bank_branch_bn TEXT DEFAULT 'কাপাসিয়া শাখা, গাজীপুর',
  bank_branch_en TEXT DEFAULT 'Kapasia Branch, Gazipur',
  bank_routing_no TEXT DEFAULT '125271874',
  bkash_number TEXT DEFAULT '01820811511',
  bkash_type TEXT DEFAULT 'personal',
  nagad_number TEXT DEFAULT '01581818368',
  nagad_type TEXT DEFAULT 'personal',
  rocket_number TEXT DEFAULT '01820811511',
  rocket_type TEXT DEFAULT 'personal',
  payment_instructions_bn TEXT,
  payment_instructions_en TEXT,

  -- পরিচালনা ও নেতৃত্ব
  founder_name_bn TEXT DEFAULT 'মুফতি আব্দুল্লাহ আল মামুন',
  founder_name_en TEXT DEFAULT 'Mufti Abdullah Al Mamon',
  founder_title_bn TEXT DEFAULT 'প্রতিষ্ঠাতা পরিচালক',
  founder_title_en TEXT DEFAULT 'Founder Director',
  founder_message_bn TEXT,
  founder_message_en TEXT,
  founder_image_url TEXT,
  founder_phone TEXT DEFAULT '01820811511',

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

  -- বোর্ড সংযুক্তি ও নিবন্ধন
  befaq_name TEXT DEFAULT 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)',
  befaq_reg_no TEXT,
  befaq_cert_no TEXT,
  huffaz_name TEXT DEFAULT 'হুফ্ফাজুল কুরআন ফাউন্ডেশন বাংলাদেশ',
  huffaz_reg_no TEXT,
  huffaz_cert_no TEXT,
  nurani_name TEXT DEFAULT 'নূরানী তা''লীমুল কুরআন বোর্ড বাংলাদেশ',
  nurani_reg_no TEXT,
  nurani_cert_no TEXT,
  trade_license_no TEXT,

  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- গ্যারান্টিযুক্ত কলাম সংযোজন (Existing installations safe migration)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_review_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_review_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS trustpilot_review_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_rating_score TEXT DEFAULT '4.9';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_reviews_count TEXT DEFAULT '48+';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_office_hours_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_office_hours_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_landmark_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_landmark_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS admission_session_year TEXT DEFAULT '২০২৬-২০২৭';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS admission_timeline_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS admission_timeline_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS admission_notice_banner_bn TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS admission_notice_banner_en TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS institutional_features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS payment_accounts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS facebook_group_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS befaq_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS befaq_reg_no TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS huffaz_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS huffaz_reg_no TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nurani_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS nurani_reg_no TEXT;

-- Initial Seed: ইউটিউব ও পুরোনো ম্যাপস লিংক মুক্ত ক্লিন ইনিশিয়াল রো
INSERT INTO public.site_settings (
  id,
  institution_name_bn,
  institution_name_en,
  tagline_bn,
  tagline_en,
  phone_primary,
  phone_secondary,
  whatsapp_number,
  email_primary,
  website_url,
  admission_status,
  address_boys_campus_bn,
  google_maps_url,
  youtube_url,
  google_rating_score,
  google_reviews_count,
  contact_office_hours_bn,
  contact_landmark_bn,
  admission_session_year,
  admission_timeline_bn,
  admission_notice_banner_bn
) VALUES (
  1,
  'আননূর তাহফিজুল কুরআন মাদরাসা',
  'Annoor Tahfizul Quran Madrasa',
  'একই স্থানে, একই খরচে, সকল শিক্ষা একইসাথে',
  'Building Faith, Knowledge & Character Together',
  '01820811511',
  '01581818368',
  '01581818368',
  'info@annoor.edu.bd',
  'https://annoor.edu.bd',
  'open',
  'আননূর তাহফিজুল কুরআন মাদরাসা, কাপাসিয়া বাজার রোড, কাপাসিয়া, গাজীপুর',
  NULL,
  NULL,
  '4.9',
  '48+',
  'সকাল ৮:০০ - বিকাল ৫:০০ (শনিবার - বৃহস্পতিবার)',
  'মেইন রোড, কাপাসিয়া বাজার (পুরাতন সোনালী ব্যাংক ভবনের বিপরীতে)',
  '২০২৬-২০২৭',
  'চলমান শিক্ষাবর্ষের ভর্তি কার্যক্রম শুরু হয়েছে',
  'সীমিত আসনে সরাসরি ক্যাম্পাসে অথবা অনলাইনে আবেদন গ্রহণ চলছে'
) ON CONFLICT (id) DO UPDATE SET
  institution_name_bn = EXCLUDED.institution_name_bn,
  institution_name_en = EXCLUDED.institution_name_en,
  google_maps_url = COALESCE(public.site_settings.google_maps_url, EXCLUDED.google_maps_url),
  youtube_url = COALESCE(public.site_settings.youtube_url, EXCLUDED.youtube_url);

-- ==============================================================================
-- ৫. NOTICES TABLE (নোটিশ বোর্ড)
-- ==============================================================================
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

-- ==============================================================================
-- ৬. MARQUEE NOTICES TABLE (টপবার রানিং নোটিশ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.marquee_notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_bn TEXT NOT NULL,
  text_en TEXT,
  link_url TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ৭. HERO BANNERS TABLE (হোম স্লাইডার ব্যানার)
-- ==============================================================================
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

-- ==============================================================================
-- ৮. FACULTY MEMBERS TABLE (শিক্ষক ও পরিচালকমণ্ডলী)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.faculty_members (
  id TEXT PRIMARY KEY,
  teacher_id TEXT,
  nid TEXT,
  joining_year TEXT,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  designation_bn TEXT NOT NULL,
  designation_en TEXT,
  department_bn TEXT,
  department_en TEXT,
  category TEXT DEFAULT 'academic' CHECK (category IN ('academic', 'management', 'hifz', 'deeni', 'general')),
  phone TEXT,
  email TEXT,
  blood_group TEXT,
  education_bn TEXT,
  education_en TEXT,
  experience_bn TEXT,
  experience_en TEXT,
  bio_bn TEXT,
  bio_en TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ৯. NEWS TABLE (ক্যাম্পাস সংবাদ ও প্রেস বিজ্ঞপ্তি)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  slug TEXT UNIQUE,
  summary_bn TEXT,
  summary_en TEXT,
  content_bn TEXT NOT NULL,
  content_en TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১০. EVENTS TABLE (ইভেন্ট ক্যালেন্ডার)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  event_date DATE NOT NULL,
  end_date DATE,
  time_label TEXT,
  location_bn TEXT,
  location_en TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'academic',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১১. ACHIEVEMENTS TABLE (সাফল্য ও প্রতিযোগিতা অর্জন)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  year TEXT NOT NULL,
  category_bn TEXT,
  category_en TEXT,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  student_name_bn TEXT,
  student_name_en TEXT,
  award_title_bn TEXT,
  award_title_en TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১২. TESTIMONIALS TABLE (অভিভাবক ও শুভানুধ্যায়ীদের রিভিউ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  relation_title_bn TEXT NOT NULL,
  relation_title_en TEXT,
  review_text_bn TEXT NOT NULL,
  review_text_en TEXT,
  rating INTEGER DEFAULT 5,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১৩. CURRICULUM TABLE (শিক্ষা কারিকুলাম ও কোর্সসমূহ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.curriculum (
  id TEXT PRIMARY KEY,
  department_bn TEXT NOT NULL,
  department_en TEXT,
  category TEXT NOT NULL,
  age_group_bn TEXT,
  age_group_en TEXT,
  duration_bn TEXT,
  duration_en TEXT,
  description_bn TEXT NOT NULL,
  description_en TEXT,
  subjects_bn JSONB DEFAULT '[]'::jsonb,
  subjects_en JSONB DEFAULT '[]'::jsonb,
  features_bn JSONB DEFAULT '[]'::jsonb,
  features_en JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১৪. DOWNLOADS TABLE (ডাউনলোড কর্নার ও সিলেবাস/ফরম)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.downloads (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  category TEXT DEFAULT 'forms' CHECK (category IN ('forms', 'syllabus', 'routines', 'results', 'prospectus', 'other')),
  file_url TEXT NOT NULL,
  file_size TEXT,
  file_type TEXT,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১৫. GALLERY ITEMS TABLE (ফটো গ্যালারি)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'academic',
  date_label TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ১৬. MEDIA VIDEOS TABLE (ভিডিও গ্যালারি - নো ডামি ইউটিউব লিংক)
-- ==============================================================================
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

-- ==============================================================================
-- ১৭. WALL OF HUFFAZ TABLE (হিফজ সমাপনকারীদের সম্মাননা বোর্ড)
-- ==============================================================================
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

-- ==============================================================================
-- ১৮. FEE STRUCTURES TABLE (ফি তালিকা ও বেতন কাঠামো)
-- ==============================================================================
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

-- ==============================================================================
-- ১৯. ADMISSION RULES TABLE (ভর্তি নিয়মাবলী)
-- ==============================================================================
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

-- ==============================================================================
-- ২০. ADMISSIONS TABLE (অনলাইন ভর্তি আবেদন)
-- ==============================================================================
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

-- সর্বজনীন রিড পারমিশন (Public Viewable)
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'site_settings', 'notices', 'marquee_notices', 'hero_banners',
    'faculty_members', 'news', 'events', 'achievements', 'testimonials',
    'curriculum', 'downloads', 'gallery_items', 'media_videos',
    'wall_of_huffaz', 'fee_structures', 'admission_rules'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public can view %I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public can view %I" ON public.%I FOR SELECT USING (true);', tbl, tbl);
  END LOOP;
END $$;

-- অ্যাডমিন ফুল পারমিশন (Authenticated Management)
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'profiles', 'activity_logs', 'site_settings', 'notices', 'marquee_notices',
    'hero_banners', 'faculty_members', 'news', 'events', 'achievements',
    'testimonials', 'curriculum', 'downloads', 'gallery_items', 'media_videos',
    'wall_of_huffaz', 'fee_structures', 'admission_rules', 'admissions'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can manage %I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Authenticated can manage %I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

-- জনসাধারণের আবেদন ও রিভিউ জমার পারমিশন (Admissions & Reviews)
DROP POLICY IF EXISTS "Anyone can submit admission" ON public.admissions;
CREATE POLICY "Anyone can submit admission"
  ON public.admissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;
CREATE POLICY "Anyone can submit testimonial"
  ON public.testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can view profiles" ON public.profiles;
CREATE POLICY "Anon can view profiles"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER (নতুন অ্যাডমিন রেজিস্টার হলে স্বয়ংক্রিয় প্রোফাইল তৈরি)
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
-- STORAGE BUCKETS SETUP (ফটো, পিডিএফ ও মিডিয়া আপলোড)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cms-notices', 'cms-notices', true),
  ('cms-gallery', 'cms-gallery', true),
  ('cms-downloads', 'cms-downloads', true),
  ('cms-branding', 'cms-branding', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

DROP POLICY IF EXISTS "Authenticated users can upload objects" ON storage.objects;
CREATE POLICY "Authenticated users can upload objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

DROP POLICY IF EXISTS "Authenticated users can manage objects" ON storage.objects;
CREATE POLICY "Authenticated users can manage objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id IN ('cms-notices', 'cms-gallery', 'cms-downloads', 'cms-branding'));

-- ==============================================================================
-- SUPABASE REALTIME PUBLICATION
-- ==============================================================================
DO $$
DECLARE
  tbl text;
  realtime_tables text[] := ARRAY[
    'site_settings', 'notices', 'marquee_notices', 'testimonials',
    'media_videos', 'admissions'
  ];
BEGIN
  FOREACH tbl IN ARRAY realtime_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', tbl);
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;
    END IF;
  END LOOP;
END $$;

-- ==============================================================================
-- SCHEMA CACHE RELOAD
-- ==============================================================================
NOTIFY pgrst, 'reload schema';


-- ==============================================================================
-- OASIS HUB / ANNOOR MADRASHA - MEDIA VIDEOS SETUP
-- ==============================================================================
-- এই স্ক্রিপ্টটি Supabase Dashboard -> SQL Editor এ গিয়ে রান (Run) করুন।
-- এর ফলে ওয়েবসাইট ও অ্যাডমিন প্যানেলের ইউটিউব ভিডিও ও প্লেলিস্ট সরাসরি ডাটাবেজে 
-- সংরক্ষিত হবে এবং 'Could not find table public.media_videos in schema cache' এররটি স্থায়ীভাবে সমাধান হবে।

-- ১. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ২. Media Videos Table তৈরি করুন
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

-- ৩. Row Level Security (RLS) সক্রিয় করুন
ALTER TABLE public.media_videos ENABLE ROW LEVEL SECURITY;

-- ৪. RLS Policies সেটআপ

-- ক. যে-কেউ (ভিজিটর ও অ্যাডমিন) ভিডিও দেখতে পারবে
DROP POLICY IF EXISTS "Public can view media videos" ON public.media_videos;
CREATE POLICY "Public can view media videos"
  ON public.media_videos FOR SELECT
  TO anon, authenticated
  USING (true);

-- খ. অ্যাডমিনরা সকল ভিডিও যোগ, পরিবর্তন ও মুছতে পারবে
DROP POLICY IF EXISTS "Admins can manage media videos" ON public.media_videos;
CREATE POLICY "Admins can manage media videos"
  ON public.media_videos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- গ. অ্যানোনিমাস / লোকাল ডেভ ক্লায়েন্টের জন্য ব্যাকআপ অনুমতি
DROP POLICY IF EXISTS "Anon can manage media videos" ON public.media_videos;
CREATE POLICY "Anon can manage media videos"
  ON public.media_videos FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ৫. রিয়েলটাইম পাবলিকেশন সক্রিয় করুন
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'media_videos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.media_videos;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- ৬. PostgREST স্কিমা ক্যাশ তাৎক্ষণিক রিলোড করুন
NOTIFY pgrst, 'reload schema';

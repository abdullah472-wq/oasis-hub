-- ==============================================================================
-- OASIS HUB / ANNOOR MADRASHA - TESTIMONIALS (REVIEWS) SETUP
-- ==============================================================================
-- এই স্ক্রিপ্টটি Supabase Dashboard -> SQL Editor এ গিয়ে রান (Run) করুন।
-- এর ফলে ওয়েবসাইট থেকে জমা দেওয়া সকল রিভিউ সরাসরি ডাটাবেজে জমা হবে এবং
-- অ্যাডমিন প্যানেলে (রিভিউ মডারেশন) তাৎক্ষণিক দেখা যাবে।

-- ১. Testimonials Table তৈরি করুন
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

-- ২. Row Level Security (RLS) সক্রিয় করুন
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- ৩. RLS Policies সেটআপ

-- ক. যে-কেউ (ভিজিটর ও অ্যাডমিন) রিভিউ দেখতে পারবে
DROP POLICY IF EXISTS "Anyone can view testimonials" ON public.testimonials;
CREATE POLICY "Anyone can view testimonials"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (true);

-- খ. ওয়েবসাইট থেকে যে-কেউ নতুন রিভিউ জমা দিতে পারবে (is_approved ডিফল্টভাবে false থাকবে)
DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
CREATE POLICY "Public can submit testimonials"
  ON public.testimonials FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- গ. শুধুমাত্র লগইন করা অ্যাডমিনরা রিভিউ অনুমোদন (Approve), আপডেট বা এডিট করতে পারবে
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ঘ. শুধুমাত্র লগইন করা অ্যাডমিনরা রিভিউ মুছে ফেলতে পারবে
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  TO authenticated
  USING (true);

-- ঙ. অ্যাডমিনদের সকল পারমিশন নিশ্চিত করা
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ৪. রিয়েলটাইম পাবলিকেশন সক্রিয় করুন (যদি রিয়েলটাইম প্রয়োজন হয়)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'testimonials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- =========================================================
-- EVENTWISHER SUPABASE DATABASE & STORAGE SETUP SCRIPT
-- Run this complete script in your Supabase SQL Editor
-- =========================================================

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  host_email TEXT NOT NULL,
  description TEXT DEFAULT '',
  theme TEXT DEFAULT 'gold',
  max_duration_sec INTEGER DEFAULT 45,
  cover_image TEXT,
  allow_file_upload BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries by host and slug
CREATE INDEX IF NOT EXISTS idx_events_host_email ON public.events (host_email);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);

-- 2. Create Wishes Table
CREATE TABLE IF NOT EXISTS public.wishes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL DEFAULT 'Anonymous Guest',
  message TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  duration INTEGER DEFAULT 15,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  moderated_at TIMESTAMPTZ
);

-- Index for fast queries by event
CREATE INDEX IF NOT EXISTS idx_wishes_event_id ON public.wishes (event_id);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON public.wishes (status);

-- 3. Create Storage Bucket for Video Uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wishes-videos',
  'wishes-videos',
  TRUE,
  104857600, -- 100 MB max file size
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Storage Policy: Allow public read access to videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to Wishes Videos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access to Wishes Videos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'wishes-videos');
  END IF;
END $$;

-- Storage Policy: Allow upload access to video wishes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow Uploads to Wishes Videos' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Allow Uploads to Wishes Videos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'wishes-videos');
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS) and provide public access for API server
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select events' AND tablename = 'events') THEN
    CREATE POLICY "Allow public select events" ON public.events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert events' AND tablename = 'events') THEN
    CREATE POLICY "Allow public insert events" ON public.events FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update events' AND tablename = 'events') THEN
    CREATE POLICY "Allow public update events" ON public.events FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete events' AND tablename = 'events') THEN
    CREATE POLICY "Allow public delete events" ON public.events FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select wishes' AND tablename = 'wishes') THEN
    CREATE POLICY "Allow public select wishes" ON public.wishes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert wishes' AND tablename = 'wishes') THEN
    CREATE POLICY "Allow public insert wishes" ON public.wishes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update wishes' AND tablename = 'wishes') THEN
    CREATE POLICY "Allow public update wishes" ON public.wishes FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public delete wishes' AND tablename = 'wishes') THEN
    CREATE POLICY "Allow public delete wishes" ON public.wishes FOR DELETE USING (true);
  END IF;
END $$;

-- 5. Seed Initial Demo Events & Wishes (Optional initial data)
INSERT INTO public.events (id, slug, name, date, host_email, description, theme, max_duration_sec, cover_image, allow_file_upload)
VALUES
  (
    'demo-wedding-2026',
    'sarah-alex-wedding',
    'Sarah & Alex’s Golden Wedding Gala',
    '2026-09-15',
    'host@eventwishes.com',
    'Join us in capturing unforgettable memories! Leave a heartfelt video wish for Sarah & Alex.',
    'gold',
    45,
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
    TRUE
  ),
  (
    'demo-tech-summit-2026',
    'global-tech-summit',
    'Global Tech Innovators Summit 2026',
    '2026-10-20',
    'host@eventwishes.com',
    'Share your key takeaways, speaker shout-outs, and future tech wishes for the summit wall!',
    'neon',
    60,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wishes (id, event_id, guest_name, message, video_url, duration, status)
VALUES
  (
    'wish-1',
    'demo-wedding-2026',
    'Jessica Miller',
    'Wishing you both a lifetime of eternal love, happiness, and unforgettable adventures!',
    'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-a-video-call-with-her-phone-41487-large.mp4',
    18,
    'approved'
  ),
  (
    'wish-2',
    'demo-wedding-2026',
    'David & Emily Chen',
    'So honored to celebrate with you guys tonight! Dance like nobody is watching!',
    'https://assets.mixkit.co/videos/preview/mixkit-happy-friends-holding-sparklers-at-a-party-41370-large.mp4',
    24,
    'approved'
  ),
  (
    'wish-3',
    'demo-wedding-2026',
    'Grandma Eleanor',
    'May God bless your sacred bond every single day. Congratulations darling!',
    'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-smiling-at-the-camera-42416-large.mp4',
    15,
    'pending'
  ),
  (
    'wish-4',
    'demo-tech-summit-2026',
    'Marcus Vance (AI Lead)',
    'Mind-blowing keynote on agentic systems! Excited for what we build together.',
    'https://assets.mixkit.co/videos/preview/mixkit-man-talking-to-the-camera-with-earphones-41584-large.mp4',
    20,
    'approved'
  )
ON CONFLICT (id) DO NOTHING;

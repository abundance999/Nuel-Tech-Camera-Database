ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

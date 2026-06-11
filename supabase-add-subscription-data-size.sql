-- Add data_size_gb to the subscriptions table
-- Run this in the Supabase SQL editor.

ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS data_size_gb numeric;

-- Add the memory_card_size and subscription fields to the clients table
-- Run this in the Supabase SQL editor.

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS memory_card_size text;

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS subscription numeric;

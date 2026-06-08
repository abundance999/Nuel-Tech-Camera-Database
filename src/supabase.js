import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fnpcclfmtpwoyjmjhncw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucGNjbGZtdHB3b3lqbWpobmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjkxMTAsImV4cCI6MjA5NjUwNTExMH0.mEy3brnweJQYfnoZHoG9mdU0KliTEJOGh3SkV0QUKaM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

-- Create profiles table if it doesn't exist
-- This table is used by the authentication system for storing user profile data

create table if not exists public.profiles (
  id uuid primary key,
  auth_user_id uuid,
  full_name text,
  email text unique,
  phone text,
  role text default 'user',
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create index for email lookups (for faster queries during login)
create unique index if not exists profiles_email_idx on public.profiles (email);

-- Enable updated_at trigger
select public.ensure_updated_at_trigger('set_profiles_updated_at', 'public.profiles');

-- Note: Admin user in Supabase Auth should be created using the seed script
-- This migration creates the table structure only.
-- Use: npm run seed:admin


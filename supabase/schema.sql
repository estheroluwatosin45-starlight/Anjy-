-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  bio text,
  profile_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Poems table
create table poems (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  featured_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Diary Entries table
create table diary_entries (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bible Verses table
create table bible_verses (
  id uuid default uuid_generate_v4() primary key,
  verse_reference text not null,
  verse_text text not null,
  explanation text,
  display_date date not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Affirmations table
create table affirmations (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  affirmation_text text not null,
  display_date date not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contact Messages table
create table contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Newsletter Subscribers table
create table newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table poems enable row level security;
alter table diary_entries enable row level security;
alter table bible_verses enable row level security;
alter table affirmations enable row level security;
alter table contact_messages enable row level security;
alter table newsletter_subscribers enable row level security;

-- Public can read content
create policy "Public can view poems" on poems for select using (true);
create policy "Public can view diary entries" on diary_entries for select using (true);
create policy "Public can view bible verses" on bible_verses for select using (true);
create policy "Public can view affirmations" on affirmations for select using (true);

-- Authenticated users (Admin) can manage content
create policy "Admin can insert poems" on poems for insert with check (auth.role() = 'authenticated');
create policy "Admin can update poems" on poems for update using (auth.role() = 'authenticated');
create policy "Admin can delete poems" on poems for delete using (auth.role() = 'authenticated');

create policy "Admin can insert diary entries" on diary_entries for insert with check (auth.role() = 'authenticated');
create policy "Admin can update diary entries" on diary_entries for update using (auth.role() = 'authenticated');
create policy "Admin can delete diary entries" on diary_entries for delete using (auth.role() = 'authenticated');

create policy "Admin can insert bible verses" on bible_verses for insert with check (auth.role() = 'authenticated');
create policy "Admin can update bible verses" on bible_verses for update using (auth.role() = 'authenticated');
create policy "Admin can delete bible verses" on bible_verses for delete using (auth.role() = 'authenticated');

create policy "Admin can insert affirmations" on affirmations for insert with check (auth.role() = 'authenticated');
create policy "Admin can update affirmations" on affirmations for update using (auth.role() = 'authenticated');
create policy "Admin can delete affirmations" on affirmations for delete using (auth.role() = 'authenticated');

-- NOTE: If you are not using Supabase Auth (e.g. logging in only via the local "admin123" passcode),
-- you can enable public inserts for simplicity by running these alternative policies in the Supabase SQL editor:
--
-- create policy "Public can insert poems" on poems for insert with check (true);
-- create policy "Public can insert diary entries" on diary_entries for insert with check (true);
-- create policy "Public can insert bible verses" on bible_verses for insert with check (true);
-- create policy "Public can insert affirmations" on affirmations for insert with check (true);

-- Anyone can submit contact messages and subscribe to newsletter
create policy "Public can insert contact messages" on contact_messages for insert with check (true);
create policy "Public can insert newsletter subscribers" on newsletter_subscribers for insert with check (true);

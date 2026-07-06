-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  bio text,
  profile_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Poems table
create table if not exists poems (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid() not null,
  title text not null,
  slug text unique not null,
  content text not null,
  featured_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Diary Entries table
create table if not exists diary_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid() not null,
  title text not null,
  slug text unique not null,
  content text not null,
  mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bible Verses table
create table if not exists bible_verses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid() not null,
  verse_reference text not null,
  verse_text text not null,
  explanation text,
  display_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_display_date unique (user_id, display_date)
);

-- Affirmations table
create table if not exists affirmations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid() not null,
  title text not null,
  affirmation_text text not null,
  display_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_affirmation_date unique (user_id, display_date)
);

-- Contact Messages table
create table if not exists contact_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid() not null, -- The author receiving the message
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Newsletter Subscribers table
create table if not exists newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade default auth.uid() not null, -- The author receiving the subscriber
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_subscriber unique (user_id, email)
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table poems enable row level security;
alter table diary_entries enable row level security;
alter table bible_verses enable row level security;
alter table affirmations enable row level security;
alter table contact_messages enable row level security;
alter table newsletter_subscribers enable row level security;

-- Profiles policies
create policy "Users can view any profile" on profiles for select using (true);
create policy "Users can edit their own profile" on profiles for all using (auth.uid() = id);

-- Poems policies
create policy "Users can access their own poems" on poems for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Diary Entries policies
create policy "Users can access their own diary entries" on diary_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bible Verses policies
create policy "Users can access their own bible verses" on bible_verses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Affirmations policies
create policy "Users can access their own affirmations" on affirmations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Contact Messages policies
create policy "Public can submit contact messages" on contact_messages for insert with check (true);
create policy "Users can access messages sent to them" on contact_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Newsletter Subscribers policies
create policy "Public can subscribe to newsletter" on newsletter_subscribers for insert with check (true);
create policy "Users can access their own subscribers list" on newsletter_subscribers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add privacy support to portfolio items
alter table poems add column if not exists is_private boolean default false not null;
alter table bible_verses add column if not exists is_private boolean default false not null;
alter table affirmations add column if not exists is_private boolean default false not null;

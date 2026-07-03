export interface Profile {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  profile_image: string;
}

export interface Poem {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  slug: string;
  content: string;
  mood: string;
  created_at: string;
}

export interface BibleVerse {
  id: string;
  verse_reference: string;
  verse_text: string;
  explanation: string;
  display_date: string;
}

export interface Affirmation {
  id: string;
  title: string;
  affirmation_text: string;
  display_date: string;
}

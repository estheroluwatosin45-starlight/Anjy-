import { supabase } from './supabase';
import { Poem, DiaryEntry, BibleVerse, Affirmation } from '../types';

// Helper to generate UUIDs locally when Supabase is not connected
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Local Storage Keys
export const STORAGE_KEYS = {
  POEMS: 'anjy_local_poems',
  DIARY: 'anjy_local_diary_entries',
  VERSES: 'anjy_local_bible_verses',
  AFFIRMATIONS: 'anjy_local_affirmations',
};

// Generic LocalStorage helpers
export function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveLocal<T>(key: string, item: T): T {
  const list = getLocal<T>(key);
  list.unshift(item); // Add to the beginning so it shows first (descending order)
  localStorage.setItem(key, JSON.stringify(list));
  return item;
}

// --- Poems ---
export async function getPoems(): Promise<Poem[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
    console.warn('Failed to fetch poems from Supabase, returning local storage fallback:', error);
  }
  return getLocal<Poem>(STORAGE_KEYS.POEMS);
}

export async function savePoem(poem: Omit<Poem, 'id' | 'created_at' | 'slug'>): Promise<{ data: Poem | null; error: any }> {
  if (supabase) {
    const slug = poem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const { data, error } = await supabase
      .from('poems')
      .insert([{ ...poem, slug }])
      .select()
      .single();
    if (!error) return { data, error: null };
    return { data: null, error };
  }

  // Local fallback
  const slug = poem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const localPoem: Poem = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    slug,
    ...poem,
  };
  saveLocal<Poem>(STORAGE_KEYS.POEMS, localPoem);
  return { data: localPoem, error: null };
}

// --- Diary Entries ---
export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
    console.warn('Failed to fetch diary entries from Supabase:', error);
  }
  return getLocal<DiaryEntry>(STORAGE_KEYS.DIARY);
}

export async function saveDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'created_at' | 'slug'>): Promise<{ data: DiaryEntry | null; error: any }> {
  if (supabase) {
    const slug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const { data, error } = await supabase
      .from('diary_entries')
      .insert([{ ...entry, slug }])
      .select()
      .single();
    if (!error) return { data, error: null };
    return { data: null, error };
  }

  const slug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const localEntry: DiaryEntry = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    slug,
    ...entry,
  };
  saveLocal<DiaryEntry>(STORAGE_KEYS.DIARY, localEntry);
  return { data: localEntry, error: null };
}

// --- Bible Verses ---
export async function getBibleVerses(): Promise<BibleVerse[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('*')
      .order('display_date', { ascending: false });
    if (!error && data) return data;
    console.warn('Failed to fetch bible verses from Supabase:', error);
  }
  return getLocal<BibleVerse>(STORAGE_KEYS.VERSES);
}

export async function saveBibleVerse(verse: Omit<BibleVerse, 'id'>): Promise<{ data: BibleVerse | null; error: any }> {
  if (supabase) {
    const { data, error } = await supabase
      .from('bible_verses')
      .insert([verse])
      .select()
      .single();
    if (!error) return { data, error: null };
    return { data: null, error };
  }

  const localVerse: BibleVerse = {
    id: generateUUID(),
    ...verse,
  };
  saveLocal<BibleVerse>(STORAGE_KEYS.VERSES, localVerse);
  return { data: localVerse, error: null };
}

// --- Affirmations ---
export async function getAffirmations(): Promise<Affirmation[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('affirmations')
      .select('*')
      .order('display_date', { ascending: false });
    if (!error && data) return data;
    console.warn('Failed to fetch affirmations from Supabase:', error);
  }
  return getLocal<Affirmation>(STORAGE_KEYS.AFFIRMATIONS);
}

export async function saveAffirmation(affirmation: Omit<Affirmation, 'id'>): Promise<{ data: Affirmation | null; error: any }> {
  if (supabase) {
    const { data, error } = await supabase
      .from('affirmations')
      .insert([affirmation])
      .select()
      .single();
    if (!error) return { data, error: null };
    return { data: null, error };
  }

  const localAffirmation: Affirmation = {
    id: generateUUID(),
    ...affirmation,
  };
  saveLocal<Affirmation>(STORAGE_KEYS.AFFIRMATIONS, localAffirmation);
  return { data: localAffirmation, error: null };
}

// --- Local Backup utility ---
export function exportLocalData() {
  const data = {
    poems: getLocal<Poem>(STORAGE_KEYS.POEMS),
    diaryEntries: getLocal<DiaryEntry>(STORAGE_KEYS.DIARY),
    bibleVerses: getLocal<BibleVerse>(STORAGE_KEYS.VERSES),
    affirmations: getLocal<Affirmation>(STORAGE_KEYS.AFFIRMATIONS),
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `anjy_local_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

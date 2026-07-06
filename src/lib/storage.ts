import { supabase } from './supabase';
import { Poem, DiaryEntry, BibleVerse, Affirmation, Profile } from '../types';

export const STORAGE_KEYS = {
  POEMS: 'anjy_local_poems',
  DIARY: 'anjy_local_diary_entries',
  VERSES: 'anjy_local_bible_verses',
  AFFIRMATIONS: 'anjy_local_affirmations',
  MESSAGES: 'anjy_local_contact_messages',
  SUBSCRIBERS: 'anjy_local_newsletter_subscribers',
};

// Helper to generate UUIDs locally when Supabase is not connected or offline
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getStorageKey(baseKey: string): string {
  const email = localStorage.getItem('anjy_user_email') || 'anonymous';
  return `${baseKey}_${email}`;
}

// Generic LocalStorage helpers
export function getLocal<T>(key: string): T[] {
  const data = localStorage.getItem(getStorageKey(key));
  return data ? JSON.parse(data) : [];
}

function saveLocal<T>(key: string, item: T): T {
  const list = getLocal<T>(key);
  list.unshift(item); // Add to the beginning so it shows first (descending order)
  localStorage.setItem(getStorageKey(key), JSON.stringify(list));
  return item;
}

function getPasscode(): string {
  return localStorage.getItem('anjy_passcode') || '';
}

function getLoginMethod(): string {
  return localStorage.getItem('anjy_login_method') || 'local';
}

function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// --- Poems ---
export async function getOwnerUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .in('email', ['pipeloluwadavid@gmail.com', 'anjy@gmail.com', 'estheroluwatosin45@gmail.com', 'estheroluwatosin45-starlight@github.com'])
      .limit(1);
    if (!error && data && data.length > 0) {
      return data[0].id;
    }
  } catch (err) {
    console.error('Error getting owner user ID:', err);
  }
  return null;
}

export async function getPoems(forAdmin = false): Promise<Poem[]> {
  if (supabase && isOnline()) {
    try {
      let query = supabase.from('poems').select('*');
      if (!forAdmin) {
        const ownerId = await getOwnerUserId();
        if (ownerId) {
          query = query.eq('user_id', ownerId).eq('is_private', false);
        }
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Network error fetching poems, falling back to local storage:', err);
    }
  }
  const localItems = getLocal<Poem>(STORAGE_KEYS.POEMS);
  return forAdmin ? localItems : localItems.filter(p => !p.is_private);
}

export async function savePoem(poem: Omit<Poem, 'id' | 'created_at' | 'slug'>): Promise<{ data: Poem | null; error: any }> {
  const slug = poem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // 1. Direct Supabase Auth writing
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('poems')
        .insert([{ ...poem, slug }])
        .select()
        .single();
      if (!error) return { data, error: null };
      return { data: null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  // 2. Option C: Express API proxy writing (using passcode)
  if (isOnline()) {
    try {
      const response = await fetch('/api/admin/poems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poem, passcode: getPasscode() })
      });
      const resData = await response.json();
      if (response.ok && resData.data) {
        return { data: resData.data, error: null };
      }
      if (response.status === 401) {
        return { data: null, error: { message: 'Invalid admin passcode' } };
      }
    } catch (err: any) {
      console.warn('Network error saving poem to backend, falling back to local storage:', err);
    }
  }

  // 3. Offline Local storage fallback
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
  if (supabase && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Network error fetching diary entries, falling back to local storage:', err);
    }
  }
  return getLocal<DiaryEntry>(STORAGE_KEYS.DIARY);
}

export async function saveDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'created_at' | 'slug'>): Promise<{ data: DiaryEntry | null; error: any }> {
  const slug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .insert([{ ...entry, slug }])
        .select()
        .single();
      if (!error) return { data, error: null };
      return { data: null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  if (isOnline()) {
    try {
      const response = await fetch('/api/admin/diary_entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entry, passcode: getPasscode() })
      });
      const resData = await response.json();
      if (response.ok && resData.data) {
        return { data: resData.data, error: null };
      }
      if (response.status === 401) {
        return { data: null, error: { message: 'Invalid admin passcode' } };
      }
    } catch (err: any) {
      console.warn('Network error saving diary entry to backend, falling back to local storage:', err);
    }
  }

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
export async function getBibleVerses(forAdmin = false): Promise<BibleVerse[]> {
  if (supabase && isOnline()) {
    try {
      let query = supabase.from('bible_verses').select('*');
      if (!forAdmin) {
        const ownerId = await getOwnerUserId();
        if (ownerId) {
          query = query.eq('user_id', ownerId).eq('is_private', false);
        }
      }
      const { data, error } = await query.order('display_date', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Network error fetching bible verses, falling back to local storage:', err);
    }
  }
  const localItems = getLocal<BibleVerse>(STORAGE_KEYS.VERSES);
  return forAdmin ? localItems : localItems.filter(v => !v.is_private);
}

export async function saveBibleVerse(verse: Omit<BibleVerse, 'id'>): Promise<{ data: BibleVerse | null; error: any }> {
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .insert([verse])
        .select()
        .single();
      if (!error) return { data, error: null };
      return { data: null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  if (isOnline()) {
    try {
      const response = await fetch('/api/admin/bible_verses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...verse, passcode: getPasscode() })
      });
      const resData = await response.json();
      if (response.ok && resData.data) {
        return { data: resData.data, error: null };
      }
      if (response.status === 401) {
        return { data: null, error: { message: 'Invalid admin passcode' } };
      }
    } catch (err: any) {
      console.warn('Network error saving bible verse to backend, falling back to local storage:', err);
    }
  }

  const localVerse: BibleVerse = {
    id: generateUUID(),
    ...verse,
  };
  saveLocal<BibleVerse>(STORAGE_KEYS.VERSES, localVerse);
  return { data: localVerse, error: null };
}

// --- Affirmations ---
export async function getAffirmations(forAdmin = false): Promise<Affirmation[]> {
  if (supabase && isOnline()) {
    try {
      let query = supabase.from('affirmations').select('*');
      if (!forAdmin) {
        const ownerId = await getOwnerUserId();
        if (ownerId) {
          query = query.eq('user_id', ownerId).eq('is_private', false);
        }
      }
      const { data, error } = await query.order('display_date', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Network error fetching affirmations, falling back to local storage:', err);
    }
  }
  const localItems = getLocal<Affirmation>(STORAGE_KEYS.AFFIRMATIONS);
  return forAdmin ? localItems : localItems.filter(a => !a.is_private);
}

export async function saveAffirmation(affirmation: Omit<Affirmation, 'id'>): Promise<{ data: Affirmation | null; error: any }> {
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('affirmations')
        .insert([affirmation])
        .select()
        .single();
      if (!error) return { data, error: null };
      return { data: null, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  if (isOnline()) {
    try {
      const response = await fetch('/api/admin/affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...affirmation, passcode: getPasscode() })
      });
      const resData = await response.json();
      if (response.ok && resData.data) {
        return { data: resData.data, error: null };
      }
      if (response.status === 401) {
        return { data: null, error: { message: 'Invalid admin passcode' } };
      }
    } catch (err: any) {
      console.warn('Network error saving affirmation to backend, falling back to local storage:', err);
    }
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
    contactMessages: getLocal<any>(STORAGE_KEYS.MESSAGES),
    newsletterSubscribers: getLocal<any>(STORAGE_KEYS.SUBSCRIBERS),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = `anjy_local_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}

// --- Contact Messages ---
export async function getContactMessages(): Promise<any[]> {
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Error direct-fetching contact messages:', err);
    }
  }

  if (getLoginMethod() === 'local' && isOnline()) {
    try {
      const response = await fetch(`/api/admin/contact_messages?passcode=${getPasscode()}`);
      const resData = await response.json();
      if (response.ok && resData.data) return resData.data;
    } catch (err) {
      console.warn('Error fetching contact messages from backend:', err);
    }
  }

  return getLocal<any>(STORAGE_KEYS.MESSAGES);
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn(err);
    }
  }

  if (getLoginMethod() === 'local' && isOnline()) {
    try {
      const response = await fetch(`/api/admin/contact_messages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: getPasscode() })
      });
      if (response.ok) return true;
    } catch (err) {
      console.warn(err);
    }
  }

  // Local fallback
  const list = getLocal<any>(STORAGE_KEYS.MESSAGES);
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  return true;
}

export async function sendContactMessage(name: string, email: string, message: string): Promise<boolean> {
  if (supabase && isOnline()) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{ name, email, message }]);
      if (!error) return true;
    } catch (err) {
      console.warn('Failed to send contact message via Supabase, saving locally:', err);
    }
  }

  // Local save
  const localMessage = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    name,
    email,
    message
  };
  saveLocal<any>(STORAGE_KEYS.MESSAGES, localMessage);
  return true;
}

// --- Newsletter Subscribers ---
export async function getNewsletterSubscribers(): Promise<any[]> {
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Error direct-fetching subscribers:', err);
    }
  }

  if (getLoginMethod() === 'local' && isOnline()) {
    try {
      const response = await fetch(`/api/admin/newsletter_subscribers?passcode=${getPasscode()}`);
      const resData = await response.json();
      if (response.ok && resData.data) return resData.data;
    } catch (err) {
      console.warn('Error fetching subscribers from backend:', err);
    }
  }

  return getLocal<any>(STORAGE_KEYS.SUBSCRIBERS);
}

// --- Registered Profiles ---
export async function getRegisteredProfiles(): Promise<Profile[]> {
  if (supabase && isOnline()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Error fetching registered profiles:', err);
    }
  }
  return [];
}

export async function deleteNewsletterSubscriber(id: string): Promise<boolean> {
  if (supabase && getLoginMethod() === 'supabase' && isOnline()) {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn(err);
    }
  }

  if (getLoginMethod() === 'local' && isOnline()) {
    try {
      const response = await fetch(`/api/admin/newsletter_subscribers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: getPasscode() })
      });
      if (response.ok) return true;
    } catch (err) {
      console.warn(err);
    }
  }

  const list = getLocal<any>(STORAGE_KEYS.SUBSCRIBERS);
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(updated));
  return true;
}

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  if (supabase && isOnline()) {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);
      if (!error) return { success: true };
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'You are already subscribed!' };
      }
      return { success: false, error: error.message };
    } catch (err: any) {
      console.warn('Failed to subscribe via Supabase, saving locally:', err);
    }
  }

  const list = getLocal<any>(STORAGE_KEYS.SUBSCRIBERS);
  if (list.some(item => item.email === email)) {
    return { success: false, error: 'You are already subscribed!' };
  }

  const localSubscriber = {
    id: generateUUID(),
    created_at: new Date().toISOString(),
    email
  };
  saveLocal<any>(STORAGE_KEYS.SUBSCRIBERS, localSubscriber);
  return { success: true };
}

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ShieldAlert, Sparkles, MessageCircle, PenTool, CheckCircle, Image as ImageIcon, Send, Mail, Download, Key, Users } from 'lucide-react';
import { Profile } from '@/types';
import { 
  savePoem, 
  saveDiaryEntry, 
  saveBibleVerse, 
  saveAffirmation, 
  exportLocalData, 
  getPoems, 
  getDiaryEntries, 
  getBibleVerses, 
  getAffirmations,
  getContactMessages,
  deleteContactMessage,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  getRegisteredProfiles
} from '@/lib/storage';

// --- Tab Components ---

function AIChatTab() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: input } as const];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await response.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'ai', content: data.reply }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-[#6D28D9] w-6 h-6" />
        <h2 className="text-xl font-semibold">AI Assistant</h2>
      </div>
      <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 mb-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#6D28D9]" />
            <p>Hello! I'm here to inspire you, help you write, or just chat.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-[#6D28D9] text-white self-end' : 'bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 text-gray-800 dark:text-gray-200 self-start'}`}>
              {m.content}
            </div>
          ))
        )}
        {loading && <div className="text-gray-400 text-sm self-start">AI is typing...</div>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for writing prompts, feedback, or chat..."
          className="flex-grow px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
        />
        <button type="submit" disabled={loading} className="px-4 py-2 bg-[#6D28D9] text-white rounded-lg hover:bg-[#4C1D95] transition-colors disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

interface WritingEditorProps {
  type: 'Poem' | 'Diary Entry';
  onPublishSuccess?: () => void;
}

function WritingEditor({ type, onPublishSuccess }: WritingEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [checking, setChecking] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; details?: string } | null>(null);

  const checkGrammar = async () => {
    if (!content) return;
    setChecking(true);
    try {
      const res = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      const data = await res.json();
      if (data.correctedText) {
        setContent(data.correctedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      setStatus({ type: 'error', message: 'Title and content are required.' });
      return;
    }
    setPublishing(true);
    setStatus(null);

    try {
      let result;
      if (type === 'Poem') {
        result = await savePoem({ title, content, featured_image: imageUrl, is_private: isPrivate });
      } else {
        result = await saveDiaryEntry({ title, content, mood: 'Reflective' });
      }

      if (result.error) {
        console.error('Publish error:', result.error);
        let errMsg = 'Error publishing entry.';
        let errDetails = result.error.message || JSON.stringify(result.error);
        
        if (errDetails.includes('Invalid path') || errDetails.includes('PGRST116') || result.error.code === 'PGRST116') {
          errMsg = 'Database Table Not Found';
          errDetails = 'This table does not exist in your Supabase database. Please go to your Supabase SQL Editor and run the queries in "supabase/schema.sql" to set up your tables.';
        } else if (errDetails.includes('Row Level Security') || errDetails.includes('new row violates row-level security')) {
          errMsg = 'Permission Denied (RLS policy)';
          errDetails = 'Row Level Security is blocking this insert. Make sure you are logged in using Supabase Auth (email & password), or configure public inserts for this table.';
        }
        
        setStatus({ type: 'error', message: errMsg, details: errDetails });
      } else {
        setStatus({ type: 'success', message: `${type} published successfully!` });
        setTitle('');
        setContent('');
        setImageUrl('');
        setIsPrivate(false);
        if (onPublishSuccess) onPublishSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred.', details: err.message || err });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-[#6D28D9]" /> Write a {type}
      </h2>

      {status && (
        <div className={`p-4 rounded-xl border text-sm ${status.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
          <div className="font-semibold flex items-center gap-2 mb-1">
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
            {status.message}
          </div>
          {status.details && (
            <p className="mt-2 text-xs leading-relaxed opacity-90 font-mono bg-white/50 dark:bg-black/20 p-2.5 rounded">
              {status.details}
            </p>
          )}
        </div>
      )}

      <input 
        type="text" 
        placeholder="Title" 
        value={title} onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 text-lg font-medium rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
      />
      
      {type === 'Poem' && (
        <div className="flex gap-2 mb-2">
          <div className="relative flex-grow">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Featured Image URL (optional)" 
              value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
            />
          </div>
        </div>
      )}

      {imageUrl && type === 'Poem' && (
        <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-200">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>
      )}

      {type === 'Poem' && (
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="checkbox"
            id="poem-private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700 text-[#6D28D9] focus:ring-[#6D28D9] cursor-pointer"
          />
          <label htmlFor="poem-private" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Keep this poem private (do not show on public website)
          </label>
        </div>
      )}
      
      <div className="relative">
        <textarea 
          placeholder={`Write your ${type.toLowerCase()} here...`} 
          value={content} onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
        />
        <button 
          onClick={checkGrammar}
          disabled={checking || !content}
          className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-[#E9D5FF]/50 text-[#4C1D95] rounded-md text-sm font-medium hover:bg-[#E9D5FF] transition-colors disabled:opacity-50"
        >
          {checking ? 'Checking...' : <><CheckCircle className="w-4 h-4" /> Grammar Check (AI)</>}
        </button>
      </div>
      
      <button 
        onClick={handlePublish} 
        disabled={publishing}
        className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] disabled:opacity-50 transition-colors"
      >
        {publishing ? 'Publishing...' : `Publish ${type}`}
      </button>
    </div>
  );
}

interface BibleVerseGeneratorProps {
  onPublishSuccess?: () => void;
}

function BibleVerseGenerator({ onPublishSuccess }: BibleVerseGeneratorProps) {
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; details?: string } | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/generate-verse', { method: 'POST' });
      const data = await res.json();
      if (data.verse_reference) setVerseRef(data.verse_reference);
      if (data.verse_text) setVerseText(data.verse_text);
      if (data.explanation) setExplanation(data.explanation);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to auto-generate verse.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!verseRef || !verseText) {
      setStatus({ type: 'error', message: 'Reference and text are required.' });
      return;
    }
    setPublishing(true);
    setStatus(null);
    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await saveBibleVerse({
        verse_reference: verseRef,
        verse_text: verseText,
        explanation,
        display_date: today,
        is_private: isPrivate
      });

      if (result.error) {
        console.error('Verse save error:', result.error);
        let errMsg = 'Error saving verse.';
        let errDetails = result.error.message || JSON.stringify(result.error);
        
        if (errDetails.includes('Invalid path') || errDetails.includes('PGRST116') || result.error.code === 'PGRST116') {
          errMsg = 'Database Table Not Found';
          errDetails = 'The "bible_verses" table does not exist in your Supabase database. Please go to your Supabase SQL Editor and run the queries in "supabase/schema.sql" to set up your tables.';
        } else if (errDetails.includes('Row Level Security') || errDetails.includes('new row violates row-level security')) {
          errMsg = 'Permission Denied (RLS policy)';
          errDetails = 'Row Level Security is blocking this insert. Make sure you are logged in using Supabase Auth (email & password), or configure public inserts for this table.';
        } else if (errDetails.includes('duplicate key value violates unique constraint')) {
          errMsg = 'Daily Limit Reached';
          errDetails = 'A verse has already been published for today. Only one verse is allowed per day due to unique display date restrictions.';
        }
        
        setStatus({ type: 'error', message: errMsg, details: errDetails });
      } else {
        setStatus({ type: 'success', message: 'Bible verse saved successfully!' });
        setVerseRef('');
        setVerseText('');
        setExplanation('');
        setIsPrivate(false);
        if (onPublishSuccess) onPublishSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred.', details: err.message || err });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Daily Bible Verse</h2>
        <button onClick={generateAI} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#E9D5FF]/50 text-[#4C1D95] rounded-lg font-medium hover:bg-[#E9D5FF] transition-colors">
          <Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Auto-Generate (AI)'}
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border text-sm ${status.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
          <div className="font-semibold flex items-center gap-2 mb-1">
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
            {status.message}
          </div>
          {status.details && (
            <p className="mt-2 text-xs leading-relaxed opacity-90 font-mono bg-white/50 dark:bg-black/20 p-2.5 rounded">
              {status.details}
            </p>
          )}
        </div>
      )}

      <input type="text" placeholder="Reference (e.g. John 3:16)" value={verseRef} onChange={e => setVerseRef(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" />
      <textarea placeholder="Verse text..." value={verseText} onChange={e => setVerseText(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" />
      <textarea placeholder="Explanation..." value={explanation} onChange={e => setExplanation(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" />

      <div className="flex items-center gap-2 mb-2">
        <input 
          type="checkbox"
          id="verse-private"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-700 text-[#6D28D9] focus:ring-[#6D28D9] cursor-pointer"
        />
        <label htmlFor="verse-private" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" /> Keep this verse private (do not show on public website)
        </label>
      </div>

      <button 
        onClick={handleSave} 
        disabled={publishing}
        className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] transition-colors disabled:opacity-50"
      >
        {publishing ? 'Saving...' : 'Save Verse'}
      </button>
    </div>
  );
}

interface AffirmationGeneratorProps {
  onPublishSuccess?: () => void;
}

function AffirmationGenerator({ onPublishSuccess }: AffirmationGeneratorProps) {
  const [affirmation, setAffirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; details?: string } | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/generate-affirmation', { method: 'POST' });
      const data = await res.json();
      if (data.affirmation) setAffirmation(data.affirmation);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to auto-generate affirmation.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!affirmation) {
      setStatus({ type: 'error', message: 'Affirmation text is required.' });
      return;
    }
    setPublishing(true);
    setStatus(null);
    const today = new Date().toISOString().split('T')[0];

    try {
      const result = await saveAffirmation({
        title: 'Daily Affirmation',
        affirmation_text: affirmation,
        display_date: today,
        is_private: isPrivate
      });

      if (result.error) {
        console.error('Affirmation save error:', result.error);
        let errMsg = 'Error saving affirmation.';
        let errDetails = result.error.message || JSON.stringify(result.error);
        
        if (errDetails.includes('Invalid path') || errDetails.includes('PGRST116') || result.error.code === 'PGRST116') {
          errMsg = 'Database Table Not Found';
          errDetails = 'The "affirmations" table does not exist in your Supabase database. Please go to your Supabase SQL Editor and run the queries in "supabase/schema.sql" to set up your tables.';
        } else if (errDetails.includes('Row Level Security') || errDetails.includes('new row violates row-level security')) {
          errMsg = 'Permission Denied (RLS policy)';
          errDetails = 'Row Level Security is blocking this insert. Make sure you are logged in using Supabase Auth (email & password), or configure public inserts for this table.';
        } else if (errDetails.includes('duplicate key value violates unique constraint')) {
          errMsg = 'Daily Limit Reached';
          errDetails = 'An affirmation has already been published for today. Only one affirmation is allowed per day due to unique display date restrictions.';
        }
        
        setStatus({ type: 'error', message: errMsg, details: errDetails });
      } else {
        setStatus({ type: 'success', message: 'Affirmation saved successfully!' });
        setAffirmation('');
        setIsPrivate(false);
        if (onPublishSuccess) onPublishSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred.', details: err.message || err });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Daily Affirmation</h2>
        <button onClick={generateAI} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#E9D5FF]/50 text-[#4C1D95] rounded-lg font-medium hover:bg-[#E9D5FF] transition-colors">
          <Sparkles className="w-4 h-4" /> {loading ? 'Generating...' : 'Auto-Generate (AI)'}
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border text-sm ${status.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
          <div className="font-semibold flex items-center gap-2 mb-1">
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
            {status.message}
          </div>
          {status.details && (
            <p className="mt-2 text-xs leading-relaxed opacity-90 font-mono bg-white/50 dark:bg-black/20 p-2.5 rounded">
              {status.details}
            </p>
          )}
        </div>
      )}

      <textarea placeholder="Write or generate affirmation..." value={affirmation} onChange={e => setAffirmation(e.target.value)} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-lg text-center font-medium" />

      <div className="flex items-center gap-2 mb-2">
        <input 
          type="checkbox"
          id="affirmation-private"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-700 text-[#6D28D9] focus:ring-[#6D28D9] cursor-pointer"
        />
        <label htmlFor="affirmation-private" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" /> Keep this affirmation private (do not show on public website)
        </label>
      </div>

      <button 
        onClick={handleSave} 
        disabled={publishing}
        className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] transition-colors disabled:opacity-50"
      >
        {publishing ? 'Saving...' : 'Save Affirmation'}
      </button>
    </div>
  );
}

interface BackupTabProps {
  isLocalMode: boolean;
}

function BackupTab({ isLocalMode }: BackupTabProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Backup initiated! Check your email shortly.' });
      } else {
        throw new Error(data.error || 'Failed to process backup');
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'An error occurred during backup.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLocalDownload = () => {
    try {
      exportLocalData();
    } catch (err) {
      console.error(err);
      alert('Failed to download local backup.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Backups</h2>
        <p className="text-gray-500">
          Export or back up your journal entries, poems, Bible verses, and affirmations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800 space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6D28D9]" /> Send Email Backup (Supabase)
          </h3>
          <p className="text-sm text-gray-500">
            Export all content currently saved in your online Supabase database and send it directly to your email.
          </p>

          <form onSubmit={handleBackup} className="space-y-3 pt-2">
            <input
              type="email"
              placeholder="owner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-sm"
              required
              disabled={isLocalMode && !supabase}
            />
            <button 
              type="submit" 
              disabled={loading || (isLocalMode && !supabase)}
              className="w-full py-2.5 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] disabled:bg-gray-300 dark:disabled:bg-gray-800 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              {loading ? 'Preparing Backup...' : <><Send className="w-4 h-4" /> Send Email Backup</>}
            </button>
          </form>

          {isLocalMode && !supabase && (
            <p className="text-xs text-amber-600 font-medium">
              * Supabase is not connected. Connect your database to enable email backups.
            </p>
          )}

          {status && (
            <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {status.message}
            </div>
          )}
        </div>

        <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 dark:bg-gray-900 dark:border-gray-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Download className="w-5 h-5 text-[#6D28D9]" /> Download Local Backup (JSON)
            </h3>
            <p className="text-sm text-gray-500">
              Download all content currently saved locally on this browser's `localStorage` directly as a JSON file.
            </p>
          </div>
          <button 
            onClick={handleLocalDownload}
            className="w-full mt-6 py-2.5 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Download JSON Backup
          </button>
        </div>
      </div>

      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-xl mt-8">
        <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" /> Safe Copy Guarantee
        </h3>
        <p className="text-sm text-purple-800 dark:text-purple-300">
          We encourage regular backups of both database and local browser content. This ensures you always have a safe copy of your personal journaling, poetry, and verses outside the platform.
        </p>
      </div>
    </div>
  );
}


function InboxTab({ onAction }: { onAction?: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    setDeletingId(id);
    try {
      const success = await deleteContactMessage(id);
      if (success) {
        setMessages(messages.filter(m => m.id !== id));
        if (onAction) onAction();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading messages...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[#4C1D95] dark:text-purple-400">
          <Mail className="text-[#6D28D9] w-6 h-6" /> Contact Inbox
        </h2>
        <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 px-2.5 py-1 rounded-full">
          {messages.length} Messages
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400">
          <Mail className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#6D28D9]" />
          <p>Inbox is empty. No messages submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="p-5 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5 flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{msg.name}</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">{msg.email}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
                <small className="text-xs text-gray-400 block pt-1">
                  Received: {new Date(msg.created_at).toLocaleString()}
                </small>
              </div>
              <button 
                onClick={() => handleDelete(msg.id)}
                disabled={deletingId === msg.id}
                className="px-3.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {deletingId === msg.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscribersTab({ onAction }: { onAction?: () => void }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tabs for the user list display
  const [listMode, setListMode] = useState<'registered' | 'newsletter'>('registered');

  // Broadcast state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const [subsData, profsData] = await Promise.all([
        getNewsletterSubscribers(),
        getRegisteredProfiles()
      ]);
      setSubscribers(subsData);
      setProfiles(profsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    setDeletingId(id);
    try {
      const success = await deleteNewsletterSubscriber(id);
      if (success) {
        setSubscribers(subscribers.filter(s => s.id !== id));
        if (onAction) onAction();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSendingBroadcast(true);
    setBroadcastStatus(null);

    try {
      const passcode = localStorage.getItem('anjy_passcode') || '';
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, passcode })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBroadcastStatus({ 
          type: 'success', 
          text: `Broadcast email sent successfully to ${data.count} subscriber(s)!` 
        });
        setSubject('');
        setMessage('');
      } else {
        setBroadcastStatus({ 
          type: 'error', 
          text: data.error || 'Failed to send broadcast announcement.' 
        });
      }
    } catch (err: any) {
      console.error(err);
      setBroadcastStatus({ type: 'error', text: 'Network error sending broadcast. Check your connection.' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading subscribers and users...</div>;

  return (
    <div className="space-y-8">
      {/* 1. Broadcast Composer */}
      <div className="bg-[#FAF5FF] dark:bg-purple-950/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm">
        <h2 className="text-lg font-bold text-[#4C1D95] dark:text-purple-400 mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#6D28D9]" /> Broadcast announcement to everyone
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Write an update or newsletter below. This will email all registered users and newsletter subscribers simultaneously.
        </p>

        {broadcastStatus && (
          <div className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 mb-6 font-medium leading-relaxed ${
            broadcastStatus.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {broadcastStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
            )}
            {broadcastStatus.text}
          </div>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-purple-900/70 dark:text-purple-300 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              placeholder="e.g. A New Poem is Out: Walking in Grace"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-900/70 dark:text-purple-300 mb-1">
              Message Body
            </label>
            <textarea
              placeholder="Type your message here. Line breaks will be preserved in the email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-sm leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sendingBroadcast || !subject.trim() || !message.trim()}
            className="px-6 py-3 bg-[#6D28D9] hover:bg-[#4C1D95] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sendingBroadcast ? 'Sending Broadcast...' : 'Send Broadcast to All'}
          </button>
        </form>
      </div>

      {/* 2. Dual Subscriber Lists */}
      <div className="space-y-4">
        {/* Header and Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex border-b border-gray-150 dark:border-gray-700 w-full sm:w-auto">
            <button
              onClick={() => setListMode('registered')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                listMode === 'registered' 
                  ? 'border-[#6D28D9] text-[#6D28D9]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Registered Users ({profiles.length})
            </button>
            <button
              onClick={() => setListMode('newsletter')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                listMode === 'newsletter' 
                  ? 'border-[#6D28D9] text-[#6D28D9]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Newsletter Signups ({subscribers.length})
            </button>
          </div>
        </div>

        {/* List Content */}
        {listMode === 'registered' ? (
          profiles.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#6D28D9]" />
              <p>No registered user accounts found.</p>
            </div>
          ) : (
            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-850">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-350 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User Email</th>
                      <th className="px-6 py-4 font-semibold">Name / Alias</th>
                      <th className="px-6 py-4 font-semibold">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {profiles.map((prof) => (
                      <tr key={prof.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/30">
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-250">{prof.email}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{prof.full_name || 'Anonymous User'}</td>
                        <td className="px-6 py-4">
                          {prof.created_at ? new Date(prof.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          subscribers.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#6D28D9]" />
              <p>No newsletter subscribers found.</p>
            </div>
          ) : (
            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-850">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-350 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Subscriber Email</th>
                      <th className="px-6 py-4 font-semibold">Subscribed Date</th>
                      <th className="px-6 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/30">
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-250">{sub.email}</td>
                        <td className="px-6 py-4">
                          {sub.created_at ? new Date(sub.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(sub.id)}
                            disabled={deletingId === sub.id}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400 font-semibold text-xs disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === sub.id ? 'Removing...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function Admin({ passcodeOnly = false }: { passcodeOnly?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'passcode' | 'signin' | 'signup'>(
    passcodeOnly ? 'passcode' : 'signin'
  );
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const [counts, setCounts] = useState({ poems: 0, diaryEntries: 0, verses: 0, affirmations: 0, messages: 0, subscribers: 0 });

  // Listen to Supabase Auth state changes
  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        localStorage.setItem('anjy_login_method', 'supabase');
        localStorage.setItem('anjy_user_email', session.user.email || '');
        setIsAuthenticated(true);
      }
    };
    
    if (supabase) {
      checkUser();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          localStorage.setItem('anjy_login_method', 'supabase');
          localStorage.setItem('anjy_user_email', session.user.email || '');
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('anjy_login_method');
          localStorage.removeItem('anjy_user_email');
          setIsAuthenticated(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchCounts = async () => {
    try {
      const p = await getPoems(true);
      const d = await getDiaryEntries();
      const v = await getBibleVerses(true);
      const a = await getAffAffirmations(true);
      const m = await getContactMessages();
      const s = await getNewsletterSubscribers();
      setCounts({
        poems: p.length,
        diaryEntries: d.length,
        verses: v.length,
        affirmations: a.length,
        messages: m.length,
        subscribers: s.length
      });
    } catch (err) {
      console.error('Error fetching dashboard counts:', err);
    }
  };

  // Helper function to resolve typescript undefined error for getAffirmations renamed in imports
  const getAffAffirmations = async (forAdmin: boolean) => {
    return getAffirmations(forAdmin);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCounts();
    }
  }, [isAuthenticated, activeTab]);

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      // 1. Verify passcode with backend API first
      const response = await fetch('/api/admin/verify_passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: password })
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error('Invalid passcode.');
      }

      // 2. Sign in to Supabase Auth using owner's email and passcode as password
      if (supabase) {
        const adminEmail = 'pipeloluwadavid@gmail.com';
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });

        if (error && (error.message.includes('Invalid login credentials') || error.status === 400)) {
          // If admin user doesn't exist in Supabase Auth yet, register it dynamically
          console.log('Registering admin account in Supabase Auth...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: password,
          });
          if (signUpError) throw signUpError;
          if (signUpData.user) {
            localStorage.setItem('anjy_login_method', 'supabase');
            localStorage.setItem('anjy_user_email', adminEmail);
            localStorage.setItem('anjy_passcode', password);
            setIsAuthenticated(true);
            return;
          }
        } else if (error) {
          throw error;
        }

        if (data.user) {
          localStorage.setItem('anjy_login_method', 'supabase');
          localStorage.setItem('anjy_user_email', adminEmail);
          localStorage.setItem('anjy_passcode', password);
          setIsAuthenticated(true);
        }
      } else {
        // Fallback if supabase is offline
        localStorage.setItem('anjy_login_method', 'local');
        localStorage.setItem('anjy_passcode', password);
        localStorage.setItem('anjy_user_email', 'pipeloluwadavid@gmail.com');
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      console.error('Passcode login error:', err);
      setAuthError(err.message || 'Passcode verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        localStorage.setItem('anjy_login_method', 'supabase');
        localStorage.setItem('anjy_user_email', data.user.email || '');
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        alert('Registration successful! Please check your email for a confirmation link (if enabled) or sign in.');
        setAuthMode('signin');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setAuthError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('anjy_login_method');
    localStorage.removeItem('anjy_user_email');
    localStorage.removeItem('anjy_passcode');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setAuthError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center bg-transparent px-4 py-20">
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-md border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-[#E9D5FF]/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#6D28D9]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-gray-100 mb-2 text-center">
            {authMode === 'passcode' ? 'Owner Passcode Access' : authMode === 'signin' ? 'Sign In to ANJY' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm mb-6 text-center">
            {authMode === 'passcode' ? 'Enter passcode to manage website.' : authMode === 'signin' ? 'Access your private journal space.' : 'Sign up to start your private journal.'}
          </p>

          {/* Tab Selector - only render if passcodeOnly is false */}
          {!passcodeOnly && (
            <div className="flex border-b border-gray-100 dark:border-gray-700 mb-6">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${authMode === 'signin' ? 'border-[#6D28D9] text-[#6D28D9]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${authMode === 'signup' ? 'border-[#6D28D9] text-[#6D28D9]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Register
              </button>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg mb-4 flex items-center gap-1.5 font-medium leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={authMode === 'passcode' ? handlePasscodeLogin : authMode === 'signin' ? handleLogin : handleSignUp} className="space-y-4">
            {authMode !== 'passcode' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                {authMode === 'passcode' ? 'Owner Passcode' : 'Password'}
              </label>
              <input 
                type="password" 
                placeholder={authMode === 'passcode' ? 'Enter owner passcode' : 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-sm"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md"
            >
              {loading ? 'Processing...' : authMode === 'passcode' ? 'Verify Passcode' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Poems':
        return <WritingEditor type="Poem" onPublishSuccess={fetchCounts} />;
      case 'Diary Entries':
        return <WritingEditor type="Diary Entry" onPublishSuccess={fetchCounts} />;
      case 'Bible Verses':
        return <BibleVerseGenerator onPublishSuccess={fetchCounts} />;
      case 'Affirmations':
        return <AffirmationGenerator onPublishSuccess={fetchCounts} />;
      case 'Inbox':
        return <InboxTab onAction={fetchCounts} />;
      case 'Subscribers':
        return <SubscribersTab onAction={fetchCounts} />;
      case 'AI Assistant':
        return <AIChatTab />;
      case 'Backups & Exporters':
        return <BackupTab isLocalMode={localStorage.getItem('anjy_login_method') !== 'supabase'} />;
      default:
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Welcome to ANJY CMS</h2>
            <p className="text-gray-500 mb-8 text-sm">Select a category on the left to start managing and creating content.</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Poems</p>
                <p className="text-3xl font-extrabold text-[#6D28D9]">{counts.poems}</p>
              </div>
              <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Diary Entries</p>
                <p className="text-3xl font-extrabold text-[#6D28D9]">{counts.diaryEntries}</p>
              </div>
              <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Bible Verses</p>
                <p className="text-3xl font-extrabold text-[#6D28D9]">{counts.verses}</p>
              </div>
              <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Affirmations</p>
                <p className="text-3xl font-extrabold text-[#6D28D9]">{counts.affirmations}</p>
              </div>
              {isAdmin && (
                <>
                  <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Inbox Messages</p>
                    <p className="text-3xl font-extrabold text-[#6D28D9]">{counts.messages}</p>
                  </div>
                  <div className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50 shadow-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Subscribers</p>
                    <p className="text-3xl font-extrabold text-[#6D28D9]">{counts.subscribers}</p>
                  </div>
                </>
              )}
            </div>
            
            {localStorage.getItem('anjy_login_method') !== 'supabase' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 rounded-xl text-sm leading-relaxed">
                <h3 className="font-semibold mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" /> Currently in Local Storage Mode
                </h3>
                <p className="opacity-90">
                  You are currently in Offline Local Storage Mode. All posts and creations will be stored locally in this browser. To save to your secure account online, sign in with your email and password.
                </p>
              </div>
            )}

            {!supabase && (
              <div className="mt-4 p-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 rounded-xl text-sm">
                <h3 className="font-semibold mb-2">Supabase Configuration Instructions</h3>
                <p className="mb-2 opacity-90">To persist data in an online database, you need to add your Supabase credentials in your Vercel or environment settings:</p>
                <ul className="list-disc list-inside space-y-1 opacity-80 font-mono text-xs">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            )}
          </>
        );
    }
  };

  const currentUserEmail = localStorage.getItem('anjy_user_email') || '';
  const isAdmin = currentUserEmail === 'pipeloluwadavid@gmail.com' || currentUserEmail === 'anjy@gmail.com' || currentUserEmail === 'estheroluwatosin45@gmail.com';
  
  const allTabs = ['Dashboard', 'Poems', 'Diary Entries', 'Bible Verses', 'Affirmations', 'Inbox', 'Subscribers', 'AI Assistant', 'Backups & Exporters'];
  const tabs = isAdmin ? allTabs : ['Dashboard', 'Poems', 'Diary Entries', 'Bible Verses', 'Affirmations', 'AI Assistant', 'Backups & Exporters'];

  return (
    <div className="flex-grow bg-transparent py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-[#4C1D95] dark:text-purple-400">CMS Dashboard</h1>
            <span className="text-xs text-gray-400 font-semibold mt-1">
              Mode: {localStorage.getItem('anjy_login_method') === 'supabase' ? 'Online Supabase Database' : 'Offline Browser Local Storage'}
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Sign Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg shadow-sm border font-medium transition-colors flex items-center justify-between ${activeTab === tab ? 'bg-[#6D28D9] text-white border-[#6D28D9]' : 'bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-100 text-[#1F2937] dark:text-gray-100 hover:bg-[#E9D5FF]/20'}`}
              >
                <span className="flex items-center">
                  {tab === 'AI Assistant' && <Sparkles className="inline w-4 h-4 mr-2" />}
                  {tab === 'Backups & Exporters' && <Mail className="inline w-4 h-4 mr-2" />}
                  {tab === 'Inbox' && <Mail className="inline w-4 h-4 mr-2" />}
                  {tab === 'Subscribers' && <Users className="inline w-4 h-4 mr-2" />}
                  {tab}
                </span>
                {tab === 'Inbox' && counts.messages > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-white text-purple-900' : 'bg-purple-100 text-purple-800'}`}>
                    {counts.messages}
                  </span>
                )}
                {tab === 'Subscribers' && counts.subscribers > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-white text-purple-900' : 'bg-purple-100 text-purple-800'}`}>
                    {counts.subscribers}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ShieldAlert, Sparkles, MessageCircle, PenTool, CheckCircle, Image as ImageIcon, Send, Mail } from 'lucide-react';

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
      <div className="flex-grow overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Hello! I'm here to inspire you, help you write, or just chat.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-[#6D28D9] text-white self-end' : 'bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 text-gray-800 self-start'}`}>
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

function WritingEditor({ type }: { type: 'Poem' | 'Diary Entry' }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [checking, setChecking] = useState(false);

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
    if (!title || !content) return alert('Title and content are required');
    if (!supabase) return alert('Supabase not connected. Check environment variables.');
    
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const table = type === 'Poem' ? 'poems' : 'diary_entries';
    const payload = type === 'Poem' 
      ? { title, slug, content, featured_image: imageUrl }
      : { title, slug, content, mood: 'Reflective' };

    const { error } = await supabase.from(table).insert([payload]);
    if (error) {
      console.error(error);
      alert('Error publishing: ' + error.message + '\n\nMake sure your Supabase Row Level Security (RLS) allows inserts.');
    } else {
      alert(`${type} published successfully!`);
      setTitle(''); setContent(''); setImageUrl('');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-[#6D28D9]" /> Write a {type}
      </h2>
      <input 
        type="text" 
        placeholder="Title" 
        value={title} onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 text-lg font-medium rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
      />
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
      {imageUrl && (
        <div className="h-32 w-32 rounded-lg overflow-hidden border border-gray-200">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
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
      <button onClick={handlePublish} className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95]">
        Publish {type}
      </button>
    </div>
  );
}

function BibleVerseGenerator() {
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-verse', { method: 'POST' });
      const data = await res.json();
      if (data.verse_reference) {
        setVerseRef(data.verse_reference);
        setVerseText(data.verse_text);
        setExplanation(data.explanation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      <input type="text" placeholder="Reference (e.g. John 3:16)" value={verseRef} onChange={e => setVerseRef(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" />
      <textarea placeholder="Verse text..." value={verseText} onChange={e => setVerseText(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" />
      <textarea placeholder="Explanation..." value={explanation} onChange={e => setExplanation(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" />
      <button onClick={async () => {
        if (!verseRef || !verseText) return alert('Reference and text are required');
        if (!supabase) return alert('Supabase not connected');
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('bible_verses').insert([{
          verse_reference: verseRef,
          verse_text: verseText,
          explanation,
          display_date: today
        }]);
        if (error) alert('Error: ' + error.message + '\n\nMake sure your Supabase Row Level Security (RLS) allows inserts.');
        else { alert('Verse saved!'); setVerseRef(''); setVerseText(''); setExplanation(''); }
      }} className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95]">Save Verse</button>
    </div>
  );
}

function AffirmationGenerator() {
  const [affirmation, setAffirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-affirmation', { method: 'POST' });
      const data = await res.json();
      if (data.affirmation) setAffirmation(data.affirmation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      <textarea placeholder="Write or generate affirmation..." value={affirmation} onChange={e => setAffirmation(e.target.value)} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] text-lg text-center font-medium" />
      <button onClick={async () => {
        if (!affirmation) return alert('Affirmation is required');
        if (!supabase) return alert('Supabase not connected');
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('affirmations').insert([{
          title: 'Daily Affirmation',
          affirmation_text: affirmation,
          display_date: today
        }]);
        if (error) alert('Error: ' + error.message + '\n\nMake sure your Supabase Row Level Security (RLS) allows inserts.');
        else { alert('Affirmation saved!'); setAffirmation(''); }
      }} className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95]">Save Affirmation</button>
    </div>
  );
}

function BackupTab() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);
    try {
      // In a real application, this would call a backend API that fetches from Supabase
      // and sends an email via SMTP (like Nodemailer) or a service like Resend/SendGrid.
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Backup to Email</h2>
        <p className="text-gray-500">
          Export all your content (Poems, Diary Entries, Bible Verses, Affirmations) and send it as a backup to the specified email address.
        </p>
      </div>

      <form onSubmit={handleBackup} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website Owner's Gmail (or any email)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="owner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            'Preparing Backup...'
          ) : (
            <>
              <Send className="w-4 h-4" /> Send Backup
            </>
          )}
        </button>

        {status && (
          <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {status.type === 'success' && <CheckCircle className="w-4 h-4 inline mr-2" />}
            {status.type === 'error' && <ShieldAlert className="w-4 h-4 inline mr-2" />}
            {status.message}
          </div>
        )}
      </form>

      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl mt-8">
        <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> How this works
        </h3>
        <p className="text-sm text-purple-800">
          When you click "Send Backup", the system gathers all entries from the database, formats them into a clean document, and emails them directly to the provided address. This ensures you always have a safe copy of your writings outside of the platform.
        </p>
      </div>
    </div>
  );
}


export function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Since Supabase isn't configured with real credentials yet, we simulate login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple demo password
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials. (Hint: use admin123)');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center bg-transparent px-4 py-20">
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#E9D5FF]/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#6D28D9]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-gray-100 mb-2">Admin Access</h1>
          <p className="text-gray-500 text-sm mb-8">Please enter your credentials to manage ANJY.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
              required
            />
            <button type="submit" className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] transition-colors">
              Sign In
            </button>
          </form>
          {!supabase && (
            <p className="mt-6 text-xs text-amber-600 flex items-center justify-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Supabase not connected. Using local state.
            </p>
          )}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Poems':
        return <WritingEditor type="Poem" />;
      case 'Diary Entries':
        return <WritingEditor type="Diary Entry" />;
      case 'Bible Verses':
        return <BibleVerseGenerator />;
      case 'Affirmations':
        return <AffirmationGenerator />;
      case 'AI Assistant':
        return <AIChatTab />;
      case 'Backup to Email':
        return <BackupTab />;
      default:
        return (
          <>
            <h2 className="text-xl font-semibold mb-6">Welcome to ANJY CMS</h2>
            <p className="text-gray-500 mb-8">Select a category on the left to start managing content.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 border border-gray-100 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500 font-medium mb-1">Total Poems</p>
                <p className="text-3xl font-bold text-[#6D28D9]">0</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500 font-medium mb-1">Total Diary Entries</p>
                <p className="text-3xl font-bold text-[#6D28D9]">0</p>
              </div>
            </div>
            
            {!supabase && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-sm">
                <h3 className="font-semibold mb-2">Supabase Configuration Required</h3>
                <p className="mb-2">To persist data, you need to add your Supabase credentials to the environment variables in AI Studio settings:</p>
                <ul className="list-disc list-inside opacity-80">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="flex-grow bg-transparent py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#4C1D95]">CMS Dashboard</h1>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            {['Dashboard', 'Poems', 'Diary Entries', 'Bible Verses', 'Affirmations', 'AI Assistant', 'Backup to Email'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg shadow-sm border font-medium transition-colors ${activeTab === tab ? 'bg-[#6D28D9] text-white border-[#6D28D9]' : 'bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-100 text-[#1F2937] dark:text-gray-100 hover:bg-[#E9D5FF]/20'}`}
              >
                {tab === 'AI Assistant' && <Sparkles className="inline w-4 h-4 mr-2" />}
                {tab === 'Backup to Email' && <Mail className="inline w-4 h-4 mr-2" />}
                {tab}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

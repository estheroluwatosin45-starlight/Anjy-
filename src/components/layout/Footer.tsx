import { Link } from 'react-router';
import React, { useState } from 'react';
import { subscribeToNewsletter } from '@/lib/storage';
import { Mail } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);

    try {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        setStatus({ type: 'success', message: 'Subscribed successfully!' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to subscribe.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-[#1F2937] text-[#E9D5FF] py-12 mt-auto border-t border-purple-900/10 dark:border-white/5">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-widest mb-4 font-serif">ANJY</h3>
          <p className="text-sm opacity-80 leading-relaxed font-light">
            A personal journaling and inspiration platform where visitors can read poems, diary entries, daily Bible verses, and receive daily affirmations.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm font-light">
            <li><Link to="/poems" className="hover:text-white transition-colors">Poems</Link></li>
            <li><Link to="/diary" className="hover:text-white transition-colors">Diary</Link></li>
            <li><Link to="/verses" className="hover:text-white transition-colors">Bible Verses</Link></li>
            <li><Link to="/affirmations" className="hover:text-white transition-colors">Affirmations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <ul className="space-y-2 text-sm font-light">
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold">Stay Updated</h4>
          <p className="text-xs opacity-80 leading-relaxed font-light">
            Subscribe to receive daily affirmations and email alerts for new poetry.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
            {status && (
              <p className={`text-[10px] font-medium ${
                status.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-700 text-sm text-center opacity-60 font-light">
        &copy; {new Date().getFullYear()} ANJY. All rights reserved.
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { sendContactMessage } from '@/lib/storage';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setStatus(null);

    try {
      const success = await sendContactMessage(name, email, message);
      if (success) {
        setStatus({ type: 'success', message: 'Your message has been sent successfully! Thank you.' });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus({ type: 'error', message: 'Failed to send your message. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-transparent py-20 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold text-[#4C1D95] dark:text-purple-400 mb-6">Get in Touch</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            I would love to hear from you. Whether you have a question about a poem, want to share how an affirmation helped you, or just want to say hello, feel free to drop a message.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
              <div className="w-12 h-12 bg-[#E9D5FF]/50 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[#6D28D9] dark:text-purple-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-[#1F2937] dark:text-gray-100">Email</p>
                <p className="text-sm">hello@anjy.example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
              <div className="w-12 h-12 bg-[#E9D5FF]/50 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[#6D28D9] dark:text-purple-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-[#1F2937] dark:text-gray-100">Location</p>
                <p className="text-sm">Global</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-750">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {status && (
              <div className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
                status.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{status.message}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" 
                required 
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" 
                required 
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea 
                id="message" 
                rows={5} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" 
                required
                disabled={loading}
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

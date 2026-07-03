import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DiaryEntry } from '@/types';

export function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setEntries(data);
      }
      setLoading(false);
    }
    fetchEntries();
  }, []);

  return (
    <div className="flex-grow bg-transparent py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4C1D95] mb-4">Personal Diary</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Daily reflections, life experiences, and thoughts captured in the moment.
          </p>
        </header>

        <div className="relative max-w-xl mx-auto mb-16">
          <input 
            type="text" 
            placeholder="Search entries..." 
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] text-[#1F2937] dark:text-gray-100"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="space-y-8 max-w-3xl mx-auto">
          {loading ? (
             <div className="text-center py-20 text-gray-500">Loading diary entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border border-gray-100 shadow-sm">
               <p className="text-gray-500 mb-2">No diary entries published yet.</p>
               <p className="text-sm text-gray-400">Check back later for new reflections.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-semibold text-[#1F2937] dark:text-gray-100">{entry.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {entry.mood && <span className="bg-[#E9D5FF]/30 text-[#6D28D9] px-3 py-1 rounded-full">{entry.mood}</span>}
                    <time dateTime={entry.created_at}>
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

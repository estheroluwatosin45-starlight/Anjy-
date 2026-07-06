import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { getBibleVerses } from '@/lib/storage';
import { BibleVerse } from '@/types';

export function BibleVerses() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerses() {
      try {
        const data = await getBibleVerses();
        
        // Check if today's verse is already in the database
        const todayStr = new Date().toISOString().split('T')[0];
        const hasTodayVerse = data.some(v => {
          if (!v.display_date) return false;
          // Extract just the date part if it is a full ISO timestamp
          const vDateStr = v.display_date.includes('T') ? v.display_date.split('T')[0] : v.display_date;
          return vDateStr === todayStr;
        });

        if (!hasTodayVerse) {
          try {
            const todayRes = await fetch('/api/verses/today');
            if (todayRes.ok) {
              const todayVerse = await todayRes.json();
              if (todayVerse && todayVerse.verse_text) {
                setVerses([todayVerse, ...data]);
                return;
              }
            }
          } catch (apiErr) {
            console.warn('Could not fetch automated daily verse fallback:', apiErr);
          }
        }
        
        setVerses(data);
      } catch (error) {
        console.error('Error fetching bible verses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVerses();
  }, []);

  return (
    <div className="flex-grow bg-transparent py-16 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <header className="mb-12 text-center">
          <div className="w-16 h-16 bg-[#E9D5FF] dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#6D28D9] dark:text-[#A78BFA]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#4C1D95] dark:text-purple-400 mb-4">Daily Bible Verse</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Inspiration and guidance from Scripture.
          </p>
        </header>

        <div className="space-y-8">
          {loading ? (
             <div className="text-center py-20 text-gray-500">Loading verses...</div>
          ) : verses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
               <p className="text-gray-500 mb-2">No verses published yet.</p>
               <p className="text-sm text-gray-400">Check back later for today's verse.</p>
            </div>
          ) : (
            verses.map((verse, index) => (
              <motion.div 
                key={verse.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4C1D95] to-[#A78BFA]"></div>
                <p className="text-sm font-semibold text-[#A78BFA] tracking-widest uppercase mb-6">
                  {new Date(verse.display_date).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                <h3 className="text-3xl md:text-4xl font-serif text-[#1F2937] dark:text-gray-100 leading-tight mb-8">
                  "{verse.verse_text}"
                </h3>
                <p className="text-xl font-medium text-[#6D28D9] dark:text-purple-400 mb-8">{verse.verse_reference}</p>
                {verse.explanation && (
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                    {verse.explanation}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Affirmation } from '@/types';

export function Affirmations() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAffirmations() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('affirmations')
        .select('*')
        .order('display_date', { ascending: false });
      
      if (!error && data) {
        setAffirmations(data);
      }
      setLoading(false);
    }
    fetchAffirmations();
  }, []);

  return (
    <div className="flex-grow bg-transparent py-16 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <header className="mb-12 text-center">
          <div className="w-16 h-16 bg-[#E9D5FF] rounded-full flex items-center justify-center mx-auto mb-6 text-[#6D28D9]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#4C1D95] mb-4">Daily Affirmations</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Start your day with a positive mindset.
          </p>
        </header>

        <div className="space-y-8">
          {loading ? (
             <div className="text-center py-20 text-gray-500">Loading affirmations...</div>
          ) : affirmations.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border border-gray-100 shadow-sm">
               <p className="text-gray-500 mb-2">No affirmations published yet.</p>
               <p className="text-sm text-gray-400">Check back later for today's affirmation.</p>
            </div>
          ) : (
            affirmations.map((affirmation, index) => (
              <motion.div 
                key={affirmation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#4C1D95] to-[#8B5CF6] p-8 md:p-12 rounded-3xl shadow-lg text-center text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="relative z-10">
                  <Sparkles className="w-8 h-8 text-[#E9D5FF] mx-auto mb-6 opacity-80" />
                  <p className="text-sm font-medium text-[#E9D5FF] tracking-widest uppercase mb-6">
                    {new Date(affirmation.display_date).toLocaleDateString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-semibold leading-tight">
                    "{affirmation.affirmation_text}"
                  </h3>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

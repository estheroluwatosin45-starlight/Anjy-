import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Poem } from '@/types';

export function Poems() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoems() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setPoems(data);
      }
      setLoading(false);
    }
    fetchPoems();
  }, []);

  return (
    <div className="flex-grow bg-transparent py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4C1D95] mb-4">Poetry Archive</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            A collection of verses exploring life, emotion, and the beauty of the human experience.
          </p>
        </header>

        <div className="relative max-w-xl mx-auto mb-16">
          <input 
            type="text" 
            placeholder="Search poems..." 
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] text-[#1F2937] dark:text-gray-100"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
             <div className="col-span-full text-center py-20 text-gray-500">Loading poems...</div>
          ) : poems.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border border-gray-100 shadow-sm">
               <p className="text-gray-500 mb-2">No poems published yet.</p>
               <p className="text-sm text-gray-400">Check back later for new verses.</p>
            </div>
          ) : (
            poems.map((poem) => (
              <motion.div 
                key={poem.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col"
              >
                {poem.featured_image && (
                  <img src={poem.featured_image} alt={poem.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-semibold text-[#1F2937] dark:text-gray-100 mb-4">{poem.title}</h3>
                  <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-6 flex-grow font-serif leading-relaxed line-clamp-4">
                    {poem.content}
                  </div>
                  <div className="text-sm text-gray-400 mt-auto">
                    {new Date(poem.created_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

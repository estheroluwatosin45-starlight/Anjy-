import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { BookOpen, Feather, Heart, Sparkles, ArrowRight, Book, Sun } from 'lucide-react';

const ButterflyLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 25L50 85" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M50 45C35 10 5 25 15 55C25 85 45 65 50 45Z" stroke="#FDE68A" strokeWidth="1.5" fill="rgba(253, 230, 138, 0.1)"/>
    <path d="M50 45C65 10 95 25 85 55C75 85 55 65 50 45Z" stroke="#FDE68A" strokeWidth="1.5" fill="rgba(253, 230, 138, 0.1)"/>
    <path d="M50 55C30 55 10 75 25 95C40 115 48 75 50 55Z" stroke="#FDE68A" strokeWidth="1.5" fill="rgba(253, 230, 138, 0.05)"/>
    <path d="M50 55C70 55 90 75 75 95C60 115 52 75 50 55Z" stroke="#FDE68A" strokeWidth="1.5" fill="rgba(253, 230, 138, 0.05)"/>
    <circle cx="50" cy="20" r="2.5" fill="#FDE68A"/>
    <circle cx="20" cy="20" r="1.5" fill="#FDE68A" opacity="0.8"/>
    <circle cx="80" cy="20" r="1.5" fill="#FDE68A" opacity="0.8"/>
    <circle cx="15" cy="40" r="1" fill="#FDE68A" opacity="0.6"/>
    <circle cx="85" cy="40" r="1" fill="#FDE68A" opacity="0.6"/>
  </svg>
);

export function Home() {
  return (
    <div className="flex-grow flex flex-col relative min-h-[calc(100vh)] -mt-[110px]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-purple-50/90 to-purple-100/90 dark:from-[#12072B]/95 dark:via-[#2A1551]/85 dark:to-[#4B2373]/70 transition-colors duration-300"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-200/50 dark:from-purple-900/20 via-transparent to-transparent transition-colors duration-300"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center pt-[150px] pb-16 px-4 min-h-[100vh]">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full text-center flex flex-col items-center"
        >
          {/* Ornamental Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#FDE68A]/60"></div>
            <div className="w-1 h-1 rounded-full bg-[#FDE68A]/80"></div>
            <ButterflyLogo className="w-8 h-8 text-[#FDE68A] drop-shadow-[0_0_8px_rgba(253,230,138,0.5)]" />
            <div className="w-1 h-1 rounded-full bg-[#FDE68A]/80"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#FDE68A]/60"></div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold tracking-wider mb-6 text-purple-900 dark:text-white drop-shadow-lg leading-tight transition-colors">
            Welcome to <span className="bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#8b5cf6] bg-clip-text text-transparent">ANJY</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-purple-800 dark:text-gray-200 mb-12 leading-relaxed font-light max-w-2xl text-center shadow-black dark:drop-shadow-md transition-colors">
            A sanctuary for thoughts, poetry, reflections,<br className="hidden md:block" />and daily inspiration.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              to="/poems" 
              className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white font-medium hover:from-[#7c3aed] hover:to-[#5b21b6] transition-all shadow-[0_4px_20px_rgba(109,40,217,0.3)] dark:shadow-[0_0_20px_rgba(109,40,217,0.5)]"
            >
              <BookOpen className="w-5 h-5 opacity-90" />
              Explore Poems
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/verses" 
              className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-purple-300 dark:border-[#a855f7]/40 text-purple-900 dark:text-white font-medium hover:bg-white/80 dark:hover:bg-black/40 hover:border-purple-400 dark:hover:border-[#a855f7]/60 transition-all shadow-lg"
            >
              <Sun className="w-5 h-5 opacity-90 text-amber-500 dark:text-[#FDE68A]" />
              Today's Inspiration
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform opacity-70" />
            </Link>
          </div>
        </motion.div>

        {/* Floating Features Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-auto w-full max-w-5xl bg-white/80 dark:bg-[#1A0B2E]/60 backdrop-blur-xl border border-purple-100 dark:border-white/10 rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 shadow-2xl transition-colors duration-300"
        >
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-[#3B1D6E] flex items-center justify-center shrink-0 border border-purple-200 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform">
              <Feather className="w-5 h-5 text-purple-600 dark:text-[#E9D5FF]" />
            </div>
            <div>
              <h3 className="text-purple-900 dark:text-white font-semibold text-base md:text-lg transition-colors">Express</h3>
              <p className="text-purple-600 dark:text-[#A78BFA] text-xs md:text-sm transition-colors">Your thoughts freely</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-[#3B1D6E] flex items-center justify-center shrink-0 border border-purple-200 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform">
              <Book className="w-5 h-5 text-purple-600 dark:text-[#E9D5FF]" />
            </div>
            <div>
              <h3 className="text-purple-900 dark:text-white font-semibold text-base md:text-lg transition-colors">Reflect</h3>
              <p className="text-purple-600 dark:text-[#A78BFA] text-xs md:text-sm transition-colors">Find clarity daily</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-[#3B1D6E] flex items-center justify-center shrink-0 border border-purple-200 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-purple-600 dark:text-[#E9D5FF]" />
            </div>
            <div>
              <h3 className="text-purple-900 dark:text-white font-semibold text-base md:text-lg transition-colors">Grow</h3>
              <p className="text-purple-600 dark:text-[#A78BFA] text-xs md:text-sm transition-colors">Build a better you</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-[#3B1D6E] flex items-center justify-center shrink-0 border border-purple-200 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-[#E9D5FF]" />
            </div>
            <div>
              <h3 className="text-purple-900 dark:text-white font-semibold text-base md:text-lg transition-colors">Inspire</h3>
              <p className="text-purple-600 dark:text-[#A78BFA] text-xs md:text-sm transition-colors">Spread positivity</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

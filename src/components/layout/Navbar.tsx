import { Link, useLocation } from 'react-router';
import { Book, Heart, Feather, BookOpen, User, Shield, Search, Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ButterflyIcon = ({ className }: { className?: string }) => (
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
    <circle cx="30" cy="10" r="1.5" fill="#FDE68A" opacity="0.9"/>
    <circle cx="70" cy="10" r="1" fill="#FDE68A" opacity="0.7"/>
    <path d="M46 15C42 10 36 15 36 15" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
    <path d="M54 15C58 10 64 15 64 15" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
  </svg>
);

export function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const links: { href: string; label: string; icon?: React.ElementType; badge?: React.ReactNode }[] = [
    { href: '/', label: 'Home', icon: ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { href: '/poems', label: 'Poems', icon: Feather },
    { href: '/diary', label: 'Diary', icon: Book },
    { href: '/verses', label: 'Daily Verse', icon: BookOpen, badge: (
      <div className="absolute -top-2.5 -right-6 flex items-center">
        <span className="absolute -left-3 top-0.5 text-[#FDE68A] text-[10px]">✨</span>
        <span className="bg-[#FDE68A] text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider relative z-10 shadow-sm">
          Today
        </span>
        <span className="absolute -right-2.5 bottom-0 text-[#FDE68A] text-[8px]">✦</span>
      </div>
    )},
    { href: '/affirmations', label: 'Affirmations', icon: Heart },
    { href: '/about', label: 'About', icon: User },
  ];
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[1400px] px-4">
      <div className="w-full bg-white/95 dark:bg-gradient-to-r dark:from-[#29134a] dark:via-[#3d1d73] dark:to-[#29134a] rounded-full h-[76px] flex items-center px-4 md:px-4 lg:px-6 shadow-lg dark:shadow-[0_12px_40px_-12px_rgba(109,40,217,0.7)] border border-purple-100 dark:border-[#a78bfa]/20 transition-all duration-300">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <ButterflyIcon className="w-12 h-12 md:w-14 md:h-14 text-purple-600 dark:text-[#FDE68A] dark:drop-shadow-[0_0_8px_rgba(253,230,138,0.5)] group-hover:scale-105 transition-transform" />
          <div className="flex flex-col -gap-1">
            <span className="text-2xl md:text-3xl leading-none font-serif font-bold text-purple-900 dark:text-white tracking-wider">ANJY</span>
            <span className="hidden sm:inline text-purple-500 dark:text-[#FDE68A] font-script text-sm md:text-base tracking-wide mt-1 dark:drop-shadow-[0_0_2px_rgba(253,230,138,0.4)]">Write. Reflect. Grow.</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden md:block w-px h-10 bg-purple-200 dark:bg-white/10 mx-4 shrink-0"></div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-grow justify-center">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            
            if (isActive) {
              return (
                <div key={link.href} className="relative flex flex-col items-center">
                  <Link
                    to={link.href}
                    className="relative flex items-center gap-1.5 xl:gap-2 bg-purple-100 dark:bg-white/10 text-purple-900 dark:text-white px-3 xl:px-4 py-2 xl:py-2.5 rounded-full text-xs xl:text-sm font-medium border border-purple-200 dark:border-white/5 shadow-inner transition-colors whitespace-nowrap"
                  >
                    {link.icon && <link.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />}
                    {link.label}
                    {link.badge}
                  </Link>
                  <div className="absolute -bottom-3 xl:-bottom-4 flex flex-col items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-purple-600 dark:bg-[#FDE68A] dark:shadow-[0_0_6px_#FDE68A]"></div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                to={link.href}
                className="relative flex items-center gap-1.5 xl:gap-2 text-purple-600 dark:text-[#E9D5FF] hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-transparent px-2.5 xl:px-3 py-2 xl:py-2.5 rounded-full text-xs xl:text-sm font-medium transition-colors whitespace-nowrap"
              >
                {link.icon && <link.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 opacity-70 shrink-0" />}
                {link.label}
                {link.badge}
              </Link>
            )
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button className="flex w-9 h-9 xl:w-10 xl:h-10 shrink-0 rounded-full bg-purple-50 dark:bg-black/20 items-center justify-center text-purple-600 dark:text-[#E9D5FF] hover:text-purple-900 dark:hover:text-white hover:bg-purple-100 dark:hover:bg-black/30 transition-colors border border-purple-200 dark:border-white/5">
            <Search className="w-4 h-4" />
          </button>
          <button onClick={toggleDarkMode} className="flex w-9 h-9 xl:w-10 xl:h-10 shrink-0 rounded-full bg-purple-50 dark:bg-black/20 items-center justify-center text-purple-600 dark:text-[#E9D5FF] hover:text-purple-900 dark:hover:text-white hover:bg-purple-100 dark:hover:bg-black/30 transition-colors border border-purple-200 dark:border-white/5">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link 
            to="/admin" 
            className="bg-gradient-to-r from-[#d946ef] to-[#a855f7] hover:from-[#e879f9] hover:to-[#c084fc] text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs xl:text-sm font-semibold transition-all shadow-[0_4px_15px_rgba(217,70,239,0.3)] dark:shadow-[0_0_15px_rgba(217,70,239,0.4)] ml-1 shrink-0"
          >
            <Shield className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
            <span className="whitespace-nowrap">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

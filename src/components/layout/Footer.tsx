import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="w-full bg-[#1F2937] text-[#E9D5FF] py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-widest mb-4">ANJY</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            A personal journaling and inspiration platform where visitors can read poems, diary entries, daily Bible verses, and receive daily affirmations.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/poems" className="hover:text-white transition-colors">Poems</Link></li>
            <li><Link to="/diary" className="hover:text-white transition-colors">Diary</Link></li>
            <li><Link to="/verses" className="hover:text-white transition-colors">Bible Verses</Link></li>
            <li><Link to="/affirmations" className="hover:text-white transition-colors">Affirmations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-700 text-sm text-center opacity-60">
        &copy; {new Date().getFullYear()} ANJY. All rights reserved.
      </div>
    </footer>
  );
}

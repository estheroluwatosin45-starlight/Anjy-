import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-[#1F2937] dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow flex flex-col pt-[110px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

import { motion } from 'motion/react';
import { Mail, MapPin } from 'lucide-react';

export function Contact() {
  return (
    <div className="flex-grow bg-transparent py-20 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl font-bold text-[#4C1D95] mb-6">Get in Touch</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            I would love to hear from you. Whether you have a question about a poem, want to share how an affirmation helped you, or just want to say hello, feel free to drop a message.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
              <div className="w-12 h-12 bg-[#E9D5FF]/50 rounded-full flex items-center justify-center text-[#6D28D9]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-[#1F2937] dark:text-gray-100">Email</p>
                <p className="text-sm">hello@anjy.example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
              <div className="w-12 h-12 bg-[#E9D5FF]/50 rounded-full flex items-center justify-center text-[#6D28D9]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-[#1F2937] dark:text-gray-100">Location</p>
                <p className="text-sm">Global</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-8 rounded-2xl shadow-sm border border-gray-100">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" required />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea id="message" rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]" required></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#4C1D95] transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

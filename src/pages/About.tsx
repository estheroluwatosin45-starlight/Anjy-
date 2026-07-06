import { motion } from 'motion/react';

export function About() {
  return (
    <div className="flex-grow bg-white dark:bg-gray-800 dark:border-gray-700 py-20 px-4">
      <div className="max-w-3xl mx-auto prose prose-purple prose-lg">
        <h1 className="text-4xl font-bold text-[#4C1D95] mb-8 text-center">About ANJY</h1>
        <div className="flex justify-center mb-12">
          <div className="relative group max-w-sm w-full overflow-hidden rounded-2xl shadow-md border border-purple-100 dark:border-gray-700">
            <img 
              src="/author.png" 
              alt="Anjy" 
              className="w-full object-cover aspect-[3/4] group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Welcome to ANJY, a sanctuary dedicated to the exploration of life, faith, and the human experience through words. This platform serves as a personal archive of poetry, daily diary reflections, scriptural insights, and empowering affirmations.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          My vision for ANJY is to create a peaceful digital space away from the noise of the modern web—a place where visitors can find a moment of calm, read thoughtfully crafted verses, and start their day with a positive mindset.
        </p>
        <h2 className="text-2xl font-semibold text-[#4C1D95] mt-12 mb-4">Our Mission</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          To inspire, to reflect, and to document the journey. Whether through a raw diary entry or an uplifting scripture, the goal is to share light and honesty.
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import NewsletterWidget from "./components/NewsletterWidget";
import CalendarWidget from "./components/CalendarWidget";
import HaasResourcesWidget from "./components/HaasResourcesWidget";

async function getNewsletterData() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/newsletter`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch newsletter data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching newsletter data:', error);
    return null;
  }
}

export default async function HomeExperimental() {
  const newsletterData = await getNewsletterData();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/haas bkg.jpg')" }}
      ></div>
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header */}
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="/bear blue 2.jpg" 
                  alt="Bear" 
                  className="h-8 w-auto object-cover"
                />
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">OskiHub (Experimental)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Dashboard Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            HAAS MBA Dashboard - Experimental
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your centralized hub for MBA resources and updates (experimental version)
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex space-x-6">
              <button className="border-b-2 border-blue-600 py-2 px-1 text-sm font-medium text-blue-600">
                Newsletter
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300">
                Events
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300">
                Resources
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300">
                Announcements
              </button>
            </nav>
          </div>
        </div>

        {/* Widget Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Calendar Widget - First two columns */}
          <div className="sm:col-span-2 lg:col-span-2">
            <CalendarWidget title="Upcoming Assignments" daysAhead={45} max={150} />
          </div>

          {/* Newsletter Widget - Right third column */}
          <div className="sm:col-span-2 lg:col-span-1">
            {newsletterData ? (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <NewsletterWidget data={newsletterData} />
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">📭</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Newsletter Unavailable</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Unable to load newsletter content at this time.
                </p>
                <Link
                  href="/api/newsletter"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                >
                  Try API directly →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Haas Resources Widget - Full width below newsletter */}
        <div className="mt-4">
          <HaasResourcesWidget />
        </div>

        {/* Additional Widgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {/* Additional Widget Placeholders - Now in a 3-column layout below */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Upcoming Events</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">3</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Career Fair</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Guest Speaker</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">Networking</span>
              </div>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Quick Links</h3>
            </div>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">📚 Course Materials</a>
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">👥 Study Groups</a>
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">💼 Career Services</a>
              <a href="#" className="block text-sm text-blue-600 hover:text-blue-800">🎓 Alumni Network</a>
            </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Deadlines</h3>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">2</span>
            </div>
            <div className="space-y-2">
              <div className="border-l-4 border-red-500 pl-2">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Assignment Due</p>
                <p className="text-xs text-slate-500">Tomorrow</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-2">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Project Submission</p>
                <p className="text-xs text-slate-500">Next Week</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

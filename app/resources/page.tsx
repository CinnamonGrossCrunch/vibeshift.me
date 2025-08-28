import HaasResourcesWidget from '../components/HaasResourcesWidget';
import CohortCalendarWidget from '../components/CohortCalendarWidget';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-berkeley-blue to-berkeley-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <span className="text-xl font-semibold text-berkeley-blue dark:text-berkeley-blue-light">Haas Resources Hub</span>
            </div>
            <Link 
              href="/" 
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-berkeley-blue dark:hover:text-berkeley-blue-light transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-berkeley-blue dark:text-berkeley-blue-light mb-4">
            UC Berkeley Haas Resources
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Quick access to essential resources, services, and support for EWMBA students
          </p>
        </div>
        
        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Haas Resources Widget */}
          <HaasResourcesWidget />
          
          {/* Cohort Calendar Widget */}
          <CohortCalendarWidget title="Cohort Calendar" daysAhead={30} max={10} />
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-berkeley-blue/20 dark:border-berkeley-blue-light/20">
          <h2 className="text-xl font-semibold text-berkeley-blue dark:text-berkeley-blue-light mb-4">
            How to Use This Page
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-berkeley-blue dark:text-berkeley-blue-light mb-2">Resources Widget</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Switch between Categories and All Items view</li>
                <li>• Expand/collapse categories for better organization</li>
                <li>• Click links to access resources directly</li>
                <li>• Search functionality coming soon</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-berkeley-blue dark:text-berkeley-blue-light mb-2">Calendar Widget</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• View upcoming assignments and events</li>
                <li>• Switch between List and Calendar views</li>
                <li>• Click events for detailed information</li>
                <li>• Navigate months in calendar view</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

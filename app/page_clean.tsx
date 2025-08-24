import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NW</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">Newsletter Widget</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-900/10 border border-blue-900/20 rounded-full text-sm font-medium text-blue-900 dark:text-blue-200 dark:bg-blue-200/10">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
              Live Newsletter Scraping
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Smart Newsletter
              <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-amber-500 bg-clip-text text-transparent"> Dashboard</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Automatically scrapes and displays Mailchimp newsletter campaigns with intelligent content parsing, 
              link absolutization, and a beautiful collapsible interface.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="mr-2">📊</span>
              View Newsletter Dashboard
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link
              href="/api/newsletter"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:border-blue-400"
            >
              <span className="mr-2">🔗</span>
              View API Response
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Smart Scraping</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Intelligently parses Mailchimp campaigns with structured content extraction.</p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Beautiful UI</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Modern, responsive design with collapsible sections and smooth animations.</p>
            </div>
            
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Fast & Secure</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">Server-side rendering with HTML sanitization and caching for optimal performance.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-900 to-amber-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">NW</span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Newsletter Widget © 2025</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Built with Next.js
              </a>
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Deploy on Vercel
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

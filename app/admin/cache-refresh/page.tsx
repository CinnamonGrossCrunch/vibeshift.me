'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CacheRefreshPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    duration?: number;
  } | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'beta') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassword('');
    }
  };

  // Progress bar animation - calibrated from actual API timing data
  // Total time: ~111 seconds based on production measurements
  // Stage breakdown:
  //   0-1%: Newsletter URL fetch (~775ms)
  //   1-2%: Newsletter scraping (~910ms)
  //   2-72%: AI newsletter organization (~77s) ← MAIN BOTTLENECK
  //   72-81%: Date/deadline extraction (~10s)
  //   81-99%: My Week AI summaries (~21s)
  //   99-100%: Cache write (~2s)
  useEffect(() => {
    if (!isRefreshing) {
      setProgress(0);
      return;
    }

    const estimatedDuration = 111000; // 111 seconds (from actual measurements)
    const interval = 100; // Update every 100ms
    const increment = (interval / estimatedDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        // Cap at 98% until actual completion (API returns)
        return next >= 98 ? 98 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isRefreshing]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setResult(null);
    setProgress(0);
    
    const startTime = Date.now();
    
    try {
      // Trigger the unified-dashboard endpoint with force-refresh
      const response = await fetch('/api/unified-dashboard?refresh=true');
      const duration = Date.now() - startTime;
      
      // Set to 100% on completion
      setProgress(100);
      
      if (response.ok) {
        // Parse response to validate actual data
        const data = await response.json();
        
        // Verify the response contains valid data
        const hasNewsletterData = data?.newsletterData?.sections?.length > 0;
        const hasMyWeekData = data?.myWeekData?.blueEvents || data?.myWeekData?.goldEvents;
        const cacheSource = response.headers.get('X-Cache-Source');
        
        // Check if we got fresh data or degraded/error data
        if (!hasNewsletterData || data.newsletterData.title === 'Loading...') {
          setResult({
            success: false,
            message: `⚠️ Cache refresh completed but data may be incomplete. Newsletter: ${hasNewsletterData ? '✓' : '✗'}, My Week: ${hasMyWeekData ? '✓' : '✗'}`,
            duration
          });
        } else {
          setResult({
            success: true,
            message: `✅ Cache refreshed successfully! Newsletter (${data.newsletterData.sections.length} sections) and My Week data updated. Cache source: ${cacheSource || 'fresh-computed'}`,
            duration
          });
        }
      } else {
        const error = await response.json();
        setResult({
          success: false,
          message: `❌ Refresh failed: ${error.error || 'Unknown error'}`,
          duration
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setProgress(100);
      setResult({
        success: false,
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Small delay to show 100%
    }
  };

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-md w-200">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-slate-700 p-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">
               Admin Access
            </h1>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white placeholder-slate-500 ${
                    authError ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter password"
                  autoFocus
                />
                {authError && (
                  <p className="mt-2 text-sm text-red-400">
                    ❌ Incorrect password. Please try again.
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-6 bg-violet-900/50 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors"
              >
                Access Admin Console
              </button>
            </form>

            <div className="mt-6">
              <Link 
                href="/"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium block text-center"
              >
                ← Back to Dashboard
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                Oski.app created and maintained by Matt Gross.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show admin panel if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 p-1">
      <div className="relative w-100 mx-auto ">
        <div className="bg-slate-800/20 backdrop-blur-md rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]  p-6">
          <h1 className="text-3xl font-light text-white mb-6">
        Cache Refresh Admin
          </h1>
          
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <p className="text-sm text-yellow-200">
              <strong>⚠️ Note:</strong> This will force-refresh all cached data including:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-200 mt-2 space-y-1">
              <li>Latest newsletter from Mailchimp</li>
              <li>Calendar events (Blue & Gold cohorts)</li>
              <li>My Week AI summaries</li>
            </ul>
            <p className="text-sm text-yellow-200 mt-2">
              This process takes approximately <strong>1-2 minutes</strong> due to AI processing. Progress bar shows real-time status.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
              isRefreshing
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 active:scale-95'
            }`}
          >
            {isRefreshing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing Cache...
              </span>
            ) : (
              ' Refresh Cache Now'
            )}
          </button>

          {/* Progress Bar */}
          {isRefreshing && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Progress</span>
                <span className="text-sm font-medium text-violet-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-violet-400 h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` } as React.CSSProperties}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                {progress < 1 && '🔍 Fetching newsletter archive...'}
                {progress >= 1 && progress < 2 && '📄 Scraping newsletter content...'}
                {progress >= 2 && progress < 72 && '🤖 AI organizing newsletter sections... (this takes ~75 seconds)'}
                {progress >= 72 && progress < 81 && '📅 Extracting dates and deadlines...'}
                {progress >= 81 && progress < 99 && '📊 Generating My Week AI summaries...'}
                {progress >= 99 && progress < 100 && '💾 Writing to cache...'}
                {progress >= 100 && '✅ Complete!'}
              </p>
            </div>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-lg backdrop-blur-sm ${
              result.success 
                ? 'bg-green-900/30 border border-green-700/50' 
                : 'bg-red-900/30 border border-red-700/50'
            }`}>
              <p className={`text-sm font-medium ${
                result.success ? 'text-green-200' : 'text-red-200'
              }`}>
                {result.message}
              </p>
              {result.duration && (
                <p className="text-xs text-slate-400 mt-2">
                  Completed in {(result.duration / 1000).toFixed(2)}s
                </p>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-3">
               Cache Status Details
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <strong className="text-slate-200">Automatic Refresh:</strong> Cron job runs daily at 8:10 AM Pacific
              </p>
              <p>
                <strong className="text-slate-200">Cache Duration:</strong> 8 hours (28,800 seconds)
              </p>
              <p>
                <strong className="text-slate-200">Last Manual Refresh:</strong> {result && result.success ? 'Just now' : 'Never'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link 
              href="/"
              className="text-violet-400 hover:text-violet-300 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              Oski.app created and maintained by Matt Gross.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

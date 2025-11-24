'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CacheRefreshPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setResult(null);
    
    const startTime = Date.now();
    
    try {
      // Trigger the unified-dashboard endpoint with force-refresh
      const response = await fetch('/api/unified-dashboard?refresh=true');
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        setResult({
          success: true,
          message: `✅ Cache refreshed successfully! Newsletter and My Week data updated.`,
          duration
        });
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
      setResult({
        success: false,
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex items-center justify-center">
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
                className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="w-200 mx-auto bg-glassmorphism-padded">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-slate-200 p-8">
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
              This process may take 8-20 seconds.
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

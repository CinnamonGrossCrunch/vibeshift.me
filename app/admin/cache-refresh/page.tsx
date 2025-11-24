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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              🔒 Admin Access
            </h1>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    authError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                  autoFocus
                />
                {authError && (
                  <p className="mt-2 text-sm text-red-600">
                    ❌ Incorrect password. Please try again.
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Access Admin Console
              </button>
            </form>

            <div className="mt-6">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium block text-center"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show admin panel if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔄 Cache Refresh Admin
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> This will force-refresh all cached data including:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
              <li>Latest newsletter from Mailchimp</li>
              <li>Calendar events (Blue & Gold cohorts)</li>
              <li>My Week AI summaries</li>
            </ul>
            <p className="text-sm text-yellow-800 mt-2">
              This process may take 8-20 seconds.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
              isRefreshing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
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
              '🔄 Refresh Cache Now'
            )}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              {result.duration && (
                <p className="text-xs text-gray-600 mt-2">
                  Completed in {(result.duration / 1000).toFixed(2)}s
                </p>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              📊 Cache Status Info
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Automatic Refresh:</strong> Cron job runs daily at 8:10 AM Pacific
              </p>
              <p>
                <strong>Cache Duration:</strong> 8 hours (28,800 seconds)
              </p>
              <p>
                <strong>Last Manual Refresh:</strong> {result && result.success ? 'Just now' : 'Never'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

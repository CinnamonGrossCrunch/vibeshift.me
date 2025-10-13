'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import NewsletterWidget from "./NewsletterWidget";
import SlackWidget from "./SlackWidget";
import type { UnifiedDashboardData } from '@/app/api/unified-dashboard/route';

interface DashboardTabs2Props {
  // Optional pre-fetched data to avoid duplicate API calls
  dashboardData?: UnifiedDashboardData | null;
}

export default function DashboardTabs2({ dashboardData: externalData }: DashboardTabs2Props) {
  const [activeTab, setActiveTab] = useState('Updates');
  const [dashboardData, setDashboardData] = useState<UnifiedDashboardData | null>(externalData || null);
  const [loading, setLoading] = useState(!externalData); // If external data provided, don't start loading
  const [error, setError] = useState<string | null>(null);
  
  // Remove My Week from tabs since it's now rendered at top level
  const tabs = ['Slack', 'Updates'];

  useEffect(() => {
    // If external data is provided, use it and skip API calls
    if (externalData) {
      setDashboardData(externalData);
      setLoading(false);
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Fetching unified dashboard data...');
        const response = await fetch('/api/unified-dashboard');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
        console.log('✅ Unified dashboard data loaded successfully');
        
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [externalData]);

  // Loading state
  if (loading) {
    return (
      <div className="relative">
        {/* Tab Navigation */}
        <div className="flex items-end relative">
          <div className="flex-grow h-px mt-3"></div>
          {tabs.map((tab, index) => (
            <button
              key={index}
              disabled
              className="ml-3 mr-2 mb-2 px-10 py-2 bg-white/40 dark:bg-slate-100/50 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-slate-700/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-full opacity-50"
            >
              <span className="block relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Loading Content */}
        <div className="bg-white/40 dark:bg-slate-100/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-400/10 p-4 sm:p-6 rounded-l-4xl rounded-b-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] saturate-[80%]">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Loading Dashboard</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Fetching newsletter, calendar, and AI analysis...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="relative">
        {/* Tab Navigation */}
        <div className="flex items-end relative">
          <div className="flex-grow h-px mt-3"></div>
          {tabs.map((tab, index) => (
            <button
              key={index}
              disabled
              className="ml-3 mr-2 mb-2 px-10 py-2 bg-white/40 dark:bg-slate-100/50 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-slate-700/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-full opacity-50"
            >
              <span className="block relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Error Content */}
        <div className="bg-white/40 dark:bg-slate-100/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-400/10 p-4 sm:p-6 rounded-l-4xl rounded-b-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] saturate-[80%]">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚠️</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Dashboard Unavailable</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {error || 'Unable to load dashboard content at this time.'}
            </p>
            <Link
              href="/api/unified-dashboard"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Try API Route →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="relative h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-end relative">
        <div className="flex-grow h-px mt-3"></div>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`relative text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${activeTab === tab
                ? ' px-8 py-3 bg-violet-300/10 backdrop-blur-lg text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-t-3xl saturate-[80%] font-light'
                : ' ml-3 mr-2 mb-2  px-10 py-2 bg-white/40 dark:bg-slate-100/50 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-slate-700/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-full font-normal'
              }
            `}
            style={{
              ...(activeTab === tab && {
                clipPath: index === tabs.length - 1 
                  ? 'polygon(30px 0%, 100% 0%, 100% 100%, 0% 100%)'  // Newsletter (rightmost) - angled left edge
                  : 'polygon(0% 0%, calc(100% - 30px) 0%, 100% 100%, 0% 100%)', // Slack (left) - angled right edge
                marginLeft: index === tabs.length - 1 ? '-16px' : '0',
                marginRight: index === tabs.length - 1 ? '0' : '-16px',
              }),
              position: 'relative'
            }}
          >
            <span className="block relative z-10">{tab || ' '}</span>
          </button>
        ))}
      </div>

      {/* Content Pane */}
      <div className="bg-violet-300/10 backdrop-blur-lg p-4 sm:p-6 rounded-l-4xl rounded-b-lg rounded-tl-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] saturate-[80%] flex-1 min-h-[600px] overflow-y-auto">
        {activeTab === 'Updates' && (
          <div className="w-full">
            <NewsletterWidget data={dashboardData.newsletterData} />
          </div>
        )}
        
        {activeTab === 'Slack' && (
          <div className="w-full">
            <SlackWidget />
          </div>
        )}
      </div>
      
      {/* Processing Info (optional debug display) - COMMENTED OUT */}
      {/* 
      {dashboardData.processingInfo && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          Loaded in {dashboardData.processingInfo.totalTime}ms
        </div>
      )}
      */}
    </div>
  );
}

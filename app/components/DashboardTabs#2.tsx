'use client';

import { useState } from 'react';
import Link from "next/link";
import NewsletterWidget from "./NewsletterWidget";
import type { CohortEvents } from '@/lib/icsUtils';

type CohortType = 'blue' | 'gold';
type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

interface DashboardTabs2Props {
  newsletterData: Payload | null;
}

export default function DashboardTabs2({ 
  newsletterData
}: DashboardTabs2Props) {
  const [activeTab, setActiveTab] = useState('Newsletter');
  const tabs = ['Newsletter'];

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex items-end relative">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`relative text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${activeTab === tab
                ? ' px-10 py-3 bg-white/40 dark:bg-slate-100/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-300/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-t-3xl saturate-[80%]'
                : ' ml-3 mr-2 mb-2  px-10 py-2 bg-white/40 dark:bg-slate-100/50 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-slate-700/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-full'
              }
            `}
          >
            <span className="block relative z-10">{tab || ' '}</span>
          </button>
        ))}
        <div className="flex-grow h-px mt-3"></div>
      </div>

      {/* Content Pane */}
      <div className="bg-white/40 dark:bg-slate-100/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-300/10 p-4 sm:p-6 rounded-r-4xl rounded-b-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] saturate-[80%]">
        {activeTab === 'Newsletter' && (
          <div>
            {/* Newsletter Widget Only */}
            <div className="w-full">
              {newsletterData ? (
                <NewsletterWidget data={newsletterData} />
              ) : (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">📭</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Newsletter Unavailable</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Unable to load newsletter content at this time.
                  </p>
                  <Link
                    href="/api/newsletter"
                    className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Try API Route →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

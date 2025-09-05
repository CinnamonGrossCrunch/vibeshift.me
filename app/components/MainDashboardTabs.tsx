'use client';

import { useState } from 'react';
import Link from "next/link";
import CalendarListView from "./CalendarListView";
import CohortCalendarWidget from "./CohortCalendarWidget";
import NewsletterWidget from "./NewsletterWidget";
import HaasResourcesWidget from "./HaasResourcesWidget";
import type { CohortEvents } from '@/lib/icsUtils';

type CohortType = 'blue' | 'gold';
type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

interface MainDashboardTabsProps {
  newsletterData: Payload | null;
  cohortEvents: CohortEvents;
  selectedCohort: CohortType;
  loading: boolean;
  onCohortChange: (cohort: CohortType) => void;
}

export default function MainDashboardTabs({ 
  newsletterData, 
  cohortEvents, 
  selectedCohort, 
  loading, 
  onCohortChange 
}: MainDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState('OskiHub Cal');
  const tabs = ['OskiHub Cal', 'Announcements'];

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex items-end relative">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`relative  text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${activeTab === tab
                ? ' px-10 py-3 bg-white/40 dark:bg-slate-100/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-300/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-t-3xl saturate-[80%]'
                : ' ml-3 mr-2 mb-2  px-10 py-2 bg-white/40 dark:bg-slate-100/50 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-slate-700/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-full'
              }
              ${activeTab === tab && index === tabs.length - 1 ? 'border-r border-white/50 dark:border-slate-700/60' : ''}
            `}
            style={{
              ...(activeTab === tab && {
                clipPath: index === 0 
                  ? 'polygon(0% 100%, 0% 0%, calc(100% - 30px) 0%, 100% 100%)'
                  : 'polygon(0% 100%, 30px 0%, calc(100% - 30px) 0%, 100% 100%)',
                marginRight: index === tabs.length - 1 ? '0' : '-16px',
              }),
              position: 'relative'
            }}
          >
            <span className="block relative z-10">{tab || ' '}</span>
          </button>
        ))}
        <div className="flex-grow h-px  mt-3"></div>
      </div>

      {/* Content Pane */}
      <div className="bg-white/40 dark:bg-slate-100/50 backdrop-blur-sm supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-300/10 p-4 sm:p-6  rounded-r-4xl rounded-b-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] saturate-[80%]">
        {activeTab === 'OskiHub Cal' && (
          <div>
            {/* Global Cohort Toggle */}
            <div className="mb-0 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div 
                  role="tablist" 
                  className="flex bg-slate-100 dark:bg-slate-700 rounded-t-lg p-1"
                  aria-label="Select cohort for all widgets"
                >
                  <button
                    role="tab"
                    aria-selected={selectedCohort === 'blue'}
                    onClick={() => onCohortChange('blue')}
                    className={`px-8 py-0 rounded-t-md text-sm font-medium transition-all duration-200 ${
                      selectedCohort === 'blue'
                        ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Blue Cohort
                  </button>
                  <button
                    role="tab"
                    aria-selected={selectedCohort === 'gold'}
                    onClick={() => onCohortChange('gold')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCohort === 'gold'
                        ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Gold Cohort
                  </button>
                </div>
              </div>
              {loading && (
                <div className="text-sm text-slate-500 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-berkeley-blue rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {/* What's Next Widget - Horizontal Layout (PRESERVED) */}
            <div className="mb-4">
              <CalendarListView 
                cohortEvents={cohortEvents}
                defaultCohort={selectedCohort}
                className="rounded-lg"
              />
            </div>

            {/* Widget Grid - 8 Column Layout (PRESERVED) */}
            <div className="grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {/* Calendar Widget - 5 columns */}
              <div className="sm:col-span-5 lg:col-span-5">
                <CohortCalendarWidget 
                  title="Cohort Calendar" 
                  daysAhead={45} 
                  max={150}
                  cohortEvents={cohortEvents}
                  selectedCohort={selectedCohort}
                />
              </div>

              {/* Newsletter Widget - Columns 6-8 */}
              <div className="sm:col-span-6 lg:col-span-3">
                {newsletterData ? (
                  <NewsletterWidget data={newsletterData} />
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
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Try API Route →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Haas Resources Widget - Full width below (PRESERVED) */}
            <div className="mt-4">
              <HaasResourcesWidget />
            </div>
          </div>
        )}
        
        {activeTab === 'Announcements' && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <p className="text-slate-500">Important announcements will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

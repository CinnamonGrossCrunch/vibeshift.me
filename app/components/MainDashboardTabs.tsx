'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
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
  const tabs = ['OskiHub Cal', 'Book A Space @ Haas'];

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
              ${tab === 'Book A Space @ Haas' && activeTab !== tab ? 'cursor-pointer' : ''}
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
                className="rounded-4xl"
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
                
                {/* Slack Integration Placeholder */}
                <div className="mt-2 group cursor-pointer">
                  <div 
                    className="relative p-6 h-56  rounded-4xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center transition-all duration-300  overflow-hidden"
                    style={{
                      backgroundImage: "url('/slack cap.jpg')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Overlay for text readability */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md rounded-4xl hover:bg-black/80 transition-all duration-200"></div>

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-center hover:scale-[1.02] transition-transform duration-400 ">

                      <div className="text-center justify-center">
                      <h3 className="text-base font-semibold text-white mb-2 drop-shadow-lg">Slack Updates</h3>
                      <p className="text-sm text-white/90 drop-shadow">Coming Soon - Stay tuned for updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Haas Resources Widget - Full width below (PRESERVED) */}
            <div className="mt-4">
              <HaasResourcesWidget />
            </div>
          </div>
        )}
        
        {activeTab === 'Book A Space @ Haas' && (
          <div className="text-center py-6 px-4 max-w-none">
            <h2 className="text-xl font-semibold">Book A Space @ Haas</h2>
            <p className="text-slate-500 mb-8">Reserve study rooms, meeting spaces, and other facilities at Haas.</p>
            <div className="flex justify-center mb-8">
              <a 
                href="https://ems.haas.berkeley.edu/emswebapp/Default.aspx?_gl=1*12r8rhf*_gcl_au*MTAxMDg4Nzk5Ni4xNzU2OTMyMjU1*_ga*MTQ2MTA4MDQ1Ni4xNzQ4ODUxNTI5*_ga_EW2RSBHHX6*czE3NTcxMTg0MjUkbzU3JGcxJHQxNzU3MTE4NTU2JGo1MiRsMCRoMA.."
                target="_blank"
                rel="noopener noreferrer"
                className="relative group cursor-pointer"
              >
                <Image 
                  src="/EMS-CAP.png" 
                  alt="EMS Space Booking System" 
                  width={1200}
                  height={800}
                  className="max-w-4xl w-full h-auto rounded-4xl shadow-lg transition-all duration-300 group-hover:opacity-80"
                  style={{
                    border: '4px dashed #FDB515',
                    boxShadow: '0 0 20px rgba(253, 181, 21, 0.3), 0 0 40px rgba(253, 181, 21, 0.2), 0 0 60px rgba(253, 181, 21, 0.1)'
                  }}
                />
                {/* Hover overlay - positioned above image */}
                <div className="absolute inset-0 bg-blue-800/80 opacity-0 group-hover:opacity-100 transition-all duration-150 rounded-4xl flex items-center justify-center z-10">
                  <div className="text-white text-center px-6">
                    <p className="text-4xl font-light urbanist-light drop-shadow-lg">Login to<br />Haas EMS<br />through CalNet</p>
                  </div>
                </div>
                {/* Hover border effect overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-4xl pointer-events-none z-20"
                  style={{
                    border: '4px dashed #003262',
                    boxShadow: '0 0 20px rgba(0, 50, 98, 0.5), 0 0 40px rgba(0, 50, 98, 0.3), 0 0 60px rgba(0, 50, 98, 0.2)'
                  }}
                />
              </a>
            </div>
           
          </div>
        )}
      </div>
    </div>
  );
}

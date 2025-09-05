'use client';

import { useState } from 'react';
import Link from "next/link";
import NewsletterWidget from "./NewsletterWidget";
import CohortCalendarWidget from "./CohortCalendarWidget";
import HaasResourcesWidget from "./HaasResourcesWidget";

type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

interface DashboardTabsProps {
  newsletterData: Payload | null;
}

export default function DashboardTabs({ newsletterData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState('Newsletter');
  const tabs = ['Newsletter', 'Events', 'Resources', 'Announcements'];

  return (
    <div className="relative">
      {/* Tab Navigation */}
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${activeTab === tab
                ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white border-x border-t border-slate-200 dark:border-slate-700 -mb-px z-10'
                : 'text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/50'
              }
            `}
          >
            {tab}
          </button>
        ))}
        <div className="flex-grow border-b border-slate-200 dark:border-slate-700"></div>
      </div>

      {/* Content Pane */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 sm:p-6 border border-slate-200 dark:border-slate-700 rounded-b-lg rounded-tr-lg">
        {activeTab === 'Newsletter' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2 lg:col-span-2">
                <CohortCalendarWidget title="Upcoming Assignments" daysAhead={45} max={150} />
              </div>
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
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Unable to load newsletter content.</p>
                    <Link href="/api/newsletter" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm">
                      Try API directly →
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <HaasResourcesWidget />
            </div>

            {/* Additional Widgets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">What&apos;s Next.</h3>
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
          </div>
        )}
        
        {activeTab === 'Events' && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold">Events</h2>
            <p className="text-slate-500">Event details will be displayed here.</p>
          </div>
        )}
        
        {activeTab === 'Resources' && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold">Resources</h2>
            <p className="text-slate-500">Helpful resources and links will be displayed here.</p>
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

'use client';

import { useState } from 'react';
import Image from "next/image";
import CalendarListView from "./CalendarListView";
import CohortCalendarWidget from "./CohortCalendarWidget";
import type { CohortEvents } from '@/lib/icsUtils';

type CohortType = 'blue' | 'gold';

interface MainDashboardTabsProps {
  cohortEvents: CohortEvents;
  selectedCohort: CohortType;
}

export default function MainDashboardTabs({ 
  cohortEvents, 
  selectedCohort
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
            className={`relative  text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${activeTab === tab
                ? ' px-8 py-3 bg-turbulence bg-glass text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-t-3xl saturate-[80%] font-light'
                : ' ml-3 mr-2 mb-2  px-10 py-2 bg-white/40 dark:bg-slate-100/50 backdrop-blur-md supports-[backdrop-filter]:bg-white/20 dark:supports-[backdrop-filter]:bg-slate-700/10 text-slate-900 dark:text-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] z-20 rounded-full font-normal'
              }
              ${activeTab === tab && index === tabs.length - 1 ? '' : ''}
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
      <div className="bg-turbulence bg-glass p-4 sm:p-6 rounded-r-4xl rounded-b-lg rounded-tr-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] saturate-[80%] flex-1 min-h-[600px] overflow-y-auto">
        {activeTab === 'OskiHub Cal' && (
          <div>
            {/* What's Next Widget - Horizontal Layout (PRESERVED) */}
            <div className="mb-4">
              <CalendarListView 
                cohortEvents={cohortEvents}
                defaultCohort={selectedCohort}
                maxEvents={4}
                className="rounded-4xl"
              />
            </div>

            {/* Calendar Widget - Full Width */}
            <div className="w-full">
              <CohortCalendarWidget 
                title="Cohort Calendar" 
                daysAhead={45} 
                max={150}
                cohortEvents={cohortEvents}
                selectedCohort={selectedCohort}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'Book A Space @ Haas' && (
          <div className="text-center py-6 px-3 max-w-none">
            <h2 className="text-xl font-semibold">Reserve Space @ Haas</h2>
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
                  className="opacity-80 max-w-4xl w-full h-auto rounded-4xl shadow-lg transition-all duration-300 group-hover:opacity-80"
                  style={{
                    border: '2px dashed #FDB515',
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

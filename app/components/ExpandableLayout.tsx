'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Type definitions (duplicate from icsUtils to avoid server imports)
interface CalendarEvent {
  uid?: string;
  title: string;
  start: string;   // ISO
  end?: string;    // ISO
  location?: string;
  url?: string;
  allDay?: boolean;
  description?: string;
  cohort?: 'blue' | 'gold';
  source?: string; // ICS filename for determining course type
  organizer?: string; // Event organizer
  status?: string; // CONFIRMED, TENTATIVE, CANCELLED
  categories?: string[]; // Event categories
}

interface CohortEvents {
  blue: CalendarEvent[];
  gold: CalendarEvent[];
  original: CalendarEvent[]; // Original calendar.ics events for rich content matching
  launch: CalendarEvent[]; // UC Launch Accelerator events
  calBears: CalendarEvent[]; // Cal Bears home events
}

// Dynamically import components with loading states
const CalendarListView = dynamic(() => import('./CalendarListView'), { 
  ssr: false,
  loading: () => <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">Loading events...</div>
});

const CohortCalendarWidget = dynamic(() => import('./CohortCalendarWidget'), { 
  ssr: false,
  loading: () => <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">Loading calendar...</div>
});

const CompactNewsletterWidget = dynamic(() => import('./CompactNewsletterWidget'), { 
  ssr: false,
  loading: () => <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">Loading newsletter...</div>
});

const NewsletterWidget = dynamic(() => import('./NewsletterWidget'), { 
  ssr: false,
  loading: () => <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse">Loading newsletter...</div>
});

type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

interface ExpandableLayoutProps {
  cohortEvents: CohortEvents;
  newsletterData: Payload;
}

export default function ExpandableLayout({ cohortEvents, newsletterData }: ExpandableLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNewsletterClick = () => {
    if (!isExpanded && !isAnimating) {
      setIsAnimating(true);
      
      // Show overlay first
      setShowOverlay(true);
      
      // After a brief delay, start the expansion
      setTimeout(() => {
        setIsExpanded(true);
      }, 400);
      
      // Hide overlay and complete animation
      setTimeout(() => {
        setShowOverlay(false);
        setIsAnimating(false);
      }, 1000);
    }
  };

  const handleCollapseClick = () => {
    if (isExpanded && !isAnimating) {
      setIsAnimating(true);
      setIsExpanded(false);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 700);
    }
  };

  return (
    <>
      {/* Soft white overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
          <div className="text-center animate-pulse">
            <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              View Full Size
            </div>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className={`grid gap-3 transition-all duration-700 ease-in-out ${
        isExpanded ? 'grid-cols-10' : 'grid-cols-9'
      }`}>
        
        {/* Upcoming Events List - Columns 1-2 (normal) or 1-2 (expanded) */}
        <div className={`transition-all duration-700 ease-in-out ${
          isExpanded ? 'col-span-2' : 'col-span-2'
        }`}>
          <CalendarListView 
            cohortEvents={cohortEvents}
            title="What's Next."
            maxEvents={5}
            showCohortToggle={true}
          />
        </div>

        {/* Calendar Widget - Columns 3-7 (normal) or 3-6 (expanded) */}
        <div className={`transition-all duration-700 ease-in-out ${
          isExpanded ? 'col-span-4' : 'col-span-5'
        }`}>
          <CohortCalendarWidget title="Cohort Calendar" daysAhead={45} max={150} />
        </div>

        {/* Newsletter Widget - Columns 8-9 (normal) or 7-10 (expanded) */}
        <div className={`relative transition-all duration-700 ease-in-out ${
          isExpanded ? 'col-span-4' : 'col-span-2'
        }`}>
          {/* Compact Newsletter Widget - Fades out during expansion */}
          <div className={`transition-all duration-500 ease-in-out ${
            isExpanded ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100'
          }`}>
            <div 
              onClick={handleNewsletterClick}
              className="rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl"
              title="Click to expand newsletter view"
            >
              <CompactNewsletterWidget data={newsletterData} />
            </div>
          </div>

          {/* Full Newsletter Widget - Fades in during expansion */}
          <div className={`transition-all duration-500 ease-in-out ${
            isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
          }`}>
            {/* Collapse Button */}
            <button
              onClick={handleCollapseClick}
              className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-lg border border-slate-200 dark:border-slate-600"
              title="Collapse newsletter view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <NewsletterWidget data={newsletterData} />
          </div>
        </div>
      </div>
    </>
  );
}

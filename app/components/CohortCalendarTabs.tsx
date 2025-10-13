'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import Image from 'next/image';
import MonthGrid from './MonthGrid';
import EventDetailModal from './EventDetailModal';
import type { CalendarEvent, CohortEvents } from '@/lib/icsUtils';

type Props = {
  cohortEvents: CohortEvents;
  title: string;
  externalSelectedCohort?: 'blue' | 'gold';
};

type CohortType = 'blue' | 'gold';

export default function CohortCalendarTabs({ cohortEvents, externalSelectedCohort }: Props) {
  const [selectedCohort, setSelectedCohort] = useState<CohortType>(externalSelectedCohort || 'blue');
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [matchedOriginalEvent, setMatchedOriginalEvent] = useState<CalendarEvent | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(-1); // Track current event index
  const [showGreekTheater, setShowGreekTheater] = useState(false);
  const [showUCLaunch, setShowUCLaunch] = useState(false);
  const [showCalBears, setShowCalBears] = useState(false);
  const [showCampusGroups, setShowCampusGroups] = useState(false);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load cohort preference from localStorage on mount (only if not externally controlled)
  useEffect(() => {
    if (!externalSelectedCohort) {
      const saved = localStorage.getItem('calendar-cohort');
      if (saved === 'blue' || saved === 'gold') {
        setSelectedCohort(saved);
      }
    }
  }, [externalSelectedCohort]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEventDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync with external cohort selection
  useEffect(() => {
    if (externalSelectedCohort) {
      setSelectedCohort(externalSelectedCohort);
    }
  }, [externalSelectedCohort]);

  // Save cohort preference to localStorage (only if not externally controlled)
  useEffect(() => {
    if (!externalSelectedCohort) {
      localStorage.setItem('calendar-cohort', selectedCohort);
    }
  }, [selectedCohort, externalSelectedCohort]);

  const handleCohortChange = (cohort: CohortType) => {
    // Only allow local changes if not externally controlled
    if (!externalSelectedCohort) {
      setSelectedCohort(cohort);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Generate course-specific fallback content for events without original calendar matches
  const generateCourseContent = (cohortEvent: CalendarEvent): CalendarEvent | null => {
    if (!cohortEvent.source) return null;

    const eventDate = new Date(cohortEvent.start);
    const isCourse201 = cohortEvent.source.includes('201') || cohortEvent.source.includes('micro');
    const isLeadingPeople = cohortEvent.source.includes('205') || cohortEvent.source.includes('leadingpeople');
    const isDataDecisions = cohortEvent.source.includes('DataDecisions') || cohortEvent.source.includes('202');
    const isMarketing = cohortEvent.source.includes('Marketing') || cohortEvent.source.includes('208');
    
    if (!isCourse201 && !isLeadingPeople && !isDataDecisions && !isMarketing) return null;

    // Course start dates
    const courseStartDates = {
      // MicroEconomics (201) start dates
      micro_blue: new Date(2025, 6, 28), // July 28, 2025 (Monday)
      micro_gold: new Date(2025, 6, 29), // July 29, 2025 (Tuesday)
      // Leading People start dates  
      leading_blue: new Date(2025, 7, 6), // August 6, 2025
      leading_gold: new Date(2025, 7, 7), // August 7, 2025
      // Data & Decisions (202) start dates
      data_blue: new Date(2025, 9, 14), // October 14, 2025 (Monday)
      data_gold: new Date(2025, 9, 15), // October 15, 2025 (Tuesday)
      // Marketing (208) start dates
      marketing_blue: new Date(2025, 9, 14), // October 14, 2025 (Monday)
      marketing_gold: new Date(2025, 9, 15), // October 15, 2025 (Tuesday)
    };

    let startDate: Date;
    let courseTitle: string;
    let baseUrl: string;
    
    if (isCourse201) {
      startDate = selectedCohort === 'blue' ? courseStartDates.micro_blue : courseStartDates.micro_gold;
      courseTitle = 'MicroEconomics';
      baseUrl = 'https://bcourses.berkeley.edu/courses/1544880/pages/week-';
    } else if (isDataDecisions) {
      startDate = selectedCohort === 'blue' ? courseStartDates.data_blue : courseStartDates.data_gold;
      courseTitle = 'Data & Decisions';
      baseUrl = 'https://bcourses.berkeley.edu/courses/1545042/pages/week-';
    } else if (isMarketing) {
      startDate = selectedCohort === 'blue' ? courseStartDates.marketing_blue : courseStartDates.marketing_gold;
      courseTitle = 'Marketing';
      baseUrl = 'https://bcourses.berkeley.edu/courses/1545360/pages/session-';
    } else {
      startDate = selectedCohort === 'blue' ? courseStartDates.leading_blue : courseStartDates.leading_gold;
      courseTitle = 'Leading People';
      baseUrl = 'https://bcourses.berkeley.edu/courses/1545386/pages/';
    }

    // Calculate week number
    const weeksDiff = Math.floor((eventDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekNumber = Math.max(1, weeksDiff + 1); // Start from week 1

    // Generate enhanced content
    const enhancedTitle = isCourse201 
      ? `MicroEconomics Week ${weekNumber}`
      : isDataDecisions
        ? `Data & Decisions Week ${weekNumber}`
        : isMarketing
          ? `Marketing Session ${weekNumber}`
          : `Leading People Week ${weekNumber}`;
    
    const courseUrl = isCourse201 
      ? `${baseUrl}${weekNumber}`
      : isDataDecisions
        ? `${baseUrl}${weekNumber}`
        : isMarketing
          ? `${baseUrl}${weekNumber}`
          : `${baseUrl}week-${weekNumber}`;

    const enhancedDescription = `For course content for ${courseTitle}, Week ${weekNumber}, please click Event Link. `;

    console.log(`Generated course content for ${cohortEvent.title}: ${enhancedTitle} -> ${courseUrl}`);

    return {
      ...cohortEvent,
      title: enhancedTitle,
      url: courseUrl,
      description: enhancedDescription,
      location: cohortEvent.location || 'Online (bCourses)',
    };
  };

  // Client-side function to find matching event from original calendar
  const findMatchingOriginalEvent = (
    cohortEvent: CalendarEvent,
    originalEvents: CalendarEvent[]
  ): CalendarEvent | null => {
    // Always display Teams@Haas events as-is (no matching or generated content)
    if (cohortEvent.source && cohortEvent.source.toLowerCase().includes('teams@haas')) {
      return null; // explicitly no matching content
    }

    if (!originalEvents.length) {
      // No original events available - try to generate course content
      return generateCourseContent(cohortEvent);
    }

    const cohortDate = new Date(cohortEvent.start);

    // First, try exact date match
    const sameDateEvents = originalEvents.filter(originalEvent => {
      const originalDate = new Date(originalEvent.start);
      return (
        originalDate.getFullYear() === cohortDate.getFullYear() &&
        originalDate.getMonth() === cohortDate.getMonth() &&
        originalDate.getDate() === cohortDate.getDate()
      );
    });

    if (sameDateEvents.length === 0) {
      // No date match found - try to generate course content
      return generateCourseContent(cohortEvent);
    }

    // Generate the course URL for this event (we'll use it to enhance matched events)
    const generatedContent = generateCourseContent(cohortEvent);

    // If only one event on the same date, return it enhanced with generated URL
    if (sameDateEvents.length === 1) {
      console.log(`Found matching event by date: ${sameDateEvents[0].title}`);
      return {
        ...sameDateEvents[0],
        url: sameDateEvents[0].url || generatedContent?.url, // Add generated URL if ICS doesn't have one
      };
    }

    // Multiple events on same date - try to match by title similarity
    const cohortTitle = cohortEvent.title.toLowerCase();

    // Helper function to calculate title similarity
    const getTitleSimilarity = (title1: string, title2: string): number => {
      const t1 = title1.toLowerCase().replace(/[^\w\s]/g, '').trim();
      const t2 = title2.toLowerCase().replace(/[^\w\s]/g, '').trim();

      // Check for common keywords
      const keywords1 = t1.split(/\s+/);
      const keywords2 = t2.split(/\s+/);

      let matches = 0;
      for (const word1 of keywords1) {
        if (word1.length > 2) {
          // Only consider words longer than 2 characters
          for (const word2 of keywords2) {
            if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
              matches++;
              break;
            }
          }
        }
      }

      return matches / Math.max(keywords1.length, keywords2.length);
    };

    // Find the event with the highest title similarity
    let bestMatch: CalendarEvent | null = null;
    let bestSimilarity = 0;

    for (const originalEvent of sameDateEvents) {
      const similarity = getTitleSimilarity(cohortTitle, originalEvent.title);
      console.log(`Comparing "${cohortTitle}" with "${originalEvent.title.toLowerCase()}" - similarity: ${similarity}`);

      if (similarity > bestSimilarity && similarity > 0.3) {
        // Minimum 30% similarity
        bestSimilarity = similarity;
        bestMatch = originalEvent;
      }
    }

    if (bestMatch) {
      console.log(`Found best matching event (${bestSimilarity.toFixed(2)} similarity): ${bestMatch.title}`);
      return {
        ...bestMatch,
        url: bestMatch.url || generatedContent?.url, // Add generated URL if ICS doesn't have one
      };
    }

    // If no good title match, try to generate course content as fallback
    if (generatedContent) {
      console.log(`No good title match found, using generated course content: ${generatedContent.title}`);
      return generatedContent;
    }

    // Final fallback - return the first event on the same date
    if (sameDateEvents.length > 0) {
      const fallbackEvent = sameDateEvents[0] as CalendarEvent;
      console.log(`No good title match found, returning first event on same date: ${fallbackEvent.title}`);
      return fallbackEvent;
    }
    
    // Should never reach here, but return null as ultimate fallback
    return null;
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Scroll to top of page first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Find the index of this event in the current events array
    const eventIndex = currentEvents.findIndex(e => 
      e.start === event.start && e.title === event.title
    );
    setCurrentEventIndex(eventIndex);
    
    // Teams@Haas: show raw event only
    if (event.source && event.source.toLowerCase().includes('teams@haas')) {
      setSelectedEvent(event);
      setMatchedOriginalEvent(null);
      console.log(`Teams@Haas event selected (no enrichment): ${event.title}`);
      return;
    }

    // Try to find matching/enriched event from original calendar (this adds the URL!)
    const enrichedEvent = findMatchingOriginalEvent(event, cohortEvents.original || []);
    
    if (enrichedEvent) {
      console.log(`✅ Enriched event with URL: ${enrichedEvent.url}`);
      // Merge: Use the base event (has rich ICS description) but add the URL from enrichedEvent
      const mergedEvent: CalendarEvent = {
        ...event, // Start with base event (has rich description from ICS)
        url: enrichedEvent.url, // Add the generated URL
      };
      setSelectedEvent(mergedEvent);
      setMatchedOriginalEvent(null);
    } else {
      console.log(`⚠️ No enrichment found for "${event.title}"`);
      setSelectedEvent(event);
      setMatchedOriginalEvent(null);
    }
  };

  const handleNextEvent = () => {
    if (currentEventIndex < currentEvents.length - 1) {
      const nextEvent = currentEvents[currentEventIndex + 1];
      handleEventClick(nextEvent);
    }
  };

  const handlePreviousEvent = () => {
    if (currentEventIndex > 0) {
      const prevEvent = currentEvents[currentEventIndex - 1];
      handleEventClick(prevEvent);
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setMatchedOriginalEvent(null);
    setCurrentEventIndex(-1);
  };

  // Get current cohort events
  const currentEvents = cohortEvents[selectedCohort] || [];

  // Debug logging for Campus Groups
  console.log('Campus Groups Events:', cohortEvents.campusGroups?.length || 0, 'events');
  console.log('Show Campus Groups:', showCampusGroups);
  console.log('Campus Groups Events Detail:', cohortEvents.campusGroups);

  return (
    <>
      {/* Compact Header - All controls on one line */}
      <header className="mb-4 relative overflow-visible">
        <div className="relative flex items-center gap-3 flex-wrap">

          {/* Cohort Tabs - Only show if not externally controlled */}
          {!externalSelectedCohort && (
            <div 
              role="tablist" 
              className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-1 flex-shrink-0"
              aria-label="Select cohort"
            >
              <button
                role="tab"
                aria-selected={selectedCohort === 'blue'}
                aria-controls="calendar-content"
                onClick={() => handleCohortChange('blue')}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedCohort === 'blue'
                    ? 'bg-berkeley-gold text-berkeley-blue shadow-[0_0_0_2px_rgba(0,50,98,0.15)] ring-3 ring-blue-300/30 shadow-blue-500/40'
                    : 'text-white hover:bg-berkeley-blue/10'
                }`}
                style={{
                  backgroundColor: selectedCohort === 'blue' ? '#00336275' : '#00000025',
                  color: selectedCohort === 'blue' ? '#ffffff' : '#4d81b3ff'
                }}
              >
                Blue
              </button>
              <button
                role="tab"
                aria-selected={selectedCohort === 'gold'}
                aria-controls="calendar-content"
                onClick={() => handleCohortChange('gold')}
                className={`relative px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none
                  ${selectedCohort === 'gold'
                    ? 'bg-berkeley-gold text-md font-medium text-berkeley-blue shadow-[0_0_0_2px_rgba(0,50,98,0.15)] ring-3 ring-white/60 shadow-yellow-500/40'
                    : 'text-berkeley-gold hover:bg-berkeley-gold/10 focus-visible:ring-2 focus-visible:ring-yellow-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-slate-700'
                  }`}
                style={{
                  backgroundColor: selectedCohort === 'gold' ? '#FDB51595' : '#00000025',
                  color: selectedCohort === 'gold' ? '#000000' : '#FDB51575'
                }}
              >
                Gold
              </button>
            </div>
          )}

          {/* Month Navigation - Centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-0 flex-shrink-0">
            <button
              onClick={goToPreviousMonth}
              className="p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-white"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="text-lg px-10">
              <span className="font-medium text-white">{format(currentMonth, 'MMM')}</span>
              <span className="font-light text-white/60"> {format(currentMonth, 'yyyy')}</span>
            </h4>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-white"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Special Event Toggles - Dropdown - Right Anchored */}
          <div className="relative flex-shrink-0 ml-auto" ref={dropdownRef}>
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-400/10 rounded-full hover:bg-slate-800 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              aria-label="Toggle special events"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-semibold text-white/80">Events</span>

            </button>

            {/* Dropdown Menu */}
            {showEventDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 py-0 z-50 min-w-[150px]">
                
                {/* Greek Theater Toggle */}
                <label className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/greeklogo.png"
                      alt="Greek Theater"
                      width={50}
                      height={50}
                      className="object-contain filter brightness-0 dark:invert"
                    />
                    
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showGreekTheater}
                      onChange={(e) => setShowGreekTheater(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                      showGreekTheater ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`translate-y-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 mt-1 ${
                        showGreekTheater ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                </label>

                {/* UC Launch Toggle */}
                <label className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/Launch Accelerator logo.png"
                      alt="UC Launch Accelerator"
                      width={50}
                      height={50}
                      className="object-contain filter brightness-0 dark:invert"
                    />
                    
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showUCLaunch}
                      onChange={(e) => setShowUCLaunch(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                      showUCLaunch ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`translate-y-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 mt-1 ${
                        showUCLaunch ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                </label>

                {/* Cal Bears Toggle */}
                <label className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/cal_logo.png"
                      alt="Cal Bears"
                      width={40}
                      height={40}
                      className="object-contain filter brightness-0 dark:invert"
                    />
                    
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showCalBears}
                      onChange={(e) => setShowCalBears(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                      showCalBears ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`translate-y-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 mt-1 ${
                        showCalBears ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                </label>

                {/* Campus Groups Toggle */}
                <label className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Club Cal</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showCampusGroups}
                      onChange={(e) => setShowCampusGroups(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                      showCampusGroups ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <div className={`translate-y-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 mt-1 ${
                        showCampusGroups ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                </label>
              {/* COMING SOON*/}
                <label className="flex items-center justify-center text-center px-5 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extralight text-slate-300/50 dark:text-slate-300/50">
                      Custom Feeds coming soon
                    </span>
                    
                  </div>
                  
                </label>
              </div>
            )}
          </div>

       
        </div>
      </header>

      {/* Calendar Content */}
      <div id="calendar-content" role="tabpanel">
        <div className="-mx-0 -mb-0 rounded-xl overflow-hidden">
          <MonthGrid 
            events={currentEvents} 
            currentMonth={currentMonth} 
            onEventClick={handleEventClick} 
            showGreekTheater={showGreekTheater}
            showUCLaunch={showUCLaunch}
            launchEvents={cohortEvents.launch || []}
            showCalBears={showCalBears}
            calBearsEvents={cohortEvents.calBears || []}
            showCampusGroups={showCampusGroups}
            campusGroupsEvents={cohortEvents.campusGroups || []}
          />
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent} 
        originalEvent={matchedOriginalEvent}
        onClose={handleCloseModal}
        onNext={handleNextEvent}
        onPrevious={handlePreviousEvent}
        hasNext={currentEventIndex >= 0 && currentEventIndex < currentEvents.length - 1}
        hasPrevious={currentEventIndex > 0}
      />
    </>
  );
}

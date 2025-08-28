'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import Image from 'next/image';
import MonthGrid from './MonthGrid';
import EventDetailModal from './EventDetailModal';
import type { CalendarEvent, CohortEvents } from '@/lib/icsUtils';

type Props = {
  cohortEvents: CohortEvents;
  title: string;
};

type CohortType = 'blue' | 'gold';
type ViewType = 'list' | 'grid';

export default function CohortCalendarTabs({ cohortEvents, title }: Props) {
  const [selectedCohort, setSelectedCohort] = useState<CohortType>('blue');
  const [view, setView] = useState<ViewType>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // August 2025
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [matchedOriginalEvent, setMatchedOriginalEvent] = useState<CalendarEvent | null>(null);
  const [showGreekTheater, setShowGreekTheater] = useState(true);

  // Load cohort preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('calendar-cohort');
    if (saved === 'blue' || saved === 'gold') {
      setSelectedCohort(saved);
    }
  }, []);

  // Save cohort preference to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-cohort', selectedCohort);
  }, [selectedCohort]);

  const handleCohortChange = (cohort: CohortType) => {
    setSelectedCohort(cohort);
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
    
    if (!isCourse201 && !isLeadingPeople) return null;

    // Course start dates
    const courseStartDates = {
      // MicroEconomics (201) start dates
      micro_blue: new Date(2025, 6, 28), // July 28, 2025 (Monday)
      micro_gold: new Date(2025, 6, 29), // July 29, 2025 (Tuesday)
      // Leading People start dates  
      leading_blue: new Date(2025, 7, 6), // August 6, 2025
      leading_gold: new Date(2025, 7, 7), // August 7, 2025
    };

    let startDate: Date;
    let courseTitle: string;
    let baseUrl: string;
    
    if (isCourse201) {
      startDate = selectedCohort === 'blue' ? courseStartDates.micro_blue : courseStartDates.micro_gold;
      courseTitle = 'MicroEconomics';
      baseUrl = 'https://bcourses.berkeley.edu/courses/1544880/pages/week-';
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
      : `Leading People Week ${weekNumber}`;
    
    const courseUrl = isCourse201 
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

    // If only one event on the same date, return it
    if (sameDateEvents.length === 1) {
      console.log(`Found matching event by date: ${sameDateEvents[0].title}`);
      return sameDateEvents[0];
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
      return bestMatch;
    }

    // If no good title match, try to generate course content as fallback
    const courseContent = generateCourseContent(cohortEvent);
    if (courseContent) {
      console.log(`No good title match found, using generated course content: ${courseContent.title}`);
      return courseContent;
    }

    // Final fallback - return the first event on the same date
    console.log(`No good title match found, returning first event on same date: ${sameDateEvents[0].title}`);
    return sameDateEvents[0];
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    // Try to find matching event from original calendar
    const originalEvent = findMatchingOriginalEvent(event, cohortEvents.original || []);
    setMatchedOriginalEvent(originalEvent);
    
    if (originalEvent) {
      console.log(`Found matching original event for "${event.title}": "${originalEvent.title}"`);
    } else {
      console.log(`No matching original event found for "${event.title}"`);
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setMatchedOriginalEvent(null);
  };

  // Get current cohort events
  const currentEvents = cohortEvents[selectedCohort] || [];
  
  // Filter out past events for list view
  const futureEvents = currentEvents.filter(ev => new Date(ev.start) >= new Date());

  return (
    <>
      {/* Compact Header - All controls on one line */}
      <header className="mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          
          
          {/* Cohort Tabs */}
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
                color: selectedCohort === 'gold' ? '#003262' : '#FDB515'
              }}
            >
              Gold
            </button>
          </div>

          {/* Month Navigation (only show in grid view) */}
          {view === 'grid' && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={goToPreviousMonth}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white min-w-0">
                {format(currentMonth, 'MMM yyyy')}
              </h4>
              <button
                onClick={goToNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Next month"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-1 flex-shrink-0">
            <button
              onClick={() => setView('grid')}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                view === 'grid'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                view === 'list'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          {/* Greek Theater Toggle Button */}
          <div className="relative group flex-shrink-0">
            <button
              onClick={() => setShowGreekTheater(!showGreekTheater)}
              className={`p-1 rounded-md transition-colors ${
                showGreekTheater
                  ? 'bg-slate-600'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-label={showGreekTheater ? 'Hide Greek Theater events' : 'Show Greek Theater events'}
            >
              <Image 
                src="/GRREK LOGO.png" 
                alt="Greek Theater" 
                width={14}
                height={10}
                className="object-contain"
              />
            </button>
            
            {/* Floating tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              Show Greek Theater Event Dates
            </div>
          </div>
        </div>
      </header>

      {/* Calendar Content */}
      <div id="calendar-content" role="tabpanel">
        {view === 'list' ? (
          futureEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg">📅</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No upcoming events for {selectedCohort} cohort.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {futureEvents.map((ev) => {
                const start = new Date(ev.start);
                const end = ev.end ? new Date(ev.end) : undefined;
                const isAllDay = ev.allDay || (!end || (start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0));

                return (
                  <li 
                    key={ev.uid || `${ev.title}-${ev.start}`}
                    className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
                    onClick={() => handleEventClick(ev)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-slate-900 dark:text-white truncate">
                          {ev.title}
                        </h5>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-600 dark:text-slate-400">
                          <span>
                            {isAllDay 
                              ? format(start, 'MMM d, yyyy')
                              : `${format(start, 'MMM d, h:mm a')} ${end ? `- ${format(end, 'h:mm a')}` : ''}`
                            }
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              📍 {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                        selectedCohort === 'blue' ? 'bg-berkeley-blue' : 'bg-berkeley-gold'
                      }`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          <div className="-mx-5 -mb-5">
            <MonthGrid 
              events={currentEvents} 
              currentMonth={currentMonth} 
              onEventClick={handleEventClick} 
              showGreekTheater={showGreekTheater}
            />
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent} 
        originalEvent={matchedOriginalEvent}
        onClose={handleCloseModal} 
      />
    </>
  );
}

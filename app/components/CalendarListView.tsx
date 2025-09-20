'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import EventDetailModal from './EventDetailModal';
import type { CalendarEvent, CohortEvents } from '@/lib/icsUtils';

type Props = {
  cohortEvents: CohortEvents;
  title?: string;
  maxEvents?: number;
  showCohortToggle?: boolean;
  defaultCohort?: 'blue' | 'gold';
  className?: string;
};

type CohortType = 'blue' | 'gold';

export default function CalendarListView({ 
  cohortEvents, 
  title = "What's Next",
  maxEvents = 6,
  showCohortToggle = false,
  defaultCohort = 'blue'
}: Props) {
  // ALL hooks must come FIRST before any conditional logic or returns
  const [selectedCohort, setSelectedCohort] = useState<CohortType>(defaultCohort);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [matchedOriginalEvent, setMatchedOriginalEvent] = useState<CalendarEvent | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);

  // Sync with external cohort selection
  useEffect(() => {
    setSelectedCohort(defaultCohort);
    setScrollIndex(0); // Reset scroll when cohort changes
  }, [defaultCohort]);

  // Load cohort preference from localStorage on mount (if cohort toggle is shown)
  useEffect(() => {
    if (showCohortToggle) {
      const saved = localStorage.getItem('calendar-cohort');
      if (saved === 'blue' || saved === 'gold') {
        setSelectedCohort(saved);
      }
    }
  }, [showCohortToggle]);

  // Save cohort preference to localStorage (if cohort toggle is shown)
  useEffect(() => {
    if (showCohortToggle) {
      localStorage.setItem('calendar-cohort', selectedCohort);
    }
  }, [selectedCohort, showCohortToggle]);

  // Listen for glow animation triggers from MyWeekWidget
  useEffect(() => {
    const handleGlowTrigger = () => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 100); // Remove glow after 0.1 seconds
    };

    // Listen for custom event from MyWeekWidget
    window.addEventListener('triggerCalendarGlow', handleGlowTrigger);
    
    return () => {
      window.removeEventListener('triggerCalendarGlow', handleGlowTrigger);
    };
  }, []);

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

    // If only one event on the same date, return it
    if (sameDateEvents.length === 1) {
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

      if (similarity > bestSimilarity && similarity > 0.3) {
        // Minimum 30% similarity
        bestSimilarity = similarity;
        bestMatch = originalEvent;
      }
    }

    if (bestMatch) {
      return bestMatch;
    }

    // If no good title match, try to generate course content as fallback
    const courseContent = generateCourseContent(cohortEvent);
    if (courseContent) {
      return courseContent;
    }

    // Final fallback - return the first event on the same date
    return sameDateEvents[0];
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Scroll to top of page first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Teams@Haas: show raw event only
    if (event.source && event.source.toLowerCase().includes('teams@haas')) {
      setSelectedEvent(event);
      setMatchedOriginalEvent(null);
      return;
    }

    setSelectedEvent(event);
    
    // Try to find matching event from original calendar
    const originalEvent = findMatchingOriginalEvent(event, cohortEvents.original || []);
    setMatchedOriginalEvent(originalEvent);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setMatchedOriginalEvent(null);
  };

  // Get current cohort events
  const currentEvents = cohortEvents[selectedCohort] || [];
  
  // Filter out past events - show all future events
  const allFutureEvents = currentEvents
    .filter(ev => new Date(ev.start) >= new Date());
  
  // Check if there are more events to scroll to
  const hasMoreEvents = scrollIndex + maxEvents < allFutureEvents.length;
  const hasPreviousEvents = scrollIndex > 0;
  
  // Check if we can shift to show last event fully aligned to right
  const isAtEnd = scrollIndex + maxEvents >= allFutureEvents.length;
  const canShiftToRight = isAtEnd && allFutureEvents.length > maxEvents;
  const isAtRightAnchor = scrollIndex === Math.max(0, allFutureEvents.length - maxEvents);
  
  // Calculate which events to display based on scroll index
  // When at right anchor, show fewer events to ensure last one is fully visible
  const effectiveMaxEvents = isAtRightAnchor ? Math.min(5, maxEvents) : maxEvents;
  const displayedEvents = allFutureEvents.slice(scrollIndex, scrollIndex + effectiveMaxEvents);
  
  // Show next arrow if there are more events OR if we can shift to right anchor
  const showNextArrow = hasMoreEvents || (canShiftToRight && !isAtRightAnchor);
  
  // Handle scroll to next event
  const handleScrollNext = () => {
    if (hasMoreEvents) {
      // Normal scrolling - move one event forward
      setScrollIndex(prev => prev + 1);
    } else if (canShiftToRight && !isAtRightAnchor) {
      // At the end but not right-anchored - shift to show last event fully
      const totalEvents = allFutureEvents.length;
      const rightAnchorIndex = Math.max(0, totalEvents - maxEvents);
      setScrollIndex(rightAnchorIndex);
    }
  };

  // Handle scroll to previous event
  const handleScrollPrevious = () => {
    if (hasPreviousEvents) {
      setScrollIndex(prev => prev - 1);
    }
  };

  return (
    <div 
      className={`calendar-list-widget p-1 rounded-xl transition-all duration-1000 ${
        isGlowing 
          ? 'ring-4 ring-blue-400/60 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 shadow-lg shadow-blue-500/30' 
          : ''
      }`} 
      style={{
        boxShadow: isGlowing && selectedCohort === 'blue' 
          ? '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 80px rgba(59, 130, 246, 0.1)'
          : undefined
      }}
      data-calendar-list-view
    >
      {/* Widget Header */}
      <div className="widget-header">
        <header className="header-container mb-2 bg-berkeley-blue/90 dark:bg-berkeley-blue/80 w-full flex items-center justify-start px-0 py-0  rounded-tr-lg rounded-tl-none">
          <h3 className="text-white text-base urbanist-medium tracking-wide leading-none m-0 p-0">
            {title}
          </h3>
        </header>
      </div>

      {/* Widget Content */}
      <div className="widget-content px-0 py-0 relative">
        {/* Events List */}
        {displayedEvents.length === 0 ? (
          <div className="empty-state text-center py-8">
            <div className="empty-icon w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📅</span>
            </div>
            <p className="empty-message text-sm text-slate-600 dark:text-slate-400">
              No upcoming events for {selectedCohort} cohort.
            </p>
          </div>
        ) : (
          <div className="events-container overflow-x-auto mb-0">
            <div className="flex gap-4 pl-1.5" style={{ minWidth: 'max-content' }}>
              {displayedEvents.map((ev) => {
                const start = new Date(ev.start);
                const end = ev.end ? new Date(ev.end) : undefined;
                const isAllDay = ev.allDay || (!end || (start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0));

                // Calculate days remaining
                const today = new Date();
                const eventDate = new Date(start);
                
                // Reset time to start of day for accurate day calculation
                today.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                
                const diffInMs = eventDate.getTime() - today.getTime();
                const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
                
          // Generate days remaining text
          let daysRemainingText = '';
          if (diffInDays === 0) {
            daysRemainingText = 'Today';
          } else if (diffInDays === 1) {
            daysRemainingText = 'Tomorrow';
          } else if (diffInDays > 1) {
            daysRemainingText = `${diffInDays} Days Remaining`;
          } else {
            daysRemainingText = `${Math.abs(diffInDays)} Day's Ago`;
          }

          // Generate color for the day indicator circle based on days remaining
          const getDayIndicatorColor = (days: number): string => {
            if (days <= 0) return '#ef4444'; // Today or past - red-500 equivalent
            if (days === 1) return '#f97316'; // Tomorrow - orange-500
            if (days === 2) return '#f59e0b'; // 2 days - amber-500
            if (days === 3) return '#eab308'; // 3 days - yellow-500
            if (days === 4) return '#84cc16'; // 4 days - lime-500
            if (days === 5) return '#22c55e'; // 5 days - green-500
            if (days === 6) return '#06b6d4'; // 6 days - cyan-500
            if (days === 7) return '#14b8a680'; // 7 days - medium opacity teal (50% opacity)
            return '#14b8a680'; // 7+ days - medium opacity teal (50% opacity)
          };

          const circleColor = getDayIndicatorColor(diffInDays);

          return (
            <div 
            key={ev.uid || `${ev.title}-${ev.start}`}
            className="event-card flex-shrink-0 w-52 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-amber-50 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover: transition-all duration-300 ease-in-out cursor-pointer"
            onClick={() => handleEventClick(ev)}
            >
            <div className="event-content flex flex-col h-full">
              {/* Days remaining indicator */}
              <div 
              className="text-xs mb-1 urbanist-medium"
              style={{ color: circleColor }}
              >
              {daysRemainingText}
              </div>
              <h4 className="event-title urbanist-medium text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 flex-grow">
              {ev.title}
              </h4>
              <div className="event-meta space-y-1 mt-auto">
              <div className="event-time text-xs text-slate-600 dark:text-slate-400">
                <div 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: circleColor }}
                ></div>
                <span className="">
                {isAllDay 
                  ? format(start, 'MMM d, yyyy')
                  : `${format(start, 'MMM d, h:mm a')} ${end ? `- ${format(end, 'h:mm a')}` : ''}`
                }
                </span>
              </div>
              </div>
            </div>
            </div>
          );
          })}
        </div>
        </div>
      )}
      
      {/* Scroll indicators for navigation */}
      {hasPreviousEvents && (
        <div className="absolute top-5 left-0.5 bottom-2">
        <div 
          className="w-6 h-20 glass-nav-button rounded-xl flex items-center justify-center cursor-pointer"
          onClick={handleScrollPrevious}
        >
          <svg 
          className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:text-white transition-colors duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        </div>
      )}
      
      {/* Scroll indicator for more events - positioned in widget container */}
      {showNextArrow && (
        <div className="absolute top-5 right-0.5 bottom-2">
        <div 
          className="w-6 h-20 glass-nav-button rounded-xl flex items-center justify-center cursor-pointer"
          onClick={handleScrollNext}
        >
          <svg 
          className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:text-white transition-colors duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        </div>
      )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal 
      event={selectedEvent} 
      originalEvent={matchedOriginalEvent}
      onClose={handleCloseModal} 
      />
    </div>
  );
}

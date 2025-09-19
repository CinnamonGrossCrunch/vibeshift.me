'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type WeeklyEvent = {
  date: string;
  time?: string;
  title: string;
  type: 'assignment' | 'class' | 'exam' | 'administrative' | 'social' | 'newsletter' | 'other';
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  location?: string;
  url?: string;
};

type MyWeekData = {
  weekStart: string;
  weekEnd: string;
  blueEvents: WeeklyEvent[];
  goldEvents: WeeklyEvent[];
  blueSummary?: string;
  goldSummary?: string;
  processingTime?: number;
};

type CohortType = 'blue' | 'gold';

interface MyWeekWidgetProps {
  // New unified approach: direct data from unified API
  data?: MyWeekData;
  selectedCohort?: CohortType;
  
  // Legacy approach: for backwards compatibility (will fetch from old API)
  cohortEvents?: CohortEvents;
  newsletterData?: NewsletterData | Payload | null;
}

// Type definitions to match my-week-analyzer.ts
interface CohortEvent {
  start: string;
  end?: string;
  title: string;
  summary?: string;
  description?: string;
  location?: string;
  url?: string;
}

interface CohortEvents {
  blue?: CohortEvent[];
  gold?: CohortEvent[];
}

interface NewsletterData {
  sections: {
    sectionTitle: string;
    items: {
      title: string;
      html: string;
      timeSensitive?: {
        dates: string[];
        deadline?: string;
        eventType: 'deadline' | 'event' | 'announcement' | 'reminder';
        priority: 'high' | 'medium' | 'low';
      };
    }[];
  }[];
}

// Basic newsletter type for backwards compatibility
interface Payload {
  sourceUrl: string;
  title?: string;
  sections: {
    sectionTitle: string;
    items: {
      title: string;
      html: string;
    }[];
  }[];
}

export default function MyWeekWidget({ data, selectedCohort = 'blue', cohortEvents, newsletterData }: MyWeekWidgetProps) {
  const [weekData, setWeekData] = useState<MyWeekData | null>(data || null);
  const [loading, setLoading] = useState(!data); // If data provided, don't start loading
  const [error, setError] = useState<string | null>(null);

  // Function to handle MyWeek event clicks
  const handleEventClick = (event: React.MouseEvent<HTMLAnchorElement>, eventTitle: string) => {
    event.preventDefault();
    
    // Trigger glow animation on calendar list view
    const calendarElement = document.querySelector('[data-calendar-list-view]');
    if (calendarElement) {
      calendarElement.classList.add('ring-4', 'ring-berkeley-blue/50', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-slate-900');
      
      // Remove the glow after 2 seconds
      setTimeout(() => {
        calendarElement.classList.remove('ring-4', 'ring-berkeley-blue/50', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-slate-900');
      }, 2000);
    }
    
    console.log(`📅 Directing attention to calendar for: ${eventTitle}`);
  };

  // Temporary debug to understand the data issue
  useEffect(() => {
    if (data) {
      console.log('🔍 MyWeekWidget received data:', {
        weekStart: data.weekStart,
        weekEnd: data.weekEnd,
        blueEvents: data.blueEvents?.length || 0,
        goldEvents: data.goldEvents?.length || 0,
        blueSummary: data.blueSummary ? 'Present' : 'Missing',
        goldSummary: data.goldSummary ? 'Present' : 'Missing',
        selectedCohort,
        actualBlueEvents: data.blueEvents,
        actualGoldEvents: data.goldEvents
      });
    }
  }, [data, selectedCohort]);

  useEffect(() => {
    // If direct data is provided, use it and skip API calls
    if (data) {
      setWeekData(data);
      setLoading(false);
      return;
    }
    
    // Legacy approach: fetch from old API if no direct data provided
    const fetchWeekData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/my-week', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cohortEvents,
            newsletterData
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch week data: ${response.status}`);
        }

        const data = await response.json();
        setWeekData(data);
      } catch (err) {
        console.error('Error fetching week data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have data to analyze
    if (cohortEvents || newsletterData) {
      fetchWeekData();
    } else {
      setLoading(false);
    }
  }, [data, cohortEvents, newsletterData]);

  const formatDate = (dateString: string) => {
    // Handle timezone issues by parsing the date as UTC to avoid local timezone shifts
    const date = new Date(dateString + 'T12:00:00'); // Add noon to avoid timezone edge cases
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventIcon = (type: WeeklyEvent['type']) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'class': return '🎓';
      case 'exam': return '📊';
      case 'administrative': return '📋';
      case 'social': return '🎉';
      case 'newsletter': return '📰';
      case 'other': return '📌';
      default: return '📅';
    }
  };

  const getEventColor = (type: WeeklyEvent['type'], priority?: WeeklyEvent['priority']) => {
    // High priority items get stronger colors
    if (priority === 'high') {
      switch (type) {
        case 'assignment': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
        case 'exam': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
        default: return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      }
    }
    
    // Regular colors for medium/low priority
    switch (type) {
      case 'assignment': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'class': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'exam': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'administrative': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'social': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'newsletter': return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
      case 'other': return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
      default: return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityIndicator = (priority?: WeeklyEvent['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Week</h3>
          <div className="w-4 h-4 border-2 border-slate-300 border-t-berkeley-blue rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Analyzing your week...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-lg">⚠️</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 text-center">Unable to Load Week</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">{error}</p>
      </div>
    );
  }

  // Get cohort-specific events and summary
  const currentEvents = selectedCohort === 'blue' ? weekData?.blueEvents : weekData?.goldEvents;
  const currentSummary = selectedCohort === 'blue' ? weekData?.blueSummary : weekData?.goldSummary;

  if (!weekData || !currentEvents?.length) {
    return (
      <div className="p-6">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-lg">📅</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 text-center">My Week - {selectedCohort.charAt(0).toUpperCase() + selectedCohort.slice(1)} Cohort</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">No events found for the {selectedCohort} cohort this week.</p>
      </div>
    );
  }

  // Group events by date
  const eventsByDate = currentEvents.reduce((acc: Record<string, WeeklyEvent[]>, event: WeeklyEvent) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, WeeklyEvent[]>);

  return (
    <div className="py-4 mb-8">
      {/* Main Layout: Left to Right Flow */}
      <div className=" rounded-2xl flex items-start gap-6">
        {/* Left Column: Current Date */}

        <div className="text-start shrink-0">
          <div className="text-2xl font-extralight text-slate-600 dark:text-slate-400 mt-1 px-2 mb-1">
            My Week
          </div>
                <div className="text-5xl mx-2 font-medium text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { month: 'short' })}{' '}
                <span className="text-white/60">{new Date().toLocaleDateString('en-US', { day: 'numeric' })}</span>
                </div>
        </div>

        {/* Middle Column: AI Summary and Events */}
        <div className="flex-1 p-1 space-y-0">
          {/* AI Summary */}
          {currentSummary && (
            <div className="flex items-start gap-3">
              <div className="w-1 h-full bg-berkeley-blue/30 dark:bg-berkeley-blue/50 rounded-full min-h-[60px] mt-0"></div>
              <div className=" bg-berkeley-blue/10 dark:bg-berkeley-blue/20 rounded-2xl">
                <p className="text-md font-medium text-slate-700 dark:text-slate-300 leading-loose">
                  {currentSummary}
                </p>
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(eventsByDate)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, events]) => (
                <div key={date} className="flex ml-2 items-center gap-2 mb-0">
                  {/* Date Header */}
                  <div className="text-center text-sm font-semibold text-slate-900 dark:text-white min-w-[100px] shrink-0">
                    {formatDate(date)}
                  </div>
                  
                  {/* Events for this date */}
                  <div className="flex  gap-2 flex-1">
                    {events.map((event, index) => (
                      <div key={index} className={`flex items-center space-x-2 rounded-lg px-3 py-1 group min-w-fit ${getEventColor(event.type, event.priority)}`}>
                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline space-x-2">
                            <h4 className={`text-sm font-light group-hover:opacity-80 transition-opacity truncate`}>
                              {event.url && event.url !== 'No URL' ? (
                                <a 
                                  href="#" 
                                  onClick={(e) => handleEventClick(e, event.title)}
                                  className="hover:underline cursor-pointer"
                                >
                                  {event.title}
                                </a>
                              ) : (
                                event.title
                              )}
                            </h4>

                            {/* Time and Location */}
                            <div className="flex items-baseline space-x-2 text-xs text-slate-600 dark:text-slate-400">
                              {event.time && (
                                <span>{event.time}</span>
                              )}
                              {event.location && (
                                <>
                                  <Image src="/images/location-icon.png" alt="location" width={14} height={14} className="w-3.5 h-3.5" />
                                  <span>{event.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

       
      </div>
    </div>
  );
}

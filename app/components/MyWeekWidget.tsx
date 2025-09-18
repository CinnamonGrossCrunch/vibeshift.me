'use client';

import { useState, useEffect } from 'react';

type WeeklyEvent = {
  date: string;
  time?: string;
  title: string;
  type: 'calendar' | 'newsletter' | 'academic' | 'social';
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          My Week - {selectedCohort.charAt(0).toUpperCase() + selectedCohort.slice(1)} Cohort
        </h3>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(weekData.weekStart)} - {formatDate(weekData.weekEnd)}
        </div>
      </div>

      {/* AI Summary */}
      {currentSummary && (
        <div className="mb-4 p-3 bg-berkeley-blue/10 dark:bg-berkeley-blue/20 rounded-2xl">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentSummary}
          </p>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(eventsByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, events]) => (
            <div key={date} className="flex items-center gap-2 mb-1">
              {/* Date Header */}
              <div className="text-sm font-medium text-slate-900 dark:text-white min-w-[100px] shrink-0">
                {formatDate(date)}
              </div>
              
              {/* Events for this date */}
              <div className="flex flex-wrap gap-2 flex-1">
                {events.map((event, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/10 dark:bg-slate-800/20 rounded-lg px-3 py-2 group min-w-fit">
                   
                    
                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <h4 className={`text-sm font-light group-hover:opacity-80 transition-opacity truncate`}>
                          {event.url ? (
                            <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {event.title}
                            </a>
                          ) : (
                            event.title
                          )}
                        </h4>

                        {/* Time and Location */}
                        <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                          {event.time && (
                            <span>{event.time}</span>
                          )}
                          {event.location && (
                            <span>📍 {event.location}</span>
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

      {/* Footer */}
      {weekData.processingTime && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Analyzed in {weekData.processingTime}ms
          </div>
        </div>
      )}
    </div>
  );
}

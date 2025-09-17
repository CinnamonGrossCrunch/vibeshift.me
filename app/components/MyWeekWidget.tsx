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
  events: WeeklyEvent[];
  aiSummary?: string;
  processingTime?: number;
};

interface MyWeekWidgetProps {
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

export default function MyWeekWidget({ cohortEvents, newsletterData }: MyWeekWidgetProps) {
  const [weekData, setWeekData] = useState<MyWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [cohortEvents, newsletterData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventIcon = (type: WeeklyEvent['type']) => {
    switch (type) {
      case 'calendar': return '📅';
      case 'newsletter': return '📰';
      case 'academic': return '🎓';
      case 'social': return '🎉';
      default: return '📌';
    }
  };

  const getEventColor = (type: WeeklyEvent['type']) => {
    switch (type) {
      case 'calendar': return 'text-blue-600 dark:text-blue-400';
      case 'newsletter': return 'text-green-600 dark:text-green-400';
      case 'academic': return 'text-purple-600 dark:text-purple-400';
      case 'social': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700">
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
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-lg">⚠️</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 text-center">Unable to Load Week</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">{error}</p>
      </div>
    );
  }

  if (!weekData || !weekData.events.length) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-lg">📅</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 text-center">My Week</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">No events found for this week.</p>
      </div>
    );
  }

  // Group events by date
  const eventsByDate = weekData.events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, WeeklyEvent[]>);

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-4xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Week</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(weekData.weekStart)} - {formatDate(weekData.weekEnd)}
        </div>
      </div>

      {/* AI Summary */}
      {weekData.aiSummary && (
        <div className="mb-4 p-3 bg-berkeley-blue/10 dark:bg-berkeley-blue/20 rounded-2xl">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {weekData.aiSummary}
          </p>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(eventsByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, events]) => (
            <div key={date} className="space-y-2">
              {/* Date Header */}
              <div className="text-sm font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                {formatDate(date)}
              </div>
              
              {/* Events for this date */}
              <div className="space-y-2 ml-2">
                {events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    {/* Event Icon */}
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <span className="text-sm">{getEventIcon(event.type)}</span>
                    </div>
                    
                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${getEventColor(event.type)} group-hover:opacity-80 transition-opacity`}>
                            {event.url ? (
                              <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {event.title}
                              </a>
                            ) : (
                              event.title
                            )}
                          </h4>
                          
                          {/* Time and Location */}
                          <div className="flex items-center space-x-3 mt-1">
                            {event.time && (
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                {event.time}
                              </span>
                            )}
                            {event.location && (
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                📍 {event.location}
                              </span>
                            )}
                          </div>
                          
                          {/* Description */}
                          {event.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {event.description}
                            </p>
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

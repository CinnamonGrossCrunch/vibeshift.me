'use client';

import { useState, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from 'next/image';
import { formatConsistentDate } from '@/lib/date-utils';

type WeeklyEvent = {
  date: string;
  time?: string;
  title: string;
  type: 'assignment' | 'class' | 'exam' | 'administrative' | 'social' | 'newsletter' | 'other';
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  location?: string;
  url?: string;
  // Source tracking for newsletter items
  sourceType?: 'calendar' | 'newsletter';
  newsletterSource?: {
    sectionTitle: string;
    sectionIndex: number;
    itemTitle: string;
    itemIndex: number;
  };
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
  // Direct data from unified API
  data?: MyWeekData;
  selectedCohort?: CohortType;
}

export default function MyWeekWidget({ data, selectedCohort = 'blue' }: MyWeekWidgetProps) {
  const [weekData, setWeekData] = useState<MyWeekData | null>(data || null);
  const [loading, setLoading] = useState(!data); // If data provided, don't start loading

  // Function to handle MyWeek event clicks
  const handleEventClick = (event: React.MouseEvent, eventData: WeeklyEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log(`🖱️ MyWeek event clicked: ${eventData.title}`);
    console.log(`🔍 Event source type:`, eventData.sourceType);
    
    // Check if this is a newsletter-sourced event
    if (eventData.sourceType === 'newsletter' && eventData.newsletterSource) {
      console.log(`📰 Newsletter item clicked - opening newsletter section`);
      console.log(`Section: ${eventData.newsletterSource.sectionTitle} (index ${eventData.newsletterSource.sectionIndex})`);
      console.log(`Item: ${eventData.newsletterSource.itemTitle} (index ${eventData.newsletterSource.itemIndex})`);
      
      // HIERARCHY CHECK: Is newsletter widget visible?
      const newsletterWidget = document.querySelector('[data-newsletter-widget]') as HTMLElement | null;
      const isNewsletterVisible = newsletterWidget && 
        newsletterWidget.offsetParent !== null && // Element is not display:none
        newsletterWidget.getBoundingClientRect().height > 0; // Element has height
      
      console.log(`👀 Newsletter visibility check: ${isNewsletterVisible ? 'VISIBLE' : 'HIDDEN (inactive tab)'}`);
      
      if (!isNewsletterVisible) {
        // CASE 1: Newsletter is hidden (mobile/small screen with inactive tab)
        console.log(`🔄 Step 1: Switching to Updates tab...`);
        
        // Switch to Updates tab first
        const switchTabEvent = new CustomEvent('switchToTab', {
          detail: {
            tabName: 'Updates',
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(switchTabEvent);
        
        // Wait for tab switch, then expand/highlight
        setTimeout(() => {
          console.log(`📬 Step 2: Tab active - now opening newsletter section`);
          const openNewsletterEvent = new CustomEvent('openNewsletterSection', {
            detail: {
              sectionIndex: eventData.newsletterSource!.sectionIndex,
              itemIndex: eventData.newsletterSource!.itemIndex,
              sectionTitle: eventData.newsletterSource!.sectionTitle,
              itemTitle: eventData.newsletterSource!.itemTitle,
              timestamp: Date.now()
            }
          });
          window.dispatchEvent(openNewsletterEvent);
        }, 150); // Wait for tab switch animation
      } else {
        // CASE 2: Newsletter already visible - proceed directly
        console.log(`✅ Newsletter visible - opening section directly`);
        
        const openNewsletterEvent = new CustomEvent('openNewsletterSection', {
          detail: {
            sectionIndex: eventData.newsletterSource.sectionIndex,
            itemIndex: eventData.newsletterSource.itemIndex,
            sectionTitle: eventData.newsletterSource.sectionTitle,
            itemTitle: eventData.newsletterSource.itemTitle,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(openNewsletterEvent);
      }
      
      // Note: No scrolling - just expands section/subsection and adds highlight animation
    } else {
      // Calendar-sourced event - use existing behavior
      console.log(`📅 Calendar event clicked - triggering calendar glow`);
      
      // Trigger glow animation on calendar list view via custom event
      const glowEvent = new CustomEvent('triggerCalendarGlow', { 
        detail: { eventTitle: eventData.title, timestamp: Date.now() }
      });
      
      console.log(`🚀 About to dispatch glow event:`, glowEvent);
      window.dispatchEvent(glowEvent);
      console.log(`✨ Dispatched glow event for: ${eventData.title}`);
      
      // Add a small delay then check if calendar element exists
      setTimeout(() => {
        const calendarElement = document.querySelector('[data-calendar-list-view]');
        if (calendarElement) {
          console.log(`📍 Found calendar element, scrolling to it`, calendarElement);
          calendarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.log(`❌ Calendar element not found with selector: [data-calendar-list-view]`);
          // Try alternative selectors
          const altElement = document.querySelector('.calendar-list-widget');
          if (altElement) {
            console.log(`📍 Found calendar widget via alternative selector`, altElement);
            altElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
      
      console.log(`📅 Directing attention to calendar for: ${eventData.title}`);
    }
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
    // If direct data is provided, use it
    if (data) {
      setWeekData(data);
      setLoading(false);
      return;
    }
    
    // No data provided - component requires data prop from parent
    setLoading(false);
  }, [data]);

  const formatDate = (dateString: string) => {
    // Use the consistent date formatting utility
    return formatConsistentDate(dateString);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      case 'assignment': return 'bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-300/50';
      case 'exam': return 'bg-orange-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-300/50';
      default: return 'bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-300/50';
      }
    }
    
    // Regular colors for medium/low priority
    switch (type) {
      case 'assignment': return 'bg-amber-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300/50';
      case 'class': return 'bg-blue-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300/50';
      case 'exam': return 'bg-orange-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-300/50';
      case 'administrative': return 'bg-purple-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-300/50';
      case 'social': return 'bg-green-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-300/50';
      case 'newsletter': return 'bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/50';
      case 'other': return 'bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-300/50';
      default: return 'bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/50';
    }
  };

  // const getPriorityIndicator = (priority?: WeeklyEvent['priority']) => {
  //   switch (priority) {
  //     case 'high': return '🔴';
  //     case 'medium': return '🟡';
  //     case 'low': return '🟢';
  //     default: return '';
  //   }
  // };

  if (loading) {
    return (
      <div className="p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Week</h3>
          <div className="w-4 h-4 border-2 border-slate-300 border-t-berkeley-blue rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-slate-400">Analyzing your week...</p>
      </div>
    );
  }

  // Get cohort-specific events and summary
  const currentEvents = selectedCohort === 'blue' ? weekData?.blueEvents : weekData?.goldEvents;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentSummary = selectedCohort === 'blue' ? weekData?.blueSummary : weekData?.goldSummary;



  if (!weekData || !currentEvents?.length) {
    return (
      <div className="p-6 ">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-lg">📅</span>
        </div>
        <h3 className="text-base font-semibold text-white mb-2 text-center">My Week - {selectedCohort.charAt(0).toUpperCase() + selectedCohort.slice(1)} Cohort</h3>
        <p className="text-sm text-slate-400 text-center">No events found for the {selectedCohort} cohort this week.</p>
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
    <div className="hidden md:flex w-full lg:mr-35 items-end">
      {/* Main Layout: Mobile vertical, Desktop horizontal */}
      <div className="w-full flex flex-col md:flex-row md:items-start gap-0 md:gap-6 md:rounded-2xl">
        {/* Header Section: "My Week" and Today's Date */}
        <div className="text-start mt-0 shrink-0 min-w-0 mb-2 md:mb-0 px-3 sm:px-0">
          <div className="text-2xl font-extralight text-slate-400 mt-0 px-0 mb-1">
            My Week
          </div>
          <div className="text-5xl font-medium text-white">
            {new Date().toLocaleDateString('en-US', { month: 'short' })}{' '}
            <span className="text-white/60">{new Date().toLocaleDateString('en-US', { day: 'numeric' })}</span>
          </div>
        </div>

        {/* Events Section */}
        <div className="flex-1 min-w-0 md:p-1 space-y-0 w-full px-0">
          {/* AI Summary */}
          {/* {currentSummary && (
            <div className="flex items-start backdrop-blur-md bg-turbulence gap-3 rounded-2xl p-1 mb-1">
              <div className="w-1 h-full rounded-full min-h-[60px] mt-0"></div>
              <div className=" rounded-2xl">
                <p className="text-md font-medium text-slate-300 leading-loose">
                  {currentSummary}
                </p>
              </div>
            </div>
          )} */}

          {/* Events List - Hidden on mobile, vertical stack on desktop */}
            <div className="hidden md:flex md:flex-col md:gap-0 md:space-y-1 md:max-h-96 w-full">
            {/* Desktop: Only show days with events */}
            {Object.entries(eventsByDate)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, events]) => (
                <div key={date} className="flex flex-row rounded-md bg-violet-900/20 items-center gap-1 mb-1">
                  {/* Date Header - Fixed width on desktop */}
                  <div className="text-center w-24 text-sm font-semibold text-slate-100 px-2 py-0 shrink-0">
                    {formatDate(date)}
                  </div>
                  
                  {/* Events for this date - Stack vertically */}
                  <div className="flex-0 overflow-hidden gap-2 flex-1 flex flex-col">
                    {events.map((event, index) => (
                      <div 
                        key={index} 
                        className={`flex-0 items-center space-x-2 border-b border-slate-900 rounded-sm px-3 py-0.5 group cursor-pointer hover:brightness-150 transition-all ${getEventColor(event.type, event.priority)}`}
                        onClick={(e) => handleEventClick(e, event)}
                      >
                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline space-x-2">
                            <h4 className={`text-sm font-medium text-white group-hover:opacity-80 transition-opacity truncate`}>
                              {event.title}
                            </h4>

                            {/* Time and Location */}
                            {/* <div className="flex items-baseline space-x-2 text-xs text-slate-400">
                              {event.time && (
                                <span>{event.time}</span>
                              )}
                              {event.location && (
                                <>
                                  <Image src="/images/location-icon.png" alt="location" width={14} height={14} className="w-3.5 h-3.5" />
                                  <span>{event.location}</span>
                                </>
                              )}
                            </div> */}
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
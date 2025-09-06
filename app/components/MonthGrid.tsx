'use client';

import { useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format } from 'date-fns';
import Image from 'next/image';
import type { CalendarEvent } from '@/lib/icsUtils';
import { hasGreekTheaterEventOnDate, getGreekTheaterEventsForDate, greekTheaterToCalendarEvent } from '@/lib/greekTheater';

type Props = {
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
  showGreekTheater?: boolean;
  showUCLaunch?: boolean;
  launchEvents?: CalendarEvent[];
  showCalBears?: boolean;
  calBearsEvents?: CalendarEvent[];
};

export default function MonthGrid({ 
  events, 
  currentMonth, 
  onEventClick, 
  showGreekTheater = true, 
  showUCLaunch = true,
  launchEvents = [],
  showCalBears = true,
  calBearsEvents = []
}: Props) {
  // Remove the internal state since month is controlled by parent
  // const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1));

  // Compute grid days
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }); // Sunday start
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div>
      {/* Remove any potential navigation wrapper */}
      <div className="grid grid-cols-7 gap-px bg-white/10 dark:bg-slate-700/10 border border-white/15 dark:border-slate-600/15">
      {/* Weekday headers */}
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
        <div key={d} className="bg-white/5 dark:bg-slate-600/5 text-xs text-center  font-light uppercase tracking-wide text-slate-700 dark:text-slate-300">
          {d}
        </div>
      ))}

      {/* Days */}
      {days.map((day) => {
        const dayEvents = events.filter((ev) =>
          isSameDay(new Date(ev.start), day)
        );
        
        // Add UC Launch events for this day if they should be shown
        const dayLaunchEvents = showUCLaunch ? launchEvents.filter((ev) =>
          isSameDay(new Date(ev.start), day)
        ) : [];
        
        // Add Cal Bears events for this day if they should be shown
        const dayCalBearsEvents = showCalBears ? calBearsEvents.filter((ev) =>
          isSameDay(new Date(ev.start), day)
        ) : [];
        
        // Combine regular events with launch events and Cal Bears events
        const allDayEvents = [...dayEvents, ...dayLaunchEvents, ...dayCalBearsEvents];

        const isToday = isSameDay(day, new Date());
        const hasGreekEvent = hasGreekTheaterEventOnDate(day);
        const hasCalBearsEvent = showCalBears && dayCalBearsEvents.length > 0;

        // Function to parse event title and extract course name and assignment
        const parseEventTitle = (title: string) => {
          let courseName = '';
          let assignment = '';
          
          // Debug: log the title to see what we're working with
          console.log('Parsing title:', title);
          
          // Handle titles like "Part 1 - Interview Report  [EWMBA 205-LEC-01A & 02A FA25]"
          if (title.includes('EWMBA 205')) {
            courseName = 'Leading People (205)';
            
            // Extract assignment part before the [EWMBA...] bracket
            const assignmentMatch = title.match(/^(.+?)\s*\[EWMBA/);
            if (assignmentMatch) {
              assignment = assignmentMatch[1].trim();
            }
            
            console.log('Course:', courseName, 'Assignment:', assignment);
          } else if (title.match(/EWMBA \d+/)) {
            // Extract course number and convert to readable format
            const courseMatch = title.match(/EWMBA (\d+)/);
            if (courseMatch) {
              const courseNum = courseMatch[1];
              const courseMappings: { [key: string]: string } = {
                '201': 'Microeconomics',
                '202': 'Data & Decisions',
                '203': 'Financial Accounting',
                '204': 'Organizational Behavior',
                '205': 'Leading People',
                '206': 'Operations',
                '207': 'Corporate Finance',
                '208': 'Marketing',
                '209': 'Strategy',
                '210': 'Business Ethics',
              };
              const courseTitle = courseMappings[courseNum] || `EWMBA ${courseNum}`;
              courseName = `${courseTitle} (${courseNum})`;
              
              // Extract assignment from title - content before [EWMBA...]
              const assignmentMatch = title.match(/^(.+?)\s*\[EWMBA/);
              if (assignmentMatch) {
                assignment = assignmentMatch[1].trim();
              }
            }
          } else {
            // For other events, try to find assignment pattern
            const parts = title.split(' - ');
            if (parts.length > 1) {
              courseName = parts[0];
              assignment = parts[1];
            } else {
              courseName = title;
            }
          }
          
          return { courseName, assignment };
        };

        // Function to get course color based on ICS source file
        const getCourseColor = (event: CalendarEvent) => {
          const hoverGold = 'hover:border-[#FDB515]'; // Berkeley Gold
          const glassBase = 'backdrop-blur-sm bg-clip-padding saturate-50 shadow-sm';

          // Check for UC Launch events FIRST - Orange styling
          if (event.source && event.source.includes('uc_launch_events')) {
            return `${glassBase} bg-orange-800/40 border-orange-700/40 text-white ${hoverGold}`;
          }

          // Check for Cal Bears events - Blue and Gold styling
          if (event.source && event.source.includes('cal_bears_home')) {
            return `${glassBase} bg-blue-800/40 border-yellow-500/40 text-white ${hoverGold}`;
          }

          // Check for Teams@Haas events FIRST (before source-based detection)
            // because Teams@Haas events are in the 205 ICS files but should have purple styling
          if (event.title.includes('Teams@Haas')) {
            return `${glassBase} bg-violet-800/40 border-violet-900/40 text-white ${hoverGold}`;
          }

          // Check the source filename to determine course type
          if (event.source) {
            // EWMBA 201 (Microeconomics) - Dark Green
            if (event.source.includes('201a_micro')) {
              return `${glassBase} bg-green-800/35 border-green-700/40 text-white ${hoverGold}`;
            }

            // EWMBA 205 (Leading People) - Dark Red
            if (event.source.includes('205_')) {
              return `${glassBase} bg-red-800/35 border-red-700/40 text-white ${hoverGold}`;
            }
          }
          
          // Fallback to title-based detection for backwards compatibility
          const title = event.title;
          
          // EWMBA 201 (Microeconomics) - Dark Green with 50% opacity
          if (title.includes('EWMBA 201') || title.includes('Microeconomics')) {
            return `bg-green-800/50 border-green-700/30 text-white ${hoverGold}`;
          }
          
          // EWMBA 205 (Leading People) - Dark Red with 50% opacity  
          if (title.includes('EWMBA 205') || title.includes('Leading People')) {
            return `bg-red-800/50 border-red-700/30 text-white ${hoverGold}`;
          }
          
          // Other courses - keeping existing colors
          if (title.includes('EWMBA 202')) return `bg-blue-500/10 border-blue-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 203')) return `bg-teal-500/10 border-teal-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 204')) return `bg-pink-500/10 border-pink-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 206')) return `bg-indigo-500/10 border-indigo-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 207')) return `bg-emerald-500/10 border-emerald-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 208')) return `bg-rose-500/10 border-rose-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 209')) return `bg-purple-500/10 border-purple-500/30 text-white ${hoverGold}`;
          if (title.includes('EWMBA 210')) return `bg-cyan-500/10 border-cyan-500/30 text-white ${hoverGold}`;
          
          return `bg-slate-100 border-slate-200 text-slate-900 ${hoverGold}`;
        };
        

        return (
          <div
            key={day.toISOString()}
            className={`h-28 p-1 flex flex-col border-t border-white/5 dark:border-slate-600/5 overflow-hidden ${
              isSameMonth(day, currentMonth) ? 'bg-white/5 dark:bg-slate-700/5' : 'bg-transparent opacity-40'
            } ${isToday ? 'rounded-sm  ring-1 ring-yellow-400 '  : ''}`}
          >
            <div className={`text-xs font-medium mb-1 flex-shrink-0 flex items-center gap-1 ${
              isToday ? 'text-yellow-500 font-bold' : 'text-slate-900 dark:text-white'
            }`}>
              {format(day, 'd')}
              {showGreekTheater && hasGreekEvent && (
                <Image 
                  src="/greeklogo.png"
                  alt="Greek Theater Event"
                  width={40}
                  height={24}
                  className="flex-shrink-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity object-contain" 
                  title={`Greek Theater: ${getGreekTheaterEventsForDate(day).map(e => e.title).join(', ')}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const greekEvents = getGreekTheaterEventsForDate(day);
                    if (greekEvents.length > 0) {
                      // Convert the first Greek Theater event to calendar event format
                      const calendarEvent = greekTheaterToCalendarEvent(greekEvents[0]);
                      onEventClick(calendarEvent);
                    }
                  }}
                />
              )}
              {hasCalBearsEvent && (
                <Image 
                  src="/cal_logo.png"
                  alt="Cal Bears Event"
                  width={25}
                  height={20}
                  className="flex-shrink-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity object-containo hover-invert " 
                  title={`Cal Bears: ${dayCalBearsEvents.map(e => e.title).join(', ')}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dayCalBearsEvents.length > 0) {
                      onEventClick(dayCalBearsEvents[0]);
                    }
                  }}
                />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-px">
              {allDayEvents.length > 0 ? (
                allDayEvents.map((ev) => {
                  const { courseName, assignment } = parseEventTitle(ev.title);
                  const courseColor = getCourseColor(ev);
                  
                  return (
                    <div
                      key={ev.uid ?? ev.title + ev.start}
                      className={`text-[10px] px-1 rounded-sm border flex-1 min-h-0 flex flex-col justify-start overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${courseColor}`}
                      title={`${assignment ? assignment + ' - ' : ''}${courseName} (${ev.title})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      style={{
                        height: `calc((100% - ${(allDayEvents.length - 1) * 1}px) / ${allDayEvents.length})`
                      }}
                    >
                      {/* Course name */}
                      <div className="leading-tight break-words hyphens-auto font-medium" style={{ wordBreak: 'break-word' }}>
                        {courseName}
                        {/* Assignment (clamped to 2 lines) */}
                        {assignment && (
                          <div
                            className="leading-tight break-words hyphens-auto opacity-80"
                            style={{
                              wordBreak: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {assignment}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

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
  showCampusGroups?: boolean;
  campusGroupsEvents?: CalendarEvent[];
};

export default function MonthGrid({ 
  events, 
  currentMonth, 
  onEventClick, 
  showGreekTheater = true, 
  showUCLaunch = true,
  launchEvents = [],
  showCalBears = true,
  calBearsEvents = [],
  showCampusGroups = false,
  campusGroupsEvents = []
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
      <div className="grid grid-cols-7 gap-px bg-slate-700/10 drop-shadow-">
      {/* Weekday headers */}
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
        <div key={d} className="bg-white/5 text-xs text-center font-light uppercase text-slate-300">
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
        
        // Add Campus Groups events for this day if they should be shown
        const dayCampusGroupsEvents = showCampusGroups ? campusGroupsEvents.filter((ev) =>
          isSameDay(new Date(ev.start), day)
        ) : [];
        
        // Debug logging for Campus Groups
        if (day.getDate() === 1) { // Only log once per month to avoid spam
          console.log(`MonthGrid Campus Groups Debug:`, {
            showCampusGroups,
            campusGroupsEventsLength: campusGroupsEvents.length,
            campusGroupsEvents: campusGroupsEvents,
            month: format(day, 'MMMM yyyy')
          });
        }
        if (showCampusGroups && campusGroupsEvents.length > 0) {
          console.log(`Campus Groups: ${campusGroupsEvents.length} total events, ${dayCampusGroupsEvents.length} events for ${day.toDateString()}`);
        }
        
        // Combine regular events with launch events, Cal Bears events, and Campus Groups events
        const allDayEvents = [...dayEvents, ...dayLaunchEvents, ...dayCalBearsEvents, ...dayCampusGroupsEvents];

        const isToday = isSameDay(day, new Date());
        const hasGreekEvent = hasGreekTheaterEventOnDate(day);
        const hasCalBearsEvent = showCalBears && dayCalBearsEvents.length > 0;
        const hasCampusGroupsEvent = showCampusGroups && dayCampusGroupsEvents.length > 0;

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

          // Check for Campus Groups events - Blue styling
          if (event.source && event.source.includes('campus_groups')) {
            return `${glassBase} bg-blue-600/40 border-blue-500/40 text-white ${hoverGold}`;
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

            // EWMBA 202 (Data & Decisions) - Dark Blue
            if (event.source.includes('DataDecisions')) {
              return `${glassBase} bg-blue-800/35 border-blue-700/40 text-white ${hoverGold}`;
            }

            // EWMBA 205 (Leading People) - Dark Red
            if (event.source.includes('205_') || event.source.includes('leadingpeople')) {
              return `${glassBase} bg-red-800/35 border-red-700/40 text-white ${hoverGold}`;
            }

            // EWMBA 208 (Marketing) - Pastel Orange
            if (event.source.includes('Marketing')) {
              return `${glassBase} bg-orange-500/60 border-orange-300/50 text-white ${hoverGold}`;
            }
          }
          
          // Default styling - no title-based fallbacks to avoid misclassification
          return `bg-slate-100 border-slate-200 text-slate-900 ${hoverGold}`;
        };
        
        // Function to check if event has a quiz (for Data & Decisions classes)
        const hasQuiz = (event: CalendarEvent): boolean => {
          if (!event.description) return false;
          
          // Check if it's a Data & Decisions class
          const isDataDecisions = event.title.includes('Data & Decisions') || 
                                  (event.source && event.source.includes('DataDecisions'));
          
          if (!isDataDecisions) return false;
          
          // Look for "QUIZ: Quiz" pattern (not "QUIZ: No quiz")
          const quizMatch = event.description.match(/QUIZ:\s*Quiz\s+\d+/i);
          return !!quizMatch;
        };
        

        return (
            <div
            key={day.toISOString()}
            className={`h-28 p-1 flex flex-col overflow-auto ${
              isSameMonth(day, currentMonth) ? 'bg-slate-600/10' : 'bg-transparent opacity-40'
            } ${isToday ? 'rounded-sm  ring-1 ring-yellow-400 '  : ''}`}
            >
            <div className={`text-xs font-light mb-0 flex-shrink-0 flex items-center gap-1 ${
              isToday ? 'text-yellow-500 font-bold' : 'text-white'
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
              {hasCampusGroupsEvent && (
              <div 
                className="w-6 h-6 flex-shrink-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity bg-blue-600 rounded-lg flex items-center justify-center"
                title={`Campus Groups: ${dayCampusGroupsEvents.map(e => e.title).join(', ')}`}
                onClick={(e) => {
                e.stopPropagation();
                if (dayCampusGroupsEvents.length > 0) {
                  onEventClick(dayCampusGroupsEvents[0]);
                }
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-px">
              {allDayEvents.length > 0 ? (
              allDayEvents.map((ev) => {
                const { courseName, assignment } = parseEventTitle(ev.title);
                const courseColor = getCourseColor(ev);
                const eventHasQuiz = hasQuiz(ev);
                
                return (
                <div
                  key={ev.uid ?? ev.title + ev.start}
                  className={`text-[10px] px-1 rounded-sm border flex-1 min-h-0 flex flex-col justify-start overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${courseColor}`}
                  title={`${assignment ? assignment + ' - ' : ''}${courseName} (${ev.title})${eventHasQuiz ? ' - QUIZ TODAY!' : ''}`}
                  onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(ev);
                  }}
                  style={{
                  height: `calc((100% - ${(allDayEvents.length - 1) * 1}px) / ${allDayEvents.length})`
                  }}
                >
                  {/* Quiz indicator above course name */}
                  {eventHasQuiz && (
                    <div className="mb-0.5">
                      <span className="font-bold text-red-500 text-[9px] px-1 bg-red-900/30 rounded whitespace-nowrap inline-block">
                        QUIZ
                      </span>
                    </div>
                  )}
                  {/* Course name */}
                  <div className="leading-tight break-words hyphens-auto font-medium" style={{ wordBreak: 'break-word' }}>
                    {courseName}
                  </div>
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

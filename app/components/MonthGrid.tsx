'use client';

import { useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format } from 'date-fns';
import type { CalendarEvent } from '@/lib/calendar';

type Props = {
  events: CalendarEvent[];
  currentMonth: Date;
  onEventClick: (event: CalendarEvent) => void;
};

export default function MonthGrid({ events, currentMonth, onEventClick }: Props) {
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
      {/* Calendar Grid - Full width, no spacing */}
      <div className="grid grid-cols-7 gap-px bg-white/10 dark:bg-slate-700/10 border border-white/15 dark:border-slate-600/15">
      {/* Weekday headers */}
      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
        <div key={d} className="bg-white/5 dark:bg-slate-600/5 text-xs text-center py-0.5 font-medium uppercase tracking-wide text-slate-700 dark:text-slate-300">
          {d}
        </div>
      ))}

      {/* Days */}
      {days.map((day) => {
        const dayEvents = events.filter((ev) =>
          isSameDay(new Date(ev.start), day)
        );

        const isToday = isSameDay(day, new Date());

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

        // Function to get course color based on course number
        const getCourseColor = (title: string) => {
          const hoverGold = 'hover:border-[#FDB515]'; // Berkeley Gold
          if (title.includes('EWMBA 201')) return `bg-green-500/10 border-green-500/30 text-white ${hoverGold}`;
            if (title.includes('EWMBA 202')) return `bg-blue-500/10 border-blue-500/30 text-white ${hoverGold}`;
            if (title.includes('EWMBA 203')) return `bg-teal-500/10 border-teal-500/30 text-white ${hoverGold}`;
            if (title.includes('EWMBA 204')) return `bg-pink-500/10 border-pink-500/30 text-white ${hoverGold}`;
            if (title.includes('EWMBA 205')) return `bg-pink-500/10 border-pink-500/30 text-white ${hoverGold}`;
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
            } ${isToday ? 'ring-1 ring-yellow-400' : ''}`}
          >
            <div className={`text-xs font-medium mb-1 flex-shrink-0 ${
              isToday ? 'text-yellow-400 font-bold' : 'text-slate-900 dark:text-white'
            }`}>
              {format(day, 'd')}
            </div>
            <div className="flex-1 flex flex-col gap-px">
              {dayEvents.length > 0 ? (
                dayEvents.map((ev) => {
                  const { courseName, assignment } = parseEventTitle(ev.title);
                  const courseColor = getCourseColor(ev.title);
                  
                  return (
                    <div
                      key={ev.uid ?? ev.title + ev.start}
                      className={`text-[10px] px-1  rounded border flex-1 min-h-0 flex flex-col justify-start overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${courseColor}`}
                      title={`${assignment ? assignment + ' - ' : ''}${courseName} (${ev.title})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      style={{
                        height: `calc((100% - ${(dayEvents.length - 1) * 1}px) / ${dayEvents.length})`
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

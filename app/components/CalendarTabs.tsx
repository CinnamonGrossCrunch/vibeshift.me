'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import MonthGrid from './MonthGrid';
import EventDetailModal from './EventDetailModal';
import type { CalendarEvent } from '@/lib/calendar';

type Props = {
  events: CalendarEvent[];
  title: string;
};

export default function CalendarTabs({ events, title }: Props) {
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // August 2025
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // Filter out past events for list view
  const futureEvents = events.filter(ev => new Date(ev.start) >= new Date());

  return (
    <>
      {/* Header with title, view tabs, and month navigation */}
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        
        {/* View Tabs - centered */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              view === 'list' 
                ? 'bg-berkeley-blue text-white border border-berkeley-blue shadow-sm' 
                : 'text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold hover:bg-berkeley-blue/10 dark:hover:bg-berkeley-blue-light/10'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              view === 'grid' 
                ? 'bg-berkeley-blue text-white border border-berkeley-blue shadow-sm' 
                : 'text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold hover:bg-berkeley-blue/10 dark:hover:bg-berkeley-blue-light/10'
            }`}
          >
            Calendar
          </button>
        </div>
        
        {/* Month Navigation - only show for grid view */}
        {view === 'grid' && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-white/10 dark:hover:bg-slate-600/10 rounded transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-sm font-medium text-slate-900 dark:text-white px-2">
              {format(currentMonth, 'MMM yyyy')}
            </span>
            
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-white/10 dark:hover:bg-slate-600/10 rounded transition-colors"
              aria-label="Next month"
            >
              <svg className="w-3 h-3 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Empty div for spacing when not showing month navigation */}
        {view === 'list' && <div></div>}
      </header>

      {view === 'list' ? (
        futureEvents.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">No upcoming events.</p>
        ) : (
          <ul className="space-y-3">
            {futureEvents.map((ev) => {
              const start = new Date(ev.start);
              const end = ev.end ? new Date(ev.end) : undefined;

              const dateLine = ev.allDay
                ? format(start, 'EEE, MMM d')
                : end
                ? `${format(start, 'EEE, MMM d · h:mma')} – ${format(end, 'h:mma')}`
                : `${format(start, 'EEE, MMM d · h:mma')}`;

              return (
                <li key={ev.uid ?? ev.start + ev.title} className="rounded-xl bg-white/40 dark:bg-slate-700/40 border border-white/20 dark:border-slate-600/20 p-3 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors" onClick={() => handleEventClick(ev)}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-12 text-center rounded-lg bg-white/60 dark:bg-slate-600/60 border border-white/30 dark:border-slate-500/30 py-1">
                      <div className="text-[10px] uppercase text-slate-600 dark:text-slate-400">{format(start, 'MMM')}</div>
                      <div className="text-lg font-semibold leading-5 text-slate-900 dark:text-white">{format(start, 'd')}</div>
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{ev.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{dateLine}</div>
                      {ev.location && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">📍 {ev.location}</div>
                      )}
                    </div>

                    {/* Event link indicator - positioned on the far right */}
                    {ev.url && (
                      <div className="shrink-0 flex items-center text-xs text-berkeley-blue dark:text-berkeley-blue-light">
                        (Assignment Details)
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <MonthGrid events={events} currentMonth={currentMonth} onEventClick={handleEventClick} />
      )}

      {/* Event Detail Modal */}
      <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
    </>
  );
}

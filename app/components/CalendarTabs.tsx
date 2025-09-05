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
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 7, 1)); // August 2025
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showGreekTheater, setShowGreekTheater] = useState(true);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Scroll to top of page first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      {/* Header with title, Greek Theater toggle, and month navigation */}
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        
        <div className="flex items-center gap-3">
          {/* Greek Theater Toggle */}
          <button
            onClick={() => setShowGreekTheater(!showGreekTheater)}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              showGreekTheater
                ? 'bg-slate-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={showGreekTheater ? 'Hide Greek Theater events' : 'Show Greek Theater events'}
            aria-label={showGreekTheater ? 'Hide Greek Theater events' : 'Show Greek Theater events'}
          >
            🎭
          </button>
        </div>
        
        {/* Month Navigation */}
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
      </header>

      {/* Calendar Grid */}
      <div className="-mx-5 -mb-5">
        <MonthGrid events={events} currentMonth={currentMonth} onEventClick={handleEventClick} showGreekTheater={showGreekTheater} />
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />
    </>
  );
}

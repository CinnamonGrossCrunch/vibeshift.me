'use client';

import { useState, useEffect } from 'react';
import CohortCalendarTabs from './CohortCalendarTabs';
import type { CohortEvents } from '@/lib/icsUtils';

type Props = {
  title?: string;
  daysAhead?: number;
  max?: number;
  cohortEvents?: CohortEvents;
  selectedCohort?: 'blue' | 'gold';
};

export default function CohortCalendarWidget({
  title = 'Cohort Calendar',
  daysAhead = 30,
  max = 150,
  cohortEvents: externalCohortEvents,
  selectedCohort: externalSelectedCohort,
}: Props) {
  const [cohortEvents, setCohortEvents] = useState<CohortEvents>({ 
    blue: [], 
    gold: [], 
    original: [], 
    launch: [], 
    calBears: [] 
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data if not provided externally
  useEffect(() => {
    if (externalCohortEvents) {
      setCohortEvents(externalCohortEvents);
    } else {
      const fetchCohortEvents = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch('/api/calendar');
          if (!response.ok) {
            throw new Error('Failed to fetch cohort events');
          }
          
          const events = await response.json();
          setCohortEvents(events);
        } catch (err) {
          console.error('Cohort calendar widget error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load cohort calendar events');
        } finally {
          setLoading(false);
        }
      };

      fetchCohortEvents();
    }
  }, [externalCohortEvents, daysAhead, max]);

  return (
    <section className="">
      {loading ? (
        <>
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </header>
          <div className="text-center py-8">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-berkeley-blue rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading calendar...</p>
          </div>
        </>
      ) : error ? (
        <>
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </header>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg"></span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Calendar Loading</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{error}</p>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-500">
              <p>Expected ICS files in /public/:</p>
              <ul className="mt-2 space-y-1">
                <li>• ewmba201a_micro_blue_fall2025.ics</li>
                <li>• ewmba_leadingpeople_blue_fall2025.ics</li>
                <li>• ewmba201a_micro_gold_fall2025.ics</li>
                <li>• ewmba_leadingpeople_gold_fall2025.ics</li>
                <li>• calendar.ics (for rich content matching)</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <CohortCalendarTabs 
          cohortEvents={cohortEvents} 
          title={title}
          externalSelectedCohort={externalSelectedCohort}
        />
      )}
    </section>
  );
}

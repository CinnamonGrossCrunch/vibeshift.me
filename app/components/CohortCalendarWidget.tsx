import { getCohortEvents } from '@/lib/icsUtils';
import CohortCalendarTabs from './CohortCalendarTabs';
import type { CohortEvents } from '@/lib/icsUtils';

type Props = {
  title?: string;
  daysAhead?: number;
  max?: number;
};

export default async function CohortCalendarWidget({
  title = 'Cohort Calendar',
  daysAhead = 30,
  max = 150,
}: Props) {
  let cohortEvents: CohortEvents = { blue: [], gold: [], original: [] };
  let error: string | null = null;

  try {
    console.log('CohortCalendarWidget: Starting to fetch cohort events');
    cohortEvents = await getCohortEvents(daysAhead, max);
    console.log(`CohortCalendarWidget: Successfully loaded Blue: ${cohortEvents.blue.length}, Gold: ${cohortEvents.gold.length} events`);
  } catch (err) {
    console.error('Cohort calendar widget error:', err);
    error = err instanceof Error ? err.message : 'Failed to load cohort calendar events';
  }

  return (
    <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-glass overflow-hidden">
      {error ? (
        <>
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </header>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📅</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Calendar Unavailable</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{error}</p>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-500">
              <p>Expected ICS files in /public/:</p>
              <ul className="mt-2 space-y-1">
                <li>• ewmba201a_micro_blue_fall2025.ics</li>
                <li>• ewmba205_blue_fallA2025_v2.ics</li>
                <li>• ewmba201a_micro_gold_fall2025.ics</li>
                <li>• ewmba205_gold_fallA2025_v2.ics</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <CohortCalendarTabs cohortEvents={cohortEvents} title={title} />
      )}
    </section>
  );
}

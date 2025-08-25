import { format } from 'date-fns';
import { getUpcomingEvents } from '@/lib/calendar';
import CalendarTabs from './CalendarTabs';

type Props = {
  title?: string;
  daysAhead?: number;
  max?: number;
};

export default async function CalendarWidget({
    title = 'Upcoming Assignments',
    daysAhead = 30,
    max = 10,
}: Props) {
    let events: any[] = [];
    let error: string | null = null;

    try {
        events = await getUpcomingEvents(daysAhead, max);
    } catch (err) {
        console.error('Calendar widget error:', err);
        error = err instanceof Error ? err.message : 'Failed to load calendar events';
    }

    return (
        <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-glass">
            {error ? (
                <>
                    <header className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                    </header>
                    <div className="text-center py-6">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-xl">📅</span>
                        </div>
                        <p className="text-base text-slate-600 dark:text-slate-400 mb-2">Calendar Unavailable</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">{error}</p>
                    </div>
                </>
            ) : (
                <div className="text-[0.95rem]">
                    <CalendarTabs events={events} title={title} />
                </div>
            )}
        </section>
    );
}

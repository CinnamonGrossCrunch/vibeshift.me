import { getHaasResourcesData } from '../../lib/resources';
import HaasResourcesTabs from './HaasResourcesTabs';

type Props = {
  title?: string;
};

export default async function HaasResourcesWidget({
  title = 'Haas Resources',
}: Props) {
  let resourcesData: any = null;
  let error: string | null = null;

  try {
    resourcesData = await getHaasResourcesData();
  } catch (err) {
    console.error('Haas Resources widget error:', err);
    error = err instanceof Error ? err.message : 'Failed to load resources';
  }

  return (
    <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-glass">
      {error ? (
        <>
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </header>
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📚</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Resources Unavailable</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{error}</p>
          </div>
        </>
      ) : (
        <HaasResourcesTabs resourcesData={resourcesData} title={title} />
      )}
    </section>
  );
}

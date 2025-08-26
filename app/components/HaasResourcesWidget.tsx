import { getHaasResourcesData } from '../../lib/resources';
import HaasResourcesTabs from './HaasResourcesTabs';
import type { HaasResourcesData } from '../../lib/resources';

type Props = {
  title?: string;
};

export default async function HaasResourcesWidget({
  title = 'Haas Resources',
}: Props) {
  let resourcesData: HaasResourcesData | null = null;
  let error: string | null = null;

  try {
    resourcesData = await getHaasResourcesData();
  } catch (err) {
    console.error('Haas Resources widget error:', err);
    error = err instanceof Error ? err.message : 'Failed to load resources';
  }

  return (
    <section className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-glass">
      {error ? (
        <>
          <header className="flex items-center justify-between mb-4 p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          </header>
          <div className="text-center py-4 ">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📚</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Resources Unavailable</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{error}</p>
          </div>
        </>
      ) : (
        resourcesData && <HaasResourcesTabs resourcesData={resourcesData} title={title} />
      )}
    </section>
  );
}

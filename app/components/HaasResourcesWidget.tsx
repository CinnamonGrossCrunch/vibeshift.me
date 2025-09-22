'use client';

import { useState, useEffect } from 'react';
import HaasResourcesTabs from './HaasResourcesTabs';
import type { HaasResourcesData } from '../../lib/resources';

type Props = {
  title?: string;
};

export default function HaasResourcesWidget({
  title = 'Haas Resources',
}: Props) {
  const [resourcesData, setResourcesData] = useState<HaasResourcesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResourcesData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch resources data from API endpoint
        const response = await fetch('/api/resources');
        if (!response.ok) {
          throw new Error('Failed to fetch resources data');
        }
        
        const data = await response.json();
        setResourcesData(data);
      } catch (err) {
        console.error('Haas Resources widget error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResourcesData();
  }, []);

  return (
    <section className="rounded-2xl p-4 bg-glass bg-turbulence shadow-glass">
      {loading ? (
        <>
          <header className="flex items-center justify-between mb-4 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              <span className="text-white">Haas</span>{' '}
              <span className="text-white/80">Resources</span>
            </h3>
          </header>
          <div className="text-center py-4">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-berkeley-blue rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading resources...</p>
          </div>
        </>
      ) : error ? (
        <>
          <header className="flex items-center justify-between mb-4 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              <span className="text-white">Haas</span>{' '}
              <span className="text-white/80">Resources</span>
            </h3>
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

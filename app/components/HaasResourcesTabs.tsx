'use client';

import { useState } from 'react';
import type { HaasResourcesData, ResourceCategory, ResourceItem } from '../../lib/resources';

type Props = {
  resourcesData: HaasResourcesData;
  title: string;
};

export default function HaasResourcesTabs({ resourcesData, title }: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()); // Start with all collapsed

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set<string>();
    if (expandedCategories.has(categoryKey)) {
      // If clicking on the already open section, close it
      // newExpanded remains empty (all closed)
    } else {
      // If clicking on a closed section, open only that one
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAll = () => {
    // Since we only allow one section open at a time, "Expand All" doesn't make sense
    // Instead, this will just collapse all sections
    setExpandedCategories(new Set());
  };

  return (
    <>
      {/* Header with title and expand/collapse all */}
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold" style={{ color: 'white' }}>{title}</h3>
        
        {/* Collapse All Button */}
        <button
          onClick={toggleAll}
          className="text-xs font-medium hover:opacity-80 transition-opacity text-slate-600 dark:text-slate-400"
        >
          {expandedCategories.size > 0 ? 'Collapse All' : 'Collapse All'}
        </button>
      </header>

      {/* Categories View */}
      <div className="space-y-0">
          {Object.entries(resourcesData.categories).map(([categoryKey, category], index) => {
            const typedCategory = category as ResourceCategory;
            const isFirst = index === 0;
            const isLast = index === Object.entries(resourcesData.categories).length - 1;
            return (
            <div key={categoryKey} className={`border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-amber-50 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 overflow-hidden ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''}`}>
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between py-1 px-3 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-amber-50 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <h4 className="text-xs font-bold" style={{ color: 'white' }}>{typedCategory.name}</h4>
                  </div>
                </div>
                <svg 
                  className={`w-3 h-3 transition-transform ${
                    expandedCategories.has(categoryKey) ? 'rotate-180' : ''
                  }`}
                  style={{ color: 'var(--berkeley-gold)' }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                    {/* chevron down icon */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`expandable ${
                  expandedCategories.has(categoryKey) ? 'expanded' : 'collapsed'
                }`}
              >
                <div className="expandable-content">
                  <div className="px-3 pb-3">
                    <ul className="space-y-2 pl-3">
                      {typedCategory.items.map((item: ResourceItem, index: number) => (
                        <li key={index} className="text-xs">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:opacity-80 transition-opacity flex items-center gap-1"
                              style={{ color: 'var(--berkeley-gold)' }}
                            >
                              {item.text}
                              <svg 
                                className="w-3 h-3 flex-shrink-0" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
    </>
  );
}

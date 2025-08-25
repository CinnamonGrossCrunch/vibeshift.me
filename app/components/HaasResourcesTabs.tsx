'use client';

import { useState } from 'react';
import type { HaasResourcesData, ResourceCategory, ResourceItem } from '../../lib/resources';

type Props = {
  resourcesData: HaasResourcesData;
  title: string;
};

export default function HaasResourcesTabs({ resourcesData, title }: Props) {
  const [view, setView] = useState<'categories' | 'list'>('categories');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['housekeeping']));

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAll = () => {
    if (expandedCategories.size === Object.keys(resourcesData.categories).length) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(Object.keys(resourcesData.categories)));
    }
  };

  return (
    <>
      {/* Header with title and view tabs */}
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-berkeley-blue dark:text-berkeley-blue-light">{title}</h3>
        
        {/* View Tabs - centered */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('categories')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              view === 'categories' 
                ? 'bg-berkeley-blue text-white border border-berkeley-blue shadow-sm' 
                : 'text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold hover:bg-berkeley-blue/10 dark:hover:bg-berkeley-blue-light/10'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded-lg text-xs transition-colors ${
              view === 'list' 
                ? 'bg-berkeley-blue text-white border border-berkeley-blue shadow-sm' 
                : 'text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold hover:bg-berkeley-blue/10 dark:hover:bg-berkeley-blue-light/10'
            }`}
          >
            All Items
          </button>
        </div>
        
        {/* Expand/Collapse All - only show for categories view */}
        {view === 'categories' && (
          <button
            onClick={toggleAll}
            className="text-xs text-berkeley-gold dark:text-berkeley-gold-light hover:text-berkeley-gold-dark dark:hover:text-berkeley-gold font-medium"
          >
            {expandedCategories.size === Object.keys(resourcesData.categories).length ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </header>

      {view === 'categories' ? (
        <div className="space-y-3">
          {Object.entries(resourcesData.categories).map(([categoryKey, category]) => {
            const typedCategory = category as ResourceCategory;
            return (
            <div key={categoryKey} className="rounded-xl bg-white/40 dark:bg-slate-700/40 border border-berkeley-blue/20 dark:border-berkeley-blue-light/20 overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-3 hover:bg-berkeley-blue/5 dark:hover:bg-berkeley-blue-light/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-berkeley-gold/20 dark:bg-berkeley-gold/30 border border-berkeley-gold/40 dark:border-berkeley-gold/50 flex items-center justify-center">
                    <span className="text-sm">{typedCategory.icon}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-berkeley-blue dark:text-berkeley-blue-light">{typedCategory.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{typedCategory.items.length} items</p>
                  </div>
                </div>
                <svg 
                  className={`w-4 h-4 text-berkeley-blue dark:text-berkeley-blue-light transition-transform ${
                    expandedCategories.has(categoryKey) ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedCategories.has(categoryKey) && (
                <div className="px-3 pb-3">
                  <ul className="space-y-2 pl-11">
                    {typedCategory.items.map((item: ResourceItem, index: number) => (
                      <li key={index} className="text-sm">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold underline"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            );
          })}

          {/* Computer Center Section */}
          {resourcesData.computerCenter && (
            <div className="rounded-xl bg-white/40 dark:bg-slate-700/40 border border-berkeley-blue/20 dark:border-berkeley-blue-light/20 p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-berkeley-gold/20 dark:bg-berkeley-gold/30 border border-berkeley-gold/40 dark:border-berkeley-gold/50 flex items-center justify-center">
                  <span className="text-sm">💻</span>
                </div>
                <h4 className="text-sm font-medium text-berkeley-blue dark:text-berkeley-blue-light">{resourcesData.computerCenter.name}</h4>
              </div>
              <ul className="space-y-2 pl-11">
                {resourcesData.computerCenter.items.map((item: ResourceItem, index: number) => (
                  <li key={index} className="text-sm">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold underline"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Flatten all items for list view */}
          {Object.entries(resourcesData.categories).flatMap(([categoryKey, category]) => {
            const typedCategory = category as ResourceCategory;
            return typedCategory.items.map((item: ResourceItem, index: number) => (
              <div key={`${categoryKey}-${index}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-berkeley-blue/5 dark:hover:bg-berkeley-blue-light/5">
                <div className="shrink-0 w-6 h-6 rounded bg-berkeley-gold/20 dark:bg-berkeley-gold/30 flex items-center justify-center">
                  <span className="text-xs">{typedCategory.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold underline break-words"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{item.text}</span>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{typedCategory.name}</p>
                </div>
              </div>
            ));
          })}
          
          {/* Computer Center items in list view */}
          {resourcesData.computerCenter && resourcesData.computerCenter.items.map((item: ResourceItem, index: number) => (
            <div key={`computer-${index}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-berkeley-blue/5 dark:hover:bg-berkeley-blue-light/5">
              <div className="shrink-0 w-6 h-6 rounded bg-berkeley-gold/20 dark:bg-berkeley-gold/30 flex items-center justify-center">
                <span className="text-xs">💻</span>
              </div>
              <div className="flex-1 min-w-0">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold underline break-words"
                  >
                    {item.text}
                  </a>
                ) : (
                  <span className="text-sm text-slate-700 dark:text-slate-300 break-words">{item.text}</span>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Computer Center</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

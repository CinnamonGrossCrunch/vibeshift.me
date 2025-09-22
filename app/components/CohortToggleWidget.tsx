'use client';

type CohortType = 'blue' | 'gold';

interface CohortToggleWidgetProps {
  selectedCohort: CohortType;
  onCohortChange: (cohort: CohortType) => void;
  className?: string;
}

export default function CohortToggleWidget({ 
  selectedCohort, 
  onCohortChange,
  className = ""
}: CohortToggleWidgetProps) {
  return (
    <div className={`mb-0 flex justify-between items-center ${className}`}>
      <div className="flex items-center space-x-2">
        <div 
          role="tablist" 
          className="flex bg-glass bg-turbulence rounded-xl shadow-sm whitespace-nowrap"
          aria-label="Select cohort for all widgets"
        >
          <button
            role="tab"
            aria-selected={selectedCohort === 'blue'}
            onClick={() => onCohortChange('blue')}
            className={`px-4 md:px-8 py-0 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCohort === 'blue'
                ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white border border-blue-500 dark:border-blue-500/50 '
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{
              boxShadow: selectedCohort === 'blue' 
                ? '0 0 12px rgba(59, 130, 246, 0.4), 0 0 24px rgba(59, 130, 246, 0.3), 0 0 36px rgba(59, 130, 246, 0.15)'
                : undefined
            }}
          >
            Blue<span className="hidden lg:inline"> Cohort</span>
          </button>
          <button
            role="tab"
            aria-selected={selectedCohort === 'gold'}
            onClick={() => onCohortChange('gold')}
            className={`px-4 md:px-8 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCohort === 'gold'
                ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white shadow-lg border border-yellow-500 dark:border-yellow-500/50 ring-4 ring-yellow-400/30 shadow-yellow-500/20 shadow-xl drop-shadow-xl glow-gold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
              style={{
              boxShadow: selectedCohort === 'gold'
                ? '0 0 12px rgba(234, 179, 8, 0.4), 0 0 24px rgba(234, 179, 8, 0.3), 0 0 36px rgba(234, 179, 8, 0.15)'
                : undefined
            }}
          >
            Gold<span className="hidden lg:inline"> Cohort</span>
          </button>
        </div>
      </div>
      
    </div>
  );
}

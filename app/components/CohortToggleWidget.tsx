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
          className="flex bg-slate-100 dark:bg-slate-700 rounded-full shadow-sm "
          aria-label="Select cohort for all widgets"
        >
          <button
            role="tab"
            aria-selected={selectedCohort === 'blue'}
            onClick={() => onCohortChange('blue')}
            className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
              selectedCohort === 'blue'
                ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white shadow-lg border border-blue-500 dark:border-blue-300 ring-8 ring-blue-400/40 shadow-blue-500/30 shadow-2xl drop-shadow-2xl glow-blue'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{
              boxShadow: selectedCohort === 'blue' 
                ? '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2), 0 0 120px rgba(59, 130, 246, 0.1)'
                : undefined
            }}
          >
            Blue Cohort
          </button>
          <button
            role="tab"
            aria-selected={selectedCohort === 'gold'}
            onClick={() => onCohortChange('gold')}
            className={`px-8 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
              selectedCohort === 'gold'
                ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white shadow-sm border border-amber-500 dark:border-amber-200'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
              style={{
              boxShadow: selectedCohort === 'gold'
                ? '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4), 0 0 80px rgba(255, 215, 0, 0.2), 0 0 120px rgba(255, 215, 0, 0.1)'
                : undefined
            }}
          >
            Gold Cohort
          </button>
        </div>
      </div>
      
    </div>
  );
}

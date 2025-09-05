'use client';

import React, { useState } from 'react';
import CalendarListView from './CalendarListView';
import CohortCalendarWidget from './CohortCalendarWidget';
import NewsletterModalWrapper from './NewsletterModalWrapper';
import type { CohortEvents } from '@/lib/icsUtils';

type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

interface DynamicLayoutGridProps {
  cohortEvents: CohortEvents;
  newsletterData: Payload;
}

export default function DynamicLayoutGrid({ cohortEvents, newsletterData }: DynamicLayoutGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpansionChange = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <div className={`grid gap-3 transition-all duration-700 ease-in-out ${
      isExpanded ? 'grid-cols-10' : 'grid-cols-9'
    }`}>
      
      {/* Columns 1-2: Calendar List View (always 2 columns) */}
      <div className="col-span-2 transition-all duration-700 ease-in-out">
        <CalendarListView 
          cohortEvents={cohortEvents}
          title="Upcoming Events"
          maxEvents={5}
          showCohortToggle={true}
        />
      </div>

      {/* Calendar Widget - Columns 3-7 (normal) or 3-6 (when expanded) */}
      <div className={`transition-all duration-700 ease-in-out ${
        isExpanded ? 'col-span-4' : 'col-span-5'
      }`}>
        <CohortCalendarWidget title="Cohort Calendar" daysAhead={45} max={150} />
      </div>

      {/* Newsletter Widget - Columns 8-9 (normal) or 7-10 (when expanded) */}
      <div className={`transition-all duration-700 ease-in-out ${
        isExpanded ? 'col-span-4' : 'col-span-2'
      }`}>
        <NewsletterModalWrapper 
          data={newsletterData}
        />
      </div>
    </div>
  );
}

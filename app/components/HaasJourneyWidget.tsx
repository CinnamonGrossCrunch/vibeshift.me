'use client';

interface ResourceItem {
  id: string;
  title: string;
  cta: string;
  url: string;
  icon: string;
}

interface HaasJourneyWidgetProps {
  className?: string;
}

const HAAS_RESOURCES: ResourceItem[] = [

  {
    id: 'academic-advisor',
    title: 'Academic Advisor',
    cta: 'Connect',
    url: 'http://haas.berkeley.edu/EWMBA/contacts/',
    icon: 'support_agent'
  },
  {
    id: 'university-finances',
    title: 'My University Finances',
    cta: 'Check Financials',
    url: 'https://calcentral.berkeley.edu/finances',
    icon: 'currency_exchange'
  },
  {
    id: 'bcourses',
    title: 'Official Academic Links',
    cta: 'BCourses',
    url: 'https://bcourses.berkeley.edu/',
    icon: 'school'
  },
  {
    id: 'career-mgmt',
    title: 'Career Mgmt Group',
    cta: 'Advisor Sync',
    url: 'https://haas.berkeley.edu/cmg/cmg-resources/cmg-career-coaching-programs-team/',
    icon: 'rocket_launch'
  },
  {
    id: 'campus-groups',
    title: 'Haas Campus Groups',
    cta: 'Campus Clubs',
    url: 'https://haas.campusgroups.com/web_app?id=23784&menu_id=63384&if=0&',
    icon: 'groups'
  },
  {
    id: 'mental-health',
    title: 'Berkeley Student Mental Health',
    cta: 'Mental Wellness',
    url: 'https://uhs.berkeley.edu/student-mental-health',
    icon: 'psychology'
  },
  {
    id: 'diversity-resources',
    title: 'CMG Diversity Resources',
    cta: 'Learn More',
    url: 'https://haas.berkeley.edu/cmg/diversity-resources/',
    icon: 'diversity_1'
  }
    ,  {
    id: 'suggestion-box',
    title: 'EWMBA Suggestion Box',
    cta: 'Submit',
    url: 'https://forms.gle/HbmCkdfdRCzQYaay9',
    icon: 'feedback'
  },
];

// Centralized styling constants for easy maintenance
const STYLES = {
  container: "px-0 ",
  title: "text-md font-md text-white mb-0",
  grid: "grid grid-cols-2 gap-0",
  resourceContainer: " border-white/30 rounded-md m-0.25",
  resourceLink: "flex items-center gap-0 p-1 rounded-xl hover:bg-turbulence transition-all duration-100 group",
  iconContainer: "w-6 h-6 border-1 border-white/30 rounded-full  flex items-center justify-center flex-shrink-1 mr-2",
  icon: "text-white/80 material-icons",
  textContainer: "flex-1 min-w-0",
  resourceTitle: "text-xxs font-extralight text-white/50 truncate mb-0.5",
  resourceCta: "text-xs font-light text-white group-hover:text-blue-200 transition-colors"
} as const;

function ResourceCard({ resource }: { resource: ResourceItem }) {
  return (
    <div className={STYLES.resourceContainer}>
      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={STYLES.resourceLink}
      >
        <div className={STYLES.iconContainer}>
          <span className={STYLES.icon} style={{ fontSize: '16px' }}>{resource.icon}</span>
        </div>
        <div className={STYLES.textContainer}>
          <div className={STYLES.resourceTitle} style={{ fontSize: '6px', lineHeight: '10px' }}>{resource.title}</div>
          <div className={STYLES.resourceCta}>{resource.cta}</div>
        </div>
      </a>
    </div>
  );
}

export default function HaasJourneyWidget({ className = "" }: HaasJourneyWidgetProps) {
  return (
    <div className={`${STYLES.container} ${className}`}>
    {/* <h3 className={STYLES.title}>Critical Links</h3> */}
      
      {/* 2x4 Grid of Resources */}
      <div className={STYLES.grid}>
        {HAAS_RESOURCES.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

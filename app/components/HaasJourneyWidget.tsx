'use client';

import { useState } from 'react';

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
    title: 'Connect',
    cta: 'Academic Advisor',
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
    title: 'Official Academic Site',
    cta: 'BCourses Portal',
    url: 'https://bcourses.berkeley.edu/',
    icon: 'school'
  },
  {
    id: 'career-mgmt',
    title: 'Career Mgmt Group',
    cta: 'Career Advisor',
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
  }
,
];

// Centralized styling constants for easy maintenance
const STYLES = {
  container: "absolute, z-35 px-0 mx-0",
  dropdownHeader: "flex items-center justify-end p-2 rounded-xl hover:bg-turbulence transition-all duration-500 cursor-pointer group",
  dropdownTitle: "text-md font-semibold text-white transition-all duration-600 overflow-hidden text-center leading-tight",
  dropdownIcon: "text-white material-icons transition-all duration-600 ease-in-out",
  dropdownIconOpen: "translate-x-3 translate-y-0",
  dropdownContent: "-mr-3 -py-overflow-hidden transition-all duration-1000 w-full",
  grid: "flex justify-between gap-2 flex-wrap w-full",
  resourceContainer: "border-white/30 rounded-md relative flex-1 min-w-0",
  resourceLink: "flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0.5 p-0.5 md:p-1 rounded-xl hover:bg-turbulence transition-all duration-100 group",
  iconContainer: "w-8 h-8 mr-1rounded-full flex items-center -mb-1 md:mb-1 justify-center flex-shrink-0",
  icon: "text-white/80 scale-140 material-icons !text-[10px] md:!text-[20px]",
  textContainer: "text-center md:text-left leading-tight",
  resourceTitle: "text-sm font-light text-white/50 truncate mb-0 leading-tight",
  resourceCta: "text-xs font-light text-gray-400 group-hover:text-blue-200 transition-colors whitespace-normal break-words leading-tight",
  tooltip: "absolute bottom-full translate-y-18 mb-0 px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-[9999] whitespace-nowrap text-violet-500 text-xs font-light shadow-lg bg-none leading-tight",
  cascadeItem: "transform transition-all duration-1200 ease-out"
} as const

function ResourceCard({ resource, index, isOpen, totalItems }: { resource: ResourceItem; index: number; isOpen: boolean; totalItems: number }) {
  // Reverse the index for right-to-left animation
  const reverseIndex = totalItems - 1 - index;
  
  return (
    <div 
      className={`select-none ${STYLES.resourceContainer} ${STYLES.cascadeItem}`}
      style={{
        transitionDelay: isOpen ? `${600 + reverseIndex * 100}ms` : '0ms',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-10px)'
      }}
    >
      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={STYLES.resourceLink}
      >
        <div className={STYLES.iconContainer}>
          <span className={STYLES.icon}>{resource.icon}</span>
        </div>
        <div className={STYLES.textContainer}>
          <div className={STYLES.resourceCta}>{resource.cta}</div>
        </div>
        
        <div className={STYLES.tooltip}>
          {resource.title}
        </div>
      </a>
    </div>
  );
}

export default function HaasJourneyWidget({ className = "" }: HaasJourneyWidgetProps) {
  const [isOpen, setIsOpen] = useState(true); // Default to true (expanded)

  return (
    <div className={`select-none ${STYLES.container} ${className}`}>
      <div className="flex items-start justify-start md:justify-end w-full z-10">
        {/* Dropdown Content - Same Row, Left Side */}
        <div 
          className={STYLES.dropdownContent}
          style={{
            maxWidth: isOpen ? '2000px' : '0',
            maxHeight: isOpen ? '500px' : '0',
            opacity: isOpen ? 1 : 0,
            transitionDelay: isOpen ? '600ms' : '0ms'
          }}
        >
          <div className={STYLES.grid}>
            {HAAS_RESOURCES.map((resource, index) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                index={index} 
                isOpen={isOpen} 
                totalItems={HAAS_RESOURCES.length}
              />
            ))}
          </div>
        </div>
        
        {/* Dropdown Header - Right Side - Hidden on mobile */}
        <div 
          className={`${STYLES.dropdownHeader} hidden md:flex`}
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse' : 'Expand'}
        >
            <h3 
            className={STYLES.dropdownTitle}
            style={{
              
              opacity: isOpen ? 0 : 1,
              marginLeft: isOpen ? '-120px' : '0px',
        
              color: '#ffffffff',
              textShadow: '0 0 12px #0063c0ff, 0 0 24px rgba(0, 50, 98, 0.8), 0 0 36px rgba(0, 50, 98, 0.6), 0 0 48px rgba(0, 50, 98, 0.4)',
              lineHeight: '1'
            }}
            >
            Critical Links
            </h3>
            <span 
            className={`${STYLES.dropdownIcon} ${isOpen ? STYLES.dropdownIconOpen : ''}`}
            style={{
              transitionDelay: isOpen ? '100ms' : '0ms',
              transform: isOpen ? 'rotate(360deg)' : 'rotate(0deg)',
              textShadow: '0 0 4px rgba(0, 99, 192, 0.8), 0 0 8px rgba(0, 99, 192, 0.6), 0 0 12px rgba(0, 99, 192, 0.4), 0 0 16px rgba(0, 99, 192, 0.2)'
            }}
            >
            {isOpen ? 'remove' : 'add'}
            </span>
        </div>
      </div>
    </div>
  );
}

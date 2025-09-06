'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import MainDashboardTabs from "./components/MainDashboardTabs";
import DashboardTabs2 from "./components/DashboardTabs2";
import type { CohortEvents } from '@/lib/icsUtils';

type CohortType = 'blue' | 'gold';
type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

export default function Home() {
  const [selectedCohort, setSelectedCohort] = useState<CohortType>('blue');
  const [newsletterData, setNewsletterData] = useState<Payload | null>(null);
  const [cohortEvents, setCohortEvents] = useState<CohortEvents>({ 
    blue: [], 
    gold: [], 
    original: [], 
    launch: [], 
    calBears: [] 
  });
  const [loading, setLoading] = useState(true);

  // Load cohort preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('global-cohort-preference');
    if (saved === 'blue' || saved === 'gold') {
      setSelectedCohort(saved);
    }
  }, []);

  // Save cohort preference to localStorage
  useEffect(() => {
    localStorage.setItem('global-cohort-preference', selectedCohort);
  }, [selectedCohort]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch newsletter data
        const newsletterResponse = await fetch('/api/newsletter');
        if (newsletterResponse.ok) {
          const newsletter = await newsletterResponse.json();
          setNewsletterData(newsletter);
        }

        // Fetch cohort events
        const eventsResponse = await fetch('/api/calendar');
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          setCohortEvents(events);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCohortChange = (cohort: CohortType) => {
    setSelectedCohort(cohort);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ 
          backgroundImage: "url('/haas bkg.jpg')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover'
        }}
      ></div>
      
      {/* Content Overlay */}
      <div className="fixed inset-0 z-10 overflow-auto">
        {/* Header */}
        <div className="w-full sticky top-0 z-30 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-900/25 border-b border-white/50 dark:border-slate-700/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] relative overflow-hidden">
          {/* SVG turbulence / glass distortion layer */}
          <svg className="absolute -inset-px w-[120%] h-[140%] opacity-20 mix-blend-overlay pointer-events-none" aria-hidden="true">
            <filter id="glassNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" stitchTiles="stitch" />
              <feComponentTransfer>
          <feFuncA type="linear" slope="0.22" />
              </feComponentTransfer>
            </filter>
            <rect width="100%" height="100%" filter="url(#glassNoise)" /> 
          </svg>
          {/* Subtle displacement shimmer */}
          <svg className="absolute inset-0 w-0 h-0">
            <filter id="glassDistort">
              <feTurbulence type="turbulence" baseFrequency="0.012 0.018" numOctaves="2" seed="11" result="turb" />
              <feDisplacementMap in="SourceGraphic" in2="turb" scale="8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div className="pointer-events-none flex justify-left inset-0" style={{ maskImage: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,.7), transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,.7), transparent 70%)', filter: 'url(#glassDistort)' }} />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-1 relative">
          <div className="flex items-center justify-between h-10 sm:h-11 md:h-12">
            <div className="flex items-center gap-1 sm:gap-2 h-full">
                <div className="rounded-lg opacity- px-0 sm:px-3 md:px-4 overflow-hidden flex items-center justify-center invert mix-blend-multiply filter brightness-80 transition-all h-full">
                <Image 
                  src="/HubClaw.svg" 
                  alt="HubClaw Logo"
                  width={32}
                  height={40}
                  className="h-6 sm:h-10 md:h-10 w-auto object-contain"
                />
                </div>
              <div className="rounded-lg opacity-80 overflow-hidden flex items-center justify-center invert mix-blend-color filter brightness-80 transition-all h-full">
                <Image 
                  src="/OskiHubWM.svg" 
                  alt="OskiHub Logo"
                  width={60}
                  height={24} 
                  className="h-4 sm:h-5 md:h-7 w-auto object-contain"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.1)) drop-shadow(0 0 10px rgba(255, 136, 0, 0.1))' }}
                />
              </div>
            </div>
            
            {/* Beta moved to right side */}
            <div className="relative rounded-lg px-2 sm:px-3 md:px-4 overflow-hidden flex items-center justify-center h-full">
              <Image 
                src="/Beta.svg" 
                alt="[Beta]"
                width={60}
                height={24} 
                title="Learn More about this project."
                className="h-4 sm:h-5 md:h-7 w-auto mx-0 opacity-100 object-contain hover:invert filter brightness-20 hover:brightness-0 transition-all cursor-pointer"
              /> 
            </div>
          </div>
        </div>
        
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* 8 Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
          {/* MainDashboardTabs - Columns 1-5 */}
          <div className="lg:col-span-5">
            <MainDashboardTabs 
              newsletterData={newsletterData}
              cohortEvents={cohortEvents}
              selectedCohort={selectedCohort}
              loading={loading}
              onCohortChange={handleCohortChange}
            />
          </div>
          
          {/* DashboardTabs#2 - Columns 6-8 */}
          <div className="lg:col-span-3">
            <DashboardTabs2 
              newsletterData={newsletterData}
            />
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

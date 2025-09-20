'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import MainDashboardTabs from "./components/MainDashboardTabs";
import DashboardTabs2 from "./components/DashboardTabs2";
import MyWeekWidget from "./components/MyWeekWidget";
import HaasResourcesWidget from "./components/HaasResourcesWidget";
import CohortToggleWidget from "./components/CohortToggleWidget";
import type { CohortEvents } from '@/lib/icsUtils';
import type { UnifiedDashboardData } from '@/app/api/unified-dashboard/route';

type CohortType = 'blue' | 'gold';

export default function Home() {
  const [selectedCohort, setSelectedCohort] = useState<CohortType>('blue');
  // Remove unused newsletterData variable since it's included in unifiedData
  const [cohortEvents, setCohortEvents] = useState<CohortEvents>({ 
    blue: [], 
    gold: [], 
    original: [], 
    launch: [], 
    calBears: [],
    campusGroups: []
  });
  const [loading, setLoading] = useState(true);
  
  // New unified dashboard data for the top-level MyWeekWidget and DashboardTabs2
  const [unifiedData, setUnifiedData] = useState<UnifiedDashboardData | null>(null);
  // Remove unused unifiedLoading variable since we use loading instead

  // Load cohort preference from localStorage on mount, but default to blue
  useEffect(() => {
    const saved = localStorage.getItem('global-cohort-preference');
    // Always default to blue, only change if explicitly saved as gold
    if (saved === 'gold') {
      setSelectedCohort('gold');
    } else {
      setSelectedCohort('blue');
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
        console.log('🚀 Starting data fetch...');
        
        // Fetch unified dashboard data for My Week widget and sidebar
        console.log('📡 Fetching unified dashboard data...');
        const unifiedResponse = await fetch('/api/unified-dashboard');
        console.log('📡 Unified dashboard response status:', unifiedResponse.status);
        
        if (unifiedResponse.ok) {
          const unified = await unifiedResponse.json();
          console.log('📡 Unified dashboard data received:', unified);
          setUnifiedData(unified);
        } else {
          console.error('📡 Unified dashboard fetch failed:', unifiedResponse.status, unifiedResponse.statusText);
        }
        
        // Fetch cohort events for main dashboard (legacy compatibility)
        console.log('📅 Fetching cohort events...');
        const eventsResponse = await fetch('/api/calendar');
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          console.log('📅 Cohort events received');
          setCohortEvents(events);
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
        console.log('✅ Data fetch completed');
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
        <div className="w-full sticky top-0 z-30 bg-white/40 dark:bg-slate-900/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-slate-900/25 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] relative overflow-hidden py-2">
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
          <div className="flex items-center h-10 sm:h-11 md:h-12">
            {/* Left section - Logos */}
            <div className="flex-1 flex items-center gap-1 sm:gap-2 h-full px-1">
                <div className="rounded-lg opacity- px-0 sm:px-3 md:px-4 overflow-hidden flex items-center justify-center invert mix-blend-multiply filter brightness-80 transition-all h-full">
                <Image 
                  src="/HubClaw.svg" 
                  alt="HubClaw Logo"
                  width={32}
                  height={40}
                  className="h-6 sm:h-10 md:h-10 w-10 object-contain"
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
            
            {/* Center section - Cohort Toggle */}
            <div className="flex-1 flex items-center justify-center h-full px-1">
              <CohortToggleWidget 
                selectedCohort={selectedCohort}
                onCohortChange={handleCohortChange}
                className=""
              />
            </div>
            
            {/* Right section - Beta */}
            <div className="flex-1 flex items-center justify-end h-full px-1">
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
        
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Current Time Debug Display */}
        {/* <CurrentTimeDisplay /> */}
      
          {loading && (
        <div className="text-sm text-slate-500 flex items-center space-x-2">
            <div className="flex flex-col items-center space-y-1 mx-auto mb-2 mt-2 z-50">
            <div className="w-8 h-8 border-2 border-t-violet-900/50 border-r-violet-900/50 border-b-violet-900/50 border-l-slate-900/50 rounded-full animate-spin [animation-duration:.5s]"></div>
            <span>Loading...</span>
            </div>
        </div>
      )}
        {/* My Week Widget - Full width at top */}
        <div className="w-full mb-6">
          <MyWeekWidget 
            data={unifiedData?.myWeekData}
            selectedCohort={selectedCohort}
            cohortEvents={unifiedData?.cohortEvents}
            newsletterData={unifiedData?.newsletterData}
          />
        </div>
        
        {/* 8 Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
          {/* MainDashboardTabs - Columns 1-5 */}
          <div className="lg:col-span-5">
            <MainDashboardTabs 
              cohortEvents={cohortEvents}
              selectedCohort={selectedCohort}
            />
          </div>
          
          {/* Right Sidebar - Columns 6-8 */}
          <div className="lg:col-span-3">
            {/* DashboardTabs2 - Newsletter & other tabs */}
            <DashboardTabs2 dashboardData={unifiedData} />
          </div>
        </div>
        
        {/* Haas Resources Widget - Full width below dashboard */}
        <div className="mt-6">
          <HaasResourcesWidget />
        </div>
      </main>
      </div>
    </div>
  );
}

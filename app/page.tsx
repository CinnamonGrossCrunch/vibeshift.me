'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import MainDashboardTabs from "./components/MainDashboardTabs";
import DashboardTabs2 from "./components/DashboardTabs2";
import MyWeekWidget from "./components/MyWeekWidget";
import HaasResourcesWidget from "./components/HaasResourcesWidget";
import HaasJourneyWidget from "./components/HaasJourneyWidget";
import CohortToggleWidget from "./components/CohortToggleWidget";
import { usePerformance, getPerformanceClasses } from "./components/PerformanceProvider";
import type { CohortEvents } from '@/lib/icsUtils';
import type { UnifiedDashboardData } from '@/app/api/unified-dashboard/route';

type CohortType = 'blue' | 'gold';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { glassEffectClass, capabilities, shouldUseReducedMotion } = usePerformance();
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
          backgroundImage: "url('/haas bkg 2.png')",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover'
        }}
      ></div>
      
      {/* Content Overlay */}
      <div className="fixed inset-0 z-10 overflow-auto">
        {/* Header */}
        <div className={getPerformanceClasses(
          `w-full sticky top-0 z-30 backdrop-blur-md ${glassEffectClass} bg-turbulence relative overflow-hidden py-3 mb-5`,
          capabilities
        )}>

          <div className="pointer-events-none flex justify-left inset-0" style={{ maskImage: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,.7), transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,.7), transparent 70%)', filter: 'url(#glassDistort)' }} />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 relative">
          <div className="flex items-center h-10 sm:h-11 md:h-12">
            {/* Left section - Logos */}
            <div className="flex-1 flex items-center gap-1 sm:gap-2 h-full px-1">
                
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
                 <div className="flex-1 flex items-left justify-start h-full px-0">
              <div className="relative rounded-lg px-0 sm:px-3 md:px-4 overflow-hidden flex items-center justify-center h-full">
                <Image 
                  src="/Beta.svg" 
                  alt="[Beta]"
                  width={60}
                  height={24} 
                  title="Learn More about this project."
                  className="h-4 sm:h-5 md:h-7 w-auto mx-0 opacity-100 object-contain hover:invert filter brightness-10 hover:brightness-0 transition-all cursor-pointer"
                /> 
              </div>
            </div>
            
            {/* Center section*/}
          
            
            {/* Right section - Beta */}
        
            </div>
               <div className="flex-1 flex items-center justify-end h-full px-1">
              <CohortToggleWidget 
                selectedCohort={selectedCohort}
                onCohortChange={handleCohortChange}
                className=""
              />
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
        
        {/* Section A: My Week and Haas Journey */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-1 mb-6">
          {/* My Week Widget - Columns 1-5 */}
          <div className="lg:col-span-5">
            <MyWeekWidget 
              data={unifiedData?.myWeekData}
              selectedCohort={selectedCohort}
              cohortEvents={unifiedData?.cohortEvents}
              newsletterData={unifiedData?.newsletterData}
            />
          </div>
          
          {/* Haas Journey Resources - Columns 6-8 */}
          <div className="lg:col-span-3">
            <HaasJourneyWidget />
          </div>
        </div>
        
        {/* Section B: Dashboard Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-1 mb-6">
          {/* MainDashboardTabs - Columns 1-5 */}
          <div className="lg:col-span-5">
            <MainDashboardTabs 
              cohortEvents={{
                blue: unifiedData?.cohortEvents?.blue || cohortEvents?.blue || [],
                gold: unifiedData?.cohortEvents?.gold || cohortEvents?.gold || [],
                original: unifiedData?.cohortEvents?.original || cohortEvents?.original || [],
                launch: unifiedData?.cohortEvents?.launch || cohortEvents?.launch || [],
                calBears: unifiedData?.cohortEvents?.calBears || cohortEvents?.calBears || [],
                campusGroups: unifiedData?.cohortEvents?.campusGroups || cohortEvents?.campusGroups || []
              }}
              selectedCohort={selectedCohort}
            />
          </div>
          
          {/* DashboardTabs2 - Columns 6-8 */}
          <div className="lg:col-span-3">
            <DashboardTabs2 dashboardData={unifiedData} />
          </div>
        </div>
        
        {/* Section C: Haas Resources Widget - Full width */}
        <div className="mt-1">
          <HaasResourcesWidget />
        </div>
      </main>
      </div>
    </div>
  );
}

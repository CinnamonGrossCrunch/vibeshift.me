'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import MainDashboardTabs from "./components/MainDashboardTabs";
import DashboardTabs2 from "./components/DashboardTabs2";
import MyWeekWidget from "./components/MyWeekWidget";
import HaasResourcesWidget from "./components/HaasResourcesWidget";
import HaasJourneyWidget from "./components/HaasJourneyWidget";
import CohortToggleWidget from "./components/CohortToggleWidget";
import AnimatedLogo from "./components/AnimatedLogo";
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
  
  // Header animation states
  const [showLogo, setShowLogo] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(100);
  
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

  // Header animation sequence
  useEffect(() => {
    // Wait 1 second, then show logo to trigger animation
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1000);

    // Wait for logo animation to complete (4 seconds for animation)
    // Then start fading out the black overlay while logo holds on final frame
    const overlayTimer = setTimeout(() => {
      setOverlayOpacity(0);
    }, 4000); // 1s delay + 4s animation, then 2s fade during framehold

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(overlayTimer);
    };
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
      
      {/* Animated logo - z-index 100 (highest layer) - fixed positioning outside header stacking context */}
      <div className="fixed top-0 left-0 z-[100] pointer-events-none" style={{ paddingTop: 'max(0.5rem, 0.5rem)', paddingLeft: 'max(0.75rem, calc((100vw - 80rem) / 2 + 0.75rem + 0.25rem))' }}>
        <div className="rounded-lg opacity-100 overflow-visible flex items-center justify-center filter brightness-100 transition-all h-8 sm:h-10 md:h-14">
          {/* Logo placeholder to prevent layout shift */}
          <div className="h-8 sm:h-10 md:h-14 w-[120px] pointer-events-auto">
            {showLogo && (
              <AnimatedLogo
                videoSrc="/oskihub_anim.mp4"
                fallbackImageSrc="/oskihub_anim_still.png"
                alt="OskiHub Logo"
                width={120}
                height={56}
                className="h-8 sm:h-10 md:h-14 w-auto object-contain"
                playOnce={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="fixed inset-0 z-50 overflow-auto">
        {/* Header */}
        <div className={getPerformanceClasses(
          `w-full sticky top-0 z-30 bg-black/10 backdrop-blur-lg relative overflow-hidden py-1 mb-0`,
          capabilities
        )}>
          {/* Animated black overlay - z-index 20 (middle layer) */}
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-2000 ease-out pointer-events-none z-20"
            style={{ opacity: overlayOpacity / 100 }}
          />

          <div className="pointer-events-none flex justify-left inset-0" style={{ maskImage: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,.7), transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 30% 25%, rgba(0,0,0,.7), transparent 70%)', filter: 'url(#glassDistort)' }} />
        
        {/* Loading spinner - centered on page */}
        {loading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-t-violet-900/50 border-r-violet-900/50 border-b-violet-900/50 border-l-slate-900/50 rounded-full animate-spin [animation-duration:.5s]"></div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 relative z-10">
          <div className="flex items-center h-10 sm:h-11 md:h-12">
            {/* Left section - Logos */}
            <div className="flex-1 flex items-center gap-1 sm:gap-2 h-full px-1">
          
              {/* Spacer to reserve space for absolutely positioned logo */}
              <div className="w-[120px] h-full"></div>
           <div className="flex-1 flex items-left justify-start h-full px-0">
              <div className="relative rounded-lg px-0 sm:px-3 md:px-4 overflow-hidden flex items-center justify-center h-full">
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
            
            {/* Center section */}
            
            {/* Right section - Cohort Toggle */}
        
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-0 relative">
        {/* Current Time Debug Display */}
        {/* <CurrentTimeDisplay /> */}
      
        {/* Animated black overlay - z-index 20 (middle layer) */}
          <div 
            className="fixed inset-0 bg-black transition-opacity duration-2000 ease-out pointer-events-none z-45"
            style={{ opacity: overlayOpacity / 100 }}
          />
        {/* Section A: Haas Journey (Full Width Row) */}
        <div className="mb-0">
          <HaasJourneyWidget />
        </div>
        
        {/* Section B: My Week Widget */}
        <div className="mb-0">
          <MyWeekWidget 
            data={unifiedData?.myWeekData}
            selectedCohort={selectedCohort}
            cohortEvents={unifiedData?.cohortEvents}
            newsletterData={unifiedData?.newsletterData}
          />
        </div>
        
        {/* Section C: Dashboard Tabs */}
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

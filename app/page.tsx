'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import MainDashboardTabs from "./components/MainDashboardTabs";
import DashboardTabs2 from "./components/DashboardTabs2";
import MyWeekWidget from "./components/MyWeekWidget";
import WeatherWidget from "./components/WeatherWidget";
import TravelTimeWidget from "./components/TravelTimeWidget";
import CurrentTimeWidget from "./components/CurrentTimeWidget";
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
  
  // Dynamic layout state - track if DashboardTabs2 is taller than MainDashboardTabs
  const [isDash2Taller, setIsDash2Taller] = useState(false);

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
  
  // Check heights after data loads and on resize
  useEffect(() => {
    const checkHeights = () => {
      const mainDash = document.getElementById('main-dashboard-tabs');
      const dash2 = document.getElementById('dashboard-tabs-2');
      
      if (mainDash && dash2) {
        const mainHeight = mainDash.offsetHeight;
        const dash2Height = dash2.offsetHeight;
        // Only consider Dash2 "taller" if it exceeds MainDash by more than 10px (buffer for rounding)
        setIsDash2Taller(dash2Height > mainHeight + 10);
      }
    };
    
    // Check on mount and when data changes
    if (!loading) {
      // Multiple delays to catch content as it renders
      setTimeout(checkHeights, 100);
      setTimeout(checkHeights, 500);
      setTimeout(checkHeights, 1000);
      setTimeout(checkHeights, 2000);
    }
    
    // Check on window resize
    window.addEventListener('resize', checkHeights);
    return () => window.removeEventListener('resize', checkHeights);
  }, [loading, unifiedData]);
  
  return (
    <div className="relative z-0 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image Layer */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[url('/haas_bkg_2.png')] bg-cover bg-center bg-no-repeat bg-fixed"></div>
      
      {/* Dark Overlay - Fallback for browsers without mix-blend support */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black/50 supports-[mix-blend-mode:multiply]:hidden"></div>
      
      {/* Dark Overlay - Gradient blend for browsers with support */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-black/60 via-black/50 to-black/60 mix-blend-multiply hidden supports-[mix-blend-mode:multiply]:block"></div>
      
      {/* Animated logo - z-index 100 (highest layer) - anchored to top with max-w-[90rem] alignment */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
        <div className="max-w-[90rem] mx-auto px-3 sm:px-4 lg:px-6 py-2">
          <div className="h-8 sm:h-14 md:h-14 w-[120px] pointer-events-auto">
            {showLogo && (
              <AnimatedLogo
                videoSrc="/oskihub_anim.mp4"
                fallbackImageSrc="/oskihub_anim_still.png"
                alt="OskiHub Logo"
                width={120}
                height={56}
                className="h-8 sm:h-14 md:h-14 w-auto object-contain"
                playOnce={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div
          className="fixed inset-0 z-50 overflow-auto"
          style={{ scrollbarGutter: 'stable both-edges' }}>
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10 border-2 border-t-violet-900/50 border-r-violet-900/50 border-b-violet-900/50 border-l-slate-900/50 rounded-full animate-spin [animation-duration:.5s]"></div>
          </div>
        )}

        <div className="max-w-[90rem] mx-auto px-3 sm:px-4 lg:px-6 py-2 relative z-10">
          <div className="flex items-center h-10 sm:h-12 md:h-12">
            {/* Left section - Logos */}
            <div className="flex-1 flex items-center gap-1 sm:gap-2 h-full px-1">
          
              {/* Spacer to reserve space for absolutely positioned logo */}
              <div className="w-[120px] h-full"></div>
           {/* Beta Badge - Hidden for now */}
           {/* <div className="flex-1 flex items-left justify-start h-full px-0">
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
            </div> */}
            
            {/* Center section */}
            
            </div> {/* Close Left section */}
            
            {/* Right section - Cohort Toggle */}
            <div className="flex-1 flex items-center justify-end h-full px-1">
              <CohortToggleWidget 
          selectedCohort={selectedCohort}
          onCohortChange={handleCohortChange}
          className=""
              />
            </div>
          </div>
        </div>
        </div> {/* Close Header */}
        
      {/* Main Content */}
      <main className="max-w-[90rem] mx-auto px-3 sm:px-0 lg:px-1 py-0 relative">
        {/* Current Time Debug Display */}
        {/* <CurrentTimeDisplay /> */}
      
        {/* Animated black overlay - z-index 20 (middle layer) */}
          <div 
            className="fixed inset-0 bg-black transition-opacity duration-2000 ease-out pointer-events-none z-45"
            style={{ opacity: overlayOpacity / 100 }}
          />
        {/* Section A: Haas Journey (Full Width Row) */}
        <div className="mb-0 border-b border-slate-700">
          <HaasJourneyWidget />
        </div>
      
  
        {/* Section B: My Week Widget and Weather Widget */}
        <div className="flex flex-col lg:flex-row mt-2 lg:py-2 mb-0 gap-0 items-start">
          {/* Weather Widget - Side by side on small/medium, right-aligned, above My Week */}
          <div className="flex-shrink-0 flex items-start justify-end w-full lg:w-auto lg:order-2 lg:min-w-0 mb-0">
            <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-0 min-w-0 justify-end">
              {/* Weather and Travel - side by side on small/medium, stacked on large */}
              <WeatherWidget />
              <TravelTimeWidget />
            </div>
          </div>
          
          {/* My Week Widget - Grows to fill available space, below weather on small/medium */}
          <div className="flex-grow flex items-center min-w-0 w-full lg:order-1">
                         {/* Current Time Widget - Above My Week */}
        {/* <div className="mt-2 hidden sm:block">
          <CurrentTimeWidget />
        </div> */}
            <MyWeekWidget 
              data={unifiedData?.myWeekData}
              selectedCohort={selectedCohort}
              cohortEvents={unifiedData?.cohortEvents}
              newsletterData={unifiedData?.newsletterData}
            />
          </div>
        </div>
        
        {/* Section C: Dashboard Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-8 lg:auto-rows-min gap-1 mt-4 mb-6">
          {/* Left Column: MainDashboardTabs - Always 6 columns on large screens */}
          <div className="lg:col-span-6 lg:row-span-1">
            <div id="main-dashboard-tabs">
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
                dashboardData={unifiedData}
              />
            </div>
          </div>
          
          {/* Right Column: DashboardTabs2 - Hidden on small screens, spans 2 rows conditionally */}
          <div className={`hidden lg:block lg:col-span-2 ${isDash2Taller ? 'lg:row-span-2' : 'lg:row-span-1'}`}>
            <div id="dashboard-tabs-2" className="lg:min-h-full">
              <DashboardTabs2 dashboardData={unifiedData} />
            </div>
          </div>
          
          {/* Haas Resources Widget - Dynamic width: 6 cols if Dash2 is taller, otherwise full 8 cols in new row */}
          {isDash2Taller ? (
            <div className="lg:col-span-6 lg:row-span-1 mt-1 lg:mt-0">
              <HaasResourcesWidget />
            </div>
          ) : (
            <div className="lg:col-span-8 lg:row-span-1 mt-1 lg:mt-0">
              <HaasResourcesWidget />
            </div>
          )}
        </div>
      </main>
    </div>
  </div>
  );
}

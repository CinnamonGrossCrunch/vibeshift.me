// Node runtime required for OpenAI and cheerio
export const runtime = 'nodejs';
// Cache on the server for some time to reduce upstream load
export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';
import { analyzeCohortMyWeekWithAI } from '@/lib/my-week-analyzer';
import { getCohortEvents, type CalendarEvent } from '@/lib/icsUtils';

export interface UnifiedDashboardData {
  // Newsletter data for NewsletterWidget
  newsletterData: {
    sourceUrl: string;
    title?: string;
    sections: {
      sectionTitle: string;
      items: {
        title: string;
        html: string;
        timeSensitive?: {
          dates: string[];
          deadline?: string;
          eventType: 'deadline' | 'event' | 'announcement' | 'reminder';
          priority: 'high' | 'medium' | 'low';
        };
      }[];
    }[];
    aiDebugInfo?: {
      reasoning: string;
      sectionDecisions: string[];
      edgeCasesHandled: string[];
      totalSections: number;
  processingTime: number;
  model?: string;
  modelsTried?: string[];
  modelLatency?: number;
    };
  };
  
  // My Week data for MyWeekWidget - now supports both cohorts
  myWeekData: {
    weekStart: string;
    weekEnd: string;
    blueEvents: {
      date: string;
      time?: string;
      title: string;
      type: 'calendar' | 'newsletter' | 'academic' | 'social';
      description?: string;
      location?: string;
      url?: string;
    }[];
    goldEvents: {
      date: string;
      time?: string;
      title: string;
      type: 'calendar' | 'newsletter' | 'academic' | 'social';
      description?: string;
      location?: string;
      url?: string;
    }[];
    blueSummary: string;
    goldSummary: string;
    processingTime: number;
  };
  
  // Calendar data for any components that need raw calendar events
  cohortEvents: {
    blue?: CalendarEvent[];
    gold?: CalendarEvent[];
    original?: CalendarEvent[];
    launch?: CalendarEvent[];
    calBears?: CalendarEvent[];
  };
  
  // Processing metadata
  processingInfo: {
    totalTime: number;
    newsletterTime: number;
    calendarTime: number;
    myWeekTime: number;
    timestamp: string;
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Unified Dashboard API: Starting comprehensive data fetch');
    console.log('🔑 OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
    console.log('🤖 OpenAI Model:', process.env.OPENAI_MODEL || 'not set');
    
    // Start all data fetching operations in parallel
    const [newsletterResult, calendarResult] = await Promise.allSettled([
      // Newsletter data fetch and AI organization
      (async () => {
        const newsletterStart = Date.now();
        console.log('📰 Fetching and organizing newsletter data...');
        
        const latest = await getLatestNewsletterUrl();
        console.log('📰 Latest URL found:', latest);
        
        const rawData = await scrapeNewsletter(latest);
        console.log('📰 Data scraped successfully');
        
        // Use OpenAI to organize the content intelligently
        const organizedData = await organizeNewsletterWithAI(
          rawData.sections, 
          rawData.sourceUrl, 
          rawData.title
        );
        console.log('📰 Content organized with AI');
        
        return {
          data: organizedData,
          processingTime: Date.now() - newsletterStart
        };
      })(),
      
      // Calendar data fetch
      (async () => {
        const calendarStart = Date.now();
        console.log('📅 Fetching cohort events...');
        
        const cohortEvents = await getCohortEvents(45, 150); // Same parameters as calendar API
        console.log('📅 Cohort events fetched successfully');
        
        return {
          data: cohortEvents,
          processingTime: Date.now() - calendarStart
        };
      })()
    ]);
    
    // Handle any failures in data fetching
    if (newsletterResult.status === 'rejected') {
      console.error('❌ Newsletter fetch failed:', newsletterResult.reason);
      throw new Error(`Newsletter fetch failed: ${newsletterResult.reason}`);
    }
    
    if (calendarResult.status === 'rejected') {
      console.error('❌ Calendar fetch failed:', calendarResult.reason);
      throw new Error(`Calendar fetch failed: ${calendarResult.reason}`);
    }
    
    const newsletterData = newsletterResult.value.data;
    const cohortEvents = calendarResult.value.data;
    const newsletterTime = newsletterResult.value.processingTime;
    const calendarTime = calendarResult.value.processingTime;
    
    // Now run My Week AI analysis with the fetched data
    const myWeekStart = Date.now();
    console.log('🤖 Running My Week AI analysis...');
    
    const myWeekData = await analyzeCohortMyWeekWithAI(cohortEvents, newsletterData);
    const myWeekTime = Date.now() - myWeekStart;
    
    console.log('🤖 My Week analysis completed');
    
    const totalTime = Date.now() - startTime;
    
    const response: UnifiedDashboardData = {
      newsletterData: {
        ...newsletterData,
        // Ensure aiDebugInfo matches expected type
        aiDebugInfo: newsletterData.aiDebugInfo ? {
          reasoning: newsletterData.aiDebugInfo.reasoning || 'AI processing completed',
          sectionDecisions: newsletterData.aiDebugInfo.sectionDecisions || [],
          edgeCasesHandled: newsletterData.aiDebugInfo.edgeCasesHandled || [],
          totalSections: newsletterData.aiDebugInfo.totalSections,
          processingTime: newsletterData.aiDebugInfo.processingTime || 0
        } : undefined
      },
      myWeekData,
      cohortEvents,
      processingInfo: {
        totalTime,
        newsletterTime,
        calendarTime,
        myWeekTime,
        timestamp: new Date().toISOString()
      }
    };
      // Attach aiMeta if present
      // @ts-expect-error augment for debug
      response.newsletterData.aiMeta = {
        model: response.newsletterData.aiDebugInfo?.model,
        modelsTried: response.newsletterData.aiDebugInfo?.modelsTried,
        ms: response.newsletterData.aiDebugInfo?.modelLatency
      };
      // @ts-expect-error augment for debug
      response.myWeekData.aiMeta = (myWeekData as any).aiMeta;
    
    console.log(`✅ Unified Dashboard API completed in ${totalTime}ms`);
    console.log(`📊 Breakdown: Newsletter ${newsletterTime}ms, Calendar ${calendarTime}ms, My Week ${myWeekTime}ms`);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('💥 Unified Dashboard API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to load dashboard data', 
        details: errorMessage,
        processingInfo: {
          totalTime: Date.now() - startTime,
          newsletterTime: 0,
          calendarTime: 0,
          myWeekTime: 0,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

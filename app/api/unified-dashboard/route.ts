// Node runtime required for OpenAI and cheerio
export const runtime = 'nodejs';
// Use ISR with 1 hour revalidation - caches response but rebuilds every hour
export const revalidate = 3600;
// Force dynamic to prevent prerendering during build
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';
import { analyzeCohortMyWeekWithAI, type CohortMyWeekAnalysis } from '@/lib/my-week-analyzer';
import { getCohortEvents, type CalendarEvent } from '@/lib/icsUtils';

// Safe console.log that doesn't interfere with JSON responses in production
const safeLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const safeError = (...args: unknown[]) => {
  // Always log errors, but ensure they don't leak into response
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

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
  
  // My Week data for MyWeekWidget - now supports both cohorts with enhanced categorization
  myWeekData: {
    weekStart: string;
    weekEnd: string;
    blueEvents: {
      date: string;
      time?: string;
      title: string;
      type: 'assignment' | 'class' | 'exam' | 'administrative' | 'social' | 'newsletter' | 'other';
      priority?: 'high' | 'medium' | 'low';
      description?: string;
      location?: string;
      url?: string;
    }[];
    goldEvents: {
      date: string;
      time?: string;
      title: string;
      type: 'assignment' | 'class' | 'exam' | 'administrative' | 'social' | 'newsletter' | 'other';
      priority?: 'high' | 'medium' | 'low';
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
    campusGroups?: CalendarEvent[];
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
    // Start all data fetching operations in parallel
    const [newsletterResult, calendarResult] = await Promise.allSettled([
      // Newsletter data fetch and AI organization
      (async () => {
        const newsletterStart = Date.now();
        
        const latest = await getLatestNewsletterUrl();
        
        const rawData = await scrapeNewsletter(latest);
        
        // Use OpenAI to organize the content intelligently
        const organizedData = await organizeNewsletterWithAI(
          rawData.sections, 
          rawData.sourceUrl, 
          rawData.title
        );
        
        return {
          data: organizedData,
          processingTime: Date.now() - newsletterStart
        };
      })(),
      
      // Calendar data fetch
      (async () => {
        const calendarStart = Date.now();
        
        const cohortEvents = await getCohortEvents(150, 150); // Extended to 150 days ahead to show December events
        
        return {
          data: cohortEvents,
          processingTime: Date.now() - calendarStart
        };
      })()
    ]);
    
    // Handle any failures in data fetching
    if (newsletterResult.status === 'rejected') {
      safeError('❌ Newsletter fetch failed:', newsletterResult.reason);
      throw new Error(`Newsletter fetch failed: ${newsletterResult.reason}`);
    }
    
    if (calendarResult.status === 'rejected') {
      safeError('❌ Calendar fetch failed:', calendarResult.reason);
      throw new Error(`Calendar fetch failed: ${calendarResult.reason}`);
    }
    
    const newsletterData = newsletterResult.value.data;
    const cohortEvents = calendarResult.value.data;
    const newsletterTime = newsletterResult.value.processingTime;
    const calendarTime = calendarResult.value.processingTime;
    
    // Now run My Week AI analysis with the fetched data
    const myWeekStart = Date.now();
    
    let myWeekData: CohortMyWeekAnalysis;
    let myWeekTime = 0;
    try {
      myWeekData = await analyzeCohortMyWeekWithAI(cohortEvents, newsletterData);
      myWeekTime = Date.now() - myWeekStart;
    } catch (error) {
      safeError('❌ My Week analysis failed:', error);
      // Provide fallback data with correct structure
      myWeekData = {
        weekStart: new Date().toISOString(),
        weekEnd: new Date().toISOString(),
        blueEvents: [],
        goldEvents: [],
        blueSummary: 'No events found for the blue cohort this week.',
        goldSummary: 'No events found for the gold cohort this week.',
        processingTime: 0
      };
      myWeekTime = Date.now() - myWeekStart;
    }
    
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
      response.myWeekData.aiMeta = (myWeekData as CohortMyWeekAnalysis).aiMeta;
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
    
  } catch (error) {
    safeError('💥 Unified Dashboard API Error:', error);
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

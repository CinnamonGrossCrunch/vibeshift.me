// Node runtime required for ical parsing
export const runtime = 'nodejs';
// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
// Cache on the server for some time to reduce upstream load
export const revalidate = 3600;

import { NextResponse, NextRequest } from 'next/server';
import { getCohortEvents } from '@/lib/icsUtils';

// Safe logging that doesn't interfere with JSON responses in production
const safeLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const safeError = (...args: unknown[]) => {
  if (typeof process !== 'undefined' && process.stderr) {
    console.error(...args);
  }
};

export async function GET(request: NextRequest) {
  try {
    safeLog('Calendar API: Starting cohort events request');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('daysAhead') || '150');
    const limit = parseInt(searchParams.get('limit') || '150');
    
    const cohortEvents = await getCohortEvents(daysAhead, limit);
    safeLog(`Calendar API: Found Blue: ${cohortEvents.blue.length}, Gold: ${cohortEvents.gold.length}, Original: ${cohortEvents.original.length} events`);
    
    return NextResponse.json(cohortEvents, { 
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale for 1 day
      },
    });
  } catch (err: unknown) {
    safeError('Calendar API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to load calendar data', 
        details: errorMessage,
        // Return empty cohort structure on error
        blue: [],
        gold: [],
        original: [],
        launch: [],
        calBears: [],
        campusGroups: []
      },
      { status: 500 }
    );
  }
}

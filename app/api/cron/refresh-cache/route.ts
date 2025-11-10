// Vercel Cron Job: Refresh cache at midnight
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 300 seconds (5 minutes) - Allow time for calendar processing

import { NextResponse } from 'next/server';
import { analyzeCohortMyWeekWithAI } from '@/lib/my-week-analyzer';
import { getCohortEvents } from '@/lib/icsUtils';
import { setCachedData, CACHE_KEYS } from '@/lib/cache';

export async function GET(request: Request) {
  // Verify this is a cron job request from Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🌙 Cron: Midnight cache refresh started...');
    
    // Fetch calendar events
    const cohortEvents = await getCohortEvents();
    
    // Pre-generate AI summaries for both cohorts (no newsletter data needed for midnight refresh)
    const myWeekData = await analyzeCohortMyWeekWithAI({
      blue: cohortEvents.blue || [],
      gold: cohortEvents.gold || []
    }, { sections: [] }); // Empty newsletter data
    
    // 🚀 WRITE TO CACHE (KV + static fallback)
    console.log('💾 Cron: Writing to cache...');
    await setCachedData(CACHE_KEYS.COHORT_EVENTS, cohortEvents, { writeStatic: true });
    await setCachedData(CACHE_KEYS.MY_WEEK_DATA, myWeekData, { writeStatic: true });
    
    console.log('✅ Cron: Midnight cache refresh completed (data written to KV + static)');
    
    return NextResponse.json({
      success: true,
      message: 'Cache refreshed at midnight',
      timestamp: new Date().toISOString(),
      cached: {
        cohortEvents: true,
        myWeekData: true
      }
    });
  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { error: 'Cache refresh failed', details: String(error) },
      { status: 500 }
    );
  }
}

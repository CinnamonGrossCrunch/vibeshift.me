// Vercel Cron Job: Refresh newsletter at 8:10 AM Pacific
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';
import { analyzeCohortMyWeekWithAI } from '@/lib/my-week-analyzer';
import { getCohortEvents } from '@/lib/icsUtils';

export async function GET(request: Request) {
  // Verify this is a cron job request from Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📰 Cron: 8:10 AM newsletter refresh started...');
    
    // Fetch and process newsletter
    const latestUrl = await getLatestNewsletterUrl();
    const rawNewsletter = await scrapeNewsletter(latestUrl);
    const organizedNewsletter = await organizeNewsletterWithAI(rawNewsletter.sections, latestUrl, rawNewsletter.title);
    
    // Fetch calendar events
    const cohortEvents = await getCohortEvents();
    
    // Pre-generate AI summaries with newsletter data
    await analyzeCohortMyWeekWithAI({
      blue: cohortEvents.blue || [],
      gold: cohortEvents.gold || []
    }, organizedNewsletter);
    
    console.log('✅ Cron: 8:10 AM newsletter refresh completed');
    
    return NextResponse.json({
      success: true,
      message: 'Newsletter and cache refreshed at 8:10 AM',
      timestamp: new Date().toISOString(),
      newsletterUrl: latestUrl
    });
  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { error: 'Newsletter refresh failed', details: String(error) },
      { status: 500 }
    );
  }
}

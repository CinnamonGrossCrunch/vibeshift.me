// Vercel Cron Job: Refresh newsletter at 8:10 AM Pacific
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 300 seconds (5 minutes) - AI processing takes ~76s

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
    const startTime = Date.now();
    
    // Fetch and process newsletter (this warms the cache!)
    console.log('🔍 Cron: Fetching latest newsletter URL...');
    const latestUrl = await getLatestNewsletterUrl();
    
    console.log('📄 Cron: Scraping newsletter content...');
    const rawNewsletter = await scrapeNewsletter(latestUrl);
    
    console.log('🤖 Cron: Processing newsletter with AI (this warms the cache)...');
    const organizedNewsletter = await organizeNewsletterWithAI(rawNewsletter.sections, latestUrl, rawNewsletter.title);
    
    console.log('📅 Cron: Fetching calendar events...');
    const cohortEvents = await getCohortEvents();
    
    console.log('🧠 Cron: Pre-generating AI summaries...');
    await analyzeCohortMyWeekWithAI({
      blue: cohortEvents.blue || [],
      gold: cohortEvents.gold || []
    }, organizedNewsletter);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Cron: 8:10 AM newsletter refresh completed in ${duration}ms`);
    console.log('💾 Cron: Newsletter cache is now warm - users will experience instant loads!');
    
    return NextResponse.json({
      success: true,
      message: 'Newsletter and cache refreshed at 8:10 AM',
      timestamp: new Date().toISOString(),
      newsletterUrl: latestUrl,
      durationMs: duration,
      sectionsProcessed: organizedNewsletter.sections.length
    });
  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { error: 'Newsletter refresh failed', details: String(error) },
      { status: 500 }
    );
  }
}

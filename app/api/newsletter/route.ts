// Node runtime required for cheerio
export const runtime = 'nodejs';
// Use ISR with 1 hour revalidation - caches response but rebuilds every hour
export const revalidate = 3600;
// Force dynamic to prevent prerendering during build
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';

// Safe logging that won't contaminate API responses
const safeLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export async function GET() {
  try {
    safeLog('Newsletter API: Starting request');
    const latest = await getLatestNewsletterUrl();
    safeLog('Newsletter API: Latest URL found:', latest);
    const rawData = await scrapeNewsletter(latest);
    safeLog('Newsletter API: Data scraped successfully');
    
    // Use OpenAI to organize the content intelligently
    const organizedData = await organizeNewsletterWithAI(
      rawData.sections, 
      rawData.sourceUrl, 
      rawData.title
    );
    safeLog('Newsletter API: Content organized with AI');
    
    return NextResponse.json(organizedData, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Newsletter API Error:', err);
    }
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to load newsletter data', details: errorMessage },
      { status: 500 }
    );
  }
}

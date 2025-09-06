// Node runtime required for cheerio
export const runtime = 'nodejs';
// Cache on the server for some time to reduce upstream load
export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';

export async function GET() {
  try {
    console.log('Newsletter API: Starting request');
    const latest = await getLatestNewsletterUrl();
    console.log('Newsletter API: Latest URL found:', latest);
    const rawData = await scrapeNewsletter(latest);
    console.log('Newsletter API: Data scraped successfully');
    
    // Use OpenAI to organize the content intelligently
    const organizedData = await organizeNewsletterWithAI(
      rawData.sections, 
      rawData.sourceUrl, 
      rawData.title
    );
    console.log('Newsletter API: Content organized with AI');
    
    return NextResponse.json(organizedData, { status: 200 });
  } catch (err: unknown) {
    console.error('Newsletter API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to load newsletter data', details: errorMessage },
      { status: 500 }
    );
  }
}

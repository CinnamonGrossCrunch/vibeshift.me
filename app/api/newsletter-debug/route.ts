import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';

export async function GET() {
  try {
    console.log('Debug API: Starting newsletter analysis with AI debugging');
    
    const latest = await getLatestNewsletterUrl();
    console.log('Debug API: Latest URL found:', latest);
    
    const rawData = await scrapeNewsletter(latest);
    console.log('Debug API: Raw data scraped, sections:', rawData.sections.length);
    
    const organizedData = await organizeNewsletterWithAI(
      rawData.sections, 
      rawData.sourceUrl, 
      rawData.title
    );
    
    return NextResponse.json({
      success: true,
      originalSections: rawData.sections.length,
      organizedSections: organizedData.sections.length,
      debugInfo: organizedData.aiDebugInfo,
      organizedData: organizedData
    }, { status: 200 });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: 'Failed to debug newsletter organization', details: error },
      { status: 500 }
    );
  }
}

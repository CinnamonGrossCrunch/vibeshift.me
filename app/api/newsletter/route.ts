// Node runtime required for cheerio
export const runtime = 'nodejs';
// Cache on the server for some time to reduce upstream load
export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { getLatestNewsletterUrl, scrapeNewsletter } from '@/lib/scrape';

export async function GET() {
  try {
    const latest = await getLatestNewsletterUrl();
    const data = await scrapeNewsletter(latest);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getHaasResourcesData } from '@/lib/resources';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const resourcesData = await getHaasResourcesData();
    
    return NextResponse.json(resourcesData, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale for 1 day
      },
    });
  } catch (error) {
    console.error('Resources API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch resources data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

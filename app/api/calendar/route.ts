import { NextResponse } from 'next/server';
import { getCohortEvents } from '@/lib/icsUtils';

export async function GET() {
  try {
    const events = await getCohortEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
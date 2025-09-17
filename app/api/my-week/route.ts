// Node runtime required for OpenAI
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { analyzeMyWeekWithAI } from '@/lib/my-week-analyzer';

export async function POST(request: NextRequest) {
  console.log('My Week API: Starting request');
  
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('My Week API: OpenAI API key not configured');
      return NextResponse.json(
        { error: 'AI analysis is not available. OpenAI API key is not configured.' }, 
        { status: 503 }
      );
    }

    const body = await request.json();
    const { cohortEvents, newsletterData } = body;
    
    console.log('My Week API: Received data for analysis');
    console.log('- Cohort events:', !!cohortEvents);
    console.log('- Newsletter data:', !!newsletterData);
    
    // Analyze the week with AI
    const weekAnalysis = await analyzeMyWeekWithAI(cohortEvents, newsletterData);
    
    console.log('My Week API: Analysis completed successfully');
    console.log('- Events found:', weekAnalysis.events.length);
    console.log('- Processing time:', weekAnalysis.processingTime, 'ms');
    
    return NextResponse.json(weekAnalysis);
    
  } catch (error) {
    console.error('My Week API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze week',
        message: error instanceof Error ? error.message : 'Unknown error',
        weekStart: new Date().toISOString().split('T')[0],
        weekEnd: new Date().toISOString().split('T')[0],
        events: [],
        aiSummary: 'Unable to analyze week due to an error.',
        processingTime: 0
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'My Week API requires POST method with cohortEvents and newsletterData',
      usage: 'POST /api/my-week with { cohortEvents, newsletterData } in body'
    },
    { status: 405 }
  );
}

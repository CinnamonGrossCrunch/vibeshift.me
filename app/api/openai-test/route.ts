import { NextResponse } from 'next/server';
import { organizeNewsletterWithAI } from '@/lib/openai-organizer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { sections, sourceUrl, title } = await request.json();
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const organized = await organizeNewsletterWithAI(sections, sourceUrl, title);
    
    return NextResponse.json(organized, { status: 200 });
  } catch (error) {
    console.error('OpenAI organization error:', error);
    return NextResponse.json(
      { error: 'Failed to organize content with AI' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // During build time, environment variables might not be available
  // Return a safe response that doesn't trigger initialization errors
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({ 
    hasApiKey,
    message: hasApiKey ? 'OpenAI API configured' : 'OpenAI API key missing',
    buildTime: !hasApiKey && process.env.NODE_ENV === 'production'
  });
}

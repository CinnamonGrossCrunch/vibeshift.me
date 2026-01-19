// API endpoint for sending deployment notifications (called by GitHub Actions)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sendDeploymentNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  // Verify this is an authorized request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { environment, success, commitMessage, deploymentUrl } = body;
    
    if (typeof success !== 'boolean') {
      return NextResponse.json({ error: 'Missing required field: success' }, { status: 400 });
    }

    const sent = await sendDeploymentNotification({
      environment: environment || 'production',
      success,
      commitMessage,
      deploymentUrl,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      emailSent: sent,
      message: sent ? 'Deployment notification sent' : 'Notification skipped (not configured)',
    });
  } catch (error) {
    console.error('❌ Deployment notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: String(error) },
      { status: 500 }
    );
  }
}

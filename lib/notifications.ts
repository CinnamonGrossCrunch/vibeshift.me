/**
 * Email Notification System for Cron Jobs and Deployments
 * 
 * Uses Resend (https://resend.com) for transactional emails.
 * Free tier: 100 emails/day, which is plenty for cron notifications.
 * 
 * Setup:
 * 1. Create account at https://resend.com
 * 2. Get API key from dashboard
 * 3. Add RESEND_API_KEY to Vercel environment variables
 * 4. Add NOTIFICATION_EMAIL (your email) to Vercel environment variables
 */

import { Resend } from 'resend';

// Initialize Resend client (only if API key is set)
let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ [Notifications] Resend email client initialized');
} else {
  console.warn('⚠️ [Notifications] RESEND_API_KEY not set - email notifications disabled');
}

// Target email for notifications
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

interface CronNotificationData {
  jobName: string;
  success: boolean;
  durationMs: number;
  timestamp: string;
  details?: {
    newsletterTitle?: string;
    newsletterUrl?: string;
    sectionsProcessed?: number;
    warnings?: string[];
    error?: string;
  };
}

interface DeploymentNotificationData {
  environment: 'production' | 'preview';
  success: boolean;
  commitMessage?: string;
  deploymentUrl?: string;
  timestamp: string;
}

/**
 * Send notification for cron job completion (success or failure)
 */
export async function sendCronNotification(data: CronNotificationData): Promise<boolean> {
  if (!resend || !NOTIFICATION_EMAIL) {
    console.log('📧 [Notifications] Email notifications disabled (missing RESEND_API_KEY or NOTIFICATION_EMAIL)');
    return false;
  }

  const statusEmoji = data.success ? '✅' : '❌';
  const statusText = data.success ? 'SUCCESS' : 'FAILED';
  const durationSec = (data.durationMs / 1000).toFixed(1);

  // Build details section
  let detailsHtml = '';
  if (data.details) {
    const d = data.details;
    detailsHtml = `
      <h3>Details:</h3>
      <ul>
        ${d.newsletterTitle ? `<li><strong>Newsletter:</strong> ${d.newsletterTitle}</li>` : ''}
        ${d.newsletterUrl ? `<li><strong>URL:</strong> <a href="${d.newsletterUrl}">${d.newsletterUrl}</a></li>` : ''}
        ${d.sectionsProcessed ? `<li><strong>Sections Processed:</strong> ${d.sectionsProcessed}</li>` : ''}
        ${d.error ? `<li><strong>Error:</strong> <code style="color: red;">${d.error}</code></li>` : ''}
      </ul>
      ${d.warnings && d.warnings.length > 0 ? `
        <h3>⚠️ Warnings:</h3>
        <ul>
          ${d.warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      ` : ''}
    `;
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${data.success ? '#22c55e' : '#ef4444'};">
        ${statusEmoji} Cron Job ${statusText}
      </h1>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Job</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.jobName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Status</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${statusText}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Duration</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${durationSec} seconds</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Timestamp</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.timestamp}</td>
        </tr>
      </table>
      
      ${detailsHtml}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This notification was sent by OSKI App (www.oski.app)<br>
        <a href="https://www.oski.app/admin">View Admin Dashboard</a>
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: 'OSKI App <notifications@resend.dev>', // Use resend.dev domain for free tier
      to: NOTIFICATION_EMAIL,
      subject: `${statusEmoji} [OSKI] Cron: ${data.jobName} - ${statusText}`,
      html: htmlContent,
    });

    console.log(`📧 [Notifications] Email sent successfully: ${result.data?.id}`);
    return true;
  } catch (error) {
    console.error('❌ [Notifications] Failed to send email:', error);
    return false;
  }
}

/**
 * Send notification for deployment completion
 */
export async function sendDeploymentNotification(data: DeploymentNotificationData): Promise<boolean> {
  if (!resend || !NOTIFICATION_EMAIL) {
    console.log('📧 [Notifications] Email notifications disabled');
    return false;
  }

  const statusEmoji = data.success ? '🚀' : '💥';
  const statusText = data.success ? 'DEPLOYED' : 'FAILED';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${data.success ? '#3b82f6' : '#ef4444'};">
        ${statusEmoji} Deployment ${statusText}
      </h1>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Environment</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.environment}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Status</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${statusText}</td>
        </tr>
        ${data.commitMessage ? `
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Commit</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.commitMessage}</td>
        </tr>
        ` : ''}
        ${data.deploymentUrl ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>URL</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><a href="${data.deploymentUrl}">${data.deploymentUrl}</a></td>
        </tr>
        ` : ''}
        <tr style="background: #f3f4f6;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Timestamp</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${data.timestamp}</td>
        </tr>
      </table>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This notification was sent by OSKI App (www.oski.app)
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: 'OSKI App <notifications@resend.dev>',
      to: NOTIFICATION_EMAIL,
      subject: `${statusEmoji} [OSKI] ${data.environment} - ${statusText}`,
      html: htmlContent,
    });

    console.log(`📧 [Notifications] Deployment email sent: ${result.data?.id}`);
    return true;
  } catch (error) {
    console.error('❌ [Notifications] Failed to send deployment email:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export function isNotificationsEnabled(): boolean {
  return !!(resend && NOTIFICATION_EMAIL);
}

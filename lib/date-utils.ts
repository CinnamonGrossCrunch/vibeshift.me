import { toZonedTime } from 'date-fns-tz';

/**
 * Utility functions for handling dates consistently between server and client
 * Addresses SSR/CSR hydration mismatches common in Next.js deployments
 * 
 * All date operations use America/Los_Angeles timezone (PST/PDT) since this is
 * for UC Berkeley EWMBA program. Vercel serverless functions run in UTC, so we
 * must explicitly convert to Berkeley time.
 */

const BERKELEY_TZ = 'America/Los_Angeles';

/**
 * Get a consistent "today" date in Berkeley timezone
 * Converts server UTC time to PST/PDT to avoid one-day-ahead bugs
 */
export function getConsistentToday(): Date {
  const nowUTC = new Date();
  // Convert UTC to Berkeley time (PST/PDT depending on DST)
  const nowBerkeley = toZonedTime(nowUTC, BERKELEY_TZ);
  // Normalize to midnight in Berkeley timezone
  return new Date(nowBerkeley.getFullYear(), nowBerkeley.getMonth(), nowBerkeley.getDate());
}

/**
 * Parse a date string in a way that's consistent between server and client
 * Handles timezone edge cases that can cause date shifting
 */
export function parseConsistentDate(dateString: string): Date {
  const dateUTC = new Date(dateString);
  // Convert to Berkeley timezone before normalizing
  const dateBerkeley = toZonedTime(dateUTC, BERKELEY_TZ);
  // Return normalized date to avoid timezone shifting
  return new Date(dateBerkeley.getFullYear(), dateBerkeley.getMonth(), dateBerkeley.getDate());
}

/**
 * Get week range starting from Sunday in Berkeley timezone
 * Ensures week calculations happen in PST/PDT, not UTC
 */
export function getConsistentWeekRange(): { start: Date; end: Date } {
  const today = getConsistentToday(); // Already in Berkeley timezone
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate the start of the week (Sunday)
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  
  // Calculate the end as next Monday at 00:00:00 (exclusive)
  const end = new Date(start);
  end.setDate(start.getDate() + 8); // 8 days later = next Monday
  end.setHours(0, 0, 0, 0);
  
  return { start, end };
}

/**
 * Format date consistently for display
 */
export function formatConsistentDate(dateString: string): string {
  const date = parseConsistentDate(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Check if a date string falls within a week range, handling timezone consistently
 */
export function isDateInWeekRange(dateString: string, weekStart: Date, weekEnd: Date): boolean {
  const eventDate = parseConsistentDate(dateString);
  return eventDate >= weekStart && eventDate < weekEnd;
}

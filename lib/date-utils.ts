/**
 * Utility functions for handling dates consistently between server and client
 * Addresses SSR/CSR hydration mismatches common in Next.js deployments
 */

/**
 * Get a consistent "today" date that works the same on server and client
 * Avoids timezone-related SSR/CSR mismatches
 */
export function getConsistentToday(): Date {
  const now = new Date();
  // Create a date in local timezone but normalized to midnight
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Parse a date string in a way that's consistent between server and client
 * Handles timezone edge cases that can cause date shifting
 */
export function parseConsistentDate(dateString: string): Date {
  const date = new Date(dateString);
  // Return normalized date to avoid timezone shifting
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Get week range starting from Sunday in a timezone-consistent way
 */
export function getConsistentWeekRange(): { start: Date; end: Date } {
  const today = getConsistentToday();
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

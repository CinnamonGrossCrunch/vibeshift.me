import ical from 'node-ical';
import { addDays, isAfter, isBefore } from 'date-fns';

export type CalendarEvent = {
  uid?: string;
  title: string;
  start: string;   // ISO
  end?: string;    // ISO
  location?: string;
  url?: string;
  allDay?: boolean;
  description?: string;
};

function resolveIcsUrl() {
  // Prefer secure env var in Vercel
  if (process.env.CALENDAR_ICS_URL) return process.env.CALENDAR_ICS_URL;
  
  // Fallback to a static file you can place in /public
  // For server-side fetch, we need an absolute URL
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  return `${baseUrl}/calendar.ics`;
}

export async function getUpcomingEvents(
  daysAhead = 30,
  limit = 150,
  tz?: string
): Promise<CalendarEvent[]> {
  const icsUrl = resolveIcsUrl();

  // Server-side fetch (no CORS issues)
  const res = await fetch(icsUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ICS (${res.status}) from ${icsUrl}`);
  const text = await res.text();

  const data = ical.sync.parseICS(text);
  const now = new Date();
  const horizon = addDays(now, daysAhead);
  const pastLimit = addDays(now, -30); // Show events from 30 days ago

  const events: CalendarEvent[] = [];

  for (const k of Object.keys(data)) {
    const v = data[k];
    if (!v || v.type !== 'VEVENT' || !v.start) continue;

    // node-ical gives Date objects already in local/server TZ; we expose ISO.
    const start = v.start as Date;
    const end = (v.end as Date) || undefined;

    // Show events within range (past 30 days to future daysAhead)
    if (!isAfter(start, pastLimit)) continue;
    if (!isBefore(start, horizon)) continue;

    const allDay =
      !!v.datetype && v.datetype === 'date' ||
      (!!v.start && start.getHours() === 0 && start.getMinutes() === 0 && (!end || (end.getHours() === 0 && end.getMinutes() === 0)));

    // Helper function to safely extract string values from potentially complex objects
    const safeStringExtract = (value: any): string | undefined => {
      if (!value) return undefined;
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value.val && typeof value.val === 'string') return value.val;
      if (typeof value === 'object' && value.toString && typeof value.toString === 'function') {
        const str = value.toString();
        return str !== '[object Object]' ? str : undefined;
      }
      return String(value);
    };

    events.push({
      uid: v.uid,
      title: safeStringExtract(v.summary) || 'Untitled',
      start: start.toISOString(),
      end: end?.toISOString(),
      location: safeStringExtract(v.location),
      url: safeStringExtract(v.url),
      description: safeStringExtract(v.description),
      allDay,
    });
  }

  // sort and cap
  events.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  return events.slice(0, limit);
}

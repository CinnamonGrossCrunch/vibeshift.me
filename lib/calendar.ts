import ical from 'node-ical';
import { addDays, isAfter, isBefore } from 'date-fns';
import fs from 'fs';
import path from 'path';

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

async function getIcsData(): Promise<string> {
  // If external ICS URL is provided, use it
  if (process.env.CALENDAR_ICS_URL) {
    try {
      const res = await fetch(process.env.CALENDAR_ICS_URL);
      if (!res.ok) throw new Error(`Failed to fetch ICS (${res.status}) from ${process.env.CALENDAR_ICS_URL}`);
      return res.text();
    } catch (error) {
      console.warn('Failed to fetch external calendar, falling back to local file:', error);
    }
  }

  // Read from local file directly (works in Node runtime)
  try {
    const filePath = path.join(process.cwd(), 'public', 'calendar.ics');
    if (fs.existsSync(filePath)) {
      console.log('Reading calendar from local file:', filePath);
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.warn('Could not read local calendar file:', error);
  }

  // Final fallback to HTTP fetch (if file doesn't exist and no external URL)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const icsUrl = `${baseUrl}/calendar.ics`;
  console.log('Fallback: fetching calendar from URL:', icsUrl);
  
  const res = await fetch(icsUrl);
  if (!res.ok) throw new Error(`Failed to fetch ICS (${res.status}) from ${icsUrl}`);
  return res.text();
}

export async function getUpcomingEvents(
  daysAhead = 30,
  limit = 150
): Promise<CalendarEvent[]> {
  const text = await getIcsData();

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
    const safeStringExtract = (value: unknown): string | undefined => {
      if (!value) return undefined;
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value && 'val' in value && typeof value.val === 'string') return value.val;
      if (typeof value === 'object' && value && 'toString' in value && typeof value.toString === 'function') {
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

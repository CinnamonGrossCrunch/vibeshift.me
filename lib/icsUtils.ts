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
  cohort?: 'blue' | 'gold';
  source?: string; // ICS filename for determining course type
  organizer?: string; // Event organizer
  status?: string; // CONFIRMED, TENTATIVE, CANCELLED
  categories?: string[]; // Event categories
};

export type CohortEvents = {
  blue: CalendarEvent[];
  gold: CalendarEvent[];
  original: CalendarEvent[]; // Original calendar.ics events for rich content matching
};

// File mappings for each cohort
const COHORT_FILES = {
  blue: [
    'ewmba201a_micro_blue_fall2025.ics',
    'ewmba_leadingpeople_blue_fall2025.ics',
    'teams@Haas.ics'
  ],
  gold: [
    'ewmba201a_micro_gold_fall2025.ics', 
    'ewmba_leadingpeople_gold_fall2025.ics',
    'teams@Haas.ics'
  ]
};

/**
 * Fetch ICS data from either external URL or local file
 */
async function fetchIcsData(filename: string): Promise<string> {
  // For development/local, always try local files first
  if (process.env.NODE_ENV === 'development') {
    try {
      const filePath = path.join(process.cwd(), 'public', filename);
      if (fs.existsSync(filePath)) {
        console.log(`Reading ICS from local file: ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.trim().length > 0) {
          return content;
        } else {
          console.warn(`Local ICS file ${filename} is empty`);
        }
      } else {
        console.warn(`Local ICS file not found: ${filePath}`);
      }
    } catch (error) {
      console.warn(`Could not read local ICS file ${filename}:`, error);
    }
  }

  // If CALENDAR_ICS_URL points to a single file, only use it for calendar.ics
  if (process.env.CALENDAR_ICS_URL && filename === 'calendar.ics') {
    try {
      console.log(`Fetching single ICS from: ${process.env.CALENDAR_ICS_URL}`);
      const res = await fetch(process.env.CALENDAR_ICS_URL);
      if (!res.ok) throw new Error(`Failed to fetch ${filename} (${res.status})`);
      return res.text();
    } catch (error) {
      console.warn(`Failed to fetch external ICS ${filename}:`, error);
    }
  }

  // For cohort-specific files, try local files in both dev and production
  try {
    const filePath = path.join(process.cwd(), 'public', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.trim().length > 0) {
        return content;
      }
    }
  } catch (error) {
    console.warn(`Could not read local ICS file ${filename}:`, error);
  }

  // If we reach here, file wasn't found or was empty
  // For leading people files we suppress throwing to allow fallback logic
  if (/leadingpeople|205_/i.test(filename)) {
    console.warn(`Could not fetch ICS data for ${filename} - returning empty string for fallback`);
    return '';
  }
  throw new Error(`Could not fetch ICS data for ${filename} - file not found or empty`);
}

/**
 * Parse ICS text and convert to CalendarEvent array
 */
function parseIcsToEvents(icsText: string, cohort: 'blue' | 'gold', filename?: string): CalendarEvent[] {
  try {
    // Handle ICS line folding BEFORE removing blank lines
    // ICS line folding uses CRLF followed by space or tab for continuation
    const unfoldedIcs = icsText
      .replace(/\r\n/g, '\n')  // Normalize line endings first
      .replace(/\r/g, '\n')    // Handle old Mac line endings
      .replace(/\n[ \t]/g, '') // Unfold lines (remove newline + space/tab)
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)  // Remove blank lines after unfolding
      .join('\n');
    
    console.log(`Successfully unfolded ICS content for ${cohort} cohort from ${filename}`);
    
    const data = ical.sync.parseICS(unfoldedIcs);
    const events: CalendarEvent[] = [];

    for (const k of Object.keys(data)) {
      const v = data[k];
      if (!v || v.type !== 'VEVENT') {
        continue;
      }

      if (!v.start) {
        console.warn(`Skipping event with no start date: ${v.summary}`);
        continue;
      }

      const start = v.start instanceof Date ? v.start : new Date(v.start);
      const end = v.end ? (v.end instanceof Date ? v.end : new Date(v.end)) : undefined;

      // Validate date
      if (isNaN(start.getTime())) {
        console.warn(`Skipping event with invalid start date: ${v.summary}, start: ${v.start}`);
        continue;
      }

      const allDay =
        !!v.datetype && v.datetype === 'date' ||
        (start.getHours() === 0 && start.getMinutes() === 0 && (!end || (end.getHours() === 0 && end.getMinutes() === 0)));

      // Helper function to safely extract string values with better debugging
      const safeStringExtract = (value: unknown, fieldName?: string): string | undefined => {
        if (!value) return undefined;
        if (typeof value === 'string') {
          const result = value.trim();
          if (fieldName && result && result.length > 50) {
            console.log(`Extracted ${fieldName}: ${result.substring(0, 100)}...`);
          }
          return result || undefined;
        }
        if (typeof value === 'object' && value && 'val' in value && typeof value.val === 'string') {
          const result = value.val.trim();
          if (fieldName && result && result.length > 50) {
            console.log(`Extracted ${fieldName} from .val: ${result.substring(0, 100)}...`);
          }
          return result || undefined;
        }
        if (typeof value === 'object' && value && 'toString' in value && typeof value.toString === 'function') {
          const str = value.toString();
          const result = str !== '[object Object]' ? str.trim() : undefined;
          if (fieldName && result && result.length > 50) {
            console.log(`Extracted ${fieldName} from toString: ${result.substring(0, 100)}...`);
          }
          return result || undefined;
        }
        const result = String(value).trim();
        return result || undefined;
      };

      const description = safeStringExtract(v.description, 'description');
      const location = safeStringExtract(v.location, 'location');
      const url = safeStringExtract(v.url, 'url');
      const organizer = safeStringExtract(v.organizer, 'organizer');
      const status = safeStringExtract(v.status, 'status');
      const summaryVal = safeStringExtract(v.summary);

      // If parsing calendar.ics, leadingpeople, or 205 files, remove any Teams@Haas events (they come from dedicated teams@Haas.ics)
      if (filename === 'calendar.ics' || (filename && (filename.includes('leadingpeople') || filename.includes('205')))) {
        const combinedText = `${summaryVal || ''} ${description || ''}`;
        if (/teams@haas/i.test(combinedText)) {
          console.log(`Filtered Teams@Haas event from ${filename}: ${summaryVal}`);
          continue; // skip adding this event
        }
      }

      // Extract categories if present
      interface ICalEventWithCategories {
        categories?: string | string[] | { [key: string]: unknown };
      }
      const vWithCategories = v as ICalEventWithCategories;
      let categories: string[] | undefined;
      if (vWithCategories.categories) {
        if (Array.isArray(vWithCategories.categories)) {
          categories = vWithCategories.categories.map((cat: unknown) => safeStringExtract(cat)).filter(Boolean) as string[];
        } else {
          const catStr = safeStringExtract(vWithCategories.categories);
          categories = catStr ? catStr.split(',').map(c => c.trim()).filter(Boolean) : undefined;
        }
      }

      let event: CalendarEvent = {
        uid: v.uid,
        title: summaryVal || 'Untitled',
        start: start.toISOString(),
        end: end?.toISOString(),
        location,
        url,
        description,
        allDay,
        cohort,
        source: filename,
        organizer,
        status,
        categories,
      };

      // Sanitize Leading People related events: remove any 'team@haas' content
      if (filename && (filename.includes('leadingpeople') || filename.includes('205_'))) {
        if (event.description && /team@haas/i.test(event.description)) {
          const cleaned = event.description.replace(/team@haas/ig, '').replace(/\n\s*\n/g, '\n').trim();
          if (cleaned !== event.description) {
            console.log(`Sanitized 'team@haas' from description in ${filename}`);
            event.description = cleaned;
          }
        }
        if (event.organizer && /team@haas/i.test(event.organizer)) {
          console.log(`Removed organizer 'team@haas' in ${filename}`);
          event.organizer = undefined;
        }
      }

      events.push(event);
    }

    console.log(`Successfully parsed ${events.length} events for ${cohort} cohort`);
    return events;
  } catch (error) {
    console.error(`Error parsing ICS for ${cohort} cohort:`, error);
    return [];
  }
}

/**
 * Fetch and parse events for a single cohort
 */
async function fetchCohortEvents(cohort: 'blue' | 'gold'): Promise<CalendarEvent[]> {
  const files = COHORT_FILES[cohort];
  const allEvents: CalendarEvent[] = [];

  console.log(`Fetching ${cohort} cohort events from ${files.length} files`);

  // Helper to attempt loading a single file with fallback
  const loadFileWithFallback = async (filename: string): Promise<CalendarEvent[]> => {
    try {
      const icsText = await fetchIcsData(filename);
      let events = parseIcsToEvents(icsText, cohort, filename);
      if (events.length === 0 && filename.includes('leadingpeople')) {
        // Fallback to legacy 205 file naming if new file is empty
        const legacyName = filename.replace('ewmba_leadingpeople', 'ewmba205').replace('leadingpeople_', '205_').replace('fall2025', 'fallA2025_v2');
        console.warn(`No events parsed from ${filename}. Trying legacy fallback ${legacyName}`);
        try {
          const legacyIcs = await fetchIcsData(legacyName);
            const legacyEvents = parseIcsToEvents(legacyIcs, cohort, legacyName);
            if (legacyEvents.length > 0) {
              console.log(`Loaded ${legacyEvents.length} fallback events from ${legacyName}`);
              events = legacyEvents;
            }
        } catch (legacyErr) {
          console.warn(`Fallback legacy file ${legacyName} also failed:`, legacyErr);
        }
      }
      return events;
    } catch (error) {
      console.error(`Failed to process ${filename} for ${cohort} cohort:`, error);
      // If new naming failed, attempt legacy directly when relevant
      if (filename.includes('leadingpeople')) {
        const legacyName = filename.replace('ewmba_leadingpeople', 'ewmba205').replace('leadingpeople_', '205_').replace('fall2025', 'fallA2025_v2');
        try {
          console.warn(`Attempting legacy file after error: ${legacyName}`);
          const legacyIcs = await fetchIcsData(legacyName);
          return parseIcsToEvents(legacyIcs, cohort, legacyName);
        } catch (legacyErr) {
          console.warn(`Legacy attempt also failed for ${legacyName}`);
        }
      }
      return [];
    }
  };

  // Fetch all files for this cohort in parallel
  const results = await Promise.all(files.map(f => loadFileWithFallback(f)));

  // Merge all events
  for (const events of results) {
    allEvents.push(...events);
  }

  // Refined de-duplication:
  //  - Single key per date+title
  //  - Prefer events whose source is teams@Haas.ics over any other source
  //  - If a non-teams event has Teams@Haas in title and a teams@Haas source version exists, drop the non-teams one
  const dedupPrefMap = new Map<string, CalendarEvent>();
  for (const ev of allEvents) {
    const key = `${ev.start.substring(0,10)}|${(ev.title || '').toLowerCase().trim()}`;
    const isTeamsSource = (ev.source || '').toLowerCase().includes('teams@haas');
    const isTeamsTitle = /teams@haas/i.test(ev.title || '');

    const existing = dedupPrefMap.get(key);
    if (!existing) {
      // Nothing stored yet
      dedupPrefMap.set(key, ev);
      continue;
    }

    const existingIsTeamsSource = (existing.source || '').toLowerCase().includes('teams@haas');
    const existingIsTeamsTitle = /teams@haas/i.test(existing.title || '');

    // If incoming is the authoritative teams source, always override
    if (isTeamsSource && !existingIsTeamsSource) {
      dedupPrefMap.set(key, ev);
      continue;
    }

    // If existing is teams source, keep it and ignore other copies
    if (existingIsTeamsSource && !isTeamsSource) {
      continue;
    }

    // If neither is teams source but one has teams title, keep the one already there
    if (!isTeamsSource && !existingIsTeamsSource) {
      continue; // first wins
    }
  }
  let output = Array.from(dedupPrefMap.values());
  if (output.length !== allEvents.length) {
    console.log(`De-duplicated ${allEvents.length - output.length} events (post Teams@Haas preference) for ${cohort}`);
  }

  console.log(`Total ${cohort} cohort events (after dedupe + Teams@Haas preference): ${output.length}`);
  return output;
}

/**
 * Filter events by date range
 */
function filterEventsByDateRange(
  events: CalendarEvent[], 
  daysAhead = 30, 
  limit = 150
): CalendarEvent[] {
  const now = new Date();
  const horizon = addDays(now, daysAhead);
  const pastLimit = addDays(now, -30); // Show events from 30 days ago

  const filteredEvents = events.filter(event => {
    const start = new Date(event.start);
    return isAfter(start, pastLimit) && isBefore(start, horizon);
  });

  // Sort by start date and limit results
  filteredEvents.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  return filteredEvents.slice(0, limit);
}

/**
 * Find a matching event from the original calendar based on date and title similarity
 */
export function findMatchingOriginalEvent(
  cohortEvent: CalendarEvent, 
  originalEvents: CalendarEvent[]
): CalendarEvent | null {
  if (!originalEvents.length) return null;

  const cohortDate = new Date(cohortEvent.start);
  
  // First, try exact date match
  const sameDateEvents = originalEvents.filter(originalEvent => {
    const originalDate = new Date(originalEvent.start);
    return (
      originalDate.getFullYear() === cohortDate.getFullYear() &&
      originalDate.getMonth() === cohortDate.getMonth() &&
      originalDate.getDate() === cohortDate.getDate()
    );
  });

  if (sameDateEvents.length === 0) return null;

  // If only one event on the same date, return it
  if (sameDateEvents.length === 1) {
    console.log(`Found matching event by date: ${sameDateEvents[0].title}`);
    return sameDateEvents[0];
  }

  // Multiple events on same date - try to match by title similarity
  const cohortTitle = cohortEvent.title.toLowerCase();
  
  // Helper function to calculate title similarity
  const getTitleSimilarity = (title1: string, title2: string): number => {
    const t1 = title1.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const t2 = title2.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // Check for common keywords
    const keywords1 = t1.split(/\s+/);
    const keywords2 = t2.split(/\s+/);
    
    let matches = 0;
    for (const word1 of keywords1) {
      if (word1.length > 2) { // Only consider words longer than 2 characters
        for (const word2 of keywords2) {
          if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
            matches++;
            break;
          }
        }
      }
    }
    
    return matches / Math.max(keywords1.length, keywords2.length);
  };

  // Find the event with the highest title similarity
  let bestMatch: CalendarEvent | null = null;
  let bestSimilarity = 0;

  for (const originalEvent of sameDateEvents) {
    const similarity = getTitleSimilarity(cohortTitle, originalEvent.title);
    console.log(`Comparing "${cohortTitle}" with "${originalEvent.title.toLowerCase()}" - similarity: ${similarity}`);
    
    if (similarity > bestSimilarity && similarity > 0.3) { // Minimum 30% similarity
      bestSimilarity = similarity;
      bestMatch = originalEvent;
    }
  }

  if (bestMatch) {
    console.log(`Found best matching event (${bestSimilarity.toFixed(2)} similarity): ${bestMatch.title}`);
    return bestMatch;
  }

  // If no good title match, return the first event on the same date
  console.log(`No good title match found, returning first event on same date: ${sameDateEvents[0].title}`);
  return sameDateEvents[0];
}

/**
 * Fetch and parse events from the original calendar.ics file
 */
async function fetchOriginalCalendarEvents(): Promise<CalendarEvent[]> {
  console.log('Fetching original calendar.ics events for rich content matching');

  try {
    const icsText = await fetchIcsData('calendar.ics');
    const events = parseIcsToEvents(icsText, 'blue', 'calendar.ics'); // Default to blue for compatibility
    console.log(`Successfully parsed ${events.length} events from original calendar.ics`);
    return events;
  } catch (error) {
    console.error('Error fetching original calendar events:', error);
    return [];
  }
}

/**
 * Main function to fetch events for both cohorts plus original calendar
 */
export async function getCohortEvents(
  daysAhead = 30,
  limit = 150
): Promise<CohortEvents> {
  console.log('Fetching events for both cohorts and original calendar...');

  try {
    // Fetch both cohorts and original calendar in parallel
    const [blueEvents, goldEvents, originalEvents] = await Promise.all([
      fetchCohortEvents('blue'),
      fetchCohortEvents('gold'),
      fetchOriginalCalendarEvents().catch(() => {
        console.warn('Could not load original calendar.ics, continuing without rich content matching');
        return [];
      })
    ]);

    // Helper to inject ALL future Teams@Haas events (next 1 year) regardless of horizon
    const injectTeams = (filtered: CalendarEvent[], all: CalendarEvent[]): CalendarEvent[] => {
      const now = new Date();
      const oneYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const existingKeys = new Set(filtered.map(ev => `${ev.start}|${(ev.title||'').toLowerCase()}`));
      const additions: CalendarEvent[] = [];
      for (const ev of all) {
        if ((ev.source || '').toLowerCase().includes('teams@haas')) {
          const startDate = new Date(ev.start);
            if (startDate >= now && startDate <= oneYear) {
              const key = `${ev.start}|${(ev.title||'').toLowerCase()}`;
              if (!existingKeys.has(key)) {
                existingKeys.add(key);
                additions.push(ev);
              }
            }
        }
      }
      if (additions.length) {
        console.log(`Injected ${additions.length} future Teams@Haas events beyond horizon`);
      }
      // Merge and resort
      const merged = [...filtered, ...additions];
      merged.sort((a,b) => +new Date(a.start) - +new Date(b.start));
      return merged;
    };

    // Filter and sort events for each cohort
    let filteredBlue = filterEventsByDateRange(blueEvents, daysAhead, limit);
    let filteredGold = filterEventsByDateRange(goldEvents, daysAhead, limit);
    const filteredOriginal = filterEventsByDateRange(originalEvents, daysAhead * 2, limit * 2); // Wider range for matching

    // Ensure Teams@Haas future events (e.g., Oct, Feb) are present
    filteredBlue = injectTeams(filteredBlue, blueEvents);
    filteredGold = injectTeams(filteredGold, goldEvents);

    console.log(`Filtered events - Blue: ${filteredBlue.length}, Gold: ${filteredGold.length}, Original: ${filteredOriginal.length}`);

    return {
      blue: filteredBlue,
      gold: filteredGold,
      original: filteredOriginal
    };
  } catch (error) {
    console.error('Error fetching cohort events:', error);
    throw error;
  }
}

/**
 * Fallback to single calendar for backward compatibility
 */
export async function getSingleCalendarEvents(
  daysAhead = 30,
  limit = 150
): Promise<CalendarEvent[]> {
  console.log('Fetching single calendar events (fallback mode)');

  try {
    // Try to read the main calendar.ics file
    const icsText = await fetchIcsData('calendar.ics');
    const events = parseIcsToEvents(icsText, 'blue'); // Default to blue for compatibility
    return filterEventsByDateRange(events, daysAhead, limit);
  } catch (error) {
    console.error('Error fetching single calendar events:', error);
    throw error;
  }
}

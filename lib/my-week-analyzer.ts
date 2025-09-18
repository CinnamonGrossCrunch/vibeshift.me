import { runAI } from './aiClient';

export interface WeeklyEvent {
  date: string;
  time?: string;
  title: string;
  type: 'assignment' | 'class' | 'exam' | 'administrative' | 'social' | 'newsletter' | 'other';
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  location?: string;
  url?: string;
}

export interface MyWeekAnalysis {
  weekStart: string;
  weekEnd: string;
  events: WeeklyEvent[];
  aiSummary: string;
  processingTime: number;
  aiMeta?: {
    model: string;
    modelsTried: string[];
    ms: number;
  };
}

// New interface for cohort-specific analysis
export interface CohortMyWeekAnalysis {
  weekStart: string;
  weekEnd: string;
  blueEvents: WeeklyEvent[];
  goldEvents: WeeklyEvent[];
  blueSummary: string;
  goldSummary: string;
  processingTime: number;
  aiMeta?: {
    model: string;
    modelsTried: string[];
    ms: number;
  };
}

// Define proper TypeScript interfaces for data structures
interface CohortEvent {
  start: string;
  end?: string;
  title: string;
  summary?: string; // Alternative title field
  description?: string;
  location?: string;
  url?: string;
}

interface CohortEvents {
  blue?: CohortEvent[];
  gold?: CohortEvent[];
}

interface TimeSensitiveInfo {
  dates: string[];
  deadline?: string;
  eventType: 'deadline' | 'event' | 'announcement' | 'reminder';
  priority: 'high' | 'medium' | 'low';
}

interface NewsletterItem {
  title: string;
  html: string;
  timeSensitive?: TimeSensitiveInfo;
}

interface NewsletterSection {
  sectionTitle: string;
  items: NewsletterItem[];
}

interface NewsletterData {
  sections: NewsletterSection[];
}

interface ProcessedNewsletterEvent extends NewsletterItem {
  section: string;
  relevantDates: string[];
  priority?: string;
  eventType?: string;
  fallbackParsing?: boolean;
}

/**
 * Get the date range for "this week" (from today to the upcoming Sunday, inclusive)
 */
function getThisWeekRange(): { start: Date; end: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const start = new Date(today);
  
  // Set start time to beginning of day
  start.setHours(0, 0, 0, 0);
  
  // Calculate days until next Sunday
  let daysUntilSunday;
  if (dayOfWeek === 0) {
    // Today is Sunday, include it and the next 7 days (to next Sunday)
    daysUntilSunday = 7;
  } else {
    // Calculate days until Sunday (7 - dayOfWeek)
    daysUntilSunday = 7 - dayOfWeek;
  }
  
  // Create end date
  const end = new Date(today);
  end.setDate(today.getDate() + daysUntilSunday);
  
  // Set end time to end of day
  end.setHours(23, 59, 59, 999);
  
  console.log(`🗓️ Week range: ${start.toISOString()} to ${end.toISOString()}`);
  console.log(`   Today: ${today.toDateString()} (day ${dayOfWeek}), Days to Sunday: ${daysUntilSunday}`);
  
  return { start, end };
}

/**
 * Categorize calendar events based on title and description patterns
 */
function categorizeEvent(title: string, description?: string, source?: string): { 
  type: WeeklyEvent['type']; 
  priority: WeeklyEvent['priority'] 
} {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const sourceLower = (source || '').toLowerCase();
  
  // High priority patterns (deadlines, exams)
  if (titleLower.includes('due') || titleLower.includes('deadline') || 
      titleLower.includes('assignment') || titleLower.includes('problem set') ||
      titleLower.includes('project') || titleLower.includes('submission') ||
      descLower.includes('due') || descLower.includes('deadline')) {
    return { type: 'assignment', priority: 'high' };
  }
  
  // Exam patterns
  if (titleLower.includes('exam') || titleLower.includes('test') || 
      titleLower.includes('quiz') || titleLower.includes('midterm') ||
      titleLower.includes('final') || descLower.includes('exam')) {
    return { type: 'exam', priority: 'high' };
  }
  
  // Class session patterns
  if (titleLower.includes('class') || titleLower.includes('session') || 
      titleLower.includes('lecture') || titleLower.includes('seminar') ||
      titleLower.includes('workshop') || titleLower.includes('microeconomics') ||
      titleLower.includes('leading people') || descLower.includes('lecture') ||
      descLower.includes('synchronous')) {
    return { type: 'class', priority: 'medium' };
  }
  
  // Administrative patterns
  if (titleLower.includes('registration') || titleLower.includes('form') || 
      titleLower.includes('application') || titleLower.includes('check-in') ||
      titleLower.includes('integrity') || titleLower.includes('verify') ||
      descLower.includes('registration') || descLower.includes('form')) {
    return { type: 'administrative', priority: 'medium' };
  }
  
  // Social events (teams@haas, networking, events)
  if (sourceLower.includes('teams@haas') || sourceLower.includes('uc_launch') ||
      titleLower.includes('team') || titleLower.includes('networking') ||
      titleLower.includes('social') || titleLower.includes('meetup') ||
      titleLower.includes('debrief') || titleLower.includes('collaborative') ||
      titleLower.includes('pitch') || titleLower.includes('accelerator')) {
    return { type: 'social', priority: 'low' };
  }
  
  // Newsletter content
  if (sourceLower.includes('newsletter')) {
    return { type: 'newsletter', priority: 'low' };
  }
  
  // Default fallback
  return { type: 'other', priority: 'medium' };
}

/**
 * Filter calendar events for the current week
 */
function filterCalendarEventsForWeek(cohortEvents: CohortEvents, weekStart: Date, weekEnd: Date): CohortEvent[] {
  const events: CohortEvent[] = [];
  
  if (!cohortEvents) {
    console.log('❌ No cohort events provided');
    return events;
  }
  
  // Process blue cohort events
  if (cohortEvents.blue?.length) {
    console.log(`📘 Processing ${cohortEvents.blue.length} blue cohort events`);
    events.push(...cohortEvents.blue);
  }
  
  // Process gold cohort events
  if (cohortEvents.gold?.length) {
    console.log(`📙 Processing ${cohortEvents.gold.length} gold cohort events`);
    events.push(...cohortEvents.gold);
  }
  
  console.log(`📊 Total events before date filtering: ${events.length}`);
  console.log(`📅 Filtering for range: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
  
  // Filter events that fall within the week range
  const filteredEvents = events.filter(event => {
    if (!event.start) {
      console.log(`⚠️ Event missing start date: ${event.title}`);
      return false;
    }
    
    const eventDate = new Date(event.start);
    const isInRange = eventDate >= weekStart && eventDate <= weekEnd;
    
    if (isInRange) {
      console.log(`✅ Including event: ${event.title} on ${eventDate.toDateString()}`);
    } else {
      console.log(`❌ Excluding event: ${event.title} on ${eventDate.toDateString()} (outside range)`);
    }
    
    return isInRange;
  });
  
  console.log(`📊 Events after date filtering: ${filteredEvents.length}`);
  return filteredEvents;
}

/**
 * Extract newsletter events/announcements for the current week from AI-organized data
 */
function extractNewsletterEventsForWeek(newsletterData: NewsletterData, weekStart: Date, weekEnd: Date): ProcessedNewsletterEvent[] {
  const events: ProcessedNewsletterEvent[] = [];
  
  if (!newsletterData?.sections) return events;
  
  console.log('📰 Analyzing newsletter sections for time-sensitive content...');
  
  // Process each organized section
  newsletterData.sections.forEach((section: NewsletterSection) => {
    if (!section.items) return;
    
    section.items.forEach((item: NewsletterItem) => {
      // Check if item has time-sensitive information
      if (item.timeSensitive && item.timeSensitive.dates) {
        const relevantDates = item.timeSensitive.dates.filter((dateStr: string) => {
          try {
            const itemDate = new Date(dateStr);
            return itemDate >= weekStart && itemDate <= weekEnd;
          } catch {
            return false;
          }
        });
        
        if (relevantDates.length > 0) {
          events.push({
            title: item.title,
            html: item.html,
            section: section.sectionTitle,
            timeSensitive: item.timeSensitive,
            relevantDates,
            priority: item.timeSensitive.priority || 'medium',
            eventType: item.timeSensitive.eventType || 'announcement'
          });
          
          console.log(`📅 Found time-sensitive item: ${item.title} (${relevantDates.length} relevant dates)`);
        }
      } else {
        // Fallback: Look for date patterns in content for items without time-sensitive tags
        const content = item.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (content) {
          const dateMatches = content.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?\b/gi);
          
          if (dateMatches) {
            const relevantDates: string[] = [];
            dateMatches.forEach((dateMatch: string) => {
              try {
                const eventDate = new Date(dateMatch);
                if (eventDate >= weekStart && eventDate <= weekEnd) {
                  relevantDates.push(eventDate.toISOString().split('T')[0]);
                }
              } catch {
                // Ignore invalid dates
              }
            });
            
            if (relevantDates.length > 0) {
              events.push({
                title: item.title,
                html: item.html,
                section: section.sectionTitle,
                relevantDates,
                priority: 'low',
                eventType: 'announcement',
                fallbackParsing: true
              });
              
              console.log(`📝 Found fallback item: ${item.title} (${relevantDates.length} dates)`);
            }
          }
        }
      }
    });
  });
  
  console.log(`📊 Total newsletter events found: ${events.length}`);
  return events;
}

/**
 * Use OpenAI to analyze and summarize the week's events
 */
export async function analyzeMyWeekWithAI(
  cohortEvents: CohortEvents,
  newsletterData: NewsletterData
): Promise<MyWeekAnalysis> {
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found');
  }

  const startTime = Date.now();
  const { start: weekStart, end: weekEnd } = getThisWeekRange();
  
  console.log('🗓️ My Week Analysis starting...');
  console.log('📅 Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  console.log(`🧮 Today is ${new Date().toDateString()}, day of week: ${new Date().getDay()}`);
  
  // Filter events for this week
  const calendarEvents = filterCalendarEventsForWeek(cohortEvents, weekStart, weekEnd);
  const newsletterEvents = extractNewsletterEventsForWeek(newsletterData, weekStart, weekEnd);
  
  console.log('� Calendar events found:', calendarEvents.length);
  console.log('� Newsletter events found:', newsletterEvents.length);
  
  // Debug: Log some event details
  calendarEvents.forEach(event => {
    console.log(`� Calendar: ${event.title} on ${new Date(event.start).toDateString()}`);
  });
  
  newsletterEvents.forEach(event => {
    console.log(`📰 Newsletter: ${event.title} on ${event.relevantDates.join(', ')}`);
  });
  
  // Prepare content for AI analysis
  const calendarContent = calendarEvents.map(event => {
    const eventDate = new Date(event.start);
    return `Date: ${eventDate.toLocaleDateString()}
Time: ${eventDate.toLocaleTimeString()}
Title: ${event.summary || event.title || 'Untitled Event'}
Description: ${event.description || 'No description'}
Location: ${event.location || 'No location'}
URL: ${event.url || 'No URL'}`;
  }).join('\n\n');
  
  const newsletterContent = newsletterEvents.map(event => {
    const dates = event.relevantDates.join(', ');
    const content = event.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return `Section: ${event.section}
Title: ${event.title}
Relevant Dates: ${dates}
Priority: ${event.priority}
Event Type: ${event.eventType}
Content: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
${event.fallbackParsing ? '(Note: Extracted via fallback date parsing)' : ''}`;
  }).join('\n\n');
  
  const prompt = `You are an AI assistant helping a UC Berkeley EWMBA student organize their week. 

Analyze the following calendar events and newsletter content for the week of ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}.

**CALENDAR EVENTS:**
${calendarContent || 'No calendar events found for this week.'}

**NEWSLETTER HIGHLIGHTS:**
${newsletterContent || 'No newsletter events found for this week.'}

**REQUIREMENTS:**

1. **Extract and organize ALL relevant events** for this specific week
2. **Prioritize newsletter items** - these are often time-sensitive announcements, deadlines, and important updates
3. **Categorize each event** as: 'calendar', 'newsletter', 'academic', or 'social'
4. **Provide a brief weekly summary** (2-3 sentences) highlighting key themes and priorities
5. **Preserve all important details** including times, locations, and URLs
6. **Format dates consistently** as YYYY-MM-DD
7. **Extract actionable information** and deadlines from newsletter content

**NEWSLETTER ITEM HANDLING:**
- Newsletter items often contain multiple dates and deadlines
- Extract the most relevant date for each newsletter item
- Use the provided priority levels (high/medium/low) to inform event importance
- Convert newsletter announcements into actionable events
- Preserve links and important details from newsletter content

**OUTPUT FORMAT:**
Return ONLY a JSON object with this exact structure:

{
  "events": [
    {
      "date": "2025-09-17",
      "time": "6:00 PM",
      "title": "Event Title",
      "type": "academic",
      "description": "Brief description",
      "location": "Location if available",
      "url": "URL if available"
    }
  ],
  "aiSummary": "This week focuses on... Key priorities include... Don't miss...",
  "insights": {
    "totalEvents": 5,
    "academicEvents": 3,
    "socialEvents": 1,
    "deadlines": 1,
    "busyDays": ["2025-09-17", "2025-09-18"],
    "newsletterHighlights": 2
  }
}

**FORMATTING GUIDELINES:**
- **Time format**: Use 12-hour format (e.g., "6:00 PM", "9:30 AM")
- **Descriptions**: Keep under 150 characters, focus on actionable info
- **Categories**: 
  - 'academic': Classes, assignments, exams, academic deadlines
  - 'social': Social events, networking, parties, tailgates
  - 'calendar': General calendar events, meetings
  - 'newsletter': Events from newsletter announcements (use this for newsletter-derived items)
- **Summary**: Focus on what the student should prioritize and prepare for
- **Newsletter Integration**: Treat newsletter items as equally important as calendar events

**IMPORTANT:** 
- Newsletter content is pre-processed and time-sensitive items are already identified
- Pay special attention to newsletter items with "high" priority
- Only include events that fall within the specified week range
- Preserve all URLs and links exactly as provided
- Ensure all dates are in YYYY-MM-DD format
- Return ONLY the JSON object, no additional text

Analyze the content and provide the weekly summary:`;

  try {
    console.log('🤖 Sending to AI for analysis...');
    
  const ai = await runAI({ prompt, reasoningEffort: 'low', verbosity: 'low', temperature: 0.1, maxOutputTokens: 2000 });
  const response = ai.text;

    console.log('📦 Raw AI response length:', response.length);
    
    // Clean up the response
    let cleanedResponse = response;
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    console.log('🔍 Attempting to parse AI response...');
    
    const aiResult = JSON.parse(cleanedResponse);
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ My Week analysis completed in ${processingTime}ms`);
    
    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      events: aiResult.events || [],
      aiSummary: aiResult.aiSummary || 'No summary available.',
      processingTime,
      aiMeta: { model: ai.model, modelsTried: ai.modelsTried, ms: ai.ms }
    };

  } catch (error) {
    console.error('💥 Error in My Week AI analysis:', error);
    
    // Fallback: return basic event list without AI processing
    const basicEvents: WeeklyEvent[] = calendarEvents.map(event => {
      const eventDate = new Date(event.start);
      const { type, priority } = categorizeEvent(
        event.summary || event.title || 'Calendar Event',
        event.description
      );
      
      return {
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        title: event.summary || event.title || 'Calendar Event',
        type,
        priority,
        description: event.description || undefined,
        location: event.location || undefined,
        url: event.url || undefined
      };
    });
    
  return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      events: basicEvents,
      aiSummary: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Showing basic calendar events.`,
      processingTime: Date.now() - startTime
    };
  }
}

// New function for cohort-specific analysis
export async function analyzeCohortMyWeekWithAI(
  cohortEvents: CohortEvents,
  newsletterData: NewsletterData
): Promise<CohortMyWeekAnalysis> {
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found');
  }

  const startTime = Date.now();
  const { start: weekStart, end: weekEnd } = getThisWeekRange();
  
  console.log('🗓️ Cohort My Week Analysis starting...');
  console.log('📅 Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  
  try {
    // Filter events for each cohort separately
    const blueCalendarEvents = filterCalendarEventsForWeek({ blue: cohortEvents.blue || [] }, weekStart, weekEnd);
    const goldCalendarEvents = filterCalendarEventsForWeek({ gold: cohortEvents.gold || [] }, weekStart, weekEnd);
    const newsletterEvents = extractNewsletterEventsForWeek(newsletterData, weekStart, weekEnd);
    
    console.log('📘 Blue cohort calendar events:', blueCalendarEvents.length);
    console.log('📙 Gold cohort calendar events:', goldCalendarEvents.length);
    console.log('📰 Newsletter events found:', newsletterEvents.length);
    
    // Generate analysis for Blue cohort
    const blueAnalysis = await generateCohortSpecificAnalysis(
      blueCalendarEvents, 
      newsletterEvents, 
      'Blue', 
      weekStart, 
      weekEnd
    );
    
    // Generate analysis for Gold cohort  
    const goldAnalysis = await generateCohortSpecificAnalysis(
      goldCalendarEvents, 
      newsletterEvents, 
      'Gold', 
      weekStart, 
      weekEnd
    );

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      blueEvents: blueAnalysis.events,
      goldEvents: goldAnalysis.events,
      blueSummary: blueAnalysis.summary,
      goldSummary: goldAnalysis.summary,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('💥 Error in Cohort My Week AI analysis:', error);
    
    // Fallback: return basic event lists without AI processing
    const blueEvents = filterCalendarEventsForWeek({ blue: cohortEvents.blue || [] }, weekStart, weekEnd).map(event => {
      const eventDate = new Date(event.start);
      return {
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        title: event.summary || event.title || 'Calendar Event',
        type: 'calendar' as const,
        description: event.description || undefined,
        location: event.location || undefined,
        url: event.url || undefined
      };
    });

    const goldEvents = filterCalendarEventsForWeek({ gold: cohortEvents.gold || [] }, weekStart, weekEnd).map(event => {
      const eventDate = new Date(event.start);
      return {
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        title: event.summary || event.title || 'Calendar Event',
        type: 'calendar' as const,
        description: event.description || undefined,
        location: event.location || undefined,
        url: event.url || undefined
      };
    });
    
    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      blueEvents,
      goldEvents,
      blueSummary: `AI analysis failed for Blue cohort: ${error instanceof Error ? error.message : 'Unknown error'}. Showing basic calendar events.`,
      goldSummary: `AI analysis failed for Gold cohort: ${error instanceof Error ? error.message : 'Unknown error'}. Showing basic calendar events.`,
      processingTime: Date.now() - startTime
    };
  }
}

// Helper function to generate cohort-specific analysis
async function generateCohortSpecificAnalysis(
  calendarEvents: CohortEvent[],
  newsletterEvents: ProcessedNewsletterEvent[],
  cohortName: string,
  weekStart: Date,
  weekEnd: Date
): Promise<{ events: WeeklyEvent[]; summary: string }> {
  
  // Prepare content for AI analysis
  const calendarContent = calendarEvents.map(event => {
    const eventDate = new Date(event.start);
    return `Date: ${eventDate.toLocaleDateString()}
Time: ${eventDate.toLocaleTimeString()}
Title: ${event.summary || event.title || 'Untitled Event'}
Description: ${event.description || 'No description'}
Location: ${event.location || 'No location'}
URL: ${event.url || 'No URL'}`;
  }).join('\n\n');
  
  const newsletterContent = newsletterEvents.map(event => {
    const dates = event.relevantDates.join(', ');
    const content = event.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    return `Section: ${event.section}
Title: ${event.title}
Relevant Dates: ${dates}
Priority: ${event.priority}
Event Type: ${event.eventType}
Content: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
  }).join('\n\n');

  const prompt = `You are an AI assistant helping a UC Berkeley EWMBA ${cohortName} cohort student organize their week.

Analyze the following calendar events and newsletter content for the ${cohortName} cohort for the week of ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}.

**${cohortName.toUpperCase()} COHORT CALENDAR EVENTS:**
${calendarContent || `No ${cohortName} cohort calendar events found for this week.`}

**NEWSLETTER HIGHLIGHTS (relevant to all students):**
${newsletterContent || 'No newsletter events found for this week.'}

**REQUIREMENTS:**

1. **Focus specifically on ${cohortName} cohort events** while including relevant general announcements
2. **Extract and organize ALL relevant events** for this specific week
3. **Prioritize cohort-specific activities** and deadlines
4. **Categorize each event** as: 'calendar', 'newsletter', 'academic', or 'social'
5. **Provide a brief weekly summary** (2-3 sentences) highlighting key themes and priorities for the ${cohortName} cohort
6. **Preserve all important details** including times, locations, and URLs
7. **Format dates consistently** as YYYY-MM-DD

Return ONLY a JSON object with this exact structure:

{
  "events": [
    {
      "date": "2025-09-17",
      "time": "6:00 PM", 
      "title": "Event Title",
      "type": "academic",
      "description": "Brief description",
      "location": "Location if available",
      "url": "URL if available"
    }
  ],
  "aiSummary": "This week for the ${cohortName} cohort focuses on... Key priorities include... Don't miss..."
}`;

  console.log(`🤖 Sending ${cohortName} cohort analysis to AI...`);
  
  const ai = await runAI({ prompt, reasoningEffort: 'low', verbosity: 'low', temperature: 0.1, maxOutputTokens: 2000 });
  const response = ai.text;
  console.log(`📦 Raw AI response for ${cohortName} cohort length:`, response.length);
  
  // Clean up the response - same logic as main analyzer
  let cleanedResponse = response;
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.slice(7);
  }
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.slice(3);
  }
  if (cleanedResponse.endsWith('```')) {
    cleanedResponse = cleanedResponse.slice(0, -3);
  }
  cleanedResponse = cleanedResponse.trim();
  
  console.log('🔍 Attempting to parse AI response...');
  const parsed = JSON.parse(cleanedResponse);
  
  return {
    events: parsed.events || [],
    summary: parsed.aiSummary || `No summary generated for ${cohortName} cohort`
  };
}

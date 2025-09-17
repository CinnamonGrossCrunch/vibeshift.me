import OpenAI from 'openai';

// Lazy initialization of OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface WeeklyEvent {
  date: string;
  time?: string;
  title: string;
  type: 'calendar' | 'newsletter' | 'academic' | 'social';
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
 * Get the date range for "this week" (from today to next Sunday)
 */
function getThisWeekRange(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today);
  
  // Find next Sunday (or today if it's Sunday)
  const daysUntilSunday = (7 - today.getDay()) % 7;
  const end = new Date(today);
  end.setDate(today.getDate() + daysUntilSunday);
  
  // If today is Sunday, the range is just today
  if (daysUntilSunday === 0) {
    end.setDate(today.getDate());
  }
  
  return { start, end };
}

/**
 * Filter calendar events for the current week
 */
function filterCalendarEventsForWeek(cohortEvents: CohortEvents, weekStart: Date, weekEnd: Date): CohortEvent[] {
  const events: CohortEvent[] = [];
  
  if (!cohortEvents) return events;
  
  // Process blue cohort events
  if (cohortEvents.blue?.length) {
    events.push(...cohortEvents.blue);
  }
  
  // Process gold cohort events
  if (cohortEvents.gold?.length) {
    events.push(...cohortEvents.gold);
  }
  
  // Filter events that fall within the week range
  return events.filter(event => {
    if (!event.start) return false;
    
    const eventDate = new Date(event.start);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });
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
          } catch (_e) {
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
              } catch (_e) {
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
  
  // Filter events for this week
  const calendarEvents = filterCalendarEventsForWeek(cohortEvents, weekStart, weekEnd);
  const newsletterEvents = extractNewsletterEventsForWeek(newsletterData, weekStart, weekEnd);
  
  console.log('🗓️ My Week Analysis starting...');
  console.log('📅 Week range:', weekStart.toISOString(), 'to', weekEnd.toISOString());
  console.log('📊 Calendar events found:', calendarEvents.length);
  console.log('📰 Newsletter events found:', newsletterEvents.length);
  
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
    
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    const client = getOpenAIClient();
    
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes calendar and newsletter content to create weekly summaries for UC Berkeley EWMBA students. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!response) {
      throw new Error('No response from AI');
    }

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
      processingTime
    };

  } catch (error) {
    console.error('💥 Error in My Week AI analysis:', error);
    
    // Fallback: return basic event list without AI processing
    const basicEvents: WeeklyEvent[] = calendarEvents.map(event => {
      const eventDate = new Date(event.start);
      return {
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
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
      events: basicEvents,
      aiSummary: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Showing basic calendar events.`,
      processingTime: Date.now() - startTime
    };
  }
}

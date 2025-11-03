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

// Define proper TypeScript interfaces
interface ParsedItem {
  title: string;
  html: string;
}

interface ParsedSection {
  sectionTitle: string;
  items: ParsedItem[];
}

export interface OrganizedSection {
  sectionTitle: string;
  items: {
    title: string;
    html: string;
    timeSensitive?: {
      dates: string[];
      deadline?: string;
      eventType: 'deadline' | 'event' | 'announcement' | 'reminder';
      priority: 'high' | 'medium' | 'low';
    };
  }[];
}

export interface OrganizedNewsletter {
  sourceUrl: string;
  title?: string;
  sections: OrganizedSection[];
  aiDebugInfo?: {
    reasoning?: string;
    sectionDecisions?: string[];
    edgeCasesHandled?: string[];
    totalSections: number;
    processingTime: number;
  };
}

/**
 * Hybrid Approach: Extract time-sensitive data from already-organized newsletter
 * Uses a separate, focused API call with gpt-4o-mini for fast date extraction
 */
export async function extractTimeSensitiveData(
  organizedNewsletter: OrganizedNewsletter
): Promise<OrganizedNewsletter> {
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not found, skipping time-sensitive extraction');
    return organizedNewsletter;
  }

  const extractStartTime = Date.now();
  console.log('📅 Starting time-sensitive data extraction...');

  try {
    // Prepare concise content for date extraction
    const itemsToAnalyze = organizedNewsletter.sections
      .flatMap(section => 
        section.items.map(item => ({
          section: section.sectionTitle,
          title: item.title,
          content: item.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500) // Increased to 500 chars for better context
        }))
      );

    const prompt = `Extract time-sensitive information from newsletter items. Return ONLY valid JSON.

CURRENT CONTEXT:
- Today is Sunday, November 3, 2025
- Reference dates: Mon Nov 4, Tue Nov 5, Wed Nov 6, Thu Nov 7, Fri Nov 8, Sat Nov 9, Sun Nov 10

ITEMS TO ANALYZE:
${itemsToAnalyze.map((item, idx) => 
  `${idx}. [${item.section}] ${item.title}\n   ${item.content}`
).join('\n\n')}

TASK:
For each item that explicitly mentions specific dates, deadlines, or scheduled events, extract:
- All relevant dates in YYYY-MM-DD format
- Main deadline if any
- Event type: deadline, event, announcement, or reminder
- Priority: high (urgent/today), medium (this week), low (general)

CRITICAL RULES:
1. ONLY include items with EXPLICIT dates mentioned in the text
2. DO NOT infer or guess dates - if no date is mentioned, skip it
3. Match day names carefully (e.g., "Monday, Nov 4" = 2025-11-04, "Tuesday, Nov 5" = 2025-11-05)
4. For "Saturday Scoop" or weekly digests with no specific date, skip them
5. For advisory items about multiple future dates (like parking advisories), skip them
6. Extract ALL explicitly mentioned dates from the text
7. If day name doesn't match calendar (e.g., text says "Monday Nov 3" but Nov 3 is Sunday), use the day name
8. Convert formats: "Nov 4" = "November 4" = "11/4" = 2025-11-04
9. Items without explicit dates = skip completely

EVENT TYPE GUIDELINES:
- "deadline" = submission deadlines, registration closes
- "event" = scheduled meetings, speaker series, clinics with specific time/location
- "announcement" = general info without specific action date
- "reminder" = ongoing opportunities without single deadline

EXAMPLES:
✓ "Coffee Chat Thursday, Nov 6, 9-10 AM" → {"dates": ["2025-11-06"], "eventType": "event"}
✓ "Flu Shot Clinic Tuesday, Nov 4, 12-4PM" → {"dates": ["2025-11-04"], "eventType": "event"}
✗ "FTMBA Electives for Spring 2026" (no date mentioned) → skip this item
✗ "Saturday Scoop" (just a newsletter name) → skip this item
✗ "Parking Advisory for all basketball games" (multiple vague dates) → skip this item

OUTPUT FORMAT (JSON only, no markdown):
{
  "timeSensitiveItems": [
    {
      "index": 0,
      "dates": ["2025-11-04"],
      "eventType": "event",
      "priority": "high"
    }
  ]
}

Return ONLY the JSON object:`;

    const client = getOpenAIClient();
    const extractionStartTime = Date.now();
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Fast model for simple extraction
      messages: [
        {
          role: "system",
          content: "You are a date extraction assistant. Return ONLY valid JSON with no markdown or extra text."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000, // Much smaller since we're just extracting dates
    });
    
    const extractionDuration = Date.now() - extractionStartTime;
    console.log(`⏱️ Date extraction API call: ${extractionDuration}ms`);

    const response = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!response) {
      console.warn('⚠️ No response from date extraction');
      return organizedNewsletter;
    }

    // Clean response
    let cleanedResponse = response;
    if (cleanedResponse.startsWith('```json')) cleanedResponse = cleanedResponse.slice(7);
    if (cleanedResponse.startsWith('```')) cleanedResponse = cleanedResponse.slice(3);
    if (cleanedResponse.endsWith('```')) cleanedResponse = cleanedResponse.slice(0, -3);
    cleanedResponse = cleanedResponse.trim();

    const extractedData: {
      timeSensitiveItems: Array<{
        index: number;
        dates: string[];
        deadline?: string;
        eventType: 'deadline' | 'event' | 'announcement' | 'reminder';
        priority: 'high' | 'medium' | 'low';
      }>;
    } = JSON.parse(cleanedResponse);

    console.log(`📅 Extracted ${extractedData.timeSensitiveItems?.length || 0} time-sensitive items`);

    // Helper function to get day name from date
    const getDayName = (dateStr: string): string => {
      const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    };

    // Map extracted data back to newsletter items with validation
    let itemIndex = 0;
    const updatedSections = organizedNewsletter.sections.map(section => ({
      ...section,
      items: section.items.map(item => {
        const currentIndex = itemIndex++;
        const extracted = extractedData.timeSensitiveItems?.find(e => e.index === currentIndex);
        
        if (extracted) {
          // Validate dates and log warnings for potential mismatches
          const validatedDates = extracted.dates.filter(dateStr => {
            const dayName = getDayName(dateStr);
            const itemText = `${item.title} ${item.html}`.toLowerCase();
            
            // Check if the text mentions a day name that doesn't match the extracted date
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const mentionedDay = dayNames.find(day => itemText.includes(day));
            
            if (mentionedDay && mentionedDay !== dayName.toLowerCase()) {
              console.warn(`⚠️ Day mismatch for "${item.title}": text mentions "${mentionedDay}" but date ${dateStr} is ${dayName}`);
            }
            
            return true; // Keep all dates for now
          });
          
          console.log(`  ✓ Added timeSensitive to "${item.title}": ${validatedDates.join(', ')} [${validatedDates.map(getDayName).join(', ')}]`);
          return {
            ...item,
            timeSensitive: {
              dates: validatedDates,
              deadline: extracted.deadline,
              eventType: extracted.eventType,
              priority: extracted.priority
            }
          };
        }
        
        return item;
      })
    }));

    const totalTime = Date.now() - extractStartTime;
    console.log(`✅ Time-sensitive extraction completed in ${totalTime}ms`);

    return {
      ...organizedNewsletter,
      sections: updatedSections
    };

  } catch (error) {
    console.error('❌ Error extracting time-sensitive data:', error);
    // Return original newsletter if extraction fails
    return organizedNewsletter;
  }
}

/**
 * Uses OpenAI to intelligently reorganize newsletter content into proper sections
 */
export async function organizeNewsletterWithAI(
  rawSections: ParsedSection[], 
  sourceUrl: string, 
  title?: string
): Promise<OrganizedNewsletter> {
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, falling back to original parsing');
    return {
      sourceUrl,
      title,
      sections: rawSections
    };
  }

  const startTime = Date.now();

  try {
    // Convert raw sections to text for AI processing
    const rawContent = rawSections.map(section => {
      const items = section.items?.map((item: ParsedItem) => {
        const cleanContent = item.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        return `${item.title}: ${cleanContent}`;
      }).join('\n');
      
      return `[${section.sectionTitle}]\n${items}`;
    }).join('\n\n');

    // Debug: Log what we're sending to AI
    console.log('🔍 Raw content being sent to AI:');
    console.log('📏 Total content length:', rawContent.length);
    console.log('📝 Raw sections count:', rawSections.length);
    console.log('📄 First 500 chars of raw content:', rawContent.substring(0, 500));
    console.log('📊 Raw sections structure:', rawSections.map(s => ({ 
      title: s.sectionTitle, 
      itemCount: s.items?.length || 0,
      firstItemTitle: s.items?.[0]?.title || 'no items',
      firstItemLength: s.items?.[0]?.html?.length || 0
    })));

    console.log('🤖 Starting AI organization...');

    // Concise prompt for better token efficiency
    const prompt = `Organize newsletter content for UC Berkeley EWMBA students. Preserve ALL content and hyperlinks exactly.

REQUIREMENTS:
1. Keep ALL content - no truncation or removal
2. Preserve ALL hyperlinks exactly: <a href='exact-url' target='_blank'>text</a>
3. Use proper HTML: <h4> for titles, <h5> for subheadings, <p> for text, <ul>/<li> for lists
4. Extract time-sensitive data: dates, deadlines, events

OUTPUT FORMAT (JSON only):
{
  "sections": [
    {
      "sectionTitle": "Section Name",
      "items": [
        {
          "title": "Item Title",
          "html": "<h4>Title</h4><p>Content with <a href='exact-url' target='_blank'>links</a></p>",
          "timeSensitive": {
            "dates": ["2025-09-17"],
            "deadline": "2025-09-17",
            "eventType": "deadline|event|announcement|reminder",
            "priority": "high|medium|low"
          }
        }
      ]
    }
  ],
  "debugInfo": {
    "reasoning": "Brief explanation",
    "totalSections": ${rawSections.length}
  }
}

TIME-SENSITIVE RULES:
- Extract dates in YYYY-MM-DD format
- deadline: main due date if any
- eventType: deadline (due dates), event (scheduled), announcement (general), reminder (action needed)  
- priority: high (urgent/today), medium (this week), low (general)
- Omit timeSensitive if no dates found

CONTENT:
${rawContent}`;

    // Use configurable model with gpt-3.5-turbo as default for better compatibility
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
    console.log('🤖 Using AI model:', model);

    // Use standard chat completions with token limit appropriate for model
    console.log('📝 Using standard chat completions API with increased token limit');
    
    // START TIMING
    const aiStartTime = Date.now();
    console.log('⏱️ AI API call started at:', new Date(aiStartTime).toISOString());
    
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a newsletter content organizer. Always return valid JSON with preserved content and hyperlinks."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: model === "gpt-3.5-turbo" ? 4000 : 16000, // Max for gpt-3.5-turbo is ~4K
    });
    
    // END TIMING
    const aiEndTime = Date.now();
    const aiDuration = (aiEndTime - aiStartTime) / 1000; // Convert to seconds
    console.log('⏱️ AI API call completed at:', new Date(aiEndTime).toISOString());
    console.log('⏱️ AI API call duration:', aiDuration.toFixed(2), 'seconds');
    console.log(aiDuration > 60 ? '⚠️ AI call took over 1 minute!' : '✅ AI call completed in reasonable time');

    const response = completion.choices[0]?.message?.content?.trim() || '';

    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('📦 Raw AI response length:', response.length);
    console.log('📄 First 500 chars of AI response:', response.substring(0, 500));
    console.log('📄 Last 200 chars of AI response:', response.substring(response.length - 200));

    // Remove any markdown code blocks if present
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

    console.log('🧹 Cleaned response length:', cleanedResponse.length);
    console.log('🔍 Attempting to parse JSON...');

    // Parse AI response
    let organizedData: {
      sections: OrganizedSection[];
      debugInfo?: {
        reasoning?: string;
        sectionDecisions?: string[];
        edgeCasesHandled?: string[];
        totalSections?: number;
        preservedHyperlinks?: string;
      };
    };
    
    try {
      organizedData = JSON.parse(cleanedResponse);
      console.log('✅ JSON parsed successfully');
      console.log('📊 Organized sections count:', organizedData.sections?.length || 0);
      console.log('📝 Debug info available:', !!organizedData.debugInfo);
      
      // DEBUG: Check if any items have timeSensitive data
      let timeSensitiveCount = 0;
      
      // Log first item structure to see what AI returned
      if (organizedData.sections?.[0]?.items?.[0]) {
        const firstItem = organizedData.sections[0].items[0];
        console.log('🔍 FIRST ITEM STRUCTURE:', JSON.stringify(firstItem, null, 2));
        console.log('🔍 First item keys:', Object.keys(firstItem));
        console.log('🔍 Has timeSensitive?', 'timeSensitive' in firstItem);
      }
      
      organizedData.sections?.forEach(section => {
        section.items?.forEach(item => {
          if (item.timeSensitive) {
            timeSensitiveCount++;
            console.log(`  ✓ Found timeSensitive in "${item.title}": ${JSON.stringify(item.timeSensitive)}`);
          }
        });
      });
      console.log(`📅 Total items with timeSensitive data: ${timeSensitiveCount}`);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.error('🔍 Problematic response:', cleanedResponse.substring(0, 500));
      console.error('🔚 Response ending:', cleanedResponse.substring(-200));
      
      // Check if response was truncated
      if (!cleanedResponse.endsWith('}') && !cleanedResponse.endsWith(']}')) {
        console.log('⚠️ Response appears to be truncated, returning fallback structure...');
        
        // Return a minimal valid structure with error info
        return {
          sourceUrl,
          sections: [],
          aiDebugInfo: {
            reasoning: 'AI response was truncated due to token limit',
            totalSections: rawSections.length,
            processingTime: Date.now() - startTime,
            sectionDecisions: ['Error: Response truncated'],
            edgeCasesHandled: [`Response length: ${cleanedResponse.length} chars`]
          }
        };
      }
      
      throw new Error('Invalid JSON response from AI');
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ AI processing completed in ${processingTime}ms`);

    // Validate structure
    const result: OrganizedNewsletter = {
      sourceUrl,
      title,
      sections: organizedData.sections || [],
      aiDebugInfo: {
        reasoning: organizedData.debugInfo?.reasoning,
        sectionDecisions: organizedData.debugInfo?.sectionDecisions,
        edgeCasesHandled: organizedData.debugInfo?.edgeCasesHandled,
        totalSections: organizedData.sections?.length || 0,
        processingTime
      }
    };

    console.log('🎉 Newsletter organization completed successfully');
    console.log('📋 Final result summary:', {
      sectionsCount: result.sections.length,
      hasDebugInfo: !!result.aiDebugInfo,
      processingTime: result.aiDebugInfo?.processingTime
    });

    return result;

  } catch (error) {
    console.error('💥 Error in AI organization:', error);
    
    // Fallback: return original sections in organized format
    const fallbackSections: OrganizedSection[] = rawSections.map((section: ParsedSection) => ({
      sectionTitle: section.sectionTitle,
      items: section.items || []
    }));

    return {
      sourceUrl,
      title,
      sections: fallbackSections,
      aiDebugInfo: {
        reasoning: `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Returning original sections.`,
        totalSections: fallbackSections.length,
        processingTime: Date.now() - startTime
      }
    };
  }
}

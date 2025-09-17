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

    // Use configurable model with gpt-4o-mini as default for better token support
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    console.log('🤖 Using AI model:', model);

    // Use standard chat completions with token limit appropriate for model
    console.log('📝 Using standard chat completions API with increased token limit');
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

    const response = completion.choices[0]?.message?.content?.trim() || '';

    if (!response) {
      throw new Error('No response from AI');
    }

    console.log('📦 Raw AI response length:', response.length);
    console.log('📄 First 200 chars of AI response:', response.substring(0, 200));

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

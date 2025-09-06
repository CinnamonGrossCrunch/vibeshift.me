import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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

    // Enhanced prompt for the AI
    const prompt = `You are a newsletter content organizer for UC Berkeley EWMBA students. Transform the following newsletter content into a clean, structured format.

**REQUIREMENTS:**

1. CONTENT PRESERVATION: Preserve ALL content - do not truncate, summarize, or remove any information
2. HYPERLINK PRESERVATION: 
   - **CRITICAL: PRESERVE ALL HYPERLINKS** - Never remove or modify any <a href="..."> tags or URLs
   - Maintain exact link text and destination URLs without any changes
   - Keep target="_blank" attributes when present
   - If hyperlinks exist in content, they MUST appear in the final output

3. SECTION ORGANIZATION:
   - Group related content logically into the existing section structure
   - Common sections: "This Week", "Announcements", "Saturday Scoop", "Events", "Career Corner", "PO Tips and Tidbits"
   - If content doesn't fit existing sections, create appropriate new sections
   - Split long content into multiple focused subsections within sections

4. FORMATTING GUIDELINES:
   - **HEADERS**: Use <h4> tags for main item titles only (not bold)
   - **SUBHEADINGS**: Use <h5> tags for subsection headers within items
   - **LISTS**: Use proper <ul> and <li> tags for bullet points
   - **PARAGRAPHS**: Use <p> tags for paragraph content
   - **BODY TEXT**: Convert ANY bold/strong formatting in the middle of paragraphs to normal font weight
   - **HYPERLINKS - CRITICAL**: Preserve ALL hyperlinks exactly as they are - NEVER remove, modify, or strip any <a href="..."> tags

5. CONTENT STRUCTURE:
   - Create clear, scannable sections with proper hierarchy
   - Break down complex announcements into logical subsections
   - Use descriptive, action-oriented headings
   - Ensure proper spacing and readability

6. SPECIAL FORMATTING RULES:
   
   **Headers and Subheadings:**
   - Use <h4> for: Main item titles at the start of each content block
   - Use <h5> for: Subsection headers like "Things to keep in mind", "Important dates", etc.
   - Do NOT use bold (**text**) or <strong> tags for headers - use proper HTML heading tags
   
   **Body Text:**
   - Convert to normal weight: Any bold text in the middle of sentences or paragraphs
   - Exception: Keep bold ONLY for true emphasis within sentences (very sparingly)
   - Remove unnecessary bold formatting that was used for visual separation
   
   **Lists and Structure:**
   - Use <ul> and <li> for bullet point lists
   - Use <ol> and <li> for numbered lists
   - Maintain proper nesting for sub-lists
   - Group related bullet points together

7. CONTENT ORGANIZATION LOGIC:
   - **ANNOUNCEMENTS**: Important updates, policy changes, deadline reminders
   - **EVENTS**: Social gatherings, networking, extracurricular activities  
   - **ACADEMIC**: Course-related info, registration, academic deadlines
   - **CAREER**: Job opportunities, career services, professional development
   - **COMPLEX CONTENT**: Break down any single item >300 words into logical subsections

8. OUTPUT FORMAT:
   Return ONLY a JSON object with this structure:

{
  "sections": [
    {
      "sectionTitle": "Section Name",
      "items": [
        {
          "title": "Item Title",
          "html": "<h4>Item Title</h4><h5>Subheading</h5><p>Content with <a href='exact-url' target='_blank'>preserved links</a></p><ul><li>Bullet points</li></ul>"
        }
      ]
    }
  ],
  "debugInfo": {
    "reasoning": "Explanation of organization decisions",
    "sectionDecisions": "How sections were structured", 
    "edgeCasesHandled": "Special cases addressed",
    "totalSections": ${rawSections.length},
    "preservedHyperlinks": "List of all hyperlinks preserved"
  }
}

**EXAMPLE FORMATTING:**
For complex content like "Fall 2025 Electives Reminder":
{
  "title": "Fall 2025 Electives Reminder",
  "html": "<h4>Fall 2025 Electives Reminder</h4><h5>Drop Only ends Monday Sep 8, 11:59PM PT</h5><h5>Things to keep in mind:</h5><ul><li>Any enrollment changes to your schedule must be made in <a href=\"https://calcentral.berkeley.edu\" target=\"_blank\">OLR</a>.</li><li>Final enrollment changes in CalCentral will be processed on Sep 9, after which you should confirm your class schedule accuracy.</li><li>Bills, transcripts, and <a href=\"https://bcourses.berkeley.edu\">bCourses</a> enrollments are generated by enrollment in CalCentral.</li></ul><h5>Go Beyond Yourself</h5><ul><li>Please drop any course enrollments you do not wish to take in consideration of students on the waitlist.</li><li>In addition, also drop yourself from any waitlists that you do not want.</li><li>As other students drop, you may be enrolled off the waitlist during Drops Only! So check your <a href=\"https://calcentral.berkeley.edu/dashboard\">OLR status</a> before the Drop Only Round closes.</li></ul>"
}

**DEBUG INFO REQUIREMENTS:**
{
  "debugInfo": {
    "reasoning": "Organized content into 6 main sections focusing on...",
    "sectionDecisions": "Grouped academic content in Announcements, social events in Events section...",
    "edgeCasesHandled": [
      "List any specific formatting issues, heading conversions, or complex content restructuring you performed",
      "Document how you split long announcements into multiple focused subsections", 
      "Mention how you ensured proper spacing between sentences and created logical bullet point structure",
      "Document any hyperlinks that were preserved and how you maintained their exact format"
    ]
  }
}

FINAL CHECKS:
- **CRITICAL**: ALL content must be preserved and properly categorized (no truncation!)
- **SECTION COUNT VERIFICATION**: Output section count MUST match input section count exactly
- **HYPERLINKS**: Double-check that ALL <a href="..."> tags from the original content are preserved exactly
- **LINK VERIFICATION**: Ensure no URLs or link text have been modified or removed
- **CONTENT VERIFICATION**: Every piece of original content must appear in the output
- Proper spacing between all sentences and paragraphs
- Bold formatting only at line beginnings for headers/subsections
- All hyperlinks maintained exactly as provided with original URLs and link text
- Proper HTML structure with semantic tags
- Content grouped logically to match our existing section organization
- Clean, readable format that adheres to our established UI patterns

HYPERLINK PRESERVATION PRIORITY: This is CRITICAL - any missing or modified hyperlinks will break the user experience. Treat hyperlink preservation as the highest priority alongside content preservation.

SECTION PRESERVATION PRIORITY: This is CRITICAL - removing any sections will lose important information. Every original section must be preserved in the output.

IMPORTANT: Return ONLY the JSON object, no additional text, explanations, or markdown formatting. Start with { and end with }.

Raw newsletter content to organize:
${rawContent}`;

    // Use configurable model with new Responses API as primary
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    console.log('🤖 Using AI model:', model);

    let response: string;

    // Get OpenAI client lazily
    const client = getOpenAIClient();

    // Try the new Responses API first (if available)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((client as any).responses) {
      console.log('🆕 Using new OpenAI Responses API');
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiResponse = await (client as any).responses.create({
          model,
          instructions: "You are a newsletter content organizer. Always return valid JSON with preserved content and hyperlinks.",
          input: prompt,
          temperature: 0.1,
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response = (apiResponse as any).output_text || '';
      } catch (error) {
        console.log('⚠️ Responses API failed, falling back to chat completions:', error);
        // Fall back to regular chat completions
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
          max_tokens: 4000,
        });

        response = completion.choices[0]?.message?.content?.trim() || '';
      }
    } else {
      console.log('📝 Using standard chat completions API');
      // Use standard chat completions
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
        max_tokens: 4000,
      });

      response = completion.choices[0]?.message?.content?.trim() || '';
    }

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

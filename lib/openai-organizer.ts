import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    reasoning: string;
    sectionDecisions: string[];
    edgeCasesHandled: string[];
    totalSections: number;
    processingTime: number;
  };
}

/**
 * Uses OpenAI to intelligently reorganize newsletter content into proper sections
 */
export async function organizeNewsletterWithAI(
  rawSections: any[], 
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
      const items = section.items?.map((item: any) => {
        const cleanContent = item.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
        return `${item.title}: ${cleanContent}`;
      }).join('\n') || '';
      
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

    const prompt = `
You are a smart newsletter parser for an MBA program. Your job is to intelligently restructure scraped newsletter content to perfectly match our existing parsing logic and formatting standards.

Raw newsletter content:
${rawContent}

CRITICAL REQUIREMENTS - Follow these parsing principles EXACTLY:

1. CONTENT PRESERVATION: Preserve ALL content - do not truncate, summarize, or remove any information
   - **CRITICAL: PRESERVE ALL SECTIONS** - Never remove or combine sections from the original
   - Keep every sentence, date, detail, and instruction from the original
   - **CRITICAL: PRESERVE ALL HYPERLINKS** - Never remove or modify any <a href="..."> tags or URLs
   - Maintain exact link text and destination URLs without any changes
   - Ensure proper spacing between sentences (NEVER concatenate like "sentence.Nextsentence")
   - Maintain all specific details, deadlines, times, and instructions
   - **SECTION COUNT MUST MATCH**: If input has 6 sections, output MUST have 6 sections

2. IDENTIFY MAIN SECTIONS: Look for content that represents distinct topics or categories
   - **MANDATORY**: Preserve ALL original sections - never combine or remove sections
   - Common sections: "This Week", "Announcements", "Saturday Scoop", "Events", "Career Corner", "PO Tips and Tidbits"
   - Group related content logically under these or similar section names
   - **SECTION PRESERVATION RULE**: Every original section must appear in the output

3. DETECT SUBSECTIONS AND INTERNAL STRUCTURE: Within each main section, identify subsections based on:
   - Strong/bold text that acts as subheadings at the beginning of lines
   - Logical content breaks and topic changes
   - Natural groupings of related information
   - **SMART CONTENT SPLITTING**: Break complex announcements into multiple readable subsections:
     * Single long announcements should be split into multiple subsections for better readability
     * Each subsection should focus on one main concept or instruction set
     * Create clear, descriptive titles for each subsection
   - **SPECIAL HANDLING**: For single announcements (like "Fall 2025 Electives Reminder"), structure as multiple subsections:
     * Main announcement subsection with title and key deadline info
     * "Requirements & Guidelines" subsection for detailed instructions
     * "Action Items" subsection for specific tasks students need to complete
     * Format bullet points and nested lists correctly within each subsection
     * Preserve the hierarchical structure with proper HTML formatting

4. FORMATTING STANDARDS - Apply these formatting rules strictly:
   - **SECTION TITLES**: Keep descriptive and concise
   - **SUBSECTION TITLES**: Should be clear headings that introduce content blocks
   - **SUB-HEADINGS**: Format time-sensitive info like "Drop Only ends Monday Sep 8, 11:59PM PT" as prominent headings
   - **BODY TEXT**: Convert ANY bold/strong formatting in the middle of paragraphs to normal font weight
   - **HYPERLINKS - CRITICAL**: Preserve ALL hyperlinks exactly as they are - NEVER remove, modify, or strip any <a href="..."> tags
     * Keep exact URL destinations unchanged
     * Preserve exact link text unchanged
     * Maintain all link attributes (target, rel, etc.)
     * Example: <a href="https://example.com" target="_blank">Link Text</a> must remain identical
   - **SPACING**: Ensure proper spaces between ALL sentences and paragraphs
   - **LINE BREAKS**: Use proper HTML structure with <p>, <ul>, <li> tags
   - **DATES/TIMES**: Preserve all important dates, times, and details exactly
   - **BULLET POINTS**: Convert to proper HTML lists with nested structure when needed

5. CONTENT ORGANIZATION:
   - Group similar topics together within sections
   - Maintain chronological order for time-sensitive items
   - **CRITICAL: Break down complex items into multiple subsections** when appropriate
   - For single announcements, create multiple focused subsections instead of one large block
   - **ENHANCED SUBSECTION CREATION**: 
     * Split long content (>300 words) into 2-3 focused subsections
     * Use descriptive subsection titles that clearly indicate the content focus
     * Group related bullet points and instructions together
     * Separate different types of information (deadlines vs instructions vs requirements)
   - Create logical subsections that make sense for the content type
   - Ensure each subsection has a clear purpose and focus

6. BOLD/STRONG TEXT RULES:
   - Keep bold only for: Section headers, subsection titles at line beginnings, important deadlines
   - Convert to normal weight: Any bold text in the middle of sentences or paragraphs
   - Exception: Keep bold for emphasis on dates/deadlines if at start of line or important notices

7. SPACING AND READABILITY:
   - Always include spaces between sentences (e.g., "First sentence. Second sentence.")
   - Use proper paragraph breaks with <p> tags
   - Break long content blocks into multiple paragraphs for readability
   - Ensure lists are properly formatted with <ul> and <li> tags
   - Create visual hierarchy with headings, subheadings, and proper list formatting

8. SPECIAL CASE HANDLING:
   - **LONG ANNOUNCEMENTS**: For content like "Fall 2025 Electives Reminder", create multiple subsections:
     * "Fall 2025 Electives Reminder" (main announcement with deadline)
     * "Enrollment Guidelines" (requirements and OLR instructions) 
     * "Student Responsibilities" (Go Beyond Yourself section with waitlist considerations)
   - **COMPLEX CONTENT**: Break down any single item >300 words into logical subsections
   - **DEADLINE-FOCUSED CONTENT**: Create separate subsections for deadlines vs detailed instructions
   - **BULLET POINT GROUPS**: When content has multiple bullet point groups, create separate subsections for each group
   - **HIERARCHICAL STRUCTURE**: Maintain proper heading levels (h3 for subsection titles, h4 for sub-headings, h5 for bullet group headers)
   - **READABILITY OPTIMIZATION**: Ensure no single subsection exceeds 200 words for optimal readability

Return a JSON object with this exact structure:
{
  "sections": [
    {
      "sectionTitle": "This Week",
      "items": [
        {
          "title": "Fall 2025 Electives Reminder",
          "html": "<h4>Drop Only ends Monday Sep 8, 11:59PM PT</h4><p>Important deadline approaching for fall electives enrollment changes.</p>"
        },
        {
          "title": "Enrollment Guidelines", 
          "html": "<h5>Things to keep in mind:</h5><ul><li>Any enrollment changes to your schedule must be made in <a href=\"https://calcentral.berkeley.edu\" target=\"_blank\">OLR</a>.</li><li>Final enrollment changes in CalCentral will be processed on Sep 9, after which you should confirm your class schedule accuracy.</li><li>Bills, transcripts, and <a href=\"https://bcourses.berkeley.edu\">bCourses</a> enrollments are generated by enrollment in CalCentral.</li></ul>"
        },
        {
          "title": "Student Responsibilities",
          "html": "<h5>Go Beyond Yourself</h5><ul><li>Please drop any course enrollments you do not wish to take in consideration of students on the waitlist.</li><li>In addition, also drop yourself from any waitlists that you do not want.</li><li>As other students drop, you may be enrolled off the waitlist during Drops Only! So check your <a href=\"https://calcentral.berkeley.edu/dashboard\">OLR status</a> before the Drop Only Round closes.</li></ul>"
        }
      ]
    }
  ],
  "debugInfo": {
    "reasoning": "Explain your overall approach and how you restructured to match the parsing logic",
    "sectionDecisions": [
      "Why you created each main section and what content you grouped together",
      "How you split complex content into focused, readable subsections",
      "How you handled formatting standardization and created proper heading hierarchy",
      "How you preserved all original content while improving structure and readability",
      "CRITICAL: How you ensured ALL hyperlinks were preserved exactly as in the original"
    ],
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
`;

    // Use configurable model with new Responses API as primary
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    console.log('🤖 Using AI model:', model);

    let response: string;

    // New Responses API (primary method as per official docs)
    if ((openai as any).responses) {
      console.log('🚀 Using new Responses API (primary method)');
      
      const apiResponse = await openai.responses.create({
        model: model,
        instructions: "You are a helpful assistant that intelligently parses and organizes newsletter content. Follow the existing parsing logic but handle edge cases flexibly. Always return valid JSON with detailed debugging information.",
        input: prompt
      });

      // Use the convenience output_text property from the SDK
      response = (apiResponse as any).output_text || '';
    } else {
      // Fallback to Chat Completions API (supported indefinitely)
      console.log('📡 Using Chat Completions API (fallback)');
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system", 
            content: "You are a helpful assistant that intelligently parses and organizes newsletter content. Follow the existing parsing logic but handle edge cases flexibly. Always return valid JSON with detailed debugging information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      response = completion.choices[0]?.message?.content || '';
    }

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean and validate JSON response
    let cleanedResponse = response.trim();
    
    // Remove any markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Log the raw response for debugging
    console.log('🔍 Raw AI Response (first 500 chars):', cleanedResponse.substring(0, 500));
    console.log('📏 Response length:', cleanedResponse.length);

    let organizedData;
    try {
      // Parse the JSON response
      organizedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('❌ JSON Parse Error:', parseError);
      console.log('🔍 Problematic response around position 5419:', cleanedResponse.substring(5400, 5450));
      
      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          console.log('🔄 Attempting to parse extracted JSON...');
          organizedData = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          const secondErrorMessage = secondParseError instanceof Error ? secondParseError.message : 'Unknown parse error';
          console.error('❌ Second JSON Parse Error:', secondParseError);
          throw new Error(`Failed to parse AI response as JSON: ${secondErrorMessage}`);
        }
      } else {
        throw new Error(`No valid JSON found in AI response: ${errorMessage}`);
      }
    }

    const processingTime = Date.now() - startTime;
    
    // Debug: Log what AI returned
    console.log('🤖 AI Response Debug:');
    console.log('📏 Response length:', response.length);
    console.log('📊 Organized sections count:', organizedData.sections?.length || 0);
    console.log('📝 First section items count:', organizedData.sections?.[0]?.items?.length || 0);
    console.log('🔍 First section structure:', {
      title: organizedData.sections?.[0]?.sectionTitle,
      itemsCount: organizedData.sections?.[0]?.items?.length || 0,
      firstItemTitle: organizedData.sections?.[0]?.items?.[0]?.title,
      firstItemContentLength: organizedData.sections?.[0]?.items?.[0]?.html?.length || 0
    });
    
    // Log debugging information
    console.log('🤖 OpenAI Newsletter Organization Debug Info:');
    console.log('📊 Processing Time:', processingTime + 'ms');
    console.log('🧠 AI Reasoning:', organizedData.debugInfo?.reasoning);
    console.log('📝 Section Decisions:', organizedData.debugInfo?.sectionDecisions);
    console.log('⚠️ Edge Cases Handled:', organizedData.debugInfo?.edgeCasesHandled);
    console.log('📚 Total Sections Created:', organizedData.sections?.length);

    return {
      sourceUrl,
      title,
      sections: organizedData.sections,
      aiDebugInfo: {
        reasoning: organizedData.debugInfo?.reasoning || 'No reasoning provided',
        sectionDecisions: organizedData.debugInfo?.sectionDecisions || [],
        edgeCasesHandled: organizedData.debugInfo?.edgeCasesHandled || [],
        totalSections: organizedData.sections?.length || 0,
        processingTime
      }
    };

  } catch (error) {
    console.error('Error organizing newsletter with AI:', error);
    
    // Fallback to original parsing
    return {
      sourceUrl,
      title,
      sections: rawSections
    };
  }
}

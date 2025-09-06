import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OrganizedSection {
  sectionTitle: string;
  items: {
    title: string;
    content: string;
  }[];
}

export interface OrganizedNewsletter {
  sourceUrl: string;
  title?: string;
  sections: OrganizedSection[];
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

  try {
    // Convert raw sections to text for AI processing
    const rawContent = rawSections.map(section => {
      const items = section.items?.map((item: any) => {
        const cleanContent = item.html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
        return `${item.title}: ${cleanContent}`;
      }).join('\n') || '';
      
      return `[${section.sectionTitle}]\n${items}`;
    }).join('\n\n');

    const prompt = `
You are a smart newsletter parser for an MBA program. Your job is to intelligently organize newsletter content, similar to how our existing parser works but with better handling of edge cases.

Raw newsletter content:
${rawContent}

Please analyze this content and organize it following these parsing principles:

1. IDENTIFY MAIN SECTIONS: Look for content that represents distinct topics or categories (like our H1 headers)
2. DETECT SUBSECTIONS: Within each main section, identify subsections based on:
   - Strong/bold text that acts as subheadings
   - Logical content breaks
   - Topics that should be grouped together
3. HANDLE EDGE CASES: Be flexible with:
   - Inconsistent formatting
   - Mixed content that could belong to multiple sections
   - Text that doesn't clearly fit standard patterns
4. PRESERVE INFORMATION: Don't lose any content - if something doesn't fit neatly, create appropriate sections for it

Return a JSON object with this structure:
{
  "sections": [
    {
      "sectionTitle": "Main Section Name",
      "items": [
        {
          "title": "Subsection Title",
          "content": "<p>Formatted HTML content with proper structure</p>"
        }
      ]
    }
  ]
}

Guidelines:
- Keep section titles descriptive but concise
- Preserve all important dates, times, and details
- Use proper HTML formatting (p, strong, ul, li tags as appropriate)
- Group related information logically
- If content seems to belong together, keep it together
- Create subsections that make sense for the content, don't force artificial divisions
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant that intelligently parses and organizes newsletter content. Follow the existing parsing logic but handle edge cases flexibly. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const organizedData = JSON.parse(response);
    
    return {
      sourceUrl,
      title,
      sections: organizedData.sections
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

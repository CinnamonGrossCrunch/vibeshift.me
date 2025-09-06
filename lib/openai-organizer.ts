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
You are a newsletter content organizer for an MBA program. Please reorganize this newsletter content into logical sections.

Based on the following raw content, create well-organized sections with appropriate titles and subsections:

${rawContent}

Please reorganize this into exactly these 5 main sections:
1. "Football Game This Week" - All football-related information
2. "Taxis and rideshares" - Transportation via rideshare information  
3. "Parking" - All parking-related information
4. "Road Closures and Traffic Advisories" - Traffic and road closure information
5. "Program Office Staff" - Staff information

For each section, create subsections with clear titles and organized content. Ensure all relevant information is properly categorized.

Return the result as a JSON object with this exact structure:
{
  "sections": [
    {
      "sectionTitle": "Section Name",
      "items": [
        {
          "title": "Subsection Title",
          "content": "<p>Formatted HTML content</p>"
        }
      ]
    }
  ]
}

Make sure to:
- Preserve all important information
- Use proper HTML formatting in content
- Create logical subsections within each main section
- Keep content organized and readable
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant that organizes newsletter content. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
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

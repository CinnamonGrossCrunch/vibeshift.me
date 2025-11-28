import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Configure marked options for better rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

export async function GET() {
  try {
    const newslettersDir = path.join(process.cwd(), 'content', 'newsletters');
    
    // Check if directory exists
    if (!fs.existsSync(newslettersDir)) {
      return NextResponse.json({ 
        newsletters: [],
        message: 'Newsletters directory does not exist yet'
      });
    }

    // Read all markdown files
    const files = fs.readdirSync(newslettersDir)
      .filter(file => file.endsWith('.md'))
      .sort()
      .reverse(); // Most recent first

    // Parse each file
    const newsletters = files.map(filename => {
      const filePath = path.join(newslettersDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      
      // Parse frontmatter and content
      const { data, content } = matter(fileContents);
      
      // Pre-process content before markdown conversion
      let processedContent = content.trim();
      
      // Replace broken image references like [image: image.png] with placeholder
      processedContent = processedContent.replace(
        /\[image:\s*([^\]]+)\]/gi,
        (match, imageName) => {
          return `\n\n**📷 Image:** *${imageName.trim()}*\n\n`;
        }
      );
      
      // Convert markdown to HTML
      const htmlContent = marked.parse(processedContent);
      
      return {
        filename,
        title: data.title || filename.replace('.md', ''),
        date: data.date || 'Unknown date',
        source: data.source || 'gmail',
        content: htmlContent,
      };
    });

    return NextResponse.json({
      newsletters,
      count: newsletters.length,
    });

  } catch (error) {
    console.error('Error reading Gmail newsletters:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch newsletters',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

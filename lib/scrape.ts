/* eslint-disable @typescript-eslint/no-explicit-any */
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';

// Helpers
function toAbsoluteUrl(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function absolutizeLinks($: cheerio.CheerioAPI, base: string) {
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) $(el).attr('href', toAbsoluteUrl(href, base));
  });
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) $(el).attr('src', toAbsoluteUrl(src, base));
  });
}

// Very light sanitization: keep markup structure + hyperlinks
function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      '*': ['class', 'id']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowVulnerableTags: false, // Disable XSS warnings since we're using a secure allowlist
    transformTags: {
      a: (tagName, attribs) => {
        // Always ensure rel safety if target=_blank
        if (attribs.target === '_blank') {
          attribs.rel = attribs.rel ? attribs.rel : 'noopener noreferrer';
        }
        return { tagName, attribs };
      }
    }
  });
}

export interface NewsletterItem {
  title: string;
  html: string; // cleaned HTML
}

export interface NewsletterSection {
  sectionTitle: string;
  items: NewsletterItem[];
}

export interface NewsletterPayload {
  sourceUrl: string;
  title?: string;
  publishedAt?: string;
  sections: NewsletterSection[];
}

// Fetch helpers
async function fetchText(url: string): Promise<string> {
  try {
    console.log('Fetching URL:', url);
    // Node 18+ has fetch globally; fallback is ok if node-fetch installed
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (NewsletterWidget Bot) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!res.ok) {
      console.error(`HTTP ${res.status} for ${url}`);
      const errorText = await res.text().catch(() => 'Unable to read error response');
      throw new Error(`HTTP ${res.status} for ${url}: ${errorText}`);
    }
    
    const text = await res.text();
    console.log(`Successfully fetched ${text.length} characters from ${url}`);
    return text;
  } catch (error) {
    console.error('Fetch error for', url, ':', error);
    throw error;
  }
}

export async function getLatestNewsletterUrl(): Promise<string> {
  const archiveUrl =
    'https://us7.campaign-archive.com/home/?u=af08d0494e1eb953ae69deb12&id=82d127382b';

  const html = await fetchText(archiveUrl);
  const $ = cheerio.load(html);

  // Robust first-link selection:
  // Prefer mailchi.mp campaign links, else first link inside the archive list area
  const href =
    $('a[href*="mailchi.mp"]').first().attr('href') ||
    $('#archive-list a[href]').first().attr('href') ||
    $('.campaigns a[href]').first().attr('href') ||
    $('a[href]').first().attr('href');

  if (!href) throw new Error('No campaign link found on archive page.');
  return toAbsoluteUrl(href, archiveUrl);
}

export async function scrapeNewsletter(url: string): Promise<NewsletterPayload> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);

  // Absolutize links in the full document first
  absolutizeLinks($, url);

  // Try to capture core content title if available
  const title =
    $('title').first().text().trim() ||
    $('h1').first().text().trim() || undefined;

  // Parse sections - much more aggressive approach
  const sections: NewsletterSection[] = [];
  
  // Look for h1 elements within Mailchimp text blocks that serve as section headers
  const sectionHeaders = $('h1').filter((_, el) => {
    const text = $(el).text().trim();
    return text.length > 0 && text !== title; // Exclude the main title
  });

  if (sectionHeaders.length > 0) {
    sectionHeaders.each((_, header) => {
      const $header = $(header);
      const sectionTitle = $header.text().trim();
      const items: NewsletterItem[] = [];

      // Find the containing block and get subsequent content blocks
      let currentBlock = $header.closest('.mcnTextBlock, .mcnCaptionBlock');
      
      // Continue collecting content until we hit the next h1 section
      while (currentBlock.length) {
        const nextBlock = currentBlock.next('.mcnTextBlock, .mcnCaptionBlock');
        
        // Check if the next block contains another h1 header (new section)
        if (nextBlock.length && nextBlock.find('h1').length > 0) {
          break;
        }
        
        if (nextBlock.length) {
          // Extract content from this block using multiple approaches
          let blockContent = extractContentFromBlock($, nextBlock);
          
          if (!blockContent.title || !blockContent.html) {
            blockContent = extractContentFromTextBlock($, nextBlock);
          }
          
          if (!blockContent.title || !blockContent.html) {
            blockContent = extractEventContentAlternative($, nextBlock);
          }
          
          // Final fallback - just use the raw text content
          if (!blockContent.title || !blockContent.html) {
            const blockText = nextBlock.text().trim();
            if (blockText.length > 10) {
              const firstLine = blockText.split('\n')[0].trim();
              blockContent = {
                title: firstLine.length > 0 && firstLine.length < 100 ? firstLine : 'Content',
                html: nextBlock.html() || `<p>${blockText}</p>`
              };
            }
          }
          
          if (blockContent.title && blockContent.html) {
            const textContent = blockContent.html.replace(/<[^>]*>/g, '').trim();
            if (textContent.length > 5) { // Very permissive threshold
              items.push(blockContent);
            }
          }
        }
        
        currentBlock = nextBlock;
      }

      if (items.length > 0) {
        sections.push({ sectionTitle, items });
      }
    });
  }

  // If no structured sections found, try alternative parsing methods
  if (sections.length === 0) {
    // Look for ALL text content blocks
    const allTextElements = $('p, div, td, li').filter((_, el) => {
      const $el = $(el);
      const textContent = $el.text().trim();
      // Very permissive - just need some text content
      return textContent.length > 10 && 
             // Make sure it's not a parent element that contains other text elements
             $el.children().filter((_, child) => $(child).text().trim().length > 5).length === 0;
    });

    const items: NewsletterItem[] = [];
    allTextElements.each((_, element) => {
      const $el = $(element);
      const textContent = $el.text().trim();
      const htmlContent = $el.html();
      
      if (textContent.length > 10 && htmlContent) {
        const title = textContent.substring(0, 60) + (textContent.length > 60 ? '...' : '');
        items.push({
          title: title,
          html: cleanHtml(htmlContent)
        });
      }
    });

    if (items.length > 0) {
      sections.push({
        sectionTitle: 'Newsletter Content',
        items
      });
    }
  }

  // Final fallback: capture main body area
  if (sections.length === 0) {
    const body =
      $('#templateBody').html() ||
      $('.bodyContainer').html() ||
      $('#bodyTable').html() ||
      $('body').html() ||
      '';

    sections.push({
      sectionTitle: 'Newsletter',
      items: [{ title: 'Content', html: cleanHtml(body) }]
    });
  }

  return { sourceUrl: url, title, sections };
}

// Helper function to detect if a block contains only images without meaningful text content
function isImageOnlyBlock($: cheerio.CheerioAPI, block: cheerio.Cheerio<any>): boolean {
  const $block = $(block);
  
  // Check if it's a caption block with only images
  if ($block.hasClass('mcnCaptionBlock')) {
    // Look for text content that's not just captions or empty
    const textContent = $block.find('.mcnCaptionRightTextContentContainer').text().trim();
    const imageCount = $block.find('img').length;
    
    // If there are images but minimal meaningful text content (less than 15 chars)
    // Reduced threshold to catch more content
    if (imageCount > 0 && textContent.length < 15) {
      return true;
    }
    
    // If the text content is only image alt text or very short captions
    // But allow longer text that might be event descriptions
    if (textContent.length < 30 && !textContent.match(/[.!?].*[.!?]/) && 
        !textContent.toLowerCase().includes('open house') &&
        !textContent.toLowerCase().includes('information session') &&
        !textContent.toLowerCase().includes('ice-cream social')) {
      return true;
    }
  }
  
  // Check if the block primarily contains images with minimal text
  const images = $block.find('img');
  const textContent = $block.text().replace(/\s+/g, ' ').trim();
  
  // If there are images but very little text content (reduced threshold)
  if (images.length > 0 && textContent.length < 20) {
    return true;
  }
  
  // Check for typical image-only structures but be more conservative
  const hasOnlyImageContent = $block.find('.mcnImageContent').length > 0 && 
                              $block.find('.mcnTextContent').length === 0 &&
                              textContent.length < 10;
  
  return hasOnlyImageContent;
}

// Alternative content extraction for events that might have different structure
function extractEventContentAlternative($: cheerio.CheerioAPI, block: cheerio.Cheerio<any>): NewsletterItem {
  const $block = $(block);
  
  // Look for any text content, including in image captions
  const allText = $block.text().trim();
  
  // Try various selectors for event titles
  let title = '';
  const possibleTitles = [
    $block.find('strong').first().text().trim(),
    $block.find('b').first().text().trim(),
    $block.find('h1, h2, h3, h4, h5, h6').first().text().trim(),
    $block.find('p').first().text().trim()
  ].filter(t => t.length > 0 && t.length < 100);
  
  title = possibleTitles[0] || 'Event';
  
  // If we found meaningful text but no proper HTML structure, create simple content
  if (allText.length > 5 && allText !== title) {
    return {
      title: title,
      html: `<p>${allText}</p>`
    };
  }
  
  return { title: '', html: '' };
}

// Helper function to extract content from a Mailchimp content block
function extractContentFromBlock($: cheerio.CheerioAPI, block: cheerio.Cheerio<any>): NewsletterItem {
  const $block = $(block);
  
  // Skip if this is an image-only block
  if (isImageOnlyBlock($, $block)) {
    return { title: '', html: '' };
  }
  
  // Look for a title - could be strong text, first paragraph, or specific elements
  let title = '';
  const strongText = $block.find('strong').first().text().trim();
  const firstP = $block.find('p').first().text().trim();
  const captionText = $block.find('.mcnCaptionRightTextContentContainer strong').first().text().trim();
  
  title = strongText || captionText || (firstP.length < 100 ? firstP : 'Content') || 'Item';
  
  // Extract the full HTML content, focusing on text content and avoiding image-only sections
  let contentElements = $block.find('.mcnTextContent, .mcnCaptionRightTextContentContainer .mcnTextContent');
  
  // If no content found, try alternative selectors for caption blocks but ensure they have text
  if (contentElements.length === 0) {
    const captionContainers = $block.find('.mcnCaptionRightTextContentContainer');
    contentElements = captionContainers.filter((_, el) => {
      const textContent = $(el).text().trim();
      return textContent.length > 10; // Reduced threshold to catch event descriptions
    });
  }
  
  // Also try to find content in mcnCaptionLeftTextContentContainer
  if (contentElements.length === 0) {
    const leftCaptionContainers = $block.find('.mcnCaptionLeftTextContentContainer');
    contentElements = leftCaptionContainers.filter((_, el) => {
      const textContent = $(el).text().trim();
      return textContent.length > 10;
    });
  }
  
  const htmlParts: string[] = [];
  
  contentElements.each((_, el) => {
    const $el = $(el);
    // Create a copy to avoid modifying the original
    const $copy = $el.clone();
    
    // Remove the title if it was taken from strong text to avoid duplication
    if (strongText && $copy.find('strong').first().text().trim() === strongText) {
      $copy.find('strong').first().remove();
    }
    
    const elementHtml = $.html($copy);
    if (elementHtml && elementHtml.trim()) {
      // Check if there's meaningful text content - reduced threshold
      const textContent = elementHtml.replace(/<[^>]*>/g, '').trim();
      if (textContent.length > 5) { // Much more permissive threshold
        htmlParts.push(elementHtml);
      }
    }
  });
  
  // If still no content, try to get text content from the block but avoid image-heavy sections
  if (htmlParts.length === 0) {
    const $blockCopy = $block.clone();
    // Don't remove image containers if they might contain text
    
    const allContent = $blockCopy.html();
    if (allContent && allContent.trim()) {
      const textContent = allContent.replace(/<[^>]*>/g, '').trim();
      if (textContent.length > 5) { // Reduced threshold to catch more content
        htmlParts.push(allContent);
      }
    }
  }
  
  return {
    title: title.replace(/\s+/g, ' ').trim(),
    html: cleanHtml(htmlParts.join(''))
  };
}

// Helper function to extract content from individual text blocks
function extractContentFromTextBlock($: cheerio.CheerioAPI, textContent: cheerio.Cheerio<any>): NewsletterItem {
  const $content = $(textContent);
  
  // Get title from first strong element or first line
  let title = '';
  const strongEl = $content.find('strong').first();
  if (strongEl.length) {
    title = strongEl.text().trim();
    // Remove the strong element to avoid duplication in content
    strongEl.remove();
  } else {
    const firstP = $content.find('p').first();
    if (firstP.length) {
      const text = firstP.text().trim();
      if (text.length < 100) {
        title = text;
        firstP.remove();
      }
    }
  }
  
  // Clean up the remaining content
  const remainingHtml = $.html($content);
  
  return {
    title: title || 'Content Item',
    html: cleanHtml(remainingHtml || '')
  };
}

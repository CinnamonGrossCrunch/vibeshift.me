'use client';

import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

export default function NewsletterWidget({ data }: { data: Payload }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [itemVisited, setItemVisited] = useState<Set<string>>(new Set());
  const [itemOpen, setItemOpen] = useState<Record<string, boolean>>({});
  const [showCaughtUpText, setShowCaughtUpText] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);

  // Load animation data dynamically
  useEffect(() => {
    fetch('/Gross-Haas-Click.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Failed to load animation:', error));
  }, []);

  // Function to split items by <strong> tags to create subsections
  const createSubsections = (items: Item[]) => {
    const subsections: { title: string; content: string }[] = [];
    
    items.forEach(item => {
      // Skip empty or very short items
      if (!item.html || item.html.trim().length < 10) {
        return;
      }

      // Check if this item contains <strong> tags for subsections (ignore empty or whitespace-only strong tags)
      const strongMatches = item.html.match(/<strong>\s*[^\s<][^<]*[^\s<]\s*<\/strong>/g);
      
      if (strongMatches && strongMatches.length > 0) {
        // Split content by <strong> tags that appear to be section headers (with meaningful content)
        const sections = item.html.split(/(<strong>\s*[^\s<][^<]*[^\s<]\s*<\/strong>)/);
        
        let currentTitle = '';
        let currentContent = '';
        let hasPreContent = false;
        
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i].trim();
          
          if (section.match(/<strong>\s*[^\s<][^<]*[^\s<]\s*<\/strong>/)) {
            // If we have accumulated content, save the previous subsection
            if (currentTitle && currentContent.trim()) {
              subsections.push({ 
                title: currentTitle, 
                content: currentContent.trim()
              });
            }
            // Start new subsection
            currentTitle = section.replace(/<\/?strong>/g, '').trim();
            currentContent = '';
          } else if (section.trim()) {
            // If this is content before the first <strong> tag and we don't have a title yet
            if (!currentTitle && section.trim() && !hasPreContent) {
              // Use item title for content that appears before any <strong> tags
              subsections.push({
                title: item.title,
                content: section.trim()
              });
              hasPreContent = true;
            } else {
              // Accumulate content for current subsection
              currentContent += section;
            }
          }
        }
        
        // Don't forget the last subsection - make sure we capture all remaining content
        if (currentTitle) {
          // Even if currentContent is empty, include the title as a subsection
          subsections.push({ 
            title: currentTitle, 
            content: currentContent.trim() || `<p class="text-xs text-slate-500 italic">Details available in the original newsletter.</p>`
          });
        }
        
        // If no subsections were created but we had strong matches, add the whole item
        if (subsections.length === 0) {
          subsections.push({
            title: item.title,
            content: item.html
          });
        }
      } else {
        // If no <strong> tags found, treat entire item as one subsection
        // But check if the content is meaningful
        const cleanContent = item.html.replace(/<[^>]*>/g, '').trim();
        if (cleanContent.length > 5) { // Only include if there's actual text content
          subsections.push({
            title: item.title,
            content: item.html
          });
        } else if (item.title && item.title.trim().length > 0) {
          // If there's a meaningful title but no content, create a placeholder with the title
          subsections.push({
            title: item.title,
            content: `<p>${item.title}</p><p class="text-xs text-slate-500 italic">Event details available in the original newsletter.</p>`
          });
        }
      }
    });
    
    // Remove duplicates based on title similarity
    const uniqueSubsections: { title: string; content: string }[] = [];
    const seenTitles = new Set<string>();
    
    for (const subsection of subsections) {
      const normalizedTitle = subsection.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (!seenTitles.has(normalizedTitle) && normalizedTitle.length > 0) {
        seenTitles.add(normalizedTitle);
        uniqueSubsections.push(subsection);
      }
    }
    
    return uniqueSubsections;
  };

  // Check if all items in a section have been visited
  const allItemsInSectionVisited = (sectionIndex: number) => {
    const section = data.sections[sectionIndex];
    // Count actual subsections for this section
    const totalSubsections = createSubsections(section.items).length;
    
    // Count visited subsections  
    let visitedSubsections = 0;
    createSubsections(section.items).forEach((_, subIdx) => {
      if (itemVisited.has(`${sectionIndex}-${subIdx}`)) {
        visitedSubsections++;
      }
    });
    
    return visitedSubsections === totalSubsections;
  };

  // Calculate progress metrics - only count sections as "read" when ALL subsections are visited
  const unopenedSectionsCount = data.sections.filter((_, index) => !allItemsInSectionVisited(index)).length;

  // Handle the "You're All Caught Up!" text delay
  useEffect(() => {
    if (unopenedSectionsCount === 0) {
      const timer = setTimeout(() => {
        setShowCaughtUpText(true);
      }, 2000); // Start fade-in at 2 seconds
      
      return () => clearTimeout(timer);
    } else {
      setShowCaughtUpText(false);
    }
  }, [unopenedSectionsCount]);

    // Smart bulleting function with enhanced HTML hierarchy
  const addSmartBullets = (html: string) => {
    // Skip if content is very short
    if (html.length < 50) {
      return html;
    }

    let processedHtml = html.trim();
    processedHtml = processedHtml.replace(/^(<br\s*\/?>|\s)+/, '');
    processedHtml = processedHtml.replace(/(<br\s*\/?>|\s)+$/, '');

    // --- NEW LOGIC ---
    // 1. Extract and style any unbulleted text that appears before lists as large bold white headings
    // 2. Remove vertical bars for empty lines in bullet rendering

    // Split content into parts: text before lists, lists, text after lists
    const listPattern = /(<ul>[\s\S]*?<\/ul>|<ol>[\s\S]*?<\/ol>)/g;
    const parts = processedHtml.split(listPattern);
    
    const processedParts: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.match(listPattern)) {
        // This is a list - process it normally later
        processedParts.push(part);
      } else if (part.trim()) {
        // This is text content - check if it comes before a list or is standalone
        const nextPart = parts[i + 1];
        const isBeforeList = nextPart && nextPart.match(listPattern);
        
        // Extract clean text content (remove HTML tags but keep structure)
        const textContent = part
          .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines first
          .replace(/<[^>]*>/g, '') // Then remove all remaining HTML tags
          .trim();
        
        if (textContent && (isBeforeList || i === 0)) {
          // Style as large bold white heading if it's before a list or at the start
          const formattedText = textContent.replace(/\n/g, '<br>');
          processedParts.push(`<div class="mb-3"><span class="block text-md urbanist-bold text-white">${formattedText}</span></div>`);
        } else if (textContent) {
          // Regular text content - preserve as paragraph with line breaks
          const formattedText = textContent.replace(/\n/g, '<br>');
          processedParts.push(`<p class="text-xs leading-relaxed urbanist-regular text-slate-700 dark:text-slate-300 my-2">${formattedText}</p>`);
        }
      }
    }
    
    // Rejoin the processed parts
    processedHtml = processedParts.join('');

    // Handle sections: <strong>Title</strong> followed by content (lists, paragraphs)
    processedHtml = processedHtml.replace(/<strong>([^<]+)<\/strong>\s*(<ul>[\s\S]*?<\/ul>|<ol>[\s\S]*?<\/ol>|<p>[\s\S]*?<\/p>)*/g, (match, title, content) => {
      return `<div class="mb-4">
        <div class="flex items-center space-x-2 mb-3">
          <div class="flex-shrink-0">
            <div class="w-1.5 h-4 rounded-full" style="background: linear-gradient(to bottom, var(--berkeley-gold), #E5A914);"></div>
          </div>
          <h4 class="text-sm urbanist-semibold text-slate-900 dark:text-white leading-tight">${title}</h4>
        </div>
        <div class="ml-4">
          ${content || ''}
        </div>
      </div>`;
    });

    // Handle unordered lists with enhanced styling
    processedHtml = processedHtml.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
      // More aggressive empty list item filtering
      const filteredContent = content
        .replace(/<li[^>]*>\s*<\/li>/g, '') // Remove completely empty <li></li> tags
        .replace(/<li[^>]*>(\s|&nbsp;|&\w+;|\?)*<\/li>/gi, '') // Remove <li> with only whitespace/entities
        .replace(/<li[^>]*>[\u00A0\u2000-\u200B\u2028\u2029\u3000\uFEFF\u202F\?\s]*<\/li>/g, ''); // Remove Unicode spaces
      
      // Additional pass to remove any remaining problematic list items
      const listItems: string[] = [];
      filteredContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_liMatch: string, liContent: string) => {
        // Ultra-strict empty content detection
        const ultraCleanContent = liContent
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/g, '') // Remove all Unicode spaces
          .replace(/[\?\u00BF\u061F\u037E\u055E\u061F\u1367\u1945\u2047-\u2049\u2753-\u2755\u2CFA-\u2CFD\u2E2E\uA60F\uA6F7\uFE16\uFE56\uFE5F\uFF1F]/g, '') // Remove various question marks
          .replace(/[^\w\s\-\.,!@#$%^&*()+=\[\]{}|\\:";'<>?/~`]/g, '') // Keep only basic printable characters
          .trim();
        
        if (ultraCleanContent && ultraCleanContent.length > 0) {
          listItems.push(_liMatch);
        }
        return '';
      });
      
      // Only process valid list items
      const processedItems = listItems.map(liMatch => {
        const liContent = liMatch.replace(/<li[^>]*>([\s\S]*?)<\/li>/, '$1');
        
        // Check if this list item contains nested lists
        const hasNestedList = liContent.includes('<ul>') || liContent.includes('<ol>');
        if (hasNestedList) {
          const parts = liContent.split(/(<ul>[\s\S]*?<\/ul>|<ol>[\s\S]*?<\/ol>)/);
          const mainText = parts[0].trim();
          const nestedList = parts[1] || '';
          return `<div class="flex items-center space-x-3 my-2">
            <div class="flex-shrink-0">
              <div class="w-2 h-2 rounded-full" style="background-color: var(--berkeley-gold);"></div>
            </div>
            <div class="flex-1">
              <span class="text-xs leading-relaxed urbanist-regular text-slate-700 dark:text-slate-300">${mainText}</span>
              <div class="ml-4 mt-2">
                ${nestedList}
              </div>
            </div>
          </div>`;
        } else {
          return `<div class="flex items-center space-x-3 my-2">
            <div class="flex-shrink-0">
              <div class="w-2 h-2 rounded-full" style="background-color: var(--berkeley-gold);"></div>
            </div>
            <div class="flex-1">
              <span class="text-xs leading-relaxed urbanist-regular text-slate-700 dark:text-slate-300">${liContent.trim()}</span>
            </div>
          </div>`;
        }
      }).join('');
      
      // If no valid items, return empty string
      if (!processedItems || processedItems.trim().length === 0) return '';
      
      return `<div class="space-y-1">${processedItems}</div>`;
    });

    // Handle ordered lists
    processedHtml = processedHtml.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
      // More aggressive empty list item filtering for ordered lists
      const filteredContent = content
        .replace(/<li[^>]*>\s*<\/li>/g, '') // Remove completely empty <li></li> tags
        .replace(/<li[^>]*>(\s|&nbsp;|&\w+;|\?)*<\/li>/gi, '') // Remove <li> with only whitespace/entities
        .replace(/<li[^>]*>[\u00A0\u2000-\u200B\u2028\u2029\u3000\uFEFF\u202F\?\s]*<\/li>/g, ''); // Remove Unicode spaces
      
      // Collect only valid list items
      const listItems: string[] = [];
      filteredContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_liMatch: string, liContent: string) => {
        // Ultra-strict empty content detection
        const ultraCleanContent = liContent
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
          .replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/g, '') // Remove all Unicode spaces
          .replace(/[\?\u00BF\u061F\u037E\u055E\u061F\u1367\u1945\u2047-\u2049\u2753-\u2755\u2CFA-\u2CFD\u2E2E\uA60F\uA6F7\uFE16\uFE56\uFE5F\uFF1F]/g, '') // Remove various question marks
          .replace(/[^\w\s\-\.,!@#$%^&*()+=\[\]{}|\\:";'<>?/~`]/g, '') // Keep only basic printable characters
          .trim();
        
        if (ultraCleanContent && ultraCleanContent.length > 0) {
          listItems.push(liContent);
        }
        return '';
      });
      
      // Only process valid list items with counter
      let counter = 0;
      const processedItems = listItems.map(liContent => {
        counter++;
        return `<div class="flex items-center space-x-3 my-2">
          <div class="flex-shrink-0">
            <div class="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center">
              <span class="text-xs urbanist-medium">${counter}</span>
            </div>
          </div>
          <div class="flex-1">
            <span class="text-xs leading-relaxed urbanist-regular text-slate-700 dark:text-slate-300">${liContent.trim()}</span>
          </div>
        </div>`;
      }).join('');
      
      // If no valid items, return empty string
      if (!processedItems || processedItems.trim().length === 0) return '';
      
      return `<div class="space-y-1">${processedItems}</div>`;
    });

    // Handle headings without vertical bars for cleaner look
    processedHtml = processedHtml.replace(/<h([1-6])>([^<]+)<\/h[1-6]>/g, (match, level, content) => {
      const levelNum = parseInt(level);
      const size = levelNum <= 2 ? 'text-sm' : 'text-xs';
      const weight = levelNum <= 2 ? 'urbanist-semibold' : 'urbanist-medium';
      return `<h${level} class="${size} ${weight} text-slate-900 dark:text-white leading-tight my-3">${content}</h${level}>`;
    });

    // Handle paragraphs without vertical indicators
    processedHtml = processedHtml.replace(/<p>([^<]+)<\/p>/g, (match, content) => {
      if (content.trim().length === 0) return ''; // Remove empty paragraphs entirely
      if (content.length < 20) return `<p class="text-xs leading-relaxed urbanist-regular text-slate-700 dark:text-slate-300 my-2">${content}</p>`;
      return `<p class="text-xs leading-relaxed urbanist-regular text-slate-700 dark:text-slate-300 my-3">${content}</p>`;
    });

    // Handle remaining elements
    processedHtml = processedHtml.replace(/<strong>([^<]+)<\/strong>/g, 
      '<span class="urbanist-semibold text-slate-900 dark:text-white">$1</span>');
    processedHtml = processedHtml.replace(/<a([^>]*)>([^<]+)<\/a>/g, 
      '<a$1 class="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline decoration-amber-300 hover:decoration-amber-500 transition-colors !important">$2</a>');
    
    // Clean up whitespace but preserve line breaks
    processedHtml = processedHtml.replace(/\n\s*\n/g, '\n'); // Remove multiple consecutive newlines
    processedHtml = processedHtml.replace(/[ \t]+/g, ' '); // Normalize spaces and tabs but keep line breaks

    return processedHtml;
  };

  return (
    <div className="max-w-4xl mx-auto dark">
      {/* Header */}
      <div className="rounded-t-3xl p-3 sm:p-4 md:p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(to right, #001f47, var(--berkeley-blue))" }}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: "url('/bear blue 2.jpg')" }}
        ></div>
        
        {/* Content Overlay */}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 mb-1 sm:mb-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl urbanist-black whitespace-nowrap truncate">
                <span style={{ color: 'white' }}>Bear</span>
                <span className="ml-2" style={{ color: 'var(--berkeley-gold)' }}>Necessities</span>
              </h2>
            </div>
            
            {data.title && (
              <p className="text-blue-100 text-xs sm:text-sm urbanist-medium mb-1 truncate">{data.title}</p>
            )}
              <a
              className="text-gray-800 dark:text-gray-600 text-xs urbanist-regular transition-colors block mb-2 whitespace-nowrap"
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--berkeley-gold)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = ''}
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View original Newsletter
            </a>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
           
            {/* SECTION READ COUNTER */}
            <div className="text-right">
              {unopenedSectionsCount === 0 ? (
                <div className="text-center">
               <div className="text-xl sm:text-2xl urbanist-bold" style={{ color: 'var(--berkeley-gold)' }}>
                    {animationData ? (
                      <Lottie 
                        animationData={animationData}
                        loop={false}
                        autoplay={true}
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                    )}
                  </div>
                  {showCaughtUpText && (
                    <div 
                      className="text-xs urbanist-medium whitespace-nowrap animate-smooth-fade-in" 
                      style={{ 
                        color: 'white'
                      }}
                    >
                      You&apos;re All<br />Caught Up!
                    </div>
                  )}
               
                </div>
              ) : (
                <div className=" rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg bg-gradient-to-b from-gray-900/50 to-gray-900/10 text-center" style={{ borderColor: 'var(--berkeley-gold)', boxShadow: '0 -2px 20px 2px rgba(255, 255, 255, 0.2)' }}>
                  <div className="text-xs urbanist-light mb-1 sm:mb-0 whitespace-nowrap" style={{ color: 'var(--berkeley-gold)' }}>Updates<br />To Review</div>
                  <div className="text-xl sm:text-2xl urbanist-bold whitespace-nowrap" style={{ color: 'var(--berkeley-gold)' }}>
                  {unopenedSectionsCount} of {data.sections.length}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        {data.sections.map((sec, idx) => {
          const id = `${idx}-${sec.sectionTitle}`;
          const isOpen = !!open[id];
          const sectionVisitedCount = createSubsections(sec.items).filter((_, subIdx) => {
            const subsectionKey = `${idx}-${subIdx}`;
            const itemId = `${id}-item-${subIdx}`;
            return itemVisited.has(subsectionKey) || itemOpen[itemId];
          }).length;
          const sectionTotalCount = createSubsections(sec.items).length;
          
          return (
            <div key={id} className={`border-b border-slate-200 dark:border-slate-700 ${idx === data.sections.length - 1 ? 'border-b-0 rounded-b-2xl overflow-hidden' : ''}`}>
              <button
                onClick={() => {
                  // Auto-collapse: close all other sections
                  const newOpen: Record<string, boolean> = {};
                  if (!isOpen) {
                    newOpen[id] = true;
                  }
                  setOpen(newOpen);
                  // Also close all item dropdowns when switching sections
                  setItemOpen({});
                }}
                className={`section-button w-full text-left px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-amber-50 dark:from-slate-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 ease-in-out flex items-center justify-between group ${idx === data.sections.length - 1 && !isOpen ? 'rounded-b-2xl' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  {allItemsInSectionVisited(idx) ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-300 shadow-lg shadow-green-500/30 mr-2"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-yellow-300 shadow-lg animate-pulse mr-2" style={{ backgroundColor: 'var(--berkeley-gold)', boxShadow: '0 10px 15px -3px rgba(251, 181, 21, 0.4)' }}></div>
                  )}
                  <h3 className="text-lg urbanist-semibold text-slate-900 dark:text-white transition-colors group-hover:transition-colors" 
                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--berkeley-gold)'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = ''}>
                    {sec.sectionTitle}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sectionVisitedCount === sectionTotalCount ? (
                      <span className="text-green-600 dark:text-green-400 font-medium flex items-center">
                        {animationData ? (
                          <Lottie 
                            animationData={animationData}
                            loop={false}
                            autoplay={true}
                            className="w-10 h- mr-3"
                          />
                        ) : (
                          <span className="text-lg mr-3">✓</span>
                        )}
                       
                      </span>
                    ) : (
                        <span
                        className="px-2 py-1 rounded-full urbanist-medium"
                        style={{ backgroundColor: 'var(--berkeley-blue)', color: 'var(--berkeley-gold)' }}
                        >
                        {sectionTotalCount - sectionVisitedCount}/{sectionTotalCount} unread
                        </span>
                    )}
                  </div>
                </div>
              </button>
              
              <div 
                className={`expandable ${
                  isOpen ? 'expanded' : 'collapsed'
                }`}
              >
                <div className="expandable-content">
                  <div className={`border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ${idx === data.sections.length - 1 ? 'rounded-b-2xl' : ''}`}>
                    <div className={`px-8 py-4 space-y-3 ${idx === data.sections.length - 1 ? 'pb-6' : ''}`}>
                      {createSubsections(sec.items).map((subsection, j) => {
                        const itemKey = `${idx}-${j}`;
                        const itemId = `${id}-item-${j}`;
                        const isItemVisited = itemVisited.has(itemKey);
                        const isItemOpen = !!itemOpen[itemId];
                        
                        return (
                          <div key={itemId} className="relative">
                            {/* Subsection container */}
                            <div className="ml-6 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 shadow-sm">
                              <button
                                onClick={() => {
                                  // Auto-collapse: close all other items in this section
                                  const newItemOpen: Record<string, boolean> = {};
                                  if (!isItemOpen) {
                                    newItemOpen[itemId] = true;
                                    // Mark as visited when opened
                                    if (!isItemVisited) {
                                      setItemVisited(new Set([...itemVisited, itemKey]));
                                    }
                                  }
                                  setItemOpen(newItemOpen);
                                }}
                                className="item-button w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition-all duration-300 ease-in-out flex items-center justify-between group rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Pulsing yellow/green indicator only */}
                                  <div 
                                    className="flex-shrink-0 cursor-pointer transition-all duration-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isItemVisited) {
                                        setItemVisited(new Set([...itemVisited, itemKey]));
                                      }
                                    }}
                                  >
                                    {isItemVisited || isItemOpen ? (
                                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-300 shadow-lg shadow-green-500/30"></div>
                                    ) : (
                                      <div className="w-3 h-3 rounded-full border-2 border-yellow-300 shadow-lg animate-pulse hover:animate-none transition-colors" 
                                           style={{ backgroundColor: 'var(--berkeley-gold)', boxShadow: '0 10px 15px -3px rgba(251, 181, 21, 0.4)' }}
                                           onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#E5A914'}
                                           onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--berkeley-gold)'}></div>
                                    )}
                                  </div>
                                  
                                  <h4 className="text-sm urbanist-medium text-slate-800 dark:text-slate-200 transition-colors"
                                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--berkeley-gold)'}
                                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = ''}>
                                    {subsection.title}
                                  </h4>
                                </div>
                              </button>
                              
                              <div 
                                className={`expandable ${
                                  isItemOpen ? 'expanded' : 'collapsed'
                                }`}
                              >
                                <div className="expandable-content">
                                  <div className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
                                    <div className="px-6 py-4 cursor-pointer"
                                      onClick={() => {
                                        if (!isItemVisited) {
                                          setItemVisited(new Set([...itemVisited, itemKey]));
                                        }
                                      }}
                                    >
                                      {/* Content with enhanced visual hierarchy */}
                                      <div>
                                        <div
                                          className="prose prose-slate dark:prose-invert prose-sm max-w-none space-y-1 urbanist-regular
                                            [&>h1]:text-sm [&>h1]:urbanist-bold [&>h1]:text-slate-900 [&>h1]:dark:text-white [&>h1]:mb-3 [&>h1]:mt-2
                                            [&>h2]:text-sm [&>h2]:urbanist-semibold [&>h2]:text-slate-800 [&>h2]:dark:text-slate-100 [&>h2]:mb-2 [&>h2]:mt-2
                                            [&>h3]:text-xs [&>h3]:urbanist-medium [&>h3]:text-slate-700 [&>h3]:dark:text-slate-200 [&>h3]:mb-2 [&>h3]:mt-1
                                            [&>h4]:text-xs [&>h4]:urbanist-medium [&>h4]:text-slate-600 [&>h4]:dark:text-slate-300 [&>h4]:mb-1
                                            [&>h5]:text-xs [&>h5]:urbanist-regular [&>h5]:text-slate-600 [&>h5]:dark:text-slate-400 [&>h5]:mb-1
                                            [&>h6]:text-xs [&>h6]:urbanist-regular [&>h6]:text-slate-500 [&>h6]:dark:text-slate-500 [&>h6]:mb-1
                                            [&>p]:text-xs [&>p]:leading-relaxed [&>p]:urbanist-regular [&>p]:text-slate-700 [&>p]:dark:text-slate-300 [&>p]:mb-2
                                            [&>ul]:text-xs [&>ul]:space-y-1 [&>ul]:ml-4 [&>ul]:my-2 [&>ul]:urbanist-regular
                                            [&>ol]:text-xs [&>ol]:space-y-1 [&>ol]:ml-4 [&>ol]:my-2 [&>ol]:urbanist-regular
                                            [&>li]:text-xs [&>li]:urbanist-regular [&>li]:text-slate-700 [&>li]:dark:text-slate-300
                                            [&>blockquote]:text-xs [&>blockquote]:urbanist-italic [&>blockquote]:border-l-2 [&>blockquote]:border-slate-300 [&>blockquote]:pl-3 [&>blockquote]:text-slate-600
                                            [&>strong]:urbanist-semibold [&>strong]:text-slate-900 [&>strong]:dark:text-white
                                            [&>em]:urbanist-italic [&>em]:text-slate-600 [&>em]:dark:text-slate-400
                                            [&>code]:text-xs [&>code]:bg-slate-100 [&>code]:dark:bg-slate-800 [&>code]:px-1 [&>code]:rounded [&>code]:urbanist-regular
                                            [&_a]:text-amber-600 [&_a]:dark:text-amber-400 [&_a]:!text-amber-600 [&_a]:dark:!text-amber-400 [&_a]:no-underline [&_a]:hover:underline [&_a]:transition-colors"
                                          dangerouslySetInnerHTML={{ __html: addSmartBullets(subsection.content) }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {data.sections.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="text-lg urbanist-semibold text-slate-900 dark:text-white mb-2">No sections found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm urbanist-regular">
              The newsletter content could not be parsed into sections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

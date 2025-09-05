'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Lottie from 'lottie-react';

type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

export default function CompactNewsletterWidget({ data }: { data: Payload }) {
  // Initialize all sections as open by default
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initialOpen: Record<string, boolean> = {};
    data.sections.forEach((_, idx) => {
      initialOpen[`${idx}-${data.sections[idx].sectionTitle}`] = false;
    });
    return initialOpen;
  });
  const [itemVisited, setItemVisited] = useState<Set<string>>(new Set());
  const [itemOpen, setItemOpen] = useState<Record<string, boolean>>({});
  const [showCaughtUpText, setShowCaughtUpText] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  
  // New states for cascade animation
  const [sectionScaleStates, setSectionScaleStates] = useState<Record<number, boolean>>({});
  const [cascadeComplete, setCascadeComplete] = useState(false);
  const [triggerTopLevelAnimation, setTriggerTopLevelAnimation] = useState(false);

  // Load animation data dynamically
  useEffect(() => {
    fetch('/Gross-Haas-Click.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Failed to load animation:', error));
  }, []);

  // Initialize all subsections as open by default
  useEffect(() => {
    const initialItemOpen: Record<string, boolean> = {};
    data.sections.forEach((section, sectionIdx) => {
      const subsections = createSubsections(section.items);
      subsections.forEach((_, subIdx) => {
        const itemId = `${sectionIdx}-${section.sectionTitle}-item-${subIdx}`;
        initialItemOpen[itemId] = false;
      });
    });
    setItemOpen(initialItemOpen);
  }, [data.sections]);

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
  // Trigger cascade animation sequence when a section completes
  const triggerCascadeAnimation = useCallback(() => {
    if (cascadeComplete) return; // Prevent multiple triggers
    
    console.log('Cascade animation triggered!');
    
    // Get all completed sections
    const completedSections: number[] = [];
    data.sections.forEach((_, index) => {
      const section = data.sections[index];
      const totalSubsections = createSubsections(section.items).length;
      let visitedSubsections = 0;
      createSubsections(section.items).forEach((_, subIdx) => {
        if (itemVisited.has(`${index}-${subIdx}`)) {
          visitedSubsections++;
        }
      });
      if (visitedSubsections === totalSubsections) {
        completedSections.push(index);
      }
    });
    
    console.log('Completed sections:', completedSections);
    
    // Start cascade from bottom section (highest index) to top
    const sortedSections = [...completedSections].sort((a, b) => b - a);
    
    sortedSections.forEach((sectionIndex, cascadeIndex) => {
      setTimeout(() => {
        console.log(`Scaling section ${sectionIndex} at cascade index ${cascadeIndex}`);
        setSectionScaleStates(prev => ({
          ...prev,
          [sectionIndex]: true
        }));
        
        // After 400ms, scale back down
        setTimeout(() => {
          setSectionScaleStates(prev => ({
            ...prev,
            [sectionIndex]: false
          }));
        }, 400);
        
        // If this is the last section in cascade, trigger top-level animation
        if (cascadeIndex === sortedSections.length - 1) {
          setTimeout(() => {
            console.log('Cascade complete, triggering top-level animation');
            setCascadeComplete(true);
            setTriggerTopLevelAnimation(true);
          }, 400); // After scale-down completes
        }
      }, cascadeIndex * 100); // 100ms delay between sections
    });
  }, [cascadeComplete, data.sections, itemVisited, setSectionScaleStates, setCascadeComplete, setTriggerTopLevelAnimation]);

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
    
    const allVisited = visitedSubsections === totalSubsections;
    
    return allVisited;
  };

  // Calculate progress metrics - only count sections as "read" when ALL subsections are visited
  const unopenedSectionsCount = data.sections.filter((_, index) => !allItemsInSectionVisited(index)).length;

  // Functions to mark all subsections as read/unread (for testing)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markAllAsRead = () => {
    const allItemKeys = new Set<string>();
    
    data.sections.forEach((section, sectionIndex) => {
      const subsections = createSubsections(section.items);
      subsections.forEach((_, subIndex) => {
        allItemKeys.add(`${sectionIndex}-${subIndex}`);
      });
    });
    
    console.log('Marking all items as read:', allItemKeys);
    setItemVisited(allItemKeys);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markAllAsUnread = () => {
    console.log('Marking all items as unread and resetting states');
    setItemVisited(new Set());
    setItemOpen({});
    setOpen({});
    setSectionScaleStates({});
    setCascadeComplete(false);
    setTriggerTopLevelAnimation(false);
    setShowCaughtUpText(false);
  };

  // Trigger cascade animation when ALL sections are completed
  useEffect(() => {
    console.log('Checking for cascade trigger, unopened sections:', unopenedSectionsCount, 'cascade complete:', cascadeComplete);
    if (unopenedSectionsCount === 0 && !cascadeComplete && data.sections.length > 0) {
      console.log('All sections complete, starting 2-second delay before cascade');
      // Add 2-second delay before starting cascade
      setTimeout(() => {
        console.log('2-second delay complete, triggering cascade');
        triggerCascadeAnimation();
      }, 2000);
    }
  }, [unopenedSectionsCount, cascadeComplete, data.sections.length, triggerCascadeAnimation]);

  // Handle the "You're All Caught Up!" text delay - now triggered by cascade completion
  useEffect(() => {
    if (triggerTopLevelAnimation && unopenedSectionsCount === 0) {
      const timer = setTimeout(() => {
        setShowCaughtUpText(true);
      }, 500); // Shorter delay after cascade completes
      
      return () => clearTimeout(timer);
    } else {
      setShowCaughtUpText(false);
    }
  }, [triggerTopLevelAnimation, unopenedSectionsCount]);

    // Smart bulleting function with enhanced HTML hierarchy - Compact version uses simpler styling
  const addSmartBullets = (html: string) => {
    // Skip if content is very short
    if (html.length < 50) {
      return html;
    }

    let processedHtml = html.trim();
    processedHtml = processedHtml.replace(/^(<br\s*\/?>|\s)+/, '');
    processedHtml = processedHtml.replace(/(<br\s*\/?>|\s)+$/, '');

    // Simplified processing for compact view
    processedHtml = processedHtml.replace(/<strong>([^<]+)<\/strong>/g, 
      '<span class="urbanist-medium text-slate-800 dark:text-white text-xs">$1</span>');
    
    // Simple link processing
    processedHtml = processedHtml.replace(/<a\s+([^>]*)>([^<]+)<\/a>/gi, 
      '<a $1 class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline text-xs">$2</a>');

    // Handle unordered lists with minimal styling
    processedHtml = processedHtml.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
      const listItems: string[] = [];
      content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_liMatch: string, liContent: string) => {
        const cleanContent = liContent.replace(/<[^>]*>/g, '').trim();
        if (cleanContent && cleanContent.length > 0) {
          listItems.push(liContent);
        }
        return '';
      });
      
      const processedItems = listItems.map(liContent => {
        return `<div class="flex items-start space-x-2 my-1">
          <div class="flex-shrink-0 mt-1">
            <div class="w-1 h-1 rounded-full bg-amber-500"></div>
          </div>
          <div class="flex-1">
            <div class="text-xs leading-tight urbanist-regular text-slate-600 dark:text-slate-400">${liContent.trim()}</div>
          </div>
        </div>`;
      }).join('');
      
      return processedItems ? `<div class="space-y-0.5">${processedItems}</div>` : '';
    });

    // Handle paragraphs with compact styling
    processedHtml = processedHtml.replace(/<p>([^<]+)<\/p>/g, (match, content) => {
      if (content.trim().length === 0) return '';
      return `<p class="text-xs leading-tight urbanist-regular text-slate-600 dark:text-slate-400 my-1">${content}</p>`;
    });

    return processedHtml;
  };

  return (
    <div className="max-w-2xl mx-auto dark">
      {/* Compact Header */}
      <div className="rounded-t-2xl pt-1 px-2 pb-1 text-white relative overflow-hidden" style={{ background: "linear-gradient(to right, #001f47, var(--berkeley-blue))" }}>
        <div className="relative z-10 select-none">
          <div className="flex items-center justify-between gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <h2 className="text-2xl urbanist-bold whitespace-nowrap truncate">
                  <span style={{ color: 'white' }}>Bear</span>

                  <span className="ml-1" style={{ color: 'var(--berkeley-gold)' }}>Necessities</span>
    
                </h2>
              </div>
              
              {data.title && (
                <p className="text-blue-100 text-lg urbanist-regular mb-0 truncate">
                  {(() => {
                    // Extract dates from title - look for patterns like "January 1, 2025" or "Jan 1" or "1/1/25"
                    const datePatterns = [
                      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4}\b/gi,
                      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{2,4}\b/gi,
                      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
                      /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
                      /\b\d{4}-\d{1,2}-\d{1,2}\b/g
                    ];
                    
                    const extractedDates: string[] = [];
                    
                    datePatterns.forEach(pattern => {
                      const matches = data.title?.match(pattern) || [];
                      extractedDates.push(...matches);
                    });
                    
                    // Remove duplicates and join with " | "
                    const uniqueDates = [...new Set(extractedDates)];
                    
                    return uniqueDates.length > 0 ? uniqueDates.join(' | ') : data.title;
                  })()}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              {unopenedSectionsCount === 0 ? (
                <div className="text-center">
                  <div className="text-xs urbanist-medium" style={{ color: 'var(--berkeley-gold)' }}>
                    {animationData && triggerTopLevelAnimation ? (
                      <Lottie 
                        animationData={animationData}
                        loop={false}
                        autoplay={true}
                        className="w-4 h-4 mx-auto"
                      />
                    ) : (
                      <div className="w-4 h-4 mx-auto flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  {showCaughtUpText && (
                    <div className="text-xs urbanist-light whitespace-nowrap" style={{ color: 'white' }}>
                      All Caught Up!
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg p-0.5 shadow-sm bg-gradient-to-b from-gray-900/30 to-gray-900/10 text-center">
                  <div className="text-xs urbanist-medium whitespace-nowrap" style={{ color: 'var(--berkeley-gold)' }}>
                    {unopenedSectionsCount}/{data.sections.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Content Sections */}
      <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        {data.sections.map((sec, idx) => {
          const id = `compact-${idx}-${sec.sectionTitle}`;
          const isOpen = !!open[id];
          const sectionVisitedCount = createSubsections(sec.items).filter((_, subIdx) => {
            const subsectionKey = `${idx}-${subIdx}`;
            const itemId = `${id}-item-${subIdx}`;
            return itemVisited.has(subsectionKey) || itemOpen[itemId];
          }).length;
          const sectionTotalCount = createSubsections(sec.items).length;
          
          return (
            <div key={id} className={`border-b border-slate-200 dark:border-slate-700 ${idx === data.sections.length - 1 ? 'border-b-0' : ''}`}>
              <button
                onClick={() => {
                  const newOpen: Record<string, boolean> = {};
                  if (!isOpen) {
                    newOpen[id] = true;
                  }
                  setOpen(newOpen);
                  setItemOpen({});
                }}
                className="w-full text-left px-2 py-1 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-amber-50 dark:from-slate-800 dark:to-slate-700 transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2">
                  {allItemsInSectionVisited(idx) ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--berkeley-gold)' }}></div>
                  )}
                  <h3 className="text-xs urbanist-medium text-slate-900 dark:text-white">
                    {sec.sectionTitle}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {sectionVisitedCount === sectionTotalCount ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-xs">{sectionTotalCount - sectionVisitedCount}</span>
                  )}
                </div>
              </button>
              
              <div className={`expandable ${isOpen ? 'expanded' : 'collapsed'}`}>
                <div className="expandable-content">
                  <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="px-3 py-2 space-y-2">
                      {createSubsections(sec.items).map((subsection, j) => {
                        const itemKey = `${idx}-${j}`;
                        const itemId = `${id}-item-${j}`;
                        const isItemVisited = itemVisited.has(itemKey);
                        const isItemOpen = !!itemOpen[itemId];
                        
                        return (
                          <div key={itemId} className="relative">
                            <div className="ml-o border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700/30">
                              <button
                                onClick={() => {
                                  const newItemOpen: Record<string, boolean> = {};
                                  if (!isItemOpen) {
                                    newItemOpen[itemId] = true;
                                    if (!isItemVisited) {
                                      setItemVisited(new Set([...itemVisited, itemKey]));
                                    }
                                  }
                                  setItemOpen(newItemOpen);
                                }}
                                className="w-full text-left px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-600/30 transition-all duration-200 flex items-center justify-between group"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="flex-shrink-0">
                                    {isItemVisited || isItemOpen ? (
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--berkeley-gold)' }}></div>
                                    )}
                                  </div>
                                  <h4 className="text-xs urbanist-regular text-slate-800 dark:text-slate-200 break-words">
                                    {subsection.title}
                                  </h4>
                                </div>
                              </button>
                              
                              <div className={`expandable ${isItemOpen ? 'expanded' : 'collapsed'}`}>
                                <div className="expandable-content">
                                  <div className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                                    <div className="px-2 py-1"
                                      onClick={() => {
                                        if (!isItemVisited) {
                                          setItemVisited(new Set([...itemVisited, itemKey]));
                                        }
                                      }}
                                    >
                                      <div
                                        className="prose prose-slate dark:prose-invert prose-xs max-w-none urbanist-regular"
                                        dangerouslySetInnerHTML={{ __html: addSmartBullets(subsection.content) }}
                                      />
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
          <div className="p-4 text-center">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-sm">📭</span>
            </div>
            <h3 className="text-sm urbanist-medium text-slate-900 dark:text-white mb-1">No sections found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs urbanist-regular">
              The newsletter content could not be parsed.
            </p>
          </div>
        )}
        
        {/* Compact Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 py-1 px-2 rounded-b-2xl" style={{ background: "linear-gradient(to right, #001f47, var(--berkeley-blue))" }}>
          <div className="relative z-10 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 urbanist-regular select-none">
              Bear Necessities | Compact View
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

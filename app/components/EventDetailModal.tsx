'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/lib/icsUtils';

type Props = {
  event: CalendarEvent | null;
  originalEvent?: CalendarEvent | null; // Rich content from original calendar.ics when matched
  onClose: () => void;
  onNext?: () => void; // Navigate to next event
  onPrevious?: () => void; // Navigate to previous event
  hasNext?: boolean; // Whether there's a next event
  hasPrevious?: boolean; // Whether there's a previous event
};

export default function EventDetailModal({ event, originalEvent, onClose, onNext, onPrevious, hasNext, hasPrevious }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key, navigate with arrow keys
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      }
    };

    if (event) {
      document.addEventListener('keydown', handleKeyboard);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.body.style.overflow = 'unset';
    };
  }, [event, onClose, hasNext, hasPrevious, onNext, onPrevious]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (event) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [event, onClose]);

  if (!event) return null;

  // Prioritize showing the actual event data from ICS files
  // Only use originalEvent if it has more content than the base event
  // BUT always preserve the URL from BOTH sources - prefer event.url (generated) over originalEvent.url
  let displayEvent: CalendarEvent;
  
  if (originalEvent && originalEvent.description && originalEvent.description.length > (event.description?.length || 0)) {
    // Use rich ICS content but ALWAYS use the event.url (generated course link) if available
    displayEvent = {
      ...originalEvent,
      url: event.url || originalEvent.url, // Prefer generated course URL from event
    };
  } else {
    displayEvent = event;
  }
  
  const start = new Date(displayEvent.start);
  const end = displayEvent.end ? new Date(displayEvent.end) : undefined;

  const formatDateTime = () => {
    if (displayEvent.allDay) {
      return format(start, 'EEEE, MMMM d, yyyy');
    } else {
      return end
        ? `${format(start, 'EEEE, MMMM d, yyyy · h:mma')} – ${format(end, 'h:mma')}`
        : format(start, 'EEEE, MMMM d, yyyy · h:mma');
    }
  };

  // Function to safely convert any value to string for rendering
  const safeStringify = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      // For objects, try to extract meaningful text or stringify
      if (value && typeof value === 'object' && 'val' in value && typeof value.val === 'string') return value.val;
      if (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
        const str = value.toString();
        if (str !== '[object Object]') return str;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Function to parse URLs from text and make them clickable
  const renderTextWithLinks = (text: unknown) => {
    const safeText = safeStringify(text);
    if (!safeText) return null;
    
    // Regular expression to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = safeText.split(urlRegex);
    
    return (
      <div className="space-y-3">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FDB515] dark:text-[#FDB515] hover:text-[#CC9500] dark:hover:text-[#FFD700] break-all inline-block"
              >
                {part}
              </a>
            );
          }
          
          // Format structured content with better styling
          const formattedPart = part.split('\n').map((line, lineIndex) => {
            // Check if line is a section header (READING:, QUIZ:, etc.)
            if (/^(READING|QUIZ|IN-CLASS EXERCISE|PREPARATION|Topic \d+):/i.test(line)) {
              // Special handling for QUIZ lines
              if (line.startsWith('QUIZ:')) {
                // Check if it's an actual quiz (not "No quiz")
                const hasActualQuiz = /QUIZ:\s*Quiz\s+\d+/i.test(line);
                if (hasActualQuiz) {
                  return (
                    <div key={`line-${index}-${lineIndex}`} className="font-bold text-red-600 dark:text-red-500 mt-3 first:mt-0">
                      {line}
                    </div>
                  );
                }
                // "No quiz" - use normal styling
                return (
                  <div key={`line-${index}-${lineIndex}`} className="font-semibold text-slate-900 dark:text-white mt-3 first:mt-0">
                    {line}
                  </div>
                );
              }
              // Other section headers (READING, PREPARATION, etc.)
              return (
                <div key={`line-${index}-${lineIndex}`} className="font-semibold text-slate-900 dark:text-white mt-3 first:mt-0">
                  {line}
                </div>
              );
            }
            // Check if line is a bullet point
            if (line.trim().startsWith('•')) {
              return (
                <div key={`line-${index}-${lineIndex}`} className="ml-4 text-slate-600 dark:text-slate-300">
                  {line}
                </div>
              );
            }
            // Regular line
            return line.trim() ? (
              <div key={`line-${index}-${lineIndex}`} className="text-slate-600 dark:text-slate-300">
                {line}
              </div>
            ) : (
              <div key={`line-${index}-${lineIndex}`} className="h-2" />
            );
          });
          
          return <div key={index}>{formattedPart}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-black/50 [&>div]:relative [&>div]:shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_18px_4px_rgba(139,92,246,0.25)] [&>div]:transition-shadow">
      <div
        ref={modalRef}
        className="bg-slate-900/60 backdrop-blur-3xl rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
              {safeStringify(displayEvent.title)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-200 mt-1">
              {formatDateTime()}
            </p>
            {/* Show indicator when displaying rich content from original calendar */}
           
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`p-2 rounded-lg transition-colors ${
                hasPrevious 
                  ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' 
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
              aria-label="Previous event"
              title="Previous event (←)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Next Button */}
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-lg transition-colors ${
                hasNext 
                  ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' 
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
              aria-label="Next event"
              title="Next event (→)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-2"
              aria-label="Close"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-500 dark:hover:scrollbar-thumb-slate-500"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(148 163 184) transparent'
          }}
        >
          
       

          {/* Event URL - Secondary Display */}
          

          {/* Description */}
          {displayEvent.description && (
            <div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2"></h3>
              <div className="text-md text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {renderTextWithLinks(displayEvent.description)}
              </div>
            </div>
          )}

          {/* Event UID for debugging if needed */}
          {displayEvent.uid && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Event ID: {displayEvent.uid}
              </p>
            </div>
          )}
          {/* Location */}
          {displayEvent.location && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">📍 Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{safeStringify(displayEvent.location)}</p>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="flex gap-2 p-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          {displayEvent.url && (
            <a
              href={displayEvent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#003262]/10 backdrop-blur-xl hover:bg-[#CC9500]/60 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_18px_4px_rgba(255,255,255,0.25)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_0_25px_8px_rgba(255,255,255,0.4)] hover:scale-[1.02]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Class Page
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

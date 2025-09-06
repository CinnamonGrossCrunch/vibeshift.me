'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/lib/icsUtils';

type Props = {
  event: CalendarEvent | null;
  originalEvent?: CalendarEvent | null; // Rich content from original calendar.ics when matched
  onClose: () => void;
};

export default function EventDetailModal({ event, originalEvent, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (event) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [event, onClose]);

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

  // Use original event content if available, otherwise use cohort event
  const displayEvent = originalEvent || event;
  
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
      <>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FDB515] dark:text-[#FDB515] hover:text-[#CC9500] dark:hover:text-[#FFD700] break-all"
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm [&>div]:relative [&>div]:border-blue-500/30 [&>div]:shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_0_18px_4px_rgba(59,130,246,0.25)] [&>div]:transition-shadow">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[60vh] overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
              {safeStringify(displayEvent.title)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-200 mt-1">
              {formatDateTime()}
            </p>
            {/* Show indicator when displaying rich content from original calendar */}
           
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Location */}
          {displayEvent.location && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-1">
                <span className="text-base">📍</span>
                {safeStringify(displayEvent.location)}
              </p>
            </div>
          )}

          {/* Event URL */}
          {displayEvent.url && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Event Link</h3>
              <a
                href={safeStringify(displayEvent.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#FDB515] dark:text-[#FDB515] hover:text-[#CC9500] dark:hover:text-[#FFD700] break-all"
              >
                {safeStringify(displayEvent.url)}
              </a>
            </div>
          )}

          {/* Description */}
          {displayEvent.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Description</h3>
              <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
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
        </div>

        {/* Footer with action buttons */}
        <div className="flex gap-2 p-6 border-t border-slate-200 dark:border-slate-700">
          {displayEvent.url && (
            <a
              href={displayEvent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#003262] hover:bg-[#CC9500] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
            >
              Open Event Link
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

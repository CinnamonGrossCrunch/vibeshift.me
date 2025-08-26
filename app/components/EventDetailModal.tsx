'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/lib/calendar';

type Props = {
  event: CalendarEvent | null;
  onClose: () => void;
};

export default function EventDetailModal({ event, onClose }: Props) {
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

  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : undefined;

  const formatDateTime = () => {
    if (event.allDay) {
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
                className="text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold underline break-all"
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
              {safeStringify(event.title)}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {formatDateTime()}
            </p>
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
          {event.location && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-1">
                <span className="text-base">📍</span>
                {safeStringify(event.location)}
              </p>
            </div>
          )}

          {/* Event URL */}
          {event.url && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Event Link</h3>
              <a
                href={safeStringify(event.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-berkeley-blue dark:text-berkeley-blue-light hover:text-berkeley-blue-dark dark:hover:text-berkeley-gold underline break-all"
              >
                {safeStringify(event.url)}
              </a>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Description</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                {renderTextWithLinks(event.description)}
              </div>
            </div>
          )}

          {/* Event UID for debugging if needed */}
          {event.uid && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Event ID: {event.uid}
              </p>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="flex gap-2 p-6 border-t border-slate-200 dark:border-slate-700">
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-berkeley-blue hover:bg-berkeley-blue-dark text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
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

'use client';

import React, { useState } from 'react';
import CompactNewsletterWidget from './CompactNewsletterWidget';
import NewsletterWidget from './NewsletterWidget';

type Item = { title: string; html: string };
type Section = { sectionTitle: string; items: Item[] };
type Payload = { sourceUrl: string; title?: string; sections: Section[] };

interface NewsletterModalWrapperProps {
  data: Payload;
}

export default function NewsletterModalWrapper({ data }: NewsletterModalWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCompactClick = () => {
    // Auto-open disabled for now but keeping for future use
    // setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Compact Newsletter Widget */}
      <div onClick={handleCompactClick}>
        <CompactNewsletterWidget data={data} />
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Close Button - Outside modal window but still visible */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-lg border-2 border-slate-200 dark:border-slate-600"
              title="Close newsletter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Full Newsletter Widget with Custom Scrollbar */}
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
              <NewsletterWidget data={data} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

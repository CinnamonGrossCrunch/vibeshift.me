'use client';

import { useState, useEffect } from 'react';

export default function CurrentTimeDisplay() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="urbanist-semibold text-amber-800 dark:text-amber-200 mb-2">⏱️ Time Debug (Server-Side)</h3>
        <p className="urbanist-regular text-amber-700 dark:text-amber-300 text-sm">Hydrating client-side...</p>
      </div>
    );
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language;

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h3 className="urbanist-semibold text-blue-800 dark:text-blue-200 mb-3">⏱️ Current Time & Date Debug</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="urbanist-medium text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Current Time:</span>
            <br />
            <span className="urbanist-regular font-mono text-lg">{currentTime.toLocaleString()}</span>
          </div>
          
          <div className="urbanist-medium text-blue-700 dark:text-blue-300">
            <span className="font-semibold">ISO String:</span>
            <br />
            <span className="urbanist-regular font-mono">{currentTime.toISOString()}</span>
          </div>
          
          <div className="urbanist-medium text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Raw Date Object:</span>
            <br />
            <span className="urbanist-regular font-mono text-xs">{currentTime.toString()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="urbanist-medium text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Detected Timezone:</span>
            <br />
            <span className="urbanist-regular font-mono">{timeZone}</span>
          </div>
          
          <div className="urbanist-medium text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Browser Locale:</span>
            <br />
            <span className="urbanist-regular font-mono">{locale}</span>
          </div>
          
          <div className="urbanist-medium text-blue-700 dark:text-blue-300">
            <span className="font-semibold">UTC Offset:</span>
            <br />
            <span className="urbanist-regular font-mono">{currentTime.getTimezoneOffset()} minutes</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <div className="urbanist-medium text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Unix Timestamp:</span>
          <span className="urbanist-regular font-mono ml-2">{currentTime.getTime()}</span>
          <span className="ml-4 font-semibold">Updates:</span>
          <span className="urbanist-regular ml-1">Every second</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function CurrentTimeWidget() {
  const [time, setTime] = useState<{ hours: string; minutes: string; period: string } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      setTime({
        hours: hours.toString(),
        minutes: minutes.toString().padStart(2, '0'),
        
        period
      });
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return null;
  }

  return (
    <div className=" flex items-center justify-start backdrop-blur-sm ml-3 -mb-2">
      <div className="flex items-baseline gap-0.5">
        <span className="text-md font-md text-gray-200">{time.hours}</span>
        <span className="text-md font-md text-gray-400">:</span>
        <span className="text-md font-md text-gray-200">{time.minutes}</span>
        <span className="text-xs font-extralight text-gray-400 ml-0">{time.period}</span>
      </div>
    </div>
  );
}

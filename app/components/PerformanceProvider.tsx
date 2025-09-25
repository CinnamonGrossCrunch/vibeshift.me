'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DeviceCapabilities, detectDeviceCapabilities, trackPerformanceMetrics, getOptimalGlassEffects } from '../../lib/performance-detector';

interface PerformanceContextType {
  capabilities: DeviceCapabilities | null;
  isLoading: boolean;
  glassEffectClass: string;
  shouldUseReducedMotion: boolean;
  shouldUseOptimizedRendering: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializePerformanceDetection = async () => {
      try {
        const caps = await detectDeviceCapabilities();
        
        if (isMounted) {
          setCapabilities(caps);
          setIsLoading(false);
          
          // Track performance metrics
          trackPerformanceMetrics(caps);
        }
      } catch (error) {
        console.warn('Performance detection failed:', error);
        
        if (isMounted) {
          // Fallback to medium performance
          const fallbackCaps: DeviceCapabilities = {
            gpu: 'medium',
            memory: 8,
            cores: 4,
            performanceLevel: 'medium',
            mobile: false,
            safari: false,
            isMac: false,
            userAgent: navigator.userAgent || ''
          };
          
          setCapabilities(fallbackCaps);
          setIsLoading(false);
        }
      }
    };

    initializePerformanceDetection();

    return () => {
      isMounted = false;
    };
  }, []);

  // Derived values based on capabilities
  const glassEffectClass = capabilities ? getOptimalGlassEffects(capabilities).className : 'bg-glass-medium';
  const shouldUseReducedMotion = capabilities?.performanceLevel === 'low' || capabilities?.mobile || false;
  const shouldUseOptimizedRendering = capabilities?.performanceLevel !== 'high' || false;

  const contextValue: PerformanceContextType = {
    capabilities,
    isLoading,
    glassEffectClass,
    shouldUseReducedMotion,
    shouldUseOptimizedRendering
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance(): PerformanceContextType {
  const context = useContext(PerformanceContext);
  
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
}

// Higher-order component for performance-aware components
interface WithPerformanceProps {
  performance: PerformanceContextType;
}

export function withPerformance<P extends object>(
  Component: React.ComponentType<P & WithPerformanceProps>
) {
  return function PerformanceEnhancedComponent(props: P) {
    const performance = usePerformance();
    
    return <Component {...props} performance={performance} />;
  };
}

// Performance-aware CSS class helper
export function getPerformanceClasses(
  baseClasses: string,
  capabilities: DeviceCapabilities | null
): string {
  if (!capabilities) return baseClasses;
  
  const performanceClasses = [];
  
  // Add performance-level specific classes
  performanceClasses.push(`perf-${capabilities.performanceLevel}`);
  
  // Add device-specific classes
  if (capabilities.isMac) performanceClasses.push('device-mac');
  if (capabilities.safari) performanceClasses.push('browser-safari');
  if (capabilities.mobile) performanceClasses.push('device-mobile');
  
  // Add GPU-specific classes
  performanceClasses.push(`gpu-${capabilities.gpu}`);
  
  return `${baseClasses} ${performanceClasses.join(' ')}`;
}

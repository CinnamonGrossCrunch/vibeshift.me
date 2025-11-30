'use client';

export interface DeviceCapabilities {
  gpu: 'high' | 'medium' | 'low';
  memory: number;
  cores: number;
  safari: boolean;
  mobile: boolean;
  performanceLevel: 'high' | 'medium' | 'low';
  userAgent: string;
  isMac: boolean;
}

export interface GlassEffectSettings {
  blur: string;
  saturate: string;
  brightness: string;
  useBackdrop: boolean;
  className: string;
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  // Server-side fallback values
  if (typeof window === 'undefined') {
    return {
      gpu: 'medium',
      memory: 8,
      cores: 4,
      safari: false,
      mobile: false,
      performanceLevel: 'medium',
      userAgent: 'server',
      isMac: false
    };
  }

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
             canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  
  // Detect GPU capabilities
  let gpu: 'high' | 'medium' | 'low' = 'medium';
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
      
      // Mac-specific GPU detection
      if (renderer.includes('Apple M1') || renderer.includes('Apple M2') || 
          renderer.includes('Apple M3') || renderer.includes('Apple M4')) {
        gpu = 'high';
      } else if (renderer.includes('Intel') && renderer.includes('Iris')) {
        gpu = 'medium';
      } else if (renderer.includes('Intel HD') || renderer.includes('Intel UHD')) {
        gpu = 'low';
      } else if (renderer.includes('AMD') || renderer.includes('NVIDIA')) {
        // Assume discrete graphics are high performance
        gpu = 'high';
      }
    }
  }

  // Detect Safari and Mac-specific issues
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform) || 
                /Mac|iPad|iPhone/.test(userAgent);
  const isMobile = /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Memory estimation (Mac-specific heuristics)
  interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
  }
  
  const navigatorWithMemory = navigator as NavigatorWithMemory;
  const memory = navigatorWithMemory.deviceMemory || 
    (cores >= 10 ? 16 : cores >= 8 ? 16 : cores >= 6 ? 12 : cores >= 4 ? 8 : 4);

  // Overall performance level calculation
  let performanceLevel: 'high' | 'medium' | 'low' = 'medium';
  
  if (gpu === 'high' && cores >= 8 && memory >= 12 && !isMobile) {
    performanceLevel = 'high';
  } else if (gpu === 'low' || cores < 4 || memory < 6 || 
             (isSafari && isMac) || isMobile) {
    performanceLevel = 'low';
  }

  // Safari on Mac often has performance issues with complex backdrop-filters
  if (isSafari && isMac) {
    performanceLevel = performanceLevel === 'high' ? 'medium' : 'low';
  }

  return {
    gpu,
    memory,
    cores,
    safari: isSafari && isMac,
    mobile: isMobile,
    performanceLevel,
    userAgent,
    isMac
  };
}

export function getOptimalGlassEffects(capabilities: DeviceCapabilities): GlassEffectSettings {
  if (capabilities.performanceLevel === 'low' || capabilities.mobile) {
    return {
      blur: '6px',
      saturate: '100%',
      brightness: '100%',
      useBackdrop: false, // Fallback to solid backgrounds
      className: 'bg-glass-low'
    };
  } else if (capabilities.performanceLevel === 'medium' || capabilities.safari) {
    return {
      blur: '10px', 
      saturate: '110%',
      brightness: '105%',
      useBackdrop: true,
      className: 'bg-glass-medium'
    };
  } else {
    return {
      blur: '20px',
      saturate: '180%', 
      brightness: '120%',
      useBackdrop: true,
      className: 'bg-glass-high'
    };
  }
}

export function trackPerformanceMetrics(capabilities: DeviceCapabilities): void {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return;
  }

  // Track performance issues
  try {
    // Measure paint times
    performance.mark('glass-effects-start');
    
    requestAnimationFrame(() => {
      performance.mark('glass-effects-end');
      performance.measure('glass-effects', 'glass-effects-start', 'glass-effects-end');
      
      const measures = performance.getEntriesByName('glass-effects');
      if (measures.length > 0) {
        const duration = measures[0].duration;
        
        console.log('🎨 Glass Effects Performance:', {
          duration: Math.round(duration * 100) / 100 + 'ms',
          device: capabilities.performanceLevel,
          safari: capabilities.safari,
          gpu: capabilities.gpu,
          cores: capabilities.cores,
          memory: capabilities.memory + 'GB'
        });
        
        // Warn about performance issues
        if (duration > 100) {
          console.warn('⚠️ Slow glass effects detected:', Math.round(duration) + 'ms');
        } else if (duration > 50) {
          console.log('🟡 Moderate glass effects performance:', Math.round(duration) + 'ms');
        } else {
          console.log('✅ Good glass effects performance:', Math.round(duration) + 'ms');
        }
      }
    });
  } catch (error) {
    console.log('Performance tracking failed:', error);
  }
}

// Performance-aware cache key for your AI analyzer
export function getPerformanceAwareCacheKey(cohort: string, baseDate: string): string {
  const baseKey = `ai-summary-${cohort}-${baseDate}`;
  
  // Add performance suffix for different cache buckets on client-side
  if (typeof window !== 'undefined') {
    const capabilities = detectDeviceCapabilities();
    
    if (capabilities.safari && capabilities.isMac) {
      return `${baseKey}-safari-mac`;
    } else if (capabilities.performanceLevel === 'low') {
      return `${baseKey}-low-perf`;
    } else if (capabilities.mobile) {
      return `${baseKey}-mobile`;
    }
  }
  
  return baseKey;
}

'use client';

/**
 * Performance Monitor Component
 *
 * This component provides comprehensive performance monitoring for the CA Lobby application,
 * including real-time metrics, error tracking, and user experience monitoring.
 */

import { useEffect, useState } from 'react';
import { getFeatureFlag } from '../lib/feature-flags';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: number;
  connectionType?: string;
}

interface ErrorInfo {
  message: string;
  filename: string;
  lineno: number;
  colno: number;
  error: Error;
  timestamp: Date;
}

export function PerformanceMonitor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    async function checkFeatureFlag() {
      try {
        const enabled = await getFeatureFlag('enablePerformanceMonitoring', undefined, true);
        setIsEnabled(enabled);

        if (enabled) {
          console.log('📊 Performance monitoring enabled');
        }
      } catch (error) {
        console.error('❌ Error checking performance monitoring feature flag:', error);
        // Default to enabled if feature flag check fails
        setIsEnabled(true);
      }
    }

    checkFeatureFlag();
  }, []);

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    const performanceObservers: PerformanceObserver[] = [];

    // Initialize performance monitoring
    const initPerformanceMonitoring = () => {
      const currentMetrics: Partial<PerformanceMetrics> = {};

      // Navigation timing
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        currentMetrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        currentMetrics.domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
      }

      // Paint timing
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        currentMetrics.firstContentfulPaint = fcpEntry.startTime;
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        currentMetrics.memoryUsage = memInfo.usedJSHeapSize;
      }

      // Connection information
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        currentMetrics.connectionType = connection.effectiveType;
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const lcpEntries = list.getEntries();
            const lastEntry = lcpEntries[lcpEntries.length - 1];
            if (lastEntry) {
              currentMetrics.largestContentfulPaint = lastEntry.startTime;
              setMetrics(prev => ({ ...prev, largestContentfulPaint: lastEntry.startTime } as PerformanceMetrics));
            }
          });

          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          performanceObservers.push(lcpObserver);
        } catch (e) {
          console.warn('LCP observer not supported');
        }

        // Cumulative Layout Shift
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            currentMetrics.cumulativeLayoutShift = clsValue;
            setMetrics(prev => ({ ...prev, cumulativeLayoutShift: clsValue } as PerformanceMetrics));
          });

          clsObserver.observe({ entryTypes: ['layout-shift'] });
          performanceObservers.push(clsObserver);
        } catch (e) {
          console.warn('CLS observer not supported');
        }

        // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const fid = (entry as any).processingStart - entry.startTime;
              currentMetrics.firstInputDelay = fid;
              setMetrics(prev => ({ ...prev, firstInputDelay: fid } as PerformanceMetrics));
            }
          });

          fidObserver.observe({ entryTypes: ['first-input'] });
          performanceObservers.push(fidObserver);
        } catch (e) {
          console.warn('FID observer not supported');
        }
      }

      setMetrics(currentMetrics as PerformanceMetrics);
    };

    // Error tracking
    const errorHandler = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date(),
      };

      setErrors(prev => [...prev.slice(-9), errorInfo]); // Keep last 10 errors

      console.error('🚨 JavaScript Error:', errorInfo);

      // Report to analytics if enabled
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'JavaScript Error', {
          message: errorInfo.message,
          filename: errorInfo.filename,
          lineno: errorInfo.lineno,
        });
      }
    };

    // Unhandled promise rejection tracking
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        filename: 'unknown',
        lineno: 0,
        colno: 0,
        error: new Error(event.reason),
        timestamp: new Date(),
      };

      setErrors(prev => [...prev.slice(-9), errorInfo]);

      console.error('🚨 Unhandled Promise Rejection:', errorInfo);

      // Report to analytics if enabled
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Promise Rejection', {
          reason: String(event.reason),
        });
      }
    };

    // Resource loading performance
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;

        // Track slow resources (>1s)
        if (resource.duration > 1000) {
          console.warn(`🐌 Slow resource: ${resource.name} (${Math.round(resource.duration)}ms)`);

          // Report to analytics
          if (typeof window !== 'undefined' && (window as any).va) {
            (window as any).va('track', 'Slow Resource', {
              name: resource.name,
              duration: Math.round(resource.duration),
              type: resource.initiatorType,
            });
          }
        }
      }
    });

    // Initialize monitoring
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    if ('PerformanceObserver' in window) {
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        performanceObservers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }

    // Initialize performance metrics
    if (document.readyState === 'complete') {
      initPerformanceMonitoring();
    } else {
      window.addEventListener('load', initPerformanceMonitoring);
    }

    // Memory monitoring (if available)
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryUsage = memInfo.usedJSHeapSize;

        // Alert if memory usage is high (>100MB)
        if (memoryUsage > 100 * 1024 * 1024) {
          console.warn(`🧠 High memory usage: ${Math.round(memoryUsage / 1024 / 1024)}MB`);
        }

        setMetrics(prev => prev ? { ...prev, memoryUsage } : null);
      }
    }, 30000); // Check every 30 seconds

    // Cleanup function
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('load', initPerformanceMonitoring);

      performanceObservers.forEach(observer => {
        try {
          observer.disconnect();
        } catch (e) {
          // Observer might already be disconnected
        }
      });

      clearInterval(memoryInterval);
    };
  }, [isEnabled]);

  // Log performance metrics periodically
  useEffect(() => {
    if (!isEnabled || !metrics) return;

    const logInterval = setInterval(() => {
      console.log('📊 Performance Metrics:', {
        pageLoadTime: Math.round(metrics.pageLoadTime || 0),
        domContentLoaded: Math.round(metrics.domContentLoaded || 0),
        firstContentfulPaint: Math.round(metrics.firstContentfulPaint || 0),
        largestContentfulPaint: Math.round(metrics.largestContentfulPaint || 0),
        cumulativeLayoutShift: Number((metrics.cumulativeLayoutShift || 0).toFixed(4)),
        firstInputDelay: Math.round(metrics.firstInputDelay || 0),
        memoryUsage: metrics.memoryUsage ? `${Math.round(metrics.memoryUsage / 1024 / 1024)}MB` : 'N/A',
        connectionType: metrics.connectionType || 'unknown',
        errorCount: errors.length,
      });

      // Report to analytics every 5 minutes
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Performance Report', {
          pageLoadTime: Math.round(metrics.pageLoadTime || 0),
          lcp: Math.round(metrics.largestContentfulPaint || 0),
          cls: Number((metrics.cumulativeLayoutShift || 0).toFixed(4)),
          fid: Math.round(metrics.firstInputDelay || 0),
          errorCount: errors.length,
        });
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(logInterval);
  }, [isEnabled, metrics, errors]);

  // Show performance warnings in development
  useEffect(() => {
    if (!isEnabled || !metrics || process.env.NODE_ENV !== 'development') return;

    const warnings = [];

    if (metrics.pageLoadTime > 3000) {
      warnings.push(`Slow page load: ${Math.round(metrics.pageLoadTime)}ms`);
    }

    if (metrics.largestContentfulPaint > 2500) {
      warnings.push(`Poor LCP: ${Math.round(metrics.largestContentfulPaint)}ms`);
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      warnings.push(`High CLS: ${metrics.cumulativeLayoutShift.toFixed(4)}`);
    }

    if (metrics.firstInputDelay > 100) {
      warnings.push(`High FID: ${Math.round(metrics.firstInputDelay)}ms`);
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Performance Issues Detected:', warnings);
    }
  }, [isEnabled, metrics]);

  // This component doesn't render any UI
  return null;
}
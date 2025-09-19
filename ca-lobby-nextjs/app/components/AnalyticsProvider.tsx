'use client';

/**
 * Analytics Provider with Feature Flag Integration
 *
 * This component provides Vercel Analytics and Speed Insights with feature flag control,
 * ensuring analytics are only loaded when enabled and providing performance monitoring.
 */

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getFeatureFlag } from '../lib/feature-flags';

interface AnalyticsConfig {
  enableAnalytics: boolean;
  enableSpeedInsights: boolean;
  enablePerformanceMonitoring: boolean;
}

export function AnalyticsProvider() {
  const [config, setConfig] = useState<AnalyticsConfig>({
    enableAnalytics: false,
    enableSpeedInsights: false,
    enablePerformanceMonitoring: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadFeatureFlags() {
      try {
        // Get feature flags for analytics
        const [enableAnalytics, enableSpeedInsights, enablePerformanceMonitoring] = await Promise.all([
          getFeatureFlag('enableAnalytics', undefined, true), // Default to true for analytics
          getFeatureFlag('enableSpeedInsights', undefined, true), // Default to true for speed insights
          getFeatureFlag('enablePerformanceMonitoring', undefined, true), // Default to true for monitoring
        ]);

        setConfig({
          enableAnalytics,
          enableSpeedInsights,
          enablePerformanceMonitoring,
        });

        setIsLoaded(true);

        console.log('📊 Analytics configuration loaded:', {
          enableAnalytics,
          enableSpeedInsights,
          enablePerformanceMonitoring,
        });
      } catch (error) {
        console.error('❌ Error loading analytics feature flags:', error);

        // Fallback to enabled state if feature flags fail
        setConfig({
          enableAnalytics: true,
          enableSpeedInsights: true,
          enablePerformanceMonitoring: true,
        });

        setIsLoaded(true);
      }
    }

    loadFeatureFlags();
  }, []);

  useEffect(() => {
    if (isLoaded && config.enablePerformanceMonitoring) {
      // Track page load performance
      const trackPagePerformance = () => {
        if (typeof window !== 'undefined' && 'performance' in window) {
          const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

          if (navigationTiming) {
            const metrics = {
              pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
              domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart,
              firstContentfulPaint: 0,
              largestContentfulPaint: 0,
            };

            // Get paint timing metrics
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              metrics.firstContentfulPaint = fcpEntry.startTime;
            }

            // Track LCP
            if ('PerformanceObserver' in window) {
              const lcpObserver = new PerformanceObserver((list) => {
                const lcpEntries = list.getEntries();
                const lastEntry = lcpEntries[lcpEntries.length - 1];
                if (lastEntry) {
                  metrics.largestContentfulPaint = lastEntry.startTime;
                }
              });

              try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
              } catch (e) {
                // LCP not supported
              }
            }

            console.log('⏱️ Page performance metrics:', metrics);

            // Custom analytics event for performance monitoring
            if (config.enableAnalytics && typeof window !== 'undefined' && (window as any).va) {
              (window as any).va('track', 'Page Performance', {
                pageLoadTime: Math.round(metrics.pageLoadTime),
                domContentLoaded: Math.round(metrics.domContentLoaded),
                firstContentfulPaint: Math.round(metrics.firstContentfulPaint),
              });
            }
          }
        }
      };

      // Track performance after page load
      if (document.readyState === 'complete') {
        trackPagePerformance();
      } else {
        window.addEventListener('load', trackPagePerformance);
        return () => window.removeEventListener('load', trackPagePerformance);
      }
    }
  }, [isLoaded, config]);

  // Don't render anything until feature flags are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {config.enableAnalytics && (
        <Analytics
          beforeSend={(event) => {
            // Custom event filtering and enhancement
            if (event.name === 'pageview') {
              // Add custom properties to pageview events
              return {
                ...event,
                properties: {
                  ...event.properties,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                  screenSize: `${screen.width}x${screen.height}`,
                },
              };
            }
            return event;
          }}
        />
      )}

      {config.enableSpeedInsights && (
        <SpeedInsights
          beforeSend={(event) => {
            // Custom speed insights filtering
            console.log('🚀 Speed Insights event:', event);
            return event;
          }}
        />
      )}

      {/* Performance monitoring script */}
      {config.enablePerformanceMonitoring && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Core Web Vitals monitoring
              (function() {
                if ('PerformanceObserver' in window) {
                  // Cumulative Layout Shift
                  const clsObserver = new PerformanceObserver((list) => {
                    let cls = 0;
                    for (const entry of list.getEntries()) {
                      if (!entry.hadRecentInput) {
                        cls += entry.value;
                      }
                    }
                    if (cls > 0) {
                      console.log('📏 Cumulative Layout Shift:', cls);
                    }
                  });

                  // First Input Delay
                  const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      const fid = entry.processingStart - entry.startTime;
                      console.log('⚡ First Input Delay:', fid);
                    }
                  });

                  try {
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                    fidObserver.observe({ entryTypes: ['first-input'] });
                  } catch (e) {
                    // Performance observers not supported
                  }
                }
              })();
            `,
          }}
        />
      )}
    </>
  );
}
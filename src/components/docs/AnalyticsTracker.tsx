'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  projectSlug: string;
  path: string;
  version?: string;
}

export function AnalyticsTracker({ projectSlug, path, version }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Track page view on mount
    const trackView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectSlug,
            path,
            version,
          }),
        });
      } catch (error) {
        // Silently fail - analytics should not break the page
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackView();
  }, [projectSlug, path, version]);

  // This component doesn't render anything
  return null;
}

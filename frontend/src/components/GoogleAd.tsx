import { useEffect, useRef } from 'react';

// AdSense publisher ID from environment variable
// Set VITE_ADSENSE_CLIENT_ID in your .env file (e.g., VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456)
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Check if AdSense script is already loaded by querying the DOM.
 * This is more reliable than module-level state for HMR and SSR scenarios.
 */
function isAdsenseScriptLoaded(): boolean {
  return !!document.querySelector('script[src*="adsbygoogle"]');
}

/**
 * Dynamically loads the AdSense script with the correct client ID.
 * This is called once globally when the first ad component mounts.
 */
function loadAdsenseScript(): void {
  if (isAdsenseScriptLoaded() || !ADSENSE_CLIENT_ID) return;
  
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

export function GoogleAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {},
}: GoogleAdProps) {
  const isAdPushed = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Skip if no client ID configured
    if (!ADSENSE_CLIENT_ID) {
      if (import.meta.env.DEV) {
        console.warn('GoogleAd: VITE_ADSENSE_CLIENT_ID not configured');
      }
      return;
    }

    // Skip if using placeholder slot
    if (adSlot.includes('XXXXXXXXXX')) {
      if (import.meta.env.DEV) {
        console.warn('GoogleAd: Using placeholder ad slot. Replace with actual slot ID before production.');
      }
      return;
    }

    // Load the AdSense script if not already loaded
    loadAdsenseScript();

    // Only push the ad once per component instance.
    // We intentionally use an empty dependency array because:
    // 1. AdSense ads should only be initialized once when the component mounts
    // 2. Changing adSlot after mount would require a full remount anyway
    // 3. The adsbygoogle.push() call is not idempotent - calling it multiple times
    //    can cause duplicate ads or errors
    if (isAdPushed.current) return;

    try {
      if (isMounted) {
        // Initialize adsbygoogle array if it doesn't exist
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdPushed.current = true;
      }
    } catch (error) {
      console.error('Google AdSense error:', error);
    }

    // Cleanup function to handle unmount before initialization completes
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // See comment above for why this is intentionally empty

  // Don't render if client ID is not configured
  if (!ADSENSE_CLIENT_ID) {
    if (import.meta.env.DEV) {
      return (
        <div 
          className={`google-ad-placeholder bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center text-neutral-400 text-sm ${className}`} 
          style={{ minHeight: '90px', ...style }}
        >
          Set VITE_ADSENSE_CLIENT_ID to enable ads
        </div>
      );
    }
    return null;
  }

  // Don't render placeholder ads in production
  if (adSlot.includes('XXXXXXXXXX')) {
    if (import.meta.env.DEV) {
      return (
        <div 
          className={`google-ad-placeholder bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center text-neutral-400 text-sm ${className}`} 
          style={{ minHeight: '90px', ...style }}
        >
          Ad Placeholder - Configure slot ID
        </div>
      );
    }
    // In production, return null silently if slot IDs are not configured
    // (warning would log on every render)
    return null;
  }

  return (
    <div className={`google-ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Ad slot IDs - Replace these with your actual AdSense ad slot IDs
// You can find these in your AdSense dashboard under Ads > By ad unit
const AD_SLOTS = {
  BANNER: import.meta.env.VITE_ADSENSE_SLOT_BANNER || 'XXXXXXXXXX',
  SIDEBAR: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || 'XXXXXXXXXX',
  IN_FEED: import.meta.env.VITE_ADSENSE_SLOT_INFEED || 'XXXXXXXXXX',
};

// Preset ad components for common placements
// Heights are set to common AdSense ad unit sizes to minimize CLS

export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAd
      adSlot={AD_SLOTS.BANNER}
      adFormat="horizontal"
      // 90px is the standard leaderboard height
      className={`w-full min-h-[90px] ${className}`}
      style={{ minHeight: '90px' }}
    />
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAd
      adSlot={AD_SLOTS.SIDEBAR}
      adFormat="rectangle"
      // 250px matches the medium rectangle (300x250) ad unit
      className={`w-full min-h-[250px] ${className}`}
      style={{ minHeight: '250px' }}
    />
  );
}

export function InFeedAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAd
      adSlot={AD_SLOTS.IN_FEED}
      adFormat="auto"
      // In-feed ads vary in height, 100px is a reasonable minimum
      className={`w-full min-h-[100px] ${className}`}
      style={{ minHeight: '100px' }}
    />
  );
}

// Default export for backwards compatibility
export default GoogleAd;

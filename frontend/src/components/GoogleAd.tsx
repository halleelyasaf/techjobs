import { useEffect, useRef, useState } from 'react';

// AdSense publisher ID from environment variable
// Set VITE_ADSENSE_CLIENT_ID in your .env file (e.g., VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456)
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

// Check at module load time to avoid flash
const IS_ADSENSE_CONFIGURED = Boolean(ADSENSE_CLIENT_ID);

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

export function GoogleAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {},
}: GoogleAdProps) {
  const isAdPushed = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only push the ad once per component instance.
    // We intentionally use an empty dependency array because:
    // 1. AdSense ads should only be initialized once when the component mounts
    // 2. Changing adSlot after mount would require a full remount anyway
    // 3. The adsbygoogle.push() call is not idempotent - calling it multiple times
    //    can cause duplicate ads or errors
    if (isAdPushed.current) return;

    // Don't initialize if client ID is not configured
    if (!IS_ADSENSE_CONFIGURED) {
      if (import.meta.env.DEV) {
        console.warn('GoogleAd: VITE_ADSENSE_CLIENT_ID not configured');
      }
      setIsLoading(false);
      return;
    }

    // Warn in development if using placeholder slot
    if (import.meta.env.DEV && adSlot.includes('XXXXXXXXXX')) {
      console.warn('GoogleAd: Using placeholder ad slot. Replace with actual slot ID before production.');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize adsbygoogle array if it doesn't exist
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isAdPushed.current = true;
      // Ad loaded callback - AdSense doesn't provide a direct callback,
      // so we use a timeout as a reasonable approximation
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error('Google AdSense error:', error);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // See comment above for why this is intentionally empty

  // Don't render if client ID is not configured (checked at build time)
  if (!IS_ADSENSE_CONFIGURED) {
    // In dev mode, show a subtle placeholder instead of jarring red
    if (import.meta.env.DEV) {
      return (
        <div 
          className={`google-ad-placeholder bg-neutral-50 border border-dashed border-neutral-200 flex items-center justify-center text-neutral-400 text-sm ${className}`} 
          style={{ minHeight: '90px', ...style }}
        >
          <span className="opacity-60">💡 Set VITE_ADSENSE_CLIENT_ID to enable ads</span>
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
          <span className="opacity-60">📍 Ad Placeholder - Configure slot ID</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`google-ad-container relative ${className}`} style={style}>
      {/* Skeleton loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse rounded" />
      )}
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
      // 90px is the standard leaderboard height, but responsive ads may be taller
      // Using aspect-ratio as fallback for better CLS handling
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

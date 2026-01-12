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

export default function GoogleAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {},
}: GoogleAdProps) {
  const isAdPushed = useRef(false);

  useEffect(() => {
    // Only push the ad once
    if (isAdPushed.current) return;

    // Don't initialize if client ID is not configured
    if (!ADSENSE_CLIENT_ID) {
      if (import.meta.env.DEV) {
        console.warn('GoogleAd: VITE_ADSENSE_CLIENT_ID not configured');
      }
      return;
    }

    // Warn in development if using placeholder slot
    if (import.meta.env.DEV && adSlot.includes('XXXXXXXXXX')) {
      console.warn('GoogleAd: Using placeholder ad slot. Replace with actual slot ID before production.');
      return;
    }

    try {
      // Initialize adsbygoogle array if it doesn't exist
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isAdPushed.current = true;
    } catch (error) {
      console.error('Google AdSense error:', error);
    }
  }, [adSlot]);

  // Don't render if client ID is not configured
  if (!ADSENSE_CLIENT_ID) {
    if (import.meta.env.DEV) {
      return (
        <div className={`google-ad-placeholder bg-red-50 border-2 border-dashed border-red-300 flex items-center justify-center text-red-500 ${className}`} style={{ minHeight: '90px', ...style }}>
          AdSense not configured - Set VITE_ADSENSE_CLIENT_ID
        </div>
      );
    }
    return null;
  }

  // Don't render placeholder ads in production
  if (adSlot.includes('XXXXXXXXXX')) {
    if (import.meta.env.DEV) {
      return (
        <div className={`google-ad-placeholder bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 ${className}`} style={{ minHeight: '90px', ...style }}>
          Ad Placeholder - Configure ad slot
        </div>
      );
    }
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
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAd
      adSlot={AD_SLOTS.BANNER}
      adFormat="horizontal"
      className={`w-full min-h-[90px] ${className}`}
    />
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAd
      adSlot={AD_SLOTS.SIDEBAR}
      adFormat="rectangle"
      className={`w-full min-h-[250px] ${className}`}
    />
  );
}

export function InFeedAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAd
      adSlot={AD_SLOTS.IN_FEED}
      adFormat="auto"
      className={`w-full ${className}`}
    />
  );
}

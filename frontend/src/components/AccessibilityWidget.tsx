import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Accessibility, X, ZoomIn, ZoomOut, Contrast, MousePointer2, Minus, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  highlightLinks: false,
  bigCursor: false,
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Highlight links
    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }
    
    // Big cursor
    if (settings.bigCursor) {
      root.classList.add('big-cursor');
    } else {
      root.classList.remove('big-cursor');
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 10, 150)
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 10, 80)
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleHighlightLinks = () => {
    setSettings(prev => ({ ...prev, highlightLinks: !prev.highlightLinks }));
  };

  const toggleBigCursor = () => {
    setSettings(prev => ({ ...prev, bigCursor: !prev.bigCursor }));
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-[100] w-14 h-14 rounded-full bg-iris-600 hover:bg-iris-700 text-white shadow-lg"
        aria-label={isOpen ? 'סגור תפריט נגישות' : 'פתח תפריט נגישות'}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility className="w-6 h-6" aria-hidden="true" />
      </Button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[99] md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              id="accessibility-panel"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 left-4 z-[100] w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-warm-200"
              role="dialog"
              aria-modal="true"
              aria-label="הגדרות נגישות"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-warm-200">
                <div className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-iris-600" aria-hidden="true" />
                  <h2 className="font-semibold text-warm-900">הגדרות נגישות</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="סגור תפריט נגישות"
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Options */}
              <div className="p-4 space-y-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-warm-700">גודל טקסט ({settings.fontSize}%)</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decreaseFontSize}
                      disabled={settings.fontSize <= 80}
                      aria-label="הקטן גודל טקסט"
                      className="flex-1"
                    >
                      <ZoomOut className="w-4 h-4 mr-1" aria-hidden="true" />
                      הקטן
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={increaseFontSize}
                      disabled={settings.fontSize >= 150}
                      aria-label="הגדל גודל טקסט"
                      className="flex-1"
                    >
                      <ZoomIn className="w-4 h-4 mr-1" aria-hidden="true" />
                      הגדל
                    </Button>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-2">
                  <Button
                    variant={settings.highContrast ? "default" : "outline"}
                    size="sm"
                    onClick={toggleHighContrast}
                    className="w-full justify-start gap-2"
                    aria-pressed={settings.highContrast}
                  >
                    <Contrast className="w-4 h-4" aria-hidden="true" />
                    ניגודיות גבוהה
                  </Button>

                  <Button
                    variant={settings.highlightLinks ? "default" : "outline"}
                    size="sm"
                    onClick={toggleHighlightLinks}
                    className="w-full justify-start gap-2"
                    aria-pressed={settings.highlightLinks}
                  >
                    <Link2 className="w-4 h-4" aria-hidden="true" />
                    הדגש קישורים
                  </Button>

                  <Button
                    variant={settings.bigCursor ? "default" : "outline"}
                    size="sm"
                    onClick={toggleBigCursor}
                    className="w-full justify-start gap-2"
                    aria-pressed={settings.bigCursor}
                  >
                    <MousePointer2 className="w-4 h-4" aria-hidden="true" />
                    סמן גדול
                  </Button>
                </div>

                {/* Reset */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSettings}
                  className="w-full text-warm-500 hover:text-warm-700"
                  aria-label="אפס את כל הגדרות הנגישות"
                >
                  <Minus className="w-4 h-4 mr-1" aria-hidden="true" />
                  אפס הגדרות
                </Button>

                {/* Link to full accessibility statement */}
                <div className="pt-2 border-t border-warm-200">
                  <Link
                    to={createPageUrl("AccessibilityStatement")}
                    className="text-sm text-iris-600 hover:text-iris-700 underline flex items-center gap-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <Accessibility className="w-3 h-3" aria-hidden="true" />
                    להצהרת נגישות מלאה
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

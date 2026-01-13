import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Accessibility, Phone, Mail, MessageCircle } from "lucide-react";

export default function AccessibilityStatement() {
  const currentDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-iris-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-iris-700 via-iris-800 to-iris-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
              <Accessibility className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">הצהרת נגישות</h1>
          </div>
          <p className="text-lg text-iris-100">
            TechJobsIL מחויבת להנגשת האתר לאנשים עם מוגבלויות
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-8">
          
          {/* General Statement */}
          <section aria-labelledby="general-statement">
            <h2 id="general-statement" className="text-2xl font-bold text-warm-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-iris-600 rounded-full"></span>
              הצהרה כללית
            </h2>
            <div className="prose prose-warm max-w-none text-warm-700 leading-relaxed space-y-4">
              <p>
                אתר TechJobsIL שם דגש רב על מתן שירות שוויוני לכל לקוחותיו, לרבות אנשים עם מוגבלות.
                אנו פועלים להנגשת האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), 
                התשע"ג-2013 ובהתאם לתקן הישראלי ת"י 5568 המבוסס על תקן WCAG 2.1 ברמה AA.
              </p>
              <p>
                במסגרת מחויבותנו לנגישות, אנו משקיעים משאבים רבים בכדי להקל ככל הניתן על השימוש באתר 
                עבור אנשים עם מוגבלות, ובשיפור חוויית הגלישה באתר עבור כלל המשתמשים.
              </p>
            </div>
          </section>

          {/* Accessibility Features */}
          <section aria-labelledby="accessibility-features">
            <h2 id="accessibility-features" className="text-2xl font-bold text-warm-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-iris-600 rounded-full"></span>
              התאמות הנגישות באתר
            </h2>
            <ul className="space-y-3 text-warm-700" role="list">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>ניווט באמצעות מקלדת בלבד - כל פונקציות האתר נגישות באמצעות מקלדת</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>קישור "דלג לתוכן הראשי" - מאפשר דילוג מהיר לתוכן המרכזי בכל עמוד</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>מבנה סמנטי תקין - שימוש בתגיות HTML סמנטיות לניווט קל עם קוראי מסך</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>טקסט חלופי לתמונות - כל התמונות מכילות תיאור טקסטואלי</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>ניגודיות צבעים - שמירה על יחס ניגודיות מינימלי של 4.5:1 לטקסט רגיל</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>מיקוד (Focus) ברור - אינדיקציה ויזואלית ברורה לאלמנט הנבחר</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>תוויות ARIA - שימוש בתוויות נגישות לכל האלמנטים האינטראקטיביים</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>הודעות חיות - עדכונים דינמיים מוכרזים לקוראי מסך</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-iris-500 rounded-full mt-2 shrink-0"></span>
                <span>תמיכה בקוראי מסך - האתר נבדק ותומך בקוראי מסך נפוצים</span>
              </li>
            </ul>
          </section>

          {/* Keyboard Navigation */}
          <section aria-labelledby="keyboard-nav">
            <h2 id="keyboard-nav" className="text-2xl font-bold text-warm-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-iris-600 rounded-full"></span>
              ניווט במקלדת
            </h2>
            <div className="bg-warm-50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-warm-700">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-white rounded-lg shadow text-sm font-mono">Tab</kbd>
                  <span>מעבר לאלמנט הבא</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-white rounded-lg shadow text-sm font-mono">Shift + Tab</kbd>
                  <span>מעבר לאלמנט הקודם</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-white rounded-lg shadow text-sm font-mono">Enter</kbd>
                  <span>הפעלת קישור/כפתור</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-white rounded-lg shadow text-sm font-mono">Escape</kbd>
                  <span>סגירת חלון קופץ/תפריט</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-white rounded-lg shadow text-sm font-mono">חצים</kbd>
                  <span>ניווט בתפריטים ורשימות</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-white rounded-lg shadow text-sm font-mono">Space</kbd>
                  <span>בחירת אפשרות</span>
                </div>
              </div>
            </div>
          </section>

          {/* Browsers and Assistive Tech */}
          <section aria-labelledby="browsers-tech">
            <h2 id="browsers-tech" className="text-2xl font-bold text-warm-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-iris-600 rounded-full"></span>
              דפדפנים וטכנולוגיות מסייעות
            </h2>
            <div className="text-warm-700 space-y-4">
              <p>האתר נבדק ותואם לשימוש עם:</p>
              <ul className="space-y-2" role="list">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-copper-500 rounded-full mt-2 shrink-0"></span>
                  <span>דפדפנים: Chrome, Firefox, Safari, Edge (גרסאות עדכניות)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-copper-500 rounded-full mt-2 shrink-0"></span>
                  <span>קוראי מסך: NVDA, JAWS, VoiceOver</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-copper-500 rounded-full mt-2 shrink-0"></span>
                  <span>מערכות הפעלה: Windows, macOS, iOS, Android</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact-section" className="bg-iris-50 rounded-xl p-6">
            <h2 id="contact-section" className="text-2xl font-bold text-warm-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-iris-600 rounded-full"></span>
              יצירת קשר בנושא נגישות
            </h2>
            <div className="text-warm-700 space-y-4">
              <p>
                אם נתקלתם בבעיית נגישות באתר, או שיש לכם הצעות לשיפור הנגישות, אנא פנו אלינו 
                ואנו נעשה כל מאמץ לטפל בפנייתכם בהקדם האפשרי.
              </p>
              <div className="flex flex-col gap-3">
                <a 
                  href="mailto:accessibility@techjobsil.com" 
                  className="flex items-center gap-2 text-iris-600 hover:text-iris-700 transition-colors"
                  aria-label="שלח אימייל לנושא נגישות"
                >
                  <Mail className="w-5 h-5" />
                  <span>accessibility@techjobsil.com</span>
                </a>
                <div className="flex items-center gap-2 text-warm-600">
                  <Phone className="w-5 h-5" />
                  <span>03-1234567</span>
                </div>
                <div className="flex items-center gap-2 text-warm-600">
                  <MessageCircle className="w-5 h-5" />
                  <span>בכל פניה נא לציין את כתובת העמוד ותיאור הבעיה</span>
                </div>
              </div>
            </div>
          </section>

          {/* Standard Compliance */}
          <section aria-labelledby="compliance">
            <h2 id="compliance" className="text-2xl font-bold text-warm-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-iris-600 rounded-full"></span>
              תקנים ורגולציה
            </h2>
            <div className="text-warm-700 space-y-4">
              <p>האתר פועל בהתאם לתקנים הבאים:</p>
              <ul className="space-y-2" role="list">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></span>
                  <span>תקן WCAG 2.1 ברמה AA (Web Content Accessibility Guidelines)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></span>
                  <span>תקן ישראלי ת"י 5568 - נגישות תכנים באינטרנט</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></span>
                  <span>חוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0"></span>
                  <span>תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Last Update */}
          <div className="text-center pt-6 border-t border-warm-200">
            <p className="text-warm-500 text-sm">
              הצהרת נגישות זו עודכנה לאחרונה בתאריך: {currentDate}
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
            <Link to={createPageUrl("Home")}>
              <ArrowRight className="w-4 h-4" />
              חזרה לדף הבית
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

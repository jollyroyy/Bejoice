import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import QuickQuoteSection from './QuickQuote.jsx';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONSTANTS
// ============================================
const GLOBE_SEA_FRAMES  = 200;
const SEA_FLIGHT_FRAMES = 200;
const TOTAL_FRAMES = GLOBE_SEA_FRAMES + SEA_FLIGHT_FRAMES; // 400

const FRAME_URL = (globalIndex) => {
  if (globalIndex < GLOBE_SEA_FRAMES) {
    const n = (globalIndex + 1).toString().padStart(3, '0');
    return `/globe-sea/ezgif-frame-${n}.jpg`;
  } else {
    const n = (globalIndex - GLOBE_SEA_FRAMES + 1).toString().padStart(3, '0');
    return `/sea-flight/ezgif-frame-${n}.jpg`;
  }
};

// ── Narrative chapters ────────────────────────────────────────────────────────
const CHAPTERS = [
  // ── ACT 1: Globe → Sea ──────────────────────────────────────────────────
  {
    id: 'world',
    label: 'Act I — The World Awaits',
    titleLines: ['Unleash', 'Global', 'Trade'],
    body: "Every continent. Every corridor. Every deadline. Bejoice charts the most intelligent route between your cargo and the world \u2014 before the tide even turns.",
    frameStart: 0,
    frameEnd: 44,
    align: 'left',
    isHero: true,
    hasHeroForm: true,
  },
  {
    id: 'routes',
    label: 'Act I — Charting Your Course',
    titleLines: ['Chart the Course.', 'Own the Ocean.'],
    body: 'Thousands of nautical miles, calculated to the hour. Our sea freight specialists engineer the optimal route \u2014 so your cargo rides the current, never fights it.',
    frameStart: 45,
    frameEnd: 89,
    align: 'right',
  },
  {
    id: 'horizon',
    label: 'Act I — The Open Horizon',
    titleLines: ['Where the Sea', 'Becomes Strategy.'],
    body: "Saudi Arabia sits at the crossroads of the world\u2019s busiest trade lanes. Bejoice turns that geography into your competitive advantage \u2014 port to port, without compromise.",
    frameStart: 90,
    frameEnd: 144,
    align: 'left',
  },
  {
    id: 'maritime',
    label: 'Act I — Maritime Mastery',
    titleLines: ['Deep Water.', 'Deeper Trust.'],
    body: 'FCL or LCL, reefer or breakbulk \u2014 our vessels move with the precision of a tide chart and the muscle of an entire fleet. The sea is not an obstacle. It is our highway.',
    frameStart: 145,
    frameEnd: 199,
    align: 'right',
    stats: [
      { value: '45+', label: 'Global Ports' },
      { value: '12M', label: 'TEUs Handled' },
    ],
  },

  // ── ACT 2: Sea → Flight ──────────────────────────────────────────────────
  {
    id: 'liftoff',
    label: 'Act II — The Ascent',
    titleLines: ['Leave the Waves.', 'Rule the Sky.'],
    body: 'When the ocean is too slow, we lift off. Bejoice bridges sea and air in a single, seamless handoff \u2014 your shipment ascends without missing a beat.',
    frameStart: 200,
    frameEnd: 254,
    align: 'left',
  },
  {
    id: 'airways',
    label: 'Act II — Commanding the Airways',
    titleLines: ['Airborne.', 'On Time.', 'Every Time.'],
    body: '150+ destinations. Priority lanes. Same-day uplift where it matters. When every hour carries a price tag, Bejoice air freight is the answer that never blinks.',
    frameStart: 255,
    frameEnd: 319,
    align: 'right',
    stats: [
      { value: '150+', label: 'Destinations' },
      { value: '24/7', label: 'Live Tracking' },
    ],
  },
  {
    id: 'promise',
    label: 'Act II — The Bejoice Promise',
    titleLines: ['One Partner.', 'Every Mile.'],
    body: 'Sea or sky, port or runway \u2014 Bejoice is the single thread that connects your supply chain from origin to delivery. No gaps. No excuses. Just results.',
    frameStart: 320,
    frameEnd: 399,
    align: 'center',
    hasCTA: true,
  },
];

// ============================================
// TRANSLATIONS
// ============================================
const TRANSLATIONS = {
  en: {
    // Header
    navQuote: 'Quick Quote',
    navTools: 'Tools',
    navContact: 'Contact',

    // Hero form
    heroFormOrigin: 'Origin (City / Country)',
    heroFormDest: 'Destination',
    heroFormWeight: 'Weight (kg)',
    heroFormEmail: 'Your Email',
    heroFormBtn: 'Get Saudi Quote — 30 min response',
    heroFormPhone: 'Or call',

    // Trust strip
    trustISO: 'ISO Certified',
    trustCustoms: 'Licensed Customs Agents',
    trustCarriers: 'Global Carrier Partnerships',
    trustInsurance: 'Cargo Insurance Coverage',

    // Saudi section
    saudiLabel: 'Saudi Arabia Focus',
    saudiHeadline: 'Trusted Logistics Partner',
    saudiHeadlineAccent: 'in Saudi Arabia',
    saudiBullets: [
      'Dedicated operations at Jeddah Islamic Port — KSA\'s largest gateway',
      'Dammam customs specialists with pre-clearance expertise',
      'Arabic-speaking support team, aligned with ZATCA regulations',
      'GCC trucking network covering Saudi, UAE, Kuwait, Bahrain, Oman',
    ],
    saudiStat1Label: 'Global Ports',
    saudiStat2Label: 'Years in KSA',
    saudiStat3Label: 'Destinations',

    // Route map
    routeLabel: 'Global Network',
    routeTitle: 'Saudi Hub.',
    routeTitleAccent: 'World Reach.',

    // How it works
    hiwLabel: 'Simple Process',
    hiwTitle: 'How It Works',
    hiwSteps: [
      { num: '01', icon: '📋', title: 'Get a Quote', desc: 'Fill out our quick form with your origin, destination, cargo type, and weight. We respond within 30 minutes.' },
      { num: '02', icon: '🗺️', title: 'We Plan the Route', desc: 'Our logistics specialists engineer the optimal sea, air, or multi-modal route — factoring Saudi customs requirements.' },
      { num: '03', icon: '📡', title: 'Real-time Tracking', desc: 'Track your shipment with your BL or AWB number. Our team provides proactive updates at every checkpoint.' },
    ],

    // Case studies
    casesLabel: 'Shipment Examples',
    casesTitle: 'Real Cargo.',
    casesTitleAccent: 'Real Results.',
    cases: [
      { tag: 'Sea Freight', cargo: 'Automotive Parts', route: 'Germany → Jeddah', days: '18 days', detail: 'FCL 40ft HC · 24 tonnes · Port Hamburg to King Abdulaziz Port', color: 'rgba(200,168,78,0.12)' },
      { tag: 'Sea + Customs', cargo: 'Industrial Machinery', route: 'China → Dammam', days: '22 days', detail: 'Project cargo · 68 CBM · Shenzhen to King Fahd Industrial Port', color: 'rgba(100,140,255,0.1)' },
      { tag: 'Air Freight', cargo: 'Perishables (Reefer)', route: 'Netherlands → Riyadh', days: '14 days', detail: 'Air reefer · 1,200 kg · AMS to RUH · +4°C cold chain', color: 'rgba(37,200,100,0.1)' },
    ],

    // Client logos
    logosLabel: 'Partner Carriers',

    // Tracking widget
    trackTitle: 'Track Your Shipment',
    trackPlaceholder: 'Enter BL / AWB number',
    trackBtn: 'Track',
    trackToast: 'Tracking in progress — our team will contact you within 30 minutes.',

    // Footer
    footerTagline: 'Moving cargo. Building trust.\nOne shipment at a time.',
    footerContactTitle: 'Contact',
    footerServicesTitle: 'Services',
    footerCompanyTitle: 'Company',
    footerAddress: 'King Fahd Road, Al Olaya\nRiyadh, Saudi Arabia 11523',
    footerWhatsapp: 'WhatsApp Us',
    footerServices: ['Sea Freight', 'Air Freight', 'Land Freight', 'Customs Clearance', 'Project Cargo'],
    footerCompany: ['About Us', 'Certifications', 'Careers', 'Privacy Policy'],
    footerCopyright: `© ${new Date().getFullYear()} Bejoice Group. All rights reserved.`,
    footerCompliance: 'ZATCA Compliant · ISO 9001 · FIATA Member',

    // Act divider
    actDividerTitle: 'Now,\nWe Take Flight.',

    // Chapters — act labels, titles, bodies
    chapters: {
      world:    { label: 'Act I — The World Awaits', titleLines: ['Unleash', 'Global', 'Trade'], body: "Every continent. Every corridor. Every deadline. Bejoice charts the most intelligent route between your cargo and the world — before the tide even turns." },
      routes:   { label: 'Act I — Charting Your Course', titleLines: ['Chart the Course.', 'Own the Ocean.'], body: 'Thousands of nautical miles, calculated to the hour. Our sea freight specialists engineer the optimal route — so your cargo rides the current, never fights it.' },
      horizon:  { label: 'Act I — The Open Horizon', titleLines: ['Where the Sea', 'Becomes Strategy.'], body: "Saudi Arabia sits at the crossroads of the world's busiest trade lanes. Bejoice turns that geography into your competitive advantage — port to port, without compromise." },
      maritime: { label: 'Act I — Maritime Mastery', titleLines: ['Deep Water.', 'Deeper Trust.'], body: 'FCL or LCL, reefer or breakbulk — our vessels move with the precision of a tide chart and the muscle of an entire fleet. The sea is not an obstacle. It is our highway.' },
      liftoff:  { label: 'Act II — The Ascent', titleLines: ['Leave the Waves.', 'Rule the Sky.'], body: 'When the ocean is too slow, we lift off. Bejoice bridges sea and air in a single, seamless handoff — your shipment ascends without missing a beat.' },
      airways:  { label: 'Act II — Commanding the Airways', titleLines: ['Airborne.', 'On Time.', 'Every Time.'], body: '150+ destinations. Priority lanes. Same-day uplift where it matters. When every hour carries a price tag, Bejoice air freight is the answer that never blinks.' },
      promise:  { label: 'Act II — The Bejoice Promise', titleLines: ['One Partner.', 'Every Mile.'], body: 'Sea or sky, port or runway — Bejoice is the single thread that connects your supply chain from origin to delivery. No gaps. No excuses. Just results.' },
    },

    // CTA
    ctaButton: 'Get a Quick Quote',
    ctaSub: 'Sea · Air · Land · Customs · Project Cargo',
  },

  ar: {
    // Header
    navQuote: 'عرض سريع',
    navTools: 'الأدوات',
    navContact: 'تواصل معنا',

    // Hero form
    heroFormOrigin: 'بلد / مدينة الشحن',
    heroFormDest: 'الوجهة',
    heroFormWeight: 'الوزن (كيلوغرام)',
    heroFormEmail: 'بريدك الإلكتروني',
    heroFormBtn: 'احصل على عرض سعر — رد خلال 30 دقيقة',
    heroFormPhone: 'أو اتصل بنا',

    // Trust strip
    trustISO: 'معتمد ISO',
    trustCustoms: 'وكلاء جمارك مرخصون',
    trustCarriers: 'شراكات مع ناقلين عالميين',
    trustInsurance: 'تأمين على البضائع',

    // Saudi section
    saudiLabel: 'التركيز على المملكة العربية السعودية',
    saudiHeadline: 'شريك لوجستي موثوق',
    saudiHeadlineAccent: 'في المملكة العربية السعودية',
    saudiBullets: [
      'عمليات مخصصة في ميناء جدة الإسلامي — أكبر بوابة في المملكة',
      'متخصصون في جمارك الدمام مع خبرة في التخليص المسبق',
      'فريق دعم ناطق بالعربية، متوافق مع لوائح هيئة الزكاة والضريبة والجمارك',
      'شبكة شاحنات تغطي السعودية والإمارات والكويت والبحرين وعُمان',
    ],
    saudiStat1Label: 'ميناء عالمي',
    saudiStat2Label: 'سنوات في المملكة',
    saudiStat3Label: 'وجهة حول العالم',

    // Route map
    routeLabel: 'الشبكة العالمية',
    routeTitle: 'المركز السعودي.',
    routeTitleAccent: 'امتداد عالمي.',

    // How it works
    hiwLabel: 'عملية بسيطة',
    hiwTitle: 'كيف تعمل؟',
    hiwSteps: [
      { num: '01', icon: '📋', title: 'احصل على عرض', desc: 'أكمل النموذج السريع بمعلومات الشحن والوجهة والوزن. سنرد عليك خلال 30 دقيقة.' },
      { num: '02', icon: '🗺️', title: 'نخطط المسار', desc: 'يضع متخصصونا المسار الأمثل براً أو بحراً أو جواً، مع الأخذ بعين الاعتبار متطلبات الجمارك السعودية.' },
      { num: '03', icon: '📡', title: 'تتبع في الوقت الفعلي', desc: 'تابع شحنتك برقم البوليصة أو رقم AWB. فريقنا يرسل تحديثات استباقية عند كل محطة.' },
    ],

    // Case studies
    casesLabel: 'أمثلة من الشحنات',
    casesTitle: 'بضائع حقيقية.',
    casesTitleAccent: 'نتائج حقيقية.',
    cases: [
      { tag: 'شحن بحري', cargo: 'قطع غيار سيارات', route: 'ألمانيا ← جدة', days: '18 يوم', detail: 'FCL 40ft HC · 24 طن · ميناء هامبورغ إلى ميناء الملك عبدالعزيز', color: 'rgba(200,168,78,0.12)' },
      { tag: 'بحري + جمارك', cargo: 'آلات صناعية', route: 'الصين ← الدمام', days: '22 يوم', detail: 'بضائع مشاريع · 68 م³ · شنتشن إلى ميناء الملك فهد الصناعي', color: 'rgba(100,140,255,0.1)' },
      { tag: 'شحن جوي', cargo: 'بضائع مبردة', route: 'هولندا ← الرياض', days: '14 يوم', detail: 'شحن جوي مبرد · 1200 كغ · AMS إلى RUH · سلسلة تبريد +4°م', color: 'rgba(37,200,100,0.1)' },
    ],

    // Client logos
    logosLabel: 'شركاؤنا الناقلون',

    // Tracking widget
    trackTitle: 'تتبع شحنتك',
    trackPlaceholder: 'أدخل رقم البوليصة / AWB',
    trackBtn: 'تتبع',
    trackToast: 'جارٍ تتبع الشحنة — سيتواصل معك فريقنا خلال 30 دقيقة.',

    // Footer
    footerTagline: 'ننقل البضائع. نبني الثقة.\nشحنة واحدة في كل مرة.',
    footerContactTitle: 'تواصل معنا',
    footerServicesTitle: 'خدماتنا',
    footerCompanyTitle: 'الشركة',
    footerAddress: 'طريق الملك فهد، العليا\nالرياض، المملكة العربية السعودية 11523',
    footerWhatsapp: 'تواصل عبر واتساب',
    footerServices: ['شحن بحري', 'شحن جوي', 'شحن بري', 'تخليص جمركي', 'شحن مشاريع'],
    footerCompany: ['من نحن', 'الشهادات', 'وظائف', 'سياسة الخصوصية'],
    footerCopyright: `© ${new Date().getFullYear()} مجموعة بيجويس. جميع الحقوق محفوظة.`,
    footerCompliance: 'متوافق مع هيئة الزكاة والضريبة · ISO 9001 · عضو FIATA',

    // Act divider
    actDividerTitle: 'الآن،\nنحلق في السماء.',

    // Chapters
    chapters: {
      world:    { label: 'الفصل الأول — العالم ينتظر', titleLines: ['أطلق العنان', 'للتجارة', 'العالمية'], body: 'كل قارة. كل ممر. كل موعد نهائي. تضع بيجويس أذكى المسارات بين بضائعك والعالم — قبل أن يتحول المد.' },
      routes:   { label: 'الفصل الأول — ارسم المسار', titleLines: ['ارسم المسار.', 'امتلك المحيط.'], body: 'آلاف الأميال البحرية محسوبة بدقة بالساعة. يصمم متخصصونا في الشحن البحري المسار الأمثل — لتسير بضائعك مع التيار لا ضده.' },
      horizon:  { label: 'الفصل الأول — الأفق المفتوح', titleLines: ['حيث البحر', 'يصبح استراتيجية.'], body: 'تقع المملكة العربية السعودية عند تقاطع أكثر مسارات التجارة ازدحاماً في العالم. تحوّل بيجويس هذا الموقع إلى ميزتك التنافسية — من ميناء إلى ميناء بلا تنازلات.' },
      maritime: { label: 'الفصل الأول — إتقان بحري', titleLines: ['مياه عميقة.', 'ثقة أعمق.'], body: 'FCL أو LCL، مبردة أو بضائع غير نظامية — تتحرك سفننا بدقة خريطة المد وقوة أسطول كامل. البحر ليس عقبة. إنه طريقنا السريع.' },
      liftoff:  { label: 'الفصل الثاني — الصعود', titleLines: ['اترك الأمواج.', 'احكم السماء.'], body: 'عندما يكون المحيط بطيئاً جداً، نحلق. تجسر بيجويس البحر والجو في تسليم سلس — تصعد شحنتك دون أن تفوت خطوة.' },
      airways:  { label: 'الفصل الثاني — السيطرة على الأجواء', titleLines: ['في الجو.', 'في الوقت.', 'دائماً.'], body: 'أكثر من 150 وجهة. مسارات أولوية. رفع في اليوم ذاته عند الحاجة. حين يحمل كل ساعة ثمناً، الشحن الجوي ببيجويس هو الإجابة التي لا تتردد.' },
      promise:  { label: 'الفصل الثاني — وعد بيجويس', titleLines: ['شريك واحد.', 'كل ميل.'], body: 'براً أو جواً، ميناء أو مدرج — بيجويس هو الخيط الواحد الذي يربط سلسلة توريدك من المنشأ إلى التسليم. بلا ثغرات. بلا أعذار. فقط نتائج.' },
    },

    // CTA
    ctaButton: 'احصل على عرض سريع',
    ctaSub: 'بحري · جوي · بري · جمارك · مشاريع',
  },
};

// ============================================
// LOADING SCREEN — Apple minimal
// ============================================
function LoadingScreen({ progress, isLoaded }) {
  const screenRef = useRef(null);

  useEffect(() => {
    if (isLoaded && screenRef.current) {
      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 1.4,
        ease: 'power3.inOut',
        delay: 0.5,
        onComplete: () => {
          if (screenRef.current) screenRef.current.style.display = 'none';
        },
      });
    }
  }, [isLoaded]);

  return (
    <div ref={screenRef} className="loading-screen">
      <div className="loading-logo">
        Bejoice <span>Group</span>
      </div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-percentage">{Math.round(progress)} %</div>
    </div>
  );
}

// ============================================
// BJS WING LOGO — inline SVG emblem
// ============================================
function BJSLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Wing emblem */}
      <svg
        width="44"
        height="28"
        viewBox="0 0 44 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8d48a" />
            <stop offset="55%" stopColor="#c8a84e" />
            <stop offset="100%" stopColor="#a8843e" />
          </linearGradient>
          <linearGradient id="wingGradR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8d48a" />
            <stop offset="55%" stopColor="#c8a84e" />
            <stop offset="100%" stopColor="#a8843e" />
          </linearGradient>
        </defs>

        {/* Left wing — outer feather */}
        <path
          d="M22 20 C17 15, 9 10, 1 8 C5 12, 10 15, 16 18 Z"
          fill="url(#wingGrad)"
          opacity="0.95"
        />
        {/* Left wing — mid feather */}
        <path
          d="M22 18 C18 12, 12 7, 5 3 C8 8, 13 12, 18 16 Z"
          fill="url(#wingGrad)"
          opacity="0.75"
        />
        {/* Left wing — inner feather */}
        <path
          d="M22 16 C20 10, 17 5, 14 1 C16 6, 18 11, 21 15 Z"
          fill="url(#wingGrad)"
          opacity="0.55"
        />

        {/* Right wing — outer feather */}
        <path
          d="M22 20 C27 15, 35 10, 43 8 C39 12, 34 15, 28 18 Z"
          fill="url(#wingGradR)"
          opacity="0.95"
        />
        {/* Right wing — mid feather */}
        <path
          d="M22 18 C26 12, 32 7, 39 3 C36 8, 31 12, 26 16 Z"
          fill="url(#wingGradR)"
          opacity="0.75"
        />
        {/* Right wing — inner feather */}
        <path
          d="M22 16 C24 10, 27 5, 30 1 C28 6, 26 11, 23 15 Z"
          fill="url(#wingGradR)"
          opacity="0.55"
        />

        {/* Center body — teardrop */}
        <path
          d="M22 26 C20 22, 19 19, 22 14 C25 19, 24 22, 22 26 Z"
          fill="url(#wingGrad)"
          opacity="0.9"
        />
      </svg>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: '0.05rem' }}>
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.2rem',
            fontWeight: 400,
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.93)',
            textIndent: '0.38em',
          }}
        >
          Bejoice
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.52rem',
            fontWeight: 500,
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: 'rgba(200,168,78,0.75)',
            textIndent: '0.45em',
          }}
        >
          Group
        </span>
      </div>
    </div>
  );
}

// ============================================
// HEADER — frosted glass on scroll
// ============================================
function Header({ onToolsClick, onQuoteClick, lang, toggleLang }) {
  const headerRef = useRef(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!headerRef.current) return;

    gsap.fromTo(
      headerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 1.8 }
    );

    const onScroll = () => {
      if (!headerRef.current) return;
      if (window.scrollY > 40) {
        headerRef.current.classList.add('scrolled');
      } else {
        headerRef.current.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="header-glass fixed top-0 left-0 w-full z-50 opacity-0"
    >
      <div className="flex items-center justify-between px-8 md:px-14 py-4">
        <BJSLogo />

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={onQuoteClick}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(200,168,78,0.85)',
              background: 'rgba(200,168,78,0.08)',
              border: '1px solid rgba(200,168,78,0.25)',
              borderRadius: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: '0.35rem 1rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,168,78,0.15)'; e.currentTarget.style.borderColor = 'rgba(200,168,78,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,168,78,0.08)'; e.currentTarget.style.borderColor = 'rgba(200,168,78,0.25)'; }}
          >
            {t.navQuote}
          </button>
          <button
            onClick={onToolsClick}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(200,168,78,0.65)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              padding: '0.25rem 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(200,168,78,1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200,168,78,0.65)')}
          >
            {t.navTools}
          </button>
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.35rem',
              cursor: 'pointer',
              padding: '0.28rem 0.6rem',
              transition: 'all 0.2s',
              display: 'flex',
              gap: '0.3rem',
            }}
          >
            <span style={{ color: lang === 'en' ? 'rgba(200,168,78,1)' : 'rgba(255,255,255,0.35)' }}>EN</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: lang === 'ar' ? 'rgba(200,168,78,1)' : 'rgba(255,255,255,0.35)' }}>AR</span>
          </button>

          <button
            id="contact-btn"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              padding: '0.25rem 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            {t.navContact}
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================
// ACT DIVIDER — cinematic title between acts
// ============================================
function ActDivider({ label, title }) {
  const ref      = useRef(null);
  const labelRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const enter = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
    });
    enter.fromTo(labelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0);
    enter.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power3.out' }, 0.1);

    const exit = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(ref.current, { opacity: 0, y: -20, ease: 'power2.in' });

    return () => {
      enter.scrollTrigger?.kill(); enter.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1,
        textAlign: 'center',
        padding: '0 2rem',
      }}
    >
      {/* Decorative line above */}
      <div
        ref={labelRef}
        style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}
      >
        <div style={{ width: '3rem', height: '1px', background: 'rgba(200,168,78,0.5)' }} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6rem',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(200,168,78,0.65)',
          }}
        >
          {label}
        </span>
        <div style={{ width: '3rem', height: '1px', background: 'rgba(200,168,78,0.5)' }} />
      </div>

      <h2
        ref={titleRef}
        className="act-divider-title"
        style={{ opacity: 0, whiteSpace: 'pre-line' }}
      >
        {title}
      </h2>
    </div>
  );
}

// ============================================
// HERO QUOTE FORM
// ============================================
function HeroQuoteForm({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const [origin, setOrigin]           = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = () => {
    document.getElementById('quick-quote-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero-cta-tray">
      {/* Header */}
      <div className="hero-cta-tray-header">
        <span className="hero-cta-tray-badge">Free Quote</span>
        <span className="hero-cta-tray-tagline">30-min response · No commitment</span>
      </div>

      {/* Route row */}
      <div className="hero-cta-tray-route">
        <div className="hero-cta-tray-field">
          <label className="hero-cta-tray-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
            {t.heroFormOrigin}
          </label>
          <input
            className="hero-cta-tray-input"
            type="text"
            placeholder="e.g. Hamburg, Germany"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
          />
        </div>
        <div className="hero-cta-tray-arrow">→</div>
        <div className="hero-cta-tray-field">
          <label className="hero-cta-tray-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {t.heroFormDest}
          </label>
          <input
            className="hero-cta-tray-input"
            type="text"
            placeholder="e.g. Jeddah, KSA"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>
      </div>

      {/* CTA button */}
      <button className="hero-cta-tray-btn" onClick={handleSubmit}>
        {t.heroFormBtn}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      {/* Sub-row */}
      <div className="hero-cta-tray-sub">
        <a href="tel:+966550000000" className="hero-cta-tray-phone">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3-8.69A2 2 0 0 1 3.82 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16z"/></svg>
          +966 55 000 0000
        </a>
        <span className="hero-cta-tray-divider" />
        <a
          href="https://wa.me/966550000000?text=Hello%2C+I+need+a+freight+quote"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-cta-tray-wa"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}

// ============================================
// CHAPTER SECTION
// ============================================
function ChapterSection({ chapter, lang = 'en' }) {
  const sectionRef = useRef(null);
  const blockRef   = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const block   = blockRef.current;
    if (!section || !block) return;

    let enter = null;
    if (chapter.isHero) {
      // Hero: visible immediately, no scroll entry
      block.style.opacity = '1';
      gsap.fromTo(
        Array.from(block.children),
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, ease: 'power3.out', stagger: 0.1, duration: 1, delay: 1.6 }
      );
    } else {
      enter = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 25%', scrub: 1.2 },
      });
      enter.fromTo(
        block,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power3.out' }
      );
    }

    const exit = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'bottom 65%', end: 'bottom 15%', scrub: 1.2 },
    });
    exit.to(block, { opacity: 0, y: -24, ease: 'power2.in' });

    return () => {
      enter?.scrollTrigger?.kill(); enter?.kill();
      exit.scrollTrigger?.kill();  exit.kill();
    };
  }, [chapter.isHero]);

  const isRight  = chapter.align === 'right';
  const isCenter = chapter.align === 'center';
  const t        = TRANSLATIONS[lang];
  const tc       = t.chapters[chapter.id] || {};
  const titleLines = tc.titleLines || chapter.titleLines;
  const body       = tc.body       || chapter.body;
  const label      = tc.label      || chapter.label;

  /* Hero chapter uses a two-column row layout */
  if (chapter.isHero) {
    return (
      <section
        ref={sectionRef}
        id={`section-${chapter.id}`}
        className="chapter-section chapter-section-hero-row relative z-10"
      >
        <div ref={blockRef} className="chapter-hero-row-inner" style={{ opacity: 0 }}>
          {/* LEFT — text content */}
          <div className="chapter-hero-left">
            <h2 className="section-title" style={{ whiteSpace: 'pre-line' }}>
              {titleLines.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {i === (chapter.titleAccentLine ?? -1)
                    ? <span className="title-accent">{line}</span>
                    : line}
                </span>
              ))}
            </h2>
            <p className="section-body">{body}</p>
          </div>

          {/* RIGHT — CTA form */}
          <div className="chapter-hero-right">
            <HeroQuoteForm lang={lang} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={`section-${chapter.id}`}
      className={`chapter-section chapter-section-${chapter.align} relative z-10`}
    >
      <div ref={blockRef} className="chapter-block" style={{ opacity: 0 }}>

        {/* Title — Bebas Neue display, with optional gold accent on first line */}
        <h2
          className="section-title"
          style={{ whiteSpace: 'pre-line' }}
        >
          {titleLines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
              {i === (chapter.titleAccentLine ?? -1) ? (
                <span className="title-accent">{line}</span>
              ) : line}
            </span>
          ))}
        </h2>

        {/* Body copy */}
        <p className="section-body">{body}</p>

        {/* Optional stats row */}
        {chapter.stats && (
          <div className={`stats-row${isRight ? ' stats-right' : ''}`}
            style={isRight ? { justifyContent: 'flex-end' } : {}}
          >
            {chapter.stats.map(s => (
              <div key={s.label} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {chapter.hasCTA && (
          <div style={{ marginTop: '2.8rem', display: 'flex', flexDirection: 'column', alignItems: isCenter ? 'center' : 'flex-start', gap: '1rem' }}>
            <button
              id="cta-start-journey"
              className="cta-button cta-button-prominent"
              onClick={() => document.getElementById('quick-quote-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.ctaButton}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)',
            }}>
              {t.ctaSub}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// CBM CALCULATOR
// ============================================
function CBMCalculator() {
  const [unit, setUnit]     = useState('cm');
  const [rows, setRows]     = useState([{ l: '', w: '', h: '', qty: '1' }]);
  const [result, setResult] = useState(null);

  const addRow = () => setRows(r => [...r, { l: '', w: '', h: '', qty: '1' }]);
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const calculate = () => {
    const divisor = unit === 'cm' ? 1000000 : 1;
    let totalCBM = 0;
    for (const row of rows) {
      const l = parseFloat(row.l) || 0;
      const w = parseFloat(row.w) || 0;
      const h = parseFloat(row.h) || 0;
      const qty = parseInt(row.qty) || 1;
      totalCBM += (l * w * h / divisor) * qty;
    }

    let container = '';
    if (totalCBM <= 25)       container = '20ft Standard (≤25 CBM)';
    else if (totalCBM <= 67)  container = '40ft Standard (≤67 CBM)';
    else if (totalCBM <= 76)  container = '40ft High Cube (≤76 CBM)';
    else                       container = `Multiple containers needed`;

    setResult({ cbm: totalCBM.toFixed(3), container });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.4rem',
    padding: '0.5rem 0.65rem',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="calc-card">
      <div className="calc-card-header">
        {/* Ship icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-7H6a2 2 0 0 0-2 2v12"/>
          <path d="M14 2v6h6"/>
          <path d="M4 12h16"/>
        </svg>
        <h3 className="calc-title">CBM Calculator</h3>
      </div>
      <p className="calc-subtitle">Calculate cubic meters for sea freight containers</p>

      {/* Unit toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['cm', 'm'].map(u => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`unit-btn${unit === u ? ' active' : ''}`}
          >
            {u === 'cm' ? 'Centimetres' : 'Metres'}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="calc-row-header">
        <span>L ({unit})</span>
        <span>W ({unit})</span>
        <span>H ({unit})</span>
        <span>Qty</span>
        <span />
      </div>

      {/* Cargo rows */}
      {rows.map((row, i) => (
        <div key={i} className="calc-row">
          {['l', 'w', 'h', 'qty'].map(field => (
            <input
              key={field}
              type="number"
              min="0"
              placeholder="0"
              value={row[field]}
              onChange={e => updateRow(i, field, e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          ))}
          <button
            onClick={() => removeRow(i)}
            className="row-remove-btn"
            disabled={rows.length === 1}
          >
            ×
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
        <button onClick={addRow} className="calc-secondary-btn">+ Add Row</button>
        <button onClick={calculate} className="calc-primary-btn">Calculate</button>
      </div>

      {result && (
        <div className="calc-result">
          <div className="calc-result-main">
            <span className="calc-result-value">{result.cbm}</span>
            <span className="calc-result-unit">CBM</span>
          </div>
          <div className="calc-result-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.7)" strokeWidth="2"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>
            {result.container}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// AIR CHARGEABLE WEIGHT CALCULATOR
// ============================================
function AirWeightCalculator() {
  const [actual, setActual]   = useState('');
  const [length, setLength]   = useState('');
  const [width, setWidth]     = useState('');
  const [height, setHeight]   = useState('');
  const [qty, setQty]         = useState('1');
  const [result, setResult]   = useState(null);

  const calculate = () => {
    const kg  = parseFloat(actual)  || 0;
    const l   = parseFloat(length)  || 0;
    const w   = parseFloat(width)   || 0;
    const h   = parseFloat(height)  || 0;
    const q   = parseInt(qty)       || 1;

    const volWeight = (l * w * h / 5000) * q;
    const actWeight = kg * q;
    const chargeable = Math.max(volWeight, actWeight);
    const basis = volWeight >= actWeight ? 'volumetric' : 'actual';

    setResult({
      actual:     actWeight.toFixed(2),
      volumetric: volWeight.toFixed(2),
      chargeable: chargeable.toFixed(2),
      basis,
    });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.4rem',
    padding: '0.5rem 0.65rem',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.6rem',
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '0.35rem',
    display: 'block',
  };

  return (
    <div className="calc-card">
      <div className="calc-card-header">
        {/* Plane icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1 0-1.5.5-3.5 2L11 8.2l-8.2 1.8-.6.6 6.4 2.4 2.4 6.4.6-.6z"/>
        </svg>
        <h3 className="calc-title">Air Chargeable Weight</h3>
      </div>
      <p className="calc-subtitle">Actual vs volumetric — you pay the higher</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Actual Weight (kg)</label>
          <input
            type="number" min="0" placeholder="0.00"
            value={actual} onChange={e => setActual(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>Qty (pieces)</label>
          <input
            type="number" min="1" placeholder="1"
            value={qty} onChange={e => setQty(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[['Length (cm)', length, setLength], ['Width (cm)', width, setWidth], ['Height (cm)', height, setHeight]].map(([lbl, val, setter]) => (
          <div key={lbl}>
            <label style={labelStyle}>{lbl}</label>
            <input
              type="number" min="0" placeholder="0"
              value={val} onChange={e => setter(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
        ))}
      </div>

      <button onClick={calculate} className="calc-primary-btn" style={{ width: '100%' }}>
        Calculate Chargeable Weight
      </button>

      {result && (
        <div className="calc-result" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="calc-mini-stat">
              <span className="calc-mini-label">Actual</span>
              <span className="calc-mini-value">{result.actual} kg</span>
            </div>
            <div className="calc-mini-stat">
              <span className="calc-mini-label">Volumetric</span>
              <span className="calc-mini-value">{result.volumetric} kg</span>
            </div>
          </div>
          <div className="calc-result-main">
            <span className="calc-result-value">{result.chargeable}</span>
            <span className="calc-result-unit">kg chargeable</span>
          </div>
          <div className="calc-result-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.7)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            Billed on {result.basis} weight
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TOOLS SECTION
// ============================================
function ToolsSection({ sectionRef, lang = 'en' }) {
  return (
    <div ref={sectionRef} id="tools-section" className="tools-section">
      {/* Background texture */}
      <div className="tools-bg-line" />

      <div className="tools-inner">
        {/* Header */}
        <div className="tools-header">
          <div className="chapter-label" style={{ justifyContent: 'center' }}>
            Freight Intelligence
          </div>
          <h2 className="tools-title">
            Calculate.<br />
            <span className="title-accent">Decide. Ship.</span>
          </h2>
          <p className="tools-subtitle">
            Instant freight calculations — no signup, no guesswork.
            Sea or air, get the numbers you need before you book.
          </p>
        </div>

        {/* Calculator grid */}
        <div className="tools-grid">
          <CBMCalculator />
          <AirWeightCalculator />
        </div>

        {/* Shipment Tracking */}
        <ShipmentTracking lang={lang} />

        {/* Footer note */}
        <p className="tools-footnote">
          Calculations are estimates based on standard carrier formulas (volumetric divisor 5000 for air).
          Final rates confirmed at booking.
        </p>
      </div>
    </div>
  );
}

// ============================================
// SHIPMENT TRACKING
// ============================================
function ShipmentTracking({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const [blNum, setBlNum] = useState('');
  const [toast, setToast] = useState(false);

  const handleTrack = () => {
    if (!blNum.trim()) return;
    setToast(true);
    setTimeout(() => setToast(false), 4500);
  };

  return (
    <div className="tracking-widget">
      <div className="tracking-widget-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <h3 className="calc-title">{t.trackTitle}</h3>
      </div>
      <p className="calc-subtitle">{t.trackPlaceholder}</p>
      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <input
          type="text"
          placeholder="e.g. MSKU1234567 or 157-12345678"
          value={blNum}
          onChange={e => setBlNum(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.45rem',
            padding: '0.6rem 0.9rem',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.82rem',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
        <button onClick={handleTrack} className="calc-primary-btn">{t.trackBtn}</button>
      </div>
      {toast && (
        <div className="tracking-toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,1)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span>{t.trackToast} WhatsApp: <a href="https://wa.me/966550000000" style={{ color: 'rgba(37,211,102,0.9)', textDecoration: 'none' }}>+966 55 000 0000</a></span>
        </div>
      )}
    </div>
  );
}

// ============================================
// TRUST STRIP
// ============================================
function TrustStrip({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const badges = [
    { icon: '🏅', label: t.trustISO },
    { icon: '🛃', label: t.trustCustoms },
    { icon: '🌐', label: t.trustCarriers },
    { icon: '🔒', label: t.trustInsurance },
  ];
  return (
    <div className="trust-strip">
      {badges.map(b => (
        <div key={b.label} className="trust-badge">
          <span className="trust-icon">{b.icon}</span>
          <span className="trust-label">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// SAUDI SECTION
// ============================================
function SaudiSection({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const stats = [
    { value: '45+',  label: t.saudiStat1Label },
    { value: '12+',  label: t.saudiStat2Label },
    { value: '150+', label: t.saudiStat3Label },
  ];
  return (
    <section className="saudi-section">
      <div className="saudi-inner">
        <div className="saudi-content">
          <div className="chapter-label">{t.saudiLabel}</div>
          <h2 className="saudi-headline">
            {t.saudiHeadline}<br />
            <span className="title-accent">{t.saudiHeadlineAccent}</span>
          </h2>
          <ul className="saudi-bullets">
            {t.saudiBullets.map(item => (
              <li key={item} className="saudi-bullet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="saudi-stats">
          {stats.map(s => (
            <div key={s.label} className="saudi-stat-card">
              <div className="saudi-stat-value">{s.value}</div>
              <div className="saudi-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// ROUTE MAP — pure SVG
// ============================================
function RouteMap({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const routes = [
    { id: 'eu',    x2: 340, y2: 115, label: lang === 'ar' ? 'أوروبا' : 'Europe' },
    { id: 'ru',    x2: 450, y2: 75,  label: lang === 'ar' ? 'روسيا'  : 'Russia' },
    { id: 'cn',    x2: 590, y2: 130, label: lang === 'ar' ? 'الصين'  : 'China' },
    { id: 'in',    x2: 530, y2: 200, label: lang === 'ar' ? 'الهند'  : 'India' },
    { id: 'us',    x2: 130, y2: 160, label: lang === 'ar' ? 'أمريكا' : 'USA' },
  ];
  const hubX = 430, hubY = 230;
  return (
    <section className="route-map-section">
      <div className="route-map-inner">
        <div className="chapter-label" style={{ justifyContent: 'center' }}>{t.routeLabel}</div>
        <h2 className="route-map-title">
          {t.routeTitle}<br /><span className="title-accent">{t.routeTitleAccent}</span>
        </h2>
        <div className="route-map-wrap">
          <svg viewBox="0 0 800 420" className="route-svg" aria-label="Bejoice global route map">
            {/* Ocean background */}
            <rect width="800" height="420" fill="rgba(5,5,8,0)" />

            {/* Simplified continent shapes */}
            {/* North America */}
            <path d="M60 80 L190 70 L200 100 L210 140 L180 200 L140 240 L100 230 L60 180 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>
            {/* South America */}
            <path d="M150 250 L195 245 L200 300 L175 370 L140 380 L125 330 L130 280 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>
            {/* Europe */}
            <path d="M300 60 L390 55 L395 95 L360 110 L320 105 L295 90 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>
            {/* Africa */}
            <path d="M310 130 L390 125 L400 190 L385 280 L345 320 L310 290 L290 220 L295 160 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>
            {/* Middle East / Saudi */}
            <path d="M390 190 L470 185 L480 245 L460 280 L410 275 L390 250 Z" fill="rgba(200,168,78,0.14)" stroke="rgba(200,168,78,0.28)" strokeWidth="1"/>
            {/* Russia */}
            <path d="M390 30 L640 25 L645 90 L480 95 L395 85 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>
            {/* Asia */}
            <path d="M490 90 L680 80 L690 160 L640 200 L560 210 L490 175 L475 120 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>
            {/* Australia */}
            <path d="M600 290 L690 280 L700 340 L660 375 L610 370 L590 330 Z" fill="rgba(200,168,78,0.06)" stroke="rgba(200,168,78,0.12)" strokeWidth="1"/>

            {/* Dashed trade routes */}
            {routes.map(r => (
              <line
                key={r.id}
                x1={hubX} y1={hubY}
                x2={r.x2} y2={r.y2}
                stroke="rgba(200,168,78,0.55)"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                className={`route-line route-line-${r.id}`}
              />
            ))}

            {/* Destination dots */}
            {routes.map(r => (
              <g key={r.id + '-dot'}>
                <circle cx={r.x2} cy={r.y2} r="4" fill="rgba(200,168,78,0.7)" />
                <text x={r.x2 + 8} y={r.y2 + 4} fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Inter,sans-serif">{r.label}</text>
              </g>
            ))}

            {/* Saudi hub — glowing dot */}
            <circle cx={hubX} cy={hubY} r="12" fill="rgba(200,168,78,0.08)" className="hub-pulse-outer" />
            <circle cx={hubX} cy={hubY} r="7"  fill="rgba(200,168,78,0.25)" className="hub-pulse-mid" />
            <circle cx={hubX} cy={hubY} r="4"  fill="rgba(200,168,78,1)" />
            <text x={hubX + 12} y={hubY - 10} fill="rgba(200,168,78,0.9)" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600">{lang === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</text>
          </svg>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS
// ============================================
function HowItWorks({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  return (
    <section className="hiw-section">
      <div className="hiw-inner">
        <div className="chapter-label" style={{ justifyContent: 'center' }}>{t.hiwLabel}</div>
        <h2 className="hiw-title">{t.hiwTitle}</h2>
        <div className="hiw-steps">
          {t.hiwSteps.map((s, i) => (
            <div key={s.num} className="hiw-step">
              <div className="hiw-step-num">{s.num}</div>
              <div className="hiw-step-icon">{s.icon}</div>
              <h3 className="hiw-step-title">{s.title}</h3>
              <p className="hiw-step-desc">{s.desc}</p>
              {i < t.hiwSteps.length - 1 && <div className="hiw-connector" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CASE STUDIES
// ============================================
function CaseStudies({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  return (
    <section className="cases-section">
      <div className="cases-inner">
        <div className="chapter-label" style={{ justifyContent: 'center' }}>{t.casesLabel}</div>
        <h2 className="cases-title">
          {t.casesTitle}<br /><span className="title-accent">{t.casesTitleAccent}</span>
        </h2>
        <div className="cases-grid">
          {t.cases.map(c => (
            <div key={c.route} className="case-card" style={{ '--card-tint': c.color }}>
              <div className="case-tag">{c.tag}</div>
              <h3 className="case-cargo">{c.cargo}</h3>
              <div className="case-route">{c.route}</div>
              <div className="case-days">{c.days}</div>
              <p className="case-detail">{c.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CLIENT LOGOS
// ============================================
function ClientLogos({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const logos = ['Maersk', 'CMA CGM', 'DP World', 'MSC', 'Hapag-Lloyd', 'Emirates SkyCargo', 'Kuehne+Nagel', 'DHL Global'];
  return (
    <section className="logos-section">
      <div className="chapter-label" style={{ justifyContent: 'center', marginBottom: '2rem' }}>{t.logosLabel}</div>
      <div className="logos-track-wrap">
        <div className="logos-fade-left" />
        <div className="logos-track">
          {[...logos, ...logos].map((l, i) => (
            <div key={i} className="logo-chip">{l}</div>
          ))}
        </div>
        <div className="logos-fade-right" />
      </div>
    </section>
  );
}

// ============================================
// SITE FOOTER
// ============================================
function SiteFooter({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <BJSLogo />
          <p className="footer-tagline" style={{ whiteSpace: 'pre-line' }}>{t.footerTagline}</p>
        </div>
        <div className="footer-contact">
          <h4 className="footer-col-title">{t.footerContactTitle}</h4>
          <address className="footer-address" style={{ whiteSpace: 'pre-line' }}>
            Bejoice Group{'\n'}{t.footerAddress}
          </address>
          <div className="footer-links-list">
            <a href="tel:+966550000000" className="footer-link">+966 55 000 0000</a>
            <a href="https://wa.me/966550000000?text=Hello%2C+I+need+a+freight+quote" target="_blank" rel="noopener noreferrer" className="footer-link footer-link-wa">{t.footerWhatsapp}</a>
            <a href="mailto:info@bejoice.com" className="footer-link">info@bejoice.com</a>
          </div>
        </div>
        <div className="footer-nav">
          <h4 className="footer-col-title">{t.footerServicesTitle}</h4>
          <div className="footer-links-list">
            {t.footerServices.map(s => (
              <span key={s} className="footer-link footer-link-plain">{s}</span>
            ))}
          </div>
        </div>
        <div className="footer-nav">
          <h4 className="footer-col-title">{t.footerCompanyTitle}</h4>
          <div className="footer-links-list">
            {t.footerCompany.map(s => (
              <span key={s} className="footer-link footer-link-plain">{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t.footerCopyright}</span>
        <span>{t.footerCompliance}</span>
      </div>
    </footer>
  );
}

// ============================================
// WHATSAPP BUTTON — fixed floating
// ============================================
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/966550000000?text=Hello%2C+I+need+a+freight+quote"
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="Chat on WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    </a>
  );
}

// ============================================
// PROGRESS BAR
// ============================================
function ProgressBar() {
  const fillRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current) return;
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.width = `${self.progress * 100}%`;
      },
    });
  }, []);

  return (
    <div className="progress-bar-track">
      <div ref={fillRef} className="progress-bar-fill" />
    </div>
  );
}

// ============================================
// ACT INDICATOR — floating pill
// ============================================
function ActIndicator({ currentAct }) {
  const ref     = useRef(null);
  const prevAct = useRef(currentAct);

  useEffect(() => {
    if (!ref.current || prevAct.current === currentAct) return;
    prevAct.current = currentAct;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)' }
    );
    const hide = setTimeout(() => {
      gsap.to(ref.current, { opacity: 0, y: -6, duration: 0.4, ease: 'power2.in' });
    }, 2400);
    return () => clearTimeout(hide);
  }, [currentAct]);

  return (
    <div
      ref={ref}
      className="act-indicator"
      style={{
        position: 'fixed',
        bottom: '2.8rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        opacity: 0,
        pointerEvents: 'none',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.6rem',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: 'rgba(200,168,78,0.85)',
        background: 'rgba(5,5,8,0.55)',
        border: '1px solid rgba(200,168,78,0.18)',
        borderRadius: '2rem',
        padding: '0.38rem 1.1rem',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        whiteSpace: 'nowrap',
      }}
    >
      {currentAct === 1 ? 'Act I — Globe to Sea' : 'Act II — Sea to Flight'}
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const canvasRef          = useRef(null);
  const imagesRef          = useRef([]);
  const frameObjRef        = useRef({ frame: 0 });
  const toolsSectionRef    = useRef(null);
  const quoteSectionRef    = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [currentAct, setCurrentAct]     = useState(1);
  const [lang, setLang]                 = useState('en');
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'ar' : 'en';
      document.documentElement.lang = next;
      document.documentElement.dir  = next === 'ar' ? 'rtl' : 'ltr';
      return next;
    });
  }, []);

  const scrollToTools = useCallback(() => {
    toolsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const scrollToQuote = useCallback(() => {
    quoteSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── DRAW FRAME ──────────────────────────────────────────────────────────────
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Smooth mouse/gyro parallax
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

    // Gentle ambient drift
    const dpr    = window.devicePixelRatio || 1;
    const t      = performance.now() / 1000;
    const driftX = (Math.sin(t * 0.17) * 4 + Math.sin(t * 0.08) * 2) * dpr;
    const driftY = (Math.cos(t * 0.13) * 3 + Math.cos(t * 0.09) * 1) * dpr;

    // Portrait → contain; landscape → cover
    const isPortrait = ch > cw;
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, cw, ch);

    const scale = isPortrait
      ? Math.min(cw / iw, ch / ih)
      : Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    const bleedX = Math.max((dw - cw) / 2, 0);
    const bleedY = Math.max((dh - ch) / 2, 0);
    const rawPx  = isPortrait ? 0 : mouseRef.current.x * 12 * dpr + driftX;
    const rawPy  = isPortrait ? 0 : mouseRef.current.y *  8 * dpr + driftY;
    const px     = Math.max(-bleedX, Math.min(bleedX, rawPx));
    const py     = Math.max(-bleedY, Math.min(bleedY, rawPy));

    const dx  = Math.round((cw - dw) / 2 + px);
    const dy  = Math.round((ch - dh) / 2 + py);
    const ddw = Math.round(dw);
    const ddh = Math.round(dh);

    ctx.drawImage(img, dx, dy, ddw, ddh);

    // Vignette overlay
    const vigCx    = cw / 2;
    const vigCy    = ch / 2;
    const vigInner = isPortrait ? Math.min(dw, dh) * 0.08 : ch * 0.10;
    const vigOuter = isPortrait ? Math.max(dw, dh) * 0.72 : Math.max(cw, ch) * 0.82;
    const vig = ctx.createRadialGradient(vigCx, vigCy, vigInner, vigCx, vigCy, vigOuter);
    vig.addColorStop(0,    'rgba(0,0,0,0)');
    vig.addColorStop(0.45, 'rgba(0,0,0,0)');
    vig.addColorStop(0.74, 'rgba(0,0,0,0.18)');
    vig.addColorStop(1,    'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);
  }, []);

  // ── MOUSE & GYROSCOPE PARALLAX ──────────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = -nx;
      mouseRef.current.targetY = -ny;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onOrientation = (e) => {
      const nx = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      const ny = Math.max(-1, Math.min(1, ((e.beta || 0) - 20) / 40));
      mouseRef.current.targetX = -nx;
      mouseRef.current.targetY = -ny;
    };
    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.addEventListener('click', () => {
          DeviceOrientationEvent.requestPermission()
            .then(s => s === 'granted' && window.addEventListener('deviceorientation', onOrientation))
            .catch(() => {});
        }, { once: true });
      } else {
        window.addEventListener('deviceorientation', onOrientation);
      }
    }

    // RAF loop for ambient drift
    let active = true;
    const loop = () => {
      if (!active) return;
      drawFrame(Math.round(frameObjRef.current.frame));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      active = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [drawFrame]);

  // ── RESIZE CANVAS ───────────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = Math.round(window.innerWidth  * dpr);
    const h   = Math.round(window.innerHeight * dpr);
    canvas.width        = w;
    canvas.height       = h;
    canvas.style.width  = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawFrame(Math.round(frameObjRef.current.frame));
  }, [drawFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // ── PRELOAD ALL 400 FRAMES ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const images = new Array(TOTAL_FRAMES).fill(null);
    imagesRef.current = images;

    // Phase 1: load first 20 frames (critical path — shown immediately)
    const CRITICAL = 20;
    let critLoaded = 0;
    let totalLoaded = 0;

    const onCritLoad = () => {
      if (cancelled) return;
      critLoaded++;
      totalLoaded++;
      setLoadProgress((totalLoaded / TOTAL_FRAMES) * 100);
      if (critLoaded === CRITICAL) {
        // Site is usable — show it and keep loading the rest in background
        setIsLoaded(true);
        loadRest();
      }
    };

    const loadRest = () => {
      for (let i = CRITICAL; i < TOTAL_FRAMES; i++) {
        if (cancelled) return;
        const img = new Image();
        img.onload = img.onerror = () => {
          if (cancelled) return;
          totalLoaded++;
          setLoadProgress((totalLoaded / TOTAL_FRAMES) * 100);
        };
        img.src = FRAME_URL(i);
        images[i] = img;
      }
    };

    for (let i = 0; i < CRITICAL; i++) {
      const img = new Image();
      img.onload  = onCritLoad;
      img.onerror = onCritLoad;
      img.src = FRAME_URL(i);
      images[i] = img;
    }

    return () => { cancelled = true; };
  }, []);

  // ── GSAP SCROLL ANIMATION ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    drawFrame(0);

    const trigger = ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const newFrame = Math.round(self.progress * (TOTAL_FRAMES - 1));
        if (newFrame !== Math.round(frameObjRef.current.frame)) {
          frameObjRef.current.frame = newFrame;
          drawFrame(newFrame);
          setCurrentAct(newFrame < GLOBE_SEA_FRAMES ? 1 : 2);
        }
      },
    });

    return () => trigger.kill();
  }, [isLoaded, drawFrame]);

  // ── DRAW INITIAL FRAME ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && canvasRef.current) {
      const timer = setTimeout(() => { handleResize(); drawFrame(0); }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, handleResize, drawFrame]);

  // ── LENIS SMOOTH SCROLL ──────────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return () => lenis.destroy();
  }, []);

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <>
      <LoadingScreen progress={loadProgress} isLoaded={isLoaded} />

      {/* Fixed canvas — all frames paint here */}
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

      <Header onToolsClick={scrollToTools} onQuoteClick={scrollToQuote} lang={lang} toggleLang={toggleLang} />
      <ActIndicator currentAct={currentAct} />

      <div id="scroll-container" className="relative z-10">
        {/* Opening spacer — minimal so hero text is visible from the start */}
        <div style={{ height: '5vh' }} />

        {/* Act 1 chapters */}
        {CHAPTERS.filter(c => c.frameStart < GLOBE_SEA_FRAMES).map(chapter => (
          <ChapterSection key={chapter.id} chapter={chapter} lang={lang} />
        ))}

        {/* Act transition divider */}
        <ActDivider
          label="Transition — Sea to Sky"
          title={TRANSLATIONS[lang].actDividerTitle}
        />

        {/* Act 2 chapters */}
        {CHAPTERS.filter(c => c.frameStart >= GLOBE_SEA_FRAMES).map(chapter => (
          <ChapterSection key={chapter.id} chapter={chapter} lang={lang} />
        ))}

        {/* Closing spacer */}
        <div style={{ height: '40vh' }} />
      </div>

      {/* Post-scroll sections — normal page flow */}
      <TrustStrip lang={lang} />
      <SaudiSection lang={lang} />
      <RouteMap lang={lang} />
      <HowItWorks lang={lang} />

      {/* Quick Quote section */}
      <QuickQuoteSection sectionRef={quoteSectionRef} />

      <CaseStudies lang={lang} />
      <ClientLogos lang={lang} />

      {/* Tools section — below scroll, normal page flow */}
      <ToolsSection sectionRef={toolsSectionRef} lang={lang} />

      <SiteFooter lang={lang} />
      <WhatsAppButton />
      <ProgressBar />
    </>
  );
}

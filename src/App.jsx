import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { useCalBooking } from './hooks/useCalBooking';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// ── Count-up hook — animates a number from 0 to target on viewport entry ─────
function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [value, ref];
}

// ============================================
// CONSTANTS — three-source combined sequence
//   frames-hero/ : 300 frames  (global index   0–299)  — ship / ocean hero
//   frames-new/  : 176 frames  (global index 300–475)  — port, customs, CTA
//   frames-mid/  :  76 frames  (global index 476–551)  — transition into air
// ============================================
const HERO_FRAMES  = 300;
const NEW_FRAMES   = 176;
const MID_FRAMES   =  76;
const TOTAL_FRAMES = HERO_FRAMES + NEW_FRAMES + MID_FRAMES; // 552

const FRAME_URL = (i) => {
  if (i < HERO_FRAMES) {
    const n = (i + 1).toString().padStart(3, '0');
    return `/frames-hero/ezgif-frame-${n}.jpg`;
  }
  if (i < HERO_FRAMES + NEW_FRAMES) {
    const n = (i - HERO_FRAMES + 1).toString().padStart(3, '0');
    return `/frames-new/ezgif-frame-${n}.jpg`;
  }
  const n = (i - HERO_FRAMES - NEW_FRAMES + 1).toString().padStart(3, '0');
  return `/frames-mid/ezgif-frame-${n}.jpg`;
};

// ── 6 chapters across 552 frames ─────────────────────────────────────────────
//   0  – 149 : hero     — big ship reveal
// 150  – 299 : maritime — ocean operations
// 300  – 369 : port     — port & customs
// 370  – 430 : air-lead — air freight (frames-new tail)
// 431  – 475 : cta      — one partner CTA (frames-new end)
// 476  – 551 : sky      — mid transition into air (frames-mid, smooth bridge)
const CHAPTERS = [
  {
    id: 'hero',
    label: 'BEJOICE AI ENGINE',
    titleLines: ['Activate AI Optimized Shipping.'],
    body: "Wars, storms, port strikes — none of it stops your cargo. Our AI predicts every disruption, reroutes in seconds, and delivers at the lowest cost. Every time.",
    frameStart: 0,
    frameEnd: 149,
    align: 'left',
    isHero: true,
    hasHeroForm: true,
  },
  {
    id: 'maritime',
    label: 'AI SEA INTELLIGENCE',
    titleLines: ['Dynamic Routes.', 'Zero Halts.'],
    body: 'Red Sea closed? AI finds the next best lane in 4 minutes. FCL · LCL · Reefer — every route optimized for cost and speed, even mid-voyage.',
    frameStart: 150,
    frameEnd: 299,
    align: 'right',
  },
  {
    id: 'port',
    label: 'INSTANT CLEARANCE AI',
    titleLines: ['Hours Not Days.', 'Zero Delays.'],
    body: 'Direct ZATCA digital integration. AI pre-classifies your HS codes, predicts duty rates, and clears your cargo before the vessel berths.',
    frameStart: 300,
    frameEnd: 430,
    align: 'left',
  },
  {
    id: 'air',
    label: 'PRECISION AIR AI',
    titleLines: ['Wheels Up.', 'On Your Terms.'],
    body: 'AI books the best uplift to RUH · JED · DMM based on live cargo space, fuel price, and weather — cutting air freight cost by up to 22%.',
    frameStart: 431,
    frameEnd: 513,
    align: 'right',
  },
  {
    id: 'cta',
    label: 'YOUR CHOICE',
    titleLines: ['One Partner.', 'Zero Risk.'],
    body: 'Every competitor uses the same old routes. We use AI to find you a better one — cheaper, faster, and immune to global disruption. Ready?',
    frameStart: 514,
    frameEnd: 551,
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
    navQuote: 'AI-Powered Quote',
    navTools: 'Route Intelligence',
    navContact: 'Talk to AI Expert',

    // Hero form
    heroFormOrigin: 'Origin (Global Hub)',
    heroFormDest: 'Destination (Saudi Port)',
    heroFormWeight: 'Cargo Weight (kg)',
    heroFormEmail: 'Business Email',
    heroFormBtn: 'Get AI-Optimized Quote — 15 min',
    heroFormPhone: 'Emergency Route Hotline',

    // Trust strip
    trustISO: 'ISO 9001:2015 — Certified AI-Grade Operations',
    trustCustoms: 'ZATCA Digital Integration — Hours, Not Days',
    trustCarriers: 'AI Carrier Selection — Maersk · MSC · Emirates SkyCargo',
    trustInsurance: '100% Cargo Coverage — Zero Exceptions, Zero Surprises',

    // Saudi section
    saudiLabel: 'The AI Advantage',
    saudiHeadline: 'Your Supply Chain,',
    saudiHeadlineAccent: 'Never Stops.',
    saudiBullets: [
      'AI detects disruptions before they happen — war, storms, port closures',
      'Dynamic re-routing activates in seconds, not days, protecting your ROI',
      'ZATCA digital integration delivers clearance in hours, not days',
      'Predictive cost engine finds the lowest-cost route in real time, every time',
    ],
    saudiStat1Label: 'Business Continuity Rate',
    saudiStat2Label: 'Average Cost Reduction via AI',
    saudiStat3Label: 'Crisis-Rerouted Shipments',

    // Route map
    routeLabel: 'AI Route Intelligence',
    routeTitle: 'Every Disruption',
    routeTitleAccent: 'Has a Detour.',

    // How it works
    hiwLabel: 'The Bejoice AI Engine',
    hiwTitle: 'How We Never Stop',
    hiwSteps: [
      { num: '01', icon: '🧠', title: 'Predict — Before It Hits', desc: 'Our AI monitors 200+ live data feeds — weather, geopolitics, port congestion — and flags risks before they become delays.' },
      { num: '02', icon: '⚡', title: 'Re-Route — In Seconds', desc: 'The moment a threat is detected, AI instantly engineers the next best route — cheaper, faster, and fully compliant.' },
      { num: '03', icon: '📡', title: 'Deliver — With Full Visibility', desc: 'Live satellite tracking, AI-generated ETAs, and proactive alerts keep you in control from origin to door.' },
    ],

    // Case studies
    casesLabel: 'AI in Action',
    casesTitle: 'Real Crises.',
    casesTitleAccent: 'Zero Disruption.',
    cases: [
      { tag: 'Red Sea Crisis Re-Route', cargo: 'Automotive Parts', route: 'Europe → Jeddah', days: '21 days', detail: 'AI rerouted via Cape of Good Hope in 4 min · 18% fuel saving · FCL 40ft', color: 'rgba(0,180,255,0.12)' },
      { tag: 'Port Congestion Bypass', cargo: 'Energy Infrastructure', route: 'China → Dammam', days: '23 days', detail: 'AI switched to transhipment hub · ZATCA cleared in 3 hrs · zero demurrage', color: 'rgba(100,255,140,0.1)' },
      { tag: 'Critical Uplift — 36hrs', cargo: 'Medical Equipment', route: 'AMS → Riyadh', days: '36 hrs', detail: 'AI booked direct RUH uplift · cold-chain maintained · zero friction clearance', color: 'rgba(255,100,255,0.1)' },
    ],

    // Client logos
    logosLabel: 'Trusted Carrier Network',

    // Tracking widget
    trackTitle: 'Live AI Shipment Intelligence',
    trackPlaceholder: 'Enter BL / AWB / Tracking Reference',
    trackBtn: 'Track Now',
    trackToast: 'AI is syncing satellite + carrier data... Live status in 30 seconds.',

    // Footer
    footerTagline: 'Wars end. Storms pass. Your supply chain never stops.\nAI-powered logistics for an unpredictable world.',
    footerContactTitle: 'Crisis & AI Sales Support',
    footerServicesTitle: 'AI-Powered Services',
    footerCompanyTitle: 'The Group',
    footerAddress: 'King Fahd Road, Al Olaya\nRiyadh, KSA 11523',
    footerWhatsapp: 'Chat with Layla — AI Assistant',
    footerServices: ['AI Sea Freight', 'Sky Corridors', 'GCC Land Bridge', 'ZATCA Automation', 'Heavy & Project Cargo'],
    footerCompany: ['Our AI Philosophy', 'Global Compliance', 'Impact Stories', 'Privacy Policy'],
    footerCopyright: `© ${new Date().getFullYear()} Bejoice Group. Powered by AI. Built for Saudi Arabia.`,
    footerCompliance: 'ZATCA Compliant · ISO 9001 Certified · FIATA Member · Vision 2030 Partner',

    actDividerTitle: 'When Others Stall,\nWe Re-Route.',
    actDividerTitle2: 'Ground Level.\nAI Precision.',

    // Chapters
    chapters: {
      hero:     { label: 'BEJOICE AI ENGINE',  titleLines: ['Activate AI Optimized Shipping.'],    body: "Wars, storms, port strikes — none of it stops your cargo. Our AI predicts every disruption, reroutes in seconds, and delivers at the lowest cost. Every time." },
      maritime: { label: 'AI SEA INTELLIGENCE',  titleLines: ['Dynamic Routes.', 'Zero Halts.'], body: 'Red Sea closed? AI finds the next best lane in 4 minutes. FCL · LCL · Reefer — every route optimized for cost and speed, even mid-voyage.' },
      port:     { label: 'INSTANT CLEARANCE AI', titleLines: ['Hours Not Days.', 'Zero Delays.'],  body: 'Direct ZATCA digital integration. AI pre-classifies your HS codes, predicts duty rates, and clears your cargo before the vessel berths.' },
      air:      { label: 'PRECISION AIR AI',    titleLines: ['Wheels Up.', 'On Your Terms.'],       body: 'AI books the best uplift to RUH · JED · DMM based on live cargo space, fuel price, and weather — cutting air freight cost by up to 22%.' },
      cta:      { label: 'YOUR CHOICE',    titleLines: ['One Partner.', 'Zero Risk.'],  body: 'Every competitor uses the same old routes. We use AI to find you a better one — cheaper, faster, and immune to global disruption. Ready?' },
    },

    // CTA
    ctaButton: 'Activate AI Optimized Shipping',
    ctaSub: 'Sea · Air · Land · Customs — All AI-Powered · Free Quote in 15 Min',
  },

  ar: {
    // Header
    navQuote: 'سعر مدعوم بالذكاء الاصطناعي',
    navTools: 'ذكاء المسارات',
    navContact: 'تحدث مع خبير الذكاء',

    // Hero form
    heroFormOrigin: 'مصدر الشحنة (مركز عالمي)',
    heroFormDest: 'الوجهة (ميناء سعودي)',
    heroFormWeight: 'وزن البضاعة (كغ)',
    heroFormEmail: 'البريد الإلكتروني للعمل',
    heroFormBtn: 'احصل على سعر محسّن بالذكاء — خلال 15 دقيقة',
    heroFormPhone: 'خط الطوارئ للمسارات البديلة',

    // Trust strip
    trustISO: 'ISO 9001:2015 — عمليات معتمدة بمستوى ذكاء اصطناعي',
    trustCustoms: 'تكامل رقمي مع زاتكا — ساعات لا أيام',
    trustCarriers: 'اختيار الناقل بالذكاء الاصطناعي — ميرسك · MSC · طيران الإمارات',
    trustInsurance: 'تغطية شاملة 100% — صفر استثناءات، صفر مفاجآت',

    // Saudi section
    saudiLabel: 'ميزة الذكاء الاصطناعي',
    saudiHeadline: 'سلسلة توريدك',
    saudiHeadlineAccent: 'لا تتوقف أبداً.',
    saudiBullets: [
      'الذكاء الاصطناعي يرصد الاضطرابات قبل وقوعها — حروب، عواصف، إغلاق موانئ',
      'إعادة التوجيه الديناميكي تنشط خلال ثوانٍ، لا أيام، لحماية عائد استثمارك',
      'التكامل الرقمي مع زاتكا يُنجز التخليص في ساعات، لا أيام',
      'محرك التكلفة التنبؤي يجد أرخص مسار في الوقت الفعلي، في كل مرة',
    ],
    saudiStat1Label: 'معدل استمرارية الأعمال',
    saudiStat2Label: 'متوسط خفض التكلفة بالذكاء',
    saudiStat3Label: 'شحنات تم إعادة توجيهها في أزمات',

    // Route map
    routeLabel: 'ذكاء المسارات بالذكاء الاصطناعي',
    routeTitle: 'كل اضطراب',
    routeTitleAccent: 'له مسار بديل.',

    // How it works
    hiwLabel: 'محرك الذكاء الاصطناعي من بيجويس',
    hiwTitle: 'كيف لا نتوقف أبداً',
    hiwSteps: [
      { num: '01', icon: '🧠', title: 'تنبؤ — قبل أن يحدث', desc: 'يراقب ذكاؤنا الاصطناعي أكثر من 200 مصدر بيانات مباشر — طقس، جيوسياسة، ازدحام موانئ — ويحدد المخاطر قبل أن تصبح تأخيرات.' },
      { num: '02', icon: '⚡', title: 'إعادة توجيه — في ثوانٍ', desc: 'بمجرد رصد أي تهديد، يُصمم الذكاء الاصطناعي فوراً أفضل مسار بديل — أرخص وأسرع وممتثل تماماً للوائح.' },
      { num: '03', icon: '📡', title: 'تسليم — بشفافية كاملة', desc: 'تتبع لحظي بالأقمار الصناعية، ومواعيد تسليم محسوبة بالذكاء، وتنبيهات استباقية تُبقيك في السيطرة من المصدر حتى الباب.' },
    ],

    // Case studies
    casesLabel: 'الذكاء الاصطناعي في الميدان',
    casesTitle: 'أزمات حقيقية.',
    casesTitleAccent: 'صفر توقف.',
    cases: [
      { tag: 'إعادة توجيه — أزمة البحر الأحمر', cargo: 'قطع غيار سيارات', route: 'أوروبا ← جدة', days: '21 يوم', detail: 'الذكاء أعاد التوجيه عبر رأس الرجاء في 4 دقائق · توفير 18% في الوقود · FCL 40ft', color: 'rgba(0,180,255,0.12)' },
      { tag: 'تجاوز ازدحام الميناء', cargo: 'بنية تحتية طاقة', route: 'الصين ← الدمام', days: '23 يوم', detail: 'الذكاء حوّل لمحطة إعادة شحن · تخليص زاتكا في 3 ساعات · صفر غرامات تأخير', color: 'rgba(100,255,140,0.1)' },
      { tag: 'رحلة طارئة — 36 ساعة', cargo: 'أجهزة طبية', route: 'أمستردام ← الرياض', days: '36 ساعة', detail: 'الذكاء حجز رحلة مباشرة RUH · سلسلة برودة محمية · تخليص بدون احتكاك', color: 'rgba(255,100,255,0.1)' },
    ],

    // Client logos
    logosLabel: 'شبكة الناقلين الموثوقة',

    // Tracking widget
    trackTitle: 'استخبارات الشحنات المباشرة بالذكاء',
    trackPlaceholder: 'أدخل رقم البوليصة / AWB / مرجع التتبع',
    trackBtn: 'تتبع الآن',
    trackToast: 'الذكاء الاصطناعي يزامن بيانات الأقمار والناقلين... الحالة المباشرة خلال 30 ثانية.',

    // Footer
    footerTagline: 'الحروب تنتهي. العواصف تمر. سلسلة توريدك لا تتوقف أبداً.\nلوجستيات مدعومة بالذكاء لعالم غير متوقع.',
    footerContactTitle: 'دعم الأزمات والمبيعات الذكية',
    footerServicesTitle: 'خدمات مدعومة بالذكاء',
    footerCompanyTitle: 'المجموعة',
    footerAddress: 'طريق الملك فهد، العليا\nالرياض، المملكة العربية السعودية 11523',
    footerWhatsapp: 'تحدث مع لايلى — المساعدة الذكية',
    footerServices: ['شحن بحري ذكي', 'ممرات جوية', 'الجسر البري الخليجي', 'أتمتة زاتكا', 'البضائع الثقيلة والمشاريع'],
    footerCompany: ['فلسفتنا في الذكاء', 'الامتثال العالمي', 'قصص النجاح', 'سياسة الخصوصية'],
    footerCopyright: `© ${new Date().getFullYear()} مجموعة بيجويس. مدعومة بالذكاء. مبنية للمملكة العربية السعودية.`,
    footerCompliance: 'متوافق مع زاتكا · معتمد ISO 9001 · عضو FIATA · شريك رؤية 2030',

    actDividerTitle: 'عندما يتوقف الآخرون،\nنحن نُعيد التوجيه.',
    actDividerTitle2: 'مستوى الأرض.\nدقة الذكاء الاصطناعي.',

    // Chapters
    chapters: {
      hero:     { label: 'محرك بيجويس الذكي',  titleLines: ['لا توقف.', 'لا تنازل.'],    body: "حروب، عواصف، إضرابات موانئ — لا شيء يوقف شحنتك. ذكاؤنا الاصطناعي يتنبأ بكل اضطراب، ويُعيد التوجيه في ثوانٍ، ويُسلّم بأقل تكلفة. في كل مرة." },
      maritime: { label: 'ذكاء البحر المتكيف',  titleLines: ['مسارات ديناميكية.', 'صفر توقف.'], body: 'البحر الأحمر مغلق؟ الذكاء يجد أفضل مسار بديل في 4 دقائق. FCL · LCL · ريفر — كل مسار محسّن للتكلفة والسرعة، حتى في منتصف الرحلة.' },
      port:     { label: 'ذكاء التخليص الفوري', titleLines: ['ساعات لا أيام.', 'صفر تأخير.'],  body: 'تكامل رقمي مباشر مع زاتكا. الذكاء يُصنف رموز HS مسبقاً، يتنبأ برسوم الجمارك، ويُخلّص بضاعتك قبل أن ترسو السفينة.' },
      air:      { label: 'دقة الجسر الجوي الذكي',    titleLines: ['جاهز للإقلاع.', 'بشروطك.'],       body: 'الذكاء يحجز أفضل رحلة إلى RUH · JED · DMM بناءً على المساحة المتاحة وأسعار الوقود والطقس — يخفّض تكلفة الشحن الجوي حتى 22%.' },
      cta:      { label: 'قرارك الآن',    titleLines: ['شريك واحد.', 'صفر مخاطر.'],  body: 'كل منافس يستخدم نفس المسارات القديمة. نحن نستخدم الذكاء الاصطناعي لإيجاد مسار أفضل لك — أرخص، أسرع، ومحصّن ضد الاضطرابات العالمية. مستعد؟' },
    },

    // CTA
    ctaButton: 'ابدأ شحنتك المدعومة بالذكاء الآن',
    ctaSub: 'بحري · جوي · بري · جمارك — بالذكاء · سعر مجاني خلال 15 دقيقة',
  },
};

// ============================================
// LOADING SCREEN — Apple minimal
// ============================================
function LoadingScreen({ progress, isLoaded, onDone }) {
  const screenRef = useRef(null);

  useEffect(() => {
    if (isLoaded && screenRef.current) {
      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0,
        onComplete: () => {
          onDone?.();
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
  const [wingsSrc, setWingsSrc] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // Remove dark navy/black background pixels; keep bright wing pixels
        const brightness = (r + g + b) / 3;
        if (brightness < 160) {
          // Fully transparent below 100; soft fade 100–160 to avoid fringing on wing edges
          const alpha = brightness < 100 ? 0 : Math.round(((brightness - 100) / 60) * d[i + 3]);
          d[i + 3] = alpha;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setWingsSrc(canvas.toDataURL('image/png'));
    };
    img.src = '/bejoice_logo.png';
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, lineHeight: 1, background: 'transparent' }}>

      {/* ── WINGS — background removed via canvas pixel processing ── */}
      <div style={{ overflow: 'hidden', height: '52px', background: 'transparent' }}>
        {wingsSrc && (
          <img
            src={wingsSrc}
            alt=""
            aria-hidden="true"
            style={{
              height: '78px',
              width: 'auto',
              display: 'block',
              imageRendering: '-webkit-optimize-contrast',
              filter: 'drop-shadow(0 0 10px rgba(200,168,78,0.4))',
              transform: 'translateZ(0)',
            }}
          />
        )}
      </div>

      {/* ── BEJOICE ── */}
      <span style={{
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '900',
        letterSpacing: '8px',
        fontFamily: "'Bebas Neue', sans-serif",
        lineHeight: 1,
        marginTop: '8px',
        textShadow: [
          '0 1px 0 rgba(0,0,0,0.8)',
          '0 0 12px rgba(255,255,255,0.4)',
          '0 0 28px rgba(200,168,78,0.6)',
        ].join(', '),
      }}>
        BEJOICE
      </span>

      {/* ── GROUP OF COMPANIES ── */}
      <span style={{
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '4px',
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1,
        marginTop: '5px',
        textTransform: 'uppercase',
        textShadow: [
          '0 0 8px rgba(255,255,255,0.6)',
          '0 1px 0 rgba(0,0,0,0.9)',
        ].join(', '),
      }}>
        GROUP OF COMPANIES
      </span>

    </div>
  );
}

// ============================================
// LOAD CALCULATOR — Sea / Air / Land / Warehouse
// ============================================
function LoadCalculator({ lang }) {
  const ar = lang === 'ar';
  const [tab, setTab] = useState('sea');
  const [results, setResults] = useState(null);

  // ── Sea ──
  const [seaRows, setSeaRows] = useState([{ l: '', w: '', h: '', qty: '1', unit: 'cm' }]);
  const [seaWeight, setSeaWeight] = useState('');

  // ── Air ──
  const [airL, setAirL] = useState(''); const [airW, setAirW] = useState('');
  const [airH, setAirH] = useState(''); const [airQty, setAirQty] = useState('1');
  const [airActual, setAirActual] = useState('');

  // ── Land ──
  const [landRows, setLandRows] = useState([{ l: '', w: '', h: '', qty: '1', weight: '' }]);
  const [truckType, setTruckType] = useState('20t');

  // ── Warehouse ──
  const [whL, setWhL] = useState(''); const [whW, setWhW] = useState('');
  const [whH, setWhH] = useState(''); const [whQty, setWhQty] = useState('1');
  const [whDays, setWhDays] = useState('30');

  const TRUCK_CAP = { '3.5t': { vol: 18, wt: 3500 }, '10t': { vol: 40, wt: 10000 }, '20t': { vol: 80, wt: 20000 }, '40t': { vol: 120, wt: 40000 } };
  const CONTAINER = (cbm) => cbm <= 25 ? '20ft (≤25 CBM)' : cbm <= 67 ? '40ft Std (≤67 CBM)' : '40ft HC (≤76 CBM)';

  const calculate = () => {
    if (tab === 'sea') {
      let totalCBM = 0, totalKg = parseFloat(seaWeight) || 0;
      for (const r of seaRows) {
        const div = r.unit === 'cm' ? 1e6 : 1;
        totalCBM += ((parseFloat(r.l)||0)*(parseFloat(r.w)||0)*(parseFloat(r.h)||0)/div) * (parseInt(r.qty)||1);
      }
      setResults({ tab: 'sea', cbm: totalCBM.toFixed(3), weight: totalKg, container: CONTAINER(totalCBM), loadPct: Math.min(100, (totalCBM/76*100)).toFixed(1) });
    } else if (tab === 'air') {
      const vol = ((parseFloat(airL)||0)*(parseFloat(airW)||0)*(parseFloat(airH)||0)/5000) * (parseInt(airQty)||1);
      const act = (parseFloat(airActual)||0) * (parseInt(airQty)||1);
      const chargeable = Math.max(vol, act);
      setResults({ tab: 'air', volWeight: vol.toFixed(2), actWeight: act.toFixed(2), chargeable: chargeable.toFixed(2), basis: chargeable === vol ? 'Volumetric' : 'Actual' });
    } else if (tab === 'land') {
      let totalVol = 0, totalKg = 0;
      for (const r of landRows) {
        const q = parseInt(r.qty)||1;
        totalVol += ((parseFloat(r.l)||0)*(parseFloat(r.w)||0)*(parseFloat(r.h)||0)/1e6)*q;
        totalKg  += (parseFloat(r.weight)||0)*q;
      }
      const cap = TRUCK_CAP[truckType];
      setResults({ tab: 'land', vol: totalVol.toFixed(3), weight: totalKg.toFixed(0), truck: truckType, volPct: Math.min(100,(totalVol/cap.vol*100)).toFixed(1), wtPct: Math.min(100,(totalKg/cap.wt*100)).toFixed(1) });
    } else {
      const cbm = ((parseFloat(whL)||0)*(parseFloat(whW)||0)*(parseFloat(whH)||0)/1e6)*(parseInt(whQty)||1);
      const days = parseFloat(whDays)||1;
      const cost = (cbm * days * 0.35).toFixed(2);
      setResults({ tab: 'warehouse', cbm: cbm.toFixed(3), days, cost });
    }
  };

  const exportCSV = () => {
    if (!results) return;
    const rows = [['Field', 'Value']];
    Object.entries(results).forEach(([k, v]) => k !== 'tab' && rows.push([k, v]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `bejoice-${results.tab}-calc.csv`; a.click();
  };

  const exportPDF = () => {
    if (!results) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Bejoice Load Calc</title><style>body{font-family:sans-serif;padding:2rem;color:#111}h2{color:#c8a84e}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style></head><body><h2>Bejoice Group — Load Calculation</h2><p>${new Date().toLocaleString()}</p><table><tr><th>Field</th><th>Value</th></tr>${Object.entries(results).filter(([k])=>k!=='tab').map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></body></html>`);
    w.document.close(); w.print();
  };

  const inp = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'0.4rem', padding:'0.5rem 0.7rem', color:'#fff', fontFamily:"'Inter',sans-serif", fontSize:'0.82rem', outline:'none', width:'100%' };
  const lbl = { fontFamily:"'Inter',sans-serif", fontSize:'0.58rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', display:'block', marginBottom:'0.3rem' };

  const tabs = [
    { id:'sea',  icon:'🚢', label: ar?'بحري':'Sea' },
    { id:'air',  icon:'✈️', label: ar?'جوي':'Air' },
    { id:'land', icon:'🚛', label: ar?'بري':'Land' },
    { id:'warehouse', icon:'🏭', label: ar?'مستودع':'Warehouse' },
  ];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.4rem', padding:'1rem 1.2rem 0', flexShrink:0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResults(null); }}
            style={{ flex:1, padding:'0.55rem 0.3rem', background: tab===t.id?'#c8a84e':'rgba(255,255,255,0.05)', border:'1px solid', borderColor: tab===t.id?'#c8a84e':'rgba(255,255,255,0.1)', borderRadius:'0.5rem', color: tab===t.id?'#0a0a0f':'rgba(255,255,255,0.65)', fontFamily:"'Inter',sans-serif", fontSize:'0.65rem', fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', transition:'all 0.2s' }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.2rem' }}>
        {/* ── SEA ── */}
        {tab==='sea' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {seaRows.map((r, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.6fr 0.6fr auto', gap:'0.4rem', alignItems:'end' }}>
                {['l','w','h'].map(f => (
                  <div key={f}><label style={lbl}>{f.toUpperCase()} (cm)</label>
                    <input style={inp} type="number" value={r[f]} onChange={e=>setSeaRows(rows=>rows.map((row,idx)=>idx===i?{...row,[f]:e.target.value}:row))} placeholder="0"/></div>
                ))}
                <div><label style={lbl}>{ar?'كمية':'Qty'}</label><input style={inp} type="number" value={r.qty} onChange={e=>setSeaRows(rows=>rows.map((row,idx)=>idx===i?{...row,qty:e.target.value}:row))}/></div>
                <div><label style={lbl}>Unit</label>
                  <select style={{...inp,padding:'0.45rem'}} value={r.unit} onChange={e=>setSeaRows(rows=>rows.map((row,idx)=>idx===i?{...row,unit:e.target.value}:row))}>
                    <option value="cm">cm</option><option value="m">m</option>
                  </select>
                </div>
                {seaRows.length>1&&<button onClick={()=>setSeaRows(r=>r.filter((_,idx)=>idx!==i))} style={{background:'rgba(255,50,50,0.15)',border:'none',borderRadius:'0.3rem',color:'rgba(255,100,100,0.8)',cursor:'pointer',padding:'0.45rem 0.6rem',alignSelf:'flex-end'}}>✕</button>}
              </div>
            ))}
            <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
              <button onClick={()=>setSeaRows(r=>[...r,{l:'',w:'',h:'',qty:'1',unit:'cm'}])} style={{background:'rgba(200,168,78,0.1)',border:'1px solid rgba(200,168,78,0.25)',borderRadius:'0.4rem',color:'#c8a84e',cursor:'pointer',padding:'0.4rem 0.8rem',fontFamily:"'Inter',sans-serif",fontSize:'0.7rem'}}>+ {ar?'إضافة صف':'Add Row'}</button>
              <div style={{flex:1}}><label style={lbl}>{ar?'الوزن الكلي (كغ)':'Total Weight (kg)'}</label><input style={inp} type="number" value={seaWeight} onChange={e=>setSeaWeight(e.target.value)} placeholder="0"/></div>
            </div>
          </div>
        )}

        {/* ── AIR ── */}
        {tab==='air' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.7fr', gap:'0.5rem' }}>
              {[['airL',setAirL,airL,'L (cm)'],['airW',setAirW,airW,'W (cm)'],['airH',setAirH,airH,'H (cm)'],['airQty',setAirQty,airQty,'Qty']].map(([,setter,val,lbTxt])=>(
                <div key={lbTxt}><label style={lbl}>{lbTxt}</label><input style={inp} type="number" value={val} onChange={e=>setter(e.target.value)} placeholder="0"/></div>
              ))}
            </div>
            <div><label style={lbl}>{ar?'الوزن الفعلي (كغ/قطعة)':'Actual Weight (kg/pc)'}</label><input style={inp} type="number" value={airActual} onChange={e=>setAirActual(e.target.value)} placeholder="0"/></div>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:'0.68rem',color:'rgba(255,255,255,0.35)',margin:0}}>Vol. weight = L×W×H÷5000 per piece</p>
          </div>
        )}

        {/* ── LAND ── */}
        {tab==='land' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            <div><label style={lbl}>{ar?'نوع الشاحنة':'Truck Type'}</label>
              <select style={{...inp,padding:'0.5rem'}} value={truckType} onChange={e=>setTruckType(e.target.value)}>
                <option value="3.5t">3.5t Pickup (18 CBM)</option><option value="10t">10t Truck (40 CBM)</option>
                <option value="20t">20t Truck (80 CBM)</option><option value="40t">40t Semi (120 CBM)</option>
              </select>
            </div>
            {landRows.map((r, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.6fr 0.8fr auto', gap:'0.4rem', alignItems:'end' }}>
                {['l','w','h'].map(f=>(<div key={f}><label style={lbl}>{f.toUpperCase()} (cm)</label><input style={inp} type="number" value={r[f]} onChange={e=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,[f]:e.target.value}:row))} placeholder="0"/></div>))}
                <div><label style={lbl}>Qty</label><input style={inp} type="number" value={r.qty} onChange={e=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,qty:e.target.value}:row))}/></div>
                <div><label style={lbl}>kg/pc</label><input style={inp} type="number" value={r.weight} onChange={e=>setLandRows(rows=>rows.map((row,idx)=>idx===i?{...row,weight:e.target.value}:row))}/></div>
                {landRows.length>1&&<button onClick={()=>setLandRows(r=>r.filter((_,idx)=>idx!==i))} style={{background:'rgba(255,50,50,0.15)',border:'none',borderRadius:'0.3rem',color:'rgba(255,100,100,0.8)',cursor:'pointer',padding:'0.45rem 0.6rem',alignSelf:'flex-end'}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>setLandRows(r=>[...r,{l:'',w:'',h:'',qty:'1',weight:''}])} style={{background:'rgba(200,168,78,0.1)',border:'1px solid rgba(200,168,78,0.25)',borderRadius:'0.4rem',color:'#c8a84e',cursor:'pointer',padding:'0.4rem 0.8rem',fontFamily:"'Inter',sans-serif",fontSize:'0.7rem',alignSelf:'flex-start'}}>+ {ar?'إضافة صف':'Add Row'}</button>
          </div>
        )}

        {/* ── WAREHOUSE ── */}
        {tab==='warehouse' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 0.7fr', gap:'0.5rem' }}>
              {[['L (cm)',whL,setWhL],['W (cm)',whW,setWhW],['H (cm)',whH,setWhH],['Qty',whQty,setWhQty]].map(([lbTxt,val,setter])=>(
                <div key={lbTxt}><label style={lbl}>{lbTxt}</label><input style={inp} type="number" value={val} onChange={e=>setter(e.target.value)} placeholder="0"/></div>
              ))}
            </div>
            <div><label style={lbl}>{ar?'أيام التخزين':'Storage Days'}</label><input style={inp} type="number" value={whDays} onChange={e=>setWhDays(e.target.value)} placeholder="30"/></div>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:'0.68rem',color:'rgba(255,255,255,0.35)',margin:0}}>Rate: $0.35 / CBM / day (indicative)</p>
          </div>
        )}

        {/* Results — Enhanced AI Visual Dashboard */}
        {results && (
          <div style={{ marginTop:'1.5rem', background:'rgba(10,10,15,0.8)', border:'1.5px solid rgba(200,168,78,0.35)', borderRadius:'1rem', padding:'1.5rem', boxShadow:'0 20px 50px rgba(0,0,0,0.4)', position:'relative', overflow:'hidden' }}>
            {/* Background Glow */}
            <div style={{ position:'absolute', top:'-50%', right:'-20%', width:'150px', height:'150px', background:'rgba(200,168,78,0.1)', filter:'blur(40px)', borderRadius:'50%' }} />
            
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', letterSpacing:'0.06em', color:'#c8a84e' }}>
                {ar ? 'تحليل الحمولة الذكي' : 'AI LOAD ANALYSIS'}
              </div>
              <div style={{ width:'8px', height:'8px', background:'#25c864', borderRadius:'50%', boxShadow:'0 0 10px #25c864' }} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
              {/* Primary Stat */}
              <div style={{ background:'rgba(255,255,255,0.03)', padding:'0.8rem', borderRadius:'0.6rem', border:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ display:'block', fontSize:'0.6rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', fontWeight:600, marginBottom:'0.2rem' }}>
                  {results.tab === 'air' ? (ar ? 'الوزن المعتمد' : 'Chargeable Wt') : (ar ? 'إجمالي CBM' : 'Total Volume')}
                </span>
                <span style={{ fontSize:'1.5rem', fontFamily:"'Bebas Neue',sans-serif", color:'#fff' }}>
                  {results.tab === 'air' ? results.chargeable : results.cbm} 
                  <span style={{ fontSize:'0.7rem', marginLeft:'0.3rem', color:'#c8a84e' }}>{results.tab === 'air' ? 'KG' : 'CBM' }</span>
                </span>
              </div>

              {/* Efficiency Stat */}
              {results.loadPct && (
                <div style={{ background:'rgba(255,255,255,0.03)', padding:'0.8rem', borderRadius:'0.6rem', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ display:'block', fontSize:'0.6rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', fontWeight:600, marginBottom:'0.2rem' }}>
                    {ar ? 'كفاءة الاستخدام' : 'Usage Efficiency'}
                  </span>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'0.2rem' }}>
                    <span style={{ fontSize:'1.5rem', fontFamily:"'Bebas Neue',sans-serif", color: results.loadPct > 90 ? '#ff5050' : '#fff' }}>{results.loadPct}</span>
                    <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', fontFamily:"'Bebas Neue',sans-serif" }}>%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Progress Bar for Load */}
            {results.loadPct && (
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'rgba(255,255,255,0.3)', marginBottom:'0.4rem', fontWeight:600 }}>
                  <span>{ar ? 'سعة الحاوية' : 'CONTAINER CAPACITY'}</span>
                  <span>{results.loadPct}%</span>
                </div>
                <div style={{ height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(100, results.loadPct)}%`, background: results.loadPct > 90 ? 'linear-gradient(90deg, #c8a84e, #ff5050)' : 'linear-gradient(90deg, #c8a84e, #e8d48a)', transition:'width 1s ease-out' }} />
                </div>
              </div>
            )}

            {results.container && (
              <div style={{ padding:'0.8rem', background:'rgba(200,168,78,0.1)', borderRadius:'0.6rem', border:'1px dotted rgba(200,168,78,0.3)', textAlign:'center' }}>
                <span style={{ display:'block', fontSize:'0.6rem', color:'#c8a84e', textTransform:'uppercase', fontWeight:700, marginBottom:'0.2rem', letterSpacing:'0.05em' }}>
                  {ar ? 'توصية الذكاء الاصطناعي' : 'AI RECOMMENDATION'}
                </span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', color:'#fff', letterSpacing:'0.03em' }}>{results.container}</span>
              </div>
            )}

            <div style={{ display:'flex', gap:'0.8rem', marginTop:'1.5rem' }}>
              <button onClick={exportCSV} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.5rem', color:'#fff', padding:'0.7rem', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', transition:'all 0.2s' }}>
                📥 CSV
              </button>
              <button onClick={exportPDF} style={{ flex:1, background:'#c8a84e', border:'none', borderRadius:'0.5rem', color:'#0a0a0f', padding:'0.7rem', cursor:'pointer', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', transition:'all 0.2s' }}>
                📄 PDF REPORT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ padding:'1rem 1.25rem', background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
        <button onClick={calculate}
          style={{ width:'100%', padding:'1.1rem', background:'linear-gradient(135deg,#c8a84e,#a8843e)', border:'none', borderRadius:'0.8rem', color:'#050508', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.2rem', letterSpacing:'0.15em', cursor:'pointer', transition:'all 0.3s', boxShadow:'0 10px 30px rgba(200,168,78,0.2)' }}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.currentTarget.style.transform=''}
        >
          {ar ? 'إجراء الحساب الذكي' : 'GENERATE AI ANALYSIS'}
        </button>
      </div>
    </div>
  );
}


// ============================================
// TOOL MODAL — generic full-screen panel
// ============================================
function ToolModal({ open, onClose, title, subtitle, children }) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  useEffect(() => {
    const o = overlayRef.current, p = panelRef.current;
    if (!o || !p) return;
    if (open) {
      o.style.display = 'flex';
      gsap.fromTo(o, { opacity:0 }, { opacity:1, duration:0.28, ease:'power2.out' });
      gsap.fromTo(p, { opacity:0, y:28, scale:0.97 }, { opacity:1, y:0, scale:1, duration:0.38, ease:'power3.out' });
    } else {
      gsap.to(p, { opacity:0, y:18, scale:0.97, duration:0.22, ease:'power2.in' });
      gsap.to(o, { opacity:0, duration:0.28, ease:'power2.in', onComplete:()=>{ if(o) o.style.display='none'; } });
    }
  }, [open]);

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ display:'none', position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', zIndex:3000, alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div ref={panelRef} style={{ background:'#0a0a0f', border:'1px solid rgba(200,168,78,0.15)', borderRadius:'1.1rem', width:'100%', maxWidth:'860px', maxHeight:'92vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.75)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.4rem', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', letterSpacing:'0.08em', color:'#fff' }}>{title}</div>
            {subtitle && <div style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.62rem', color:'rgba(200,168,78,0.65)', letterSpacing:'0.1em', marginTop:'0.1rem' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.5)', fontSize:'0.9rem', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.5)';}}>✕</button>
        </div>
        <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>{children}</div>
      </div>
    </div>
  );
}

// ============================================
// HAMBURGER MENU DRAWER — Tools Hub
// ============================================
function MenuDrawer({ open, onClose, onQuoteClick, onBook, lang, toggleLang, airOpen, setAirOpen, calcOpen, setCalcOpen }) {
  const drawerRef  = useRef(null);
  const overlayRef = useRef(null);
  const ar = lang === 'ar';

  useEffect(() => {
    const drawer = drawerRef.current, overlay = overlayRef.current;
    if (!drawer || !overlay) return;
    if (open) {
      overlay.style.display = 'block';
      gsap.fromTo(overlay, { opacity:0 }, { opacity:1, duration:0.28, ease:'power2.out' });
      gsap.fromTo(drawer,  { x:'100%' },  { x:'0%',   duration:0.42, ease:'power3.out' });
    } else {
      gsap.to(drawer,  { x:'100%',  duration:0.32, ease:'power3.in' });
      gsap.to(overlay, { opacity:0, duration:0.28, ease:'power2.in', onComplete:()=>{ if(overlay) overlay.style.display='none'; } });
    }
  }, [open]);

  const navLink = (label, onClick) => (
    <button onClick={()=>{ onClose(); setTimeout(onClick, 300); }}
      style={{ display:'flex', alignItems:'center', gap:'0.6rem', width:'100%', textAlign:'left', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.15rem', fontWeight:400, letterSpacing:'0.12em', color:'rgba(255,255,255,0.65)', background:'none', border:'none', cursor:'pointer', padding:'0.7rem 0', borderBottom:'1px solid rgba(255,255,255,0.06)', transition:'color 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.color='#c8a84e'}
      onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.65)'}>
      <span style={{ display:'inline-block', width:3, height:14, background:'rgba(200,168,78,0.4)', borderRadius:2, flexShrink:0 }}/>
      {label}
    </button>
  );

  const toolCard = (icon, label, sub, onClick) => (
    <button onClick={onClick}
      style={{ display:'flex', flexDirection:'column', gap:'0.5rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.9rem', padding:'1.1rem 1rem', cursor:'pointer', transition:'all 0.22s', textAlign:'left' }}
      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(200,168,78,0.1)'; e.currentTarget.style.borderColor='rgba(200,168,78,0.35)'; e.currentTarget.style.transform='translateY(-1px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.transform=''; }}>
      <span style={{ fontSize:'1.6rem', lineHeight:1 }}>{icon}</span>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'0.1em', color:'#ffffff', lineHeight:1.1 }}>{label}</span>
      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.68rem', fontWeight:500, color:'rgba(200,168,78,0.7)', lineHeight:1.4, letterSpacing:'0.02em' }}>{sub}</span>
    </button>
  );

  return (
    <>
      <div ref={overlayRef} onClick={onClose} style={{ display:'none', position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:998, backdropFilter:'blur(5px)', WebkitBackdropFilter:'blur(5px)' }}/>
      <div ref={drawerRef} style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(400px, 92vw)', background:'#080810', borderLeft:'1px solid rgba(200,168,78,0.1)', zIndex:999, display:'flex', flexDirection:'column', transform:'translateX(100%)', overflowY:'auto' }}>

        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.2rem 1.4rem', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
          <BJSLogo />
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.45)', fontSize:'0.85rem', transition:'all 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(255,255,255,0.1)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}>✕</button>
        </div>

        {/* Nav */}
        <div style={{ padding:'1rem 1.4rem 0.5rem', flexShrink:0 }}>
          {navLink(ar?'عرض سعر سريع':'Quick Quote', onQuoteClick)}
          {navLink(ar?'تتبع شحنتك':'Track Shipment', ()=>document.getElementById('tools-section')?.scrollIntoView({behavior:'smooth'}))}
          {navLink(ar?'تواصل معنا':'Contact Us', ()=>document.querySelector('.site-footer')?.scrollIntoView({behavior:'smooth'}))}
        </div>

        {/* Tools section */}
        <div style={{ padding:'1rem 1.4rem', flexShrink:0 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.85rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(200,168,78,0.7)', marginBottom:'0.8rem', borderBottom:'1px solid rgba(200,168,78,0.12)', paddingBottom:'0.5rem' }}>
            {ar?'أدوات لوجستية':'Logistics Tools'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
            {toolCard('🌍', ar?'حركة الجو المباشرة':'Live Air Traffic', ar?'رادار الطائرات في الوقت الحقيقي':'Real-time flight radar', ()=>setAirOpen(true))}
            {toolCard('📦', ar?'حاسبة الحمولة':'Load Calculator', ar?'بحري · جوي · بري · مستودع':'Sea · Air · Land · Warehouse', ()=>setCalcOpen(true))}
            {toolCard('🚢', ar?'عرض سعر سريع':'Quick Quote', ar?'أسعار فورية لجميع أنواع الشحن':'Instant freight rates', ()=>{ onClose(); setTimeout(onQuoteClick, 300); })}
            {toolCard('📡', ar?'تتبع الشحنة':'Track Shipment', ar?'تتبع بوليصة الشحن أو AWB':'BL / AWB live tracking', ()=>{ onClose(); setTimeout(()=>document.getElementById('tools-section')?.scrollIntoView({behavior:'smooth'}), 300); })}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex:1 }}/>

        {/* Book CTA */}
        <div style={{ padding:'1rem 1.4rem', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
          <button onClick={()=>{ onClose(); setTimeout(onBook, 300); }}
            style={{ width:'100%', padding:'1rem', background:'linear-gradient(135deg,#c8a84e,#a8843e)', border:'none', borderRadius:'0.75rem', color:'#050508', fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.05rem', letterSpacing:'0.18em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', transition:'all 0.2s', boxShadow:'0 4px 20px rgba(200,168,78,0.25)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='linear-gradient(135deg,#e8d48a,#c8a84e)';e.currentTarget.style.boxShadow='0 6px 28px rgba(200,168,78,0.4)';}} onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,#c8a84e,#a8843e)';e.currentTarget.style.boxShadow='0 4px 20px rgba(200,168,78,0.25)';}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {ar?'اتصل بخبير شحن':'Call a Freight Expert'}
          </button>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.9rem' }}>
            <button onClick={toggleLang} style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.16em', color:'rgba(255,255,255,0.4)', background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'2rem', cursor:'pointer', padding:'0.25rem 0.65rem', display:'flex', gap:'0.25rem' }}>
              <span style={{color:lang==='en'?'#c8a84e':'inherit'}}>EN</span>
              <span style={{color:'rgba(255,255,255,0.15)'}}>|</span>
              <span style={{color:lang==='ar'?'#c8a84e':'inherit'}}>AR</span>
            </button>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.52rem', color:'rgba(255,255,255,0.15)', letterSpacing:'0.08em' }}>ZATCA · ISO 9001 · FIATA</span>
          </div>
        </div>
      </div>


    </>
  );
}

// ============================================
// HEADER — minimal: logo left, book CTA + burger right
// ============================================
function Header({ onToolsClick, onQuoteClick, lang, toggleLang, airOpen, setAirOpen, calcOpen, setCalcOpen }) {
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const scrollToHero = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.set(headerRef.current, { opacity: 1 });
    const onScroll = () => {
      if (!headerRef.current) return;
      headerRef.current.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Floating pill — left side, background hugs content */}
      <header
        ref={headerRef}
        className="header-glass fixed top-0 left-0 w-full z-50"
        style={{ pointerEvents: 'none', background: 'transparent', opacity: 1 }}
      >
        <div style={{ padding: '0.9rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo — left */}
          <div style={{ pointerEvents: 'auto' }}>
            <button onClick={scrollToHero} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} aria-label="Back to top">
              <BJSLogo />
            </button>
          </div>
          {/* Desktop nav links — hidden on mobile */}
          <nav className="header-desktop-nav" style={{ pointerEvents: 'auto' }} aria-label="Main navigation">
            {[
              { label: lang === 'ar' ? 'الخدمات'   : 'Services', id: 'services-section' },
              { label: lang === 'ar' ? 'عن بيجويس'  : 'About',    id: 'about-section'   },
              { label: lang === 'ar' ? 'عملاؤنا'   : 'Clients',  id: 'clients-section' },
              { label: lang === 'ar' ? 'الأدوات'   : 'Tools',    id: 'tools-section'   },
            ].map(link => (
              <button
                key={link.id}
                className="header-nav-link"
                onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls — all in one pill */}
          <div className="header-inner-pill" style={{ pointerEvents: 'auto' }}>
            {/* Lang toggle */}
            <button onClick={toggleLang} className="header-lang-btn" aria-label="Toggle language">
              <span className={lang === 'en' ? 'lang-active' : ''}>{lang === 'en' ? 'EN' : 'ع'}</span>
              <span className="lang-sep">|</span>
              <span className={lang === 'ar' ? 'lang-active' : ''}>{lang === 'ar' ? 'AR' : 'ع'}</span>
            </button>
            {/* Divider */}
            <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            {/* Book CTA */}
            <button onClick={onQuoteClick} className="header-book-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {lang === 'ar' ? 'اتصل بخبير شحن' : 'Call a Freight Expert'}
            </button>
            {/* Divider */}
            <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            {/* Burger */}
            <button onClick={() => setMenuOpen(true)} className="header-burger" aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onQuoteClick={onQuoteClick}
        onBook={onQuoteClick}
        lang={lang}
        toggleLang={toggleLang}
        airOpen={airOpen}
        setAirOpen={setAirOpen}
        calcOpen={calcOpen}
        setCalcOpen={setCalcOpen}
      />
    </>
  );
}

// ============================================
// ACT DIVIDER — cinematic title between acts
// ============================================
function ActDivider({ label, title, compact = false }) {
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
        height: compact ? '45vh' : '100vh',
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
// HERO QUOTE FORM — minimal left-anchored card
// ============================================
const CARGO_TYPES = [
  { id: 'sea',      label: '🚢 Sea',     labelAr: '🚢 بحري' },
  { id: 'air',      label: '✈️ Air',     labelAr: '✈️ جوي' },
  { id: 'land',     label: '🚛 Land',    labelAr: '🚛 بري' },
  { id: 'customs',  label: '🏛️ Customs', labelAr: '🏛️ جمارك' },
];

function HeroQuoteForm({ lang = 'en', onBook }) {
  const [cargoType, setCargoType] = useState('sea');
  const [origin, setOrigin]       = useState('');
  const [dest, setDest]           = useState('');
  const [errors, setErrors]       = useState({ origin: false, dest: false });
  const [shake, setShake]         = useState(false);

  const handleSubmit = () => {
    const newErrors = { origin: !origin.trim(), dest: !dest.trim() };
    setErrors(newErrors);
    if (newErrors.origin || newErrors.dest) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    onBook?.();
  };

  return (
    <div className="hero-mini-card" style={{ maxWidth: '480px', margin: '0 auto', background: 'rgba(5, 5, 8, 0.85)', border: '1px solid rgba(200,168,78,0.5)', boxShadow: '0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(200,168,78,0.2)' }}>
      {/* Eyebrow */}
      <div className="hero-mini-card__eyebrow" style={{ justifyContent: 'center' }}>
        <span className="hero-mini-card__dot" />
        {lang === 'ar' ? 'عرض مجاني · رد خلال 30 دقيقة' : 'Free quote · 30-min response'}
      </div>

      {/* Cargo type tabs */}
      <div className="hero-mini-card__tabs" style={{ justifyContent: 'center' }}>
        {CARGO_TYPES.map(ct => (
          <button
            key={ct.id}
            className={`hero-mini-card__tab${cargoType === ct.id ? ' hero-mini-card__tab--active' : ''}`}
            onClick={() => setCargoType(ct.id)}
            type="button"
          >
            {lang === 'ar' ? ct.labelAr : ct.label}
          </button>
        ))}
      </div>

      {/* Inputs (Side by side for centered layout) */}
      <div className="hero-mini-card__fields" style={{ flexDirection: 'row', gap: '0.5rem' }}>
        <div className="hero-mini-card__field-wrap" style={{ flex: 1 }}>
          <input
            className={`hero-mini-card__input${errors.origin ? ' hero-mini-card__input--error' : ''}`}
            type="text"
            placeholder={lang === 'ar' ? 'بلد الشحن' : 'Origin'}
            value={origin}
            onChange={e => { setOrigin(e.target.value); if (e.target.value.trim()) setErrors(prev => ({ ...prev, origin: false })); }}
            style={{ borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <div className="hero-mini-card__arrow" style={{ alignSelf: 'center', border: 'none', background: 'transparent' }}>→</div>
        <div className="hero-mini-card__field-wrap" style={{ flex: 1 }}>
          <input
            className={`hero-mini-card__input${errors.dest ? ' hero-mini-card__input--error' : ''}`}
            type="text"
            placeholder={lang === 'ar' ? 'الوجهة' : 'Destination'}
            value={dest}
            onChange={e => { setDest(e.target.value); if (e.target.value.trim()) setErrors(prev => ({ ...prev, dest: false })); }}
            style={{ borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>

      {/* Primary CTA */}
      <button
        className={`hero-mini-card__btn${shake ? ' hero-mini-card__btn--shake' : ''}`}
        onClick={handleSubmit}
        style={{ marginTop: '0.5rem' }}
      >
        {lang === 'ar' ? 'اتصل بخبير شحن' : 'Call a Freight Expert'}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      {/* Sub-links */}
      <div className="hero-mini-card__sub" style={{ justifyContent: 'center' }}>
        <a href="tel:+966550000000" className="hero-mini-card__link">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3-8.69A2 2 0 0 1 3.82 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16z"/></svg>
          +966 55 000 0000
        </a>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <a href="https://wa.me/966550000000" target="_blank" rel="noopener noreferrer" className="hero-mini-card__link hero-mini-card__link--wa">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

// ============================================
// HERO TRUST & STATS BAR (Reality Check)
// ============================================
function RollingNumber({ value, suffix = '', duration = 2.5 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const target = parseFloat(value);
    const obj = { n: 0 };
    
    // Wait for potential UI transitions to finish
    const timer = setTimeout(() => {
      gsap.to(ref.current, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5 });
      
      gsap.to(obj, {
        n: target,
        duration,
        ease: "power4.out",
        onUpdate: () => {
          if (ref.current) {
            const currentVal = Math.floor(obj.n);
            ref.current.textContent = currentVal + suffix;
          }
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [value, suffix, duration]);
  return <span ref={ref} style={{ opacity: 0, filter: 'blur(10px)', display: 'inline-block', transform: 'translateZ(0)', willChange: 'opacity, transform', WebkitFontSmoothing: 'antialiased' }}>0{suffix}</span>;
}

function HeroTrustBar({ lang }) {
  const isAr = lang === 'ar';
  return (
    <div className="hero-trust-bar hero-trust-bar--centered">
      <div className="hero-trust-stats-grid">
        <div className="hero-trust-stat">
          <span className="hero-trust-val"><RollingNumber value="200" suffix="+" /></span>
          <span className="hero-trust-lbl">{isAr ? 'عميل نشط' : 'Satisfied Clients'}</span>
        </div>
        <div className="hero-trust-stat">
          <span className="hero-trust-val"><RollingNumber value="24" suffix="+" /></span>
          <span className="hero-trust-lbl">{isAr ? 'قطاعاً مخدوماً' : 'Industries Served'}</span>
        </div>
        <div className="hero-trust-stat">
          <span className="hero-trust-val" style={{ color: '#ffd97a' }}><RollingNumber value="15" suffix="%" /></span>
          <span className="hero-trust-lbl">{isAr ? 'توفير التكاليف' : 'ROI / Cost Savings'}</span>
        </div>
        <div className="hero-trust-stat">
          <span className="hero-trust-val" style={{ color: '#10b981' }}><RollingNumber value="100" suffix="%" /></span>
          <span className="hero-trust-lbl">{isAr ? 'خال من الصراعات' : 'Crisis-Proof Content'}</span>
        </div>
        <div className="hero-trust-stat">
          <span className="hero-trust-val">KSA</span>
          <span className="hero-trust-lbl">{isAr ? 'تغطية إقليمية' : 'Regional Specialist'}</span>
        </div>
      </div>
      
      <div className="hero-trust-certs-wrap" style={{ marginTop: '1.5rem' }}>
        <div className="hero-trust-certs">
          <span className="hero-trust-badge">ZATCA Certified</span>
          <span className="hero-trust-badge">ISO 9001:2015</span>
          <span className="hero-trust-badge">GCC Specialist</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTELLIGENT AI ASSISTANT WIDGET
// ============================================
// Inject assistant keyframes once
(function injectAssistantStyles() {
  if (typeof document === 'undefined') return;
  const id = 'bjs-assistant-styles';
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = `
    @keyframes bjs-wave {
      0%,100%{ transform:rotate(0deg) }
      15%    { transform:rotate(22deg) }
      30%    { transform:rotate(-12deg) }
      45%    { transform:rotate(20deg) }
      60%    { transform:rotate(-8deg) }
      75%    { transform:rotate(14deg) }
    }
    @keyframes bjs-float {
      0%,100%{ transform:translateY(0) }
      50%    { transform:translateY(-7px) }
    }
    @keyframes bjs-ring {
      0%  { transform:scale(1);   opacity:.55 }
      100%{ transform:scale(1.8); opacity:0   }
    }
    @keyframes bjs-panel {
      from{ opacity:0; transform:translateY(18px) scale(.96) }
      to  { opacity:1; transform:translateY(0)    scale(1)   }
    }
    @keyframes bjs-bubble-in {
      from{ opacity:0; transform:scale(.85) translateY(6px) }
      to  { opacity:1; transform:scale(1)   translateY(0)   }
    }
    @keyframes bjs-msg-in {
      from{ opacity:0; transform:translateY(8px) }
      to  { opacity:1; transform:translateY(0)   }
    }
    @keyframes bjs-dot {
      0%,80%,100%{ transform:translateY(0) }
      40%         { transform:translateY(-5px) }
    }
    @keyframes bjs-blink {
      0%,90%,100%{ transform:scaleY(1) }
      95%         { transform:scaleY(.1) }
    }
    .bjs-hand { display:inline-block; transform-origin:70% 80%; animation:bjs-wave 2s ease-in-out; }
    .bjs-eye  { animation:bjs-blink 4s ease-in-out infinite; transform-origin:center; }
  `;
  document.head.appendChild(s);
})();


const QUICK_CHIPS = [
  { label: '🗺️ Optimise Route',  key: 'route'    },
  { label: '📦 Get a Quote',      key: 'price'    },
  { label: '🏛️ What is ZATCA?',  key: 'zatca'    },
  { label: '🚢 Sea Freight',      key: 'sea'      },
  { label: '✈️ Air Freight',      key: 'air'      },
  { label: '📍 Track Shipment',   key: 'tracking' },
];

/* ── AI Holographic Avatar — replaces previous SVG character ── */
function AssistantAvatar({ size = 56, fullBody = false }) {
  const w = fullBody ? 120 : size;
  const h = fullBody ? 120 : size;
  return (
    <div style={{
      width: w, height: h, flexShrink: 0,
      borderRadius: '50%',
      background: 'radial-gradient(circle at center, rgba(0, 153, 255, 0.15) 0%, rgba(5, 10, 20, 0.7) 80%)',
      border: `1px solid rgba(0, 153, 255, ${fullBody ? '.7' : '.5'})`,
      boxShadow: fullBody 
        ? '0 0 40px rgba(0, 153, 255, 0.3), inset 0 0 20px rgba(0, 153, 255, 0.15)'
        : '0 4px 15px rgba(0, 110, 255, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      position: 'relative',
      backgroundSize: 'cover',
      transform: 'translateZ(0)',
      imageRendering: '-webkit-optimize-contrast'
    }}>
      <img
        src="/ai-assistant-female.png"
        alt="Layla — Bejoice AI"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.05)',
          animation: 'layla-float 5s ease-in-out infinite, layla-wave-soft 8s ease-in-out infinite',
          transformOrigin: 'bottom center'
        }}
      />
      {/* bluish animated scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 153, 255, 0.08) 3px, transparent 4px)',
        pointerEvents: 'none',
        opacity: 0.6,
        animation: 'bjs-scanline 8s linear infinite'
      }} />
      <style>{`
        @keyframes bjs-scanline { 
          from { background-position: 0 0; } 
          to { background-position: 0 100%; } 
        }
      `}</style>
    </div>
  );
}

const ASSISTANT_BUBBLES = [
  "Global trade is shifting. Is your cargo safe? ✨",
  "I can bypass regional disruptions in seconds. 🌊",
  "Need a conflict-proof route to Saudi Arabia?",
  "BJS Omni-Mind AI: Zero Delays, Maximum Resilience.",
  "Ask me how we delivered on time last month! 📈",
];

function AIAssistant({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: lang === 'ar' 
      ? "التجارة العالمية تتغير.. هل سلاسل التوريد الخاصة بك مرنة بما يكفي؟ ✨\n\nهل تود معرفة كيف يضمن لك نظام BJS Omni-Mind وصول شحناتك في موعدها، حتى في أصعب الظروف؟" 
      : "Global trade is changing. Is your supply chain resilient enough? ✨\n\nDo you want to know how BJS Omni-Mind AI guarantees your delivery, regardless of global instability?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: init, 1: type, 2: goal, 3: done
  const [bubbleIdx, setBubbleIdx] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [waving, setWaving] = useState(true);
  const [showChips, setShowChips] = useState(true);
  const [chatLang, setChatLang] = useState(lang); // independent chat language
  const scrollRef = useRef(null);
  const ar = chatLang === 'ar';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Cycle speech bubbles
  useEffect(() => {
    if (isOpen) return;
    const iv = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => { setBubbleIdx(i => (i + 1) % ASSISTANT_BUBBLES.length); setShowBubble(true); }, 350);
    }, 4000);
    return () => clearInterval(iv);
  }, [isOpen]);



  const getReply = (query) => {
    const q = query.toLowerCase();

    // ── Route optimisation ─────────────────────────────────────────
    const routeMatch = q.match(/(?:from|between|route|path|way).*?([a-z]{3,})\s+(?:to|and|-)\s+([a-z]{3,})/i)
                    || q.match(/([a-z]{3,})\s+to\s+([a-z]{3,})/i);
    if (routeMatch || q.includes('route') || q.includes('path') || q.includes('fastest') || q.includes('cheapest') || q.includes('optimiz')) {
      if (routeMatch) {
        const [, from, to] = routeMatch;
        const f = from.charAt(0).toUpperCase() + from.slice(1);
        const t = to.charAt(0).toUpperCase() + to.slice(1);
        return `Great question! 🗺️ For ${f} → ${t}, here's how we'd optimise your route:\n\n• **Sea freight**: Most cost-effective for heavy cargo (20–40 ft containers). Transit via Jeddah Islamic Port or King Abdulaziz Port (Dammam).\n• **Air freight**: Fastest — ideal for time-sensitive or high-value goods. Riyadh (RUH) or Jeddah (JED) as entry points.\n• **Land**: Best for GCC-regional moves.\n\nWant a live rate for this lane? 👉 Use the Quick Quote form below!`;
      }
      return `Optimising freight routes is our specialty! 🗺️ The best path depends on:\n\n• **Cargo type** — hazardous, perishable, oversized?\n• **Speed vs cost** — air (fast) vs sea (cheap) vs land (flexible)\n• **Incoterms** — EXW, FOB, CIF, DDP?\n\nFor Saudi Arabia, main gateways are Jeddah Port, Dammam Port, Riyadh Dry Port, and King Khalid Airport. Share your origin & destination and I'll recommend the optimal lane! 🚀`;
    }

    // ── ZATCA / Customs ────────────────────────────────────────────
    if (q.includes('what is zatca') || q.includes('zatca mean') || q.includes('explain zatca'))
      return `ZATCA stands for **Zakat, Tax and Customs Authority** — Saudi Arabia's regulatory body that oversees:\n\n• 🧾 VAT & e-invoicing compliance (FATOORAH)\n• 🏛️ Import/export customs clearance\n• 📦 HS code classification & duty assessment\n• 🔍 AEO (Authorised Economic Operator) certification\n\nBejoice is a certified ZATCA partner, so we handle all digital compliance automatically — often clearing shipments in under 4 hours! Want to know more?`;
    if (q.includes('zatca') || q.includes('customs') || q.includes('clearance') || q.includes('duty') || q.includes('hs code') || q.includes('tariff'))
      return `As a ZATCA-certified partner, Bejoice handles full customs brokerage: 📋\n\n• HS code classification\n• Duty & VAT calculation\n• E-invoicing (FATOORAH Phase 2)\n• SASO product conformity\n• AEO fast-track lanes at Jeddah & Dammam\n\nAverage clearance time: **3–4 hours** at major Saudi ports. Need help with a specific HS code or import procedure?`;

    // ── Incoterms ──────────────────────────────────────────────────
    if (q.includes('incoterm') || q.includes('fob') || q.includes('cif') || q.includes('exw') || q.includes('ddp') || q.includes('dap'))
      return `Incoterms are international trade terms defining who pays for what 📋:\n\n• **EXW** — Buyer handles everything from seller's door\n• **FOB** — Seller loads at origin port, buyer takes over\n• **CIF** — Seller pays freight + insurance to destination port\n• **DAP** — Seller delivers to buyer's door (buyer pays import duty)\n• **DDP** — Seller handles everything including customs & duty\n\nFor Saudi imports, **FOB** or **CIF Jeddah/Dammam** are most common. Which Incoterm are you working with?`;

    // ── CBM / Dimensions ───────────────────────────────────────────
    if (q.includes('cbm') || q.includes('cubic') || q.includes('volume') || q.includes('dimension') || q.includes('lcl') || q.includes('fcl'))
      return `CBM (Cubic Meter) is the standard unit for sea freight volume 📦:\n\n• **Formula**: Length × Width × Height (in metres)\n• **LCL** (Less than Container Load) — you pay per CBM, ideal for small shipments\n• **FCL** (Full Container Load) — you rent the whole container:\n  - 20ft ≈ 25 CBM / 21,700 kg\n  - 40ft ≈ 55 CBM / 26,500 kg\n  - 40HC ≈ 68 CBM / 26,500 kg\n\nUse the **CBM Calculator** in our Tools section below for instant calculations! 🔢`;

    // ── Air freight / Chargeable weight ───────────────────────────
    if (q.includes('chargeable') || q.includes('volumetric') || q.includes('dim weight'))
      return `Chargeable weight in air freight = **max(actual weight, volumetric weight)** ✈️\n\n• **Volumetric weight** = (L × W × H in cm) ÷ 5000\n• Example: 50×40×30 cm box = 60,000 ÷ 5000 = **12 kg volumetric**\n• If actual weight is 8 kg → you're charged for 12 kg\n\nUse our **Air Chargeable Weight Calculator** in the Tools section for instant results! 🚀`;

    // ── Freight modes ──────────────────────────────────────────────
    if (q.includes('sea freight') || q.includes('ocean freight') || q.includes('fcl') || q.includes('container ship'))
      return `Sea freight is the most cost-effective mode for heavy or bulky cargo 🚢:\n\n• **Transit times to Saudi Arabia**: Europe 18–25 days, Asia 8–14 days, USA 25–35 days\n• **Main Saudi ports**: Jeddah Islamic Port (west), King Abdulaziz Port Dammam (east), Jubail\n• **Container types**: 20ft Dry, 40ft Dry, 40HC, Reefer, Flat Rack, Open Top\n\nBejoice operates direct carrier contracts with MSC, Maersk, CMA CGM & more. Want a quote?`;
    if (q.includes('air freight') || q.includes('air cargo') || q.includes('airway'))
      return `Air freight is the fastest mode — ideal for urgent or high-value shipments ✈️:\n\n• **Transit to Saudi Arabia**: Europe 2–3 days, Asia 1–2 days, USA 3–4 days\n• **Saudi airports**: King Khalid (RUH), King Abdulaziz (JED), King Fahd (DMM)\n• **Best for**: Electronics, pharma, perishables, fashion, spare parts\n• **Cost**: ~4–6× more than sea, but saves on storage & lost-sales risk\n\nWant an air freight rate? Hit the Quick Quote button! 🚀`;
    if (q.includes('land freight') || q.includes('truck') || q.includes('road freight') || q.includes('ftl') || q.includes('ltl'))
      return `Land freight is perfect for GCC-regional moves 🚛:\n\n• **Coverage**: Saudi Arabia, UAE, Kuwait, Bahrain, Oman, Qatar, Jordan, Egypt\n• **FTL** (Full Truck Load) — dedicated truck for your cargo\n• **LTL** (Less than Truck Load) — share space, pay per pallet/CBM\n• **Truck types**: Curtainsider, Flatbed, Reefer, Lowbed (for heavy equipment)\n\nBejoice runs daily lanes across all GCC borders with SABER-certified carriers!`;

    // ── Saudi-specific logistics ───────────────────────────────────
    if (q.includes('saso') || q.includes('conformity') || q.includes('certificate of conformity'))
      return `SASO (Saudi Standards, Metrology and Quality Organization) requires a **Certificate of Conformity (CoC)** for regulated product categories entering Saudi Arabia 🇸🇦:\n\n• Electronics, appliances, toys, chemicals, food, PPE & more\n• Issued by accredited bodies (INTERTEK, SGS, Bureau Veritas)\n• Required BEFORE shipment — cannot be obtained after arrival\n\nBejoice coordinates CoC procurement as part of our customs brokerage service. Need help identifying if your product needs SASO clearance?`;
    if (q.includes('aeo') || q.includes('authorised economic'))
      return `AEO (Authorised Economic Operator) is a ZATCA certification that gives trusted traders faster customs clearance 🏅:\n\n• **Benefits**: Priority inspection lanes, reduced documentation, lower bond requirements\n• **Eligibility**: Companies with clean compliance record, secure supply chain, financial solvency\n• Bejoice holds AEO status — your shipments automatically benefit from our fast-track lanes!\n\nTypical clearance with AEO: **2–4 hours** vs 24–48 hours standard.`;
    if (q.includes('jeddah') || q.includes('dammam') || q.includes('riyadh') || q.includes('jubail') || q.includes('saudi port'))
      return `Saudi Arabia's key logistics gateways 🇸🇦:\n\n• **Jeddah Islamic Port** — largest Red Sea port, handles 65% of Saudi imports\n• **King Abdulaziz Port (Dammam)** — main eastern gateway, serves Aramco supply chain\n• **Jubail Industrial Port** — petrochemicals & project cargo\n• **King Khalid Airport (RUH)** — main air cargo hub\n• **Riyadh Dry Port** — inland container depot, 24/7 operations\n\nBejoice has bonded warehouse space at all major gateways!`;

    // ── Tracking ───────────────────────────────────────────────────
    if (q.includes('track') || q.includes('where is') || q.includes('status') || q.includes('bl number') || q.includes('awb') || q.includes('تتبع'))
      return `To track your shipment 📍, enter your BL (Bill of Lading) or AWB (Air Waybill) number in the **Tracking widget** in our Tools section below. You'll get:\n\n• Real-time vessel/flight position\n• Port event timeline (loaded, departed, arrived, cleared)\n• Estimated delivery date\n• Delay alerts\n\nDon't have your BL/AWB? Contact us on WhatsApp and we'll pull it for you instantly!`;

    // ── Pricing / quote ────────────────────────────────────────────
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('quote') || q.includes('how much') || q.includes('سعر'))
      return `Freight rates vary by mode, route, volume and season 💰. Here's a rough guide:\n\n• **LCL Sea**: $30–80 per CBM (Asia–Saudi)\n• **FCL 20ft**: $800–2,500 (Asia–Saudi, market dependent)\n• **Air freight**: $2–6 per kg (varies hugely by lane & urgency)\n• **Customs brokerage**: Fixed fee per shipment\n\nFor an exact rate, use our **Quick Quote form** — we compare 200+ carriers and respond within the hour! 🚀`;

    // ── About Bejoice ──────────────────────────────────────────────
    if (q.includes('who') || q.includes('bejoice') || q.includes('about') || q.includes('company') || q.includes('services'))
      return `Bejoice Group is a Saudi-based freight forwarder & logistics partner 🌍:\n\n• 🚢 Sea Freight (FCL/LCL)\n• ✈️ Air Freight\n• 🚛 Land Freight (GCC-wide)\n• 🏛️ Customs Clearance (ZATCA-certified)\n• 📦 Warehousing & Distribution\n• ⚙️ Project & Heavy Cargo\n\nCertified: ZATCA · ISO 9001 · FIATA · IATA · AEO · SASO\nHeadquartered in Saudi Arabia with global reach. How can we help you today?`;

    // ── Saudi Vision 2030 / NEOM / Logistics Cities ───────────────
    if (q.includes('vision 2030') || q.includes('neom') || q.includes('saudi vision'))
      return `Saudi Vision 2030 is transforming the Kingdom into a global logistics powerhouse 🇸🇦:\n\n• **NEOM** — $500B mega-city, creating demand for project & specialised cargo\n• **King Salman Energy Park (SPARK)** — industrial hub near Dammam\n• **Riyadh Logistics Hub** — targeting 50M tons throughput by 2030\n• **Saudi Landbridge** — Jeddah to Dammam rail, cutting transit time to 18hrs\n• **Ras Al-Khair Port** — mining & minerals export gateway\n\nBejoice is positioned at the heart of this transformation — your Vision 2030 logistics partner!`;

    // ── Supply chain / general ────────────────────────────────────
    if (q.includes('supply chain') || q.includes('3pl') || q.includes('4pl') || q.includes('logistics management'))
      return `Supply chain management is the backbone of global trade 🔗:\n\n• **3PL** (Third-Party Logistics) — outsource warehousing, transport & distribution\n• **4PL** (Fourth-Party) — we manage your entire supply chain + technology layer\n• **Just-in-Time (JIT)** — inventory arrives exactly when needed, reducing storage cost\n• **Safety stock** — buffer inventory to absorb demand spikes\n• **Lead time** — total time from order to delivery\n\nBejoice offers end-to-end 3PL/4PL solutions across Saudi Arabia & GCC — from port to last mile!`;

    // ── Dangerous goods / IMDG ────────────────────────────────────
    if (q.includes('dangerous') || q.includes('hazardous') || q.includes('dg') || q.includes('imdg') || q.includes('iata dg') || q.includes('un number'))
      return `Dangerous Goods (DG) require special handling & documentation ⚠️:\n\n• **IMDG Code** — sea freight DG regulations (9 hazard classes)\n• **IATA DGR** — air freight dangerous goods rules\n• **Key documents**: Dangerous Goods Declaration, MSDS/SDS, emergency contact\n• **UN Numbers** identify each hazardous substance (e.g. UN1263 = Paint)\n• **Packaging**: UN-approved packaging required for all DG shipments\n\nClass 1 (explosives) & Class 7 (radioactive) require special Saudi CUSTOMS approval. Bejoice has certified DG handlers for all 9 classes!`;

    // ── Cold chain / reefer ───────────────────────────────────────
    if (q.includes('cold chain') || q.includes('reefer') || q.includes('temperature') || q.includes('perishable') || q.includes('pharma'))
      return `Cold chain logistics maintains product integrity from origin to destination ❄️:\n\n• **Reefer containers**: -30°C to +30°C range, GPS-monitored\n• **Pharma (GDP)**: +2°C to +8°C for vaccines & biologics\n• **Food (SFDA)**: Saudi Food & Drug Authority compliance required for food imports\n• **Flowers/Produce**: 0°C to +4°C, time-critical air freight\n• **Dry ice & gel packs**: for smaller pharmaceutical shipments\n\nBejoice operates SFDA-approved cold storage in Jeddah & Riyadh, with reefer capacity on all major sea lanes!`;

    // ── Insurance ─────────────────────────────────────────────────
    if (q.includes('insurance') || q.includes('cargo insurance') || q.includes('marine insurance') || q.includes('claim'))
      return `Cargo insurance protects your shipment against loss or damage 🛡️:\n\n• **All Risk (Institute Cargo Clauses A)** — broadest cover, recommended\n• **Free from Particular Average (FPA/ICC C)** — basic cover, total loss only\n• **Premium**: typically 0.1%–0.5% of cargo value\n• **What's covered**: theft, water damage, fire, collision, general average\n• **What's NOT covered**: inherent vice, improper packing, delay\n\nAlways insure at **CIF value + 10%**. Bejoice arranges cargo insurance for every shipment — ask us for a quote!`;

    // ── Documents ─────────────────────────────────────────────────
    if (q.includes('bill of lading') || q.includes('bl ') || q.includes('awb') || q.includes('documents') || q.includes('commercial invoice') || q.includes('packing list') || q.includes('certificate of origin') || q.includes('coo'))
      return `Key shipping documents you need 📄:\n\n• **Bill of Lading (BL)** — sea freight title document & contract of carriage\n• **Air Waybill (AWB)** — air freight equivalent of BL (non-negotiable)\n• **Commercial Invoice** — value, description, HS code, buyer/seller\n• **Packing List** — item count, weights, dimensions per carton\n• **Certificate of Origin (CoO)** — required for preferential duty rates (GCC FTA)\n• **SASO CoC** — mandatory for regulated product categories\n• **SFDA License** — for food, pharma, medical devices\n\nMissing any? Bejoice prepares all customs documentation for Saudi imports!`;

    // ── Warehousing ───────────────────────────────────────────────
    if (q.includes('warehouse') || q.includes('storage') || q.includes('fulfillment') || q.includes('pick and pack') || q.includes('last mile'))
      return `Bejoice warehousing & distribution across Saudi Arabia 🏭:\n\n• **Locations**: Jeddah, Riyadh, Dammam bonded & commercial warehouses\n• **Services**: Bonded storage, pick & pack, cross-docking, kitting, labelling\n• **Cold storage**: SFDA-approved cold rooms in Jeddah & Riyadh\n• **Last-mile delivery**: Same-day in Riyadh & Jeddah, 2-day nationwide\n• **WMS integration**: Real-time stock visibility via our portal\n• **E-commerce**: Fulfillment for Saudi Aramco, Noon, Salla merchants\n\nNeed storage or distribution in KSA? Let's talk!`;

    // ── GCC trade / FTAs ──────────────────────────────────────────
    if (q.includes('gcc') || q.includes('free trade') || q.includes('fta') || q.includes('uae') || q.includes('dubai') || q.includes('kuwait') || q.includes('bahrain') || q.includes('oman') || q.includes('qatar'))
      return `GCC trade is seamless with the right partner 🌙:\n\n• **GCC Customs Union**: Zero duty between Saudi, UAE, Kuwait, Bahrain, Oman, Qatar\n• **Saudi–UAE land corridor**: 12hr truck transit, daily departures from Dammam\n• **Dubai (Jebel Ali)** — major transshipment hub, 2-day feeder to Jeddah\n• **MENA FTAs**: Saudi has bilateral agreements with Egypt, Jordan, Morocco, Turkey\n• **ATA Carnet**: Duty-free temporary import for exhibitions & samples\n\nBejoice runs daily cross-border lanes to all GCC states with pre-cleared documentation!`;

    // ── Project cargo / heavy lift ────────────────────────────────
    if (q.includes('project cargo') || q.includes('heavy lift') || q.includes('oog') || q.includes('out of gauge') || q.includes('oversized') || q.includes('breakbulk'))
      return `Project & heavy cargo is our specialty for Saudi mega-projects 🏗️:\n\n• **OOG (Out of Gauge)**: cargo exceeding standard container dimensions\n• **Breakbulk**: non-containerised cargo loaded directly in vessel hold\n• **Heavy lift**: single lifts up to 1,000+ tons via floating cranes\n• **SPMT (Self-Propelled Modular Transporter)**: for ultra-heavy industrial modules\n• **Escort & permits**: Saudi MOMRA road permits, police escort arrangement\n\nBejoice handles project cargo for ARAMCO, SABIC, NEOM & Saudi Vision 2030 infrastructure — full door-to-site service!`;

    // ── Greetings ──────────────────────────────────────────────────
    if (q.match(/^(hi|hello|hey|مرحبا|السلام|good morning|good afternoon|howdy|greetings)/))
      return `${ar ? 'أهلاً بك! أنا ليلى، مستشارتك الذكية في بيجويس.' : 'Hello! I am Layla, your Intelligent Logistics Advisor at Bejoice.'} ✨\n\n${ar ? 'أنا هنا لمساعدتك في التغلب على تعقيدات الشحن العالمي، خاصة في أوقات الأزمات. يمكنني مساعدتك في:' : 'I am here to help you navigate the complexities of global shipping, especially during uncertain times. I can assist with:'}\n• 🌍 ${ar ? 'تخطيط مسارات مقاومة للأزمات' : 'Crisis-Proof Route Engineering'}\n• 🏛️ ${ar ? 'الامتثال لهيئة الزكاة والضريبة والجمارك' : 'ZATCA & Saudi Customs Compliance'}\n• 🚢 ${ar ? 'تحسين الشحن البحري والجوي والبري' : 'Sea, Air & Land Optimization'}\n• 🏗️ ${ar ? 'لوجستيات المشاريع الضخمة' : 'Mega-Project Logistics support'}\n\n${ar ? 'كيف يمكنني تأمين شحنتك اليوم؟' : 'How can I secure your shipment today?'}`;

    // ── Default ────────────────────────────────────────────────────
    return `${ar ? 'سؤال مثير للاهتمام!' : 'That is an interesting question!'} 🤔 ${ar ? 'أنا ليلى، أعمل بذكاء BJS Omni-Mind. جرب سؤالي عن:' : 'I am Layla, powered by the BJS Omni-Mind AI. Try asking me about:'}\n\n• "${ar ? 'أفضل مسار من الصين إلى الرياض حالياً؟' : 'Safest route from China to Riyadh right now?'}"\n• "${ar ? 'كيف أتجنب تأخيرات البحر الأحمر؟' : 'How can I avoid Red Sea delays?'}"\n• "${ar ? 'ما هي متطلبات زاتكا لعام 2024؟' : 'What are the 2024 ZATCA requirements?'}"\n• "${ar ? 'هل شحنتي مؤمنة ضد مخاطر النزاعات؟' : 'Is my cargo insured against conflict risks?'}"\n\n${ar ? 'أنا هنا لخدمتك دائماً.' : 'I am always here to guide you.'} 😊`;
  };

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');

    // ── Onboarding Logic ───────────────────────────────────────────
    if (onboardingStep < 3) {
      setIsTyping(true);
      setTimeout(() => {
        let reply = '';
        const low = msg.toLowerCase();
        
        if (onboardingStep === 0) {
          if (low.includes('yes') || low.includes('نعم') || low.includes('ready')) {
            reply = ar 
              ? "رائع! ✨ في بيجويس، نقوم بتأمين مساراتك رغم كل الظروف. ما هو نوع الشحن الذي ترغب في تحسينه اليوم؟"
              : "Excellent! ✨ At Bejoice, we secure your routes regardless of global conditions. What kind of freight would you like to optimize today?";
            setOnboardingStep(1);
          } else if (low.includes('not ready') || low.includes('لا')) {
            reply = ar 
              ? "لا تقلق، أنا هنا دائماً لحماية سلاسل التوريد الخاصة بك. هل لديك أي أسئلة عامة حول كيفية تجاوزنا للأزمات العالمية؟"
              : "No worries, I am always here to safeguard your supply chains. Do you have any general questions about how we navigate global crises?";
            setOnboardingStep(3);
            setShowChips(false);
          } else if (low.includes('connect')) {
            reply = ar 
              ? "يسعدنا جداً ربطك مع خبراء الأزمات واللوجستيات لدينا! يمكنك استخدام زر واتساب بالأسفل للاتصال الفوري. كيف يمكنني خدمتك حتى ذلك الحين؟"
              : "I'd be happy to bridge you to our crisis and logistics experts! You can reach them instantly via the WhatsApp button below. How can I assist you until then?";
            setOnboardingStep(3);
            setShowChips(false);
          } else {
            reply = getReply(msg);
            setOnboardingStep(3);
            setShowChips(false);
          }
        } else if (onboardingStep === 1) {
          reply = ar 
            ? "اختيار حكيم. وما هو الهدف الأهم الذي تريد من ذكائنا الاصطناعي تحقيقه لشحنتك؟ (مثل: أقل تكلفة، أسرع وصول، أو موثوقية عالية في وقت الأزمات)"
            : "A wise choice. What is the most critical goal you'd like our AI to achieve for your shipment? (e.g., lowest cost, fastest transit, or peak reliability during crisis)";
          setOnboardingStep(2);
        } else if (onboardingStep === 2) {
          reply = ar 
            ? "تم التسجيل! ✅ لقد قمت بمزامنة أهدافك مع نظام BJS Omni-Mind. سأحرص على أن يكون مقترحنا هو الأكثر أماناً وفعالية. كيف يمكنني مساعدتك في شحنتك الأولى؟"
            : "Noted! ✅ I've synchronized your goals with the BJS Omni-Mind system. I'll ensure our proposal is the safest and most efficient possible. How can I help you with your first shipment?";
          setOnboardingStep(3);
          setShowChips(false);
        }

        setMessages(prev => [...prev, { role: 'ai', content: reply }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    setShowChips(false);

    // ── Language switch detection ──────────────────────────────────
    const q = msg.toLowerCase();
    const switchToAr = q.match(/arabic|عربي|عربية|تكلم عربي|بالعربي|change.*arabic|switch.*arabic|speak arabic|تحدث.*عربي|اللغة العربية/);
    const switchToEn = q.match(/english|انجليزي|إنجليزي|change.*english|switch.*english|speak english|تحدث.*انجليزي/);

    if (switchToAr) {
      setChatLang('ar');
      setMessages(prev => [...prev, { role: 'ai', content: 'بكل سرور! تم تفعيل النواة الذكية باللغة العربية. ⚡\n\nأنا نظام **BJS OMNI-MIND** — المركز المتطور لإدارة العمليات اللوجستية.\n\nكيف يمكنني مساعدتك اليوم؟ 🇸🇦' }]);
      return;
    }
    if (switchToEn) {
      setChatLang('en');
      setMessages(prev => [...prev, { role: 'ai', content: 'Switching to English interface... Done. ⚡\n\nI am **BJS OMNI-MIND** — your logistics intelligence core.\n\nHow can I help you? 🚀' }]);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: getReply(msg) }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div style={{
          width: 320,
          background: 'linear-gradient(160deg,#0d1b2e 0%,#0a1220 100%)',
          border: '1px solid rgba(200,168,78,.25)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,.65),0 0 0 1px rgba(200,168,78,.1)',
          animation: 'bjs-panel .3s cubic-bezier(.34,1.56,.64,1) forwards',
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            padding: '16px 18px', 
            display: 'flex', alignItems: 'center', gap: 12, 
            borderBottom: '1px solid rgba(200,168,78,.2)',
            position: 'relative'
          }}>
            <div style={{ position: 'relative' }}>
              <AssistantAvatar size={48} />
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid #0f172a', boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'Outfit,Inter,sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' }}>{ar ? 'لايلى — خبيرة اللوجستيات' : 'Layla — AI Logistics Expert'}</div>
              <div style={{ color: '#7dd3fc', fontSize: 10, fontFamily: 'Inter,sans-serif', fontWeight: 600, opacity: 1 }}>{ar ? 'نظام مفعّل · معتمد من ZATCA' : 'ILLUMINATED CORE · ZATCA CERTIFIED'}</div>
              <div style={{ color: '#38bdf8', fontSize: 9, fontFamily: 'Inter,sans-serif', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 5px #4ade80' }} />
                SYSTEM ACTIVE
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} onWheel={e => e.stopPropagation()} style={{ height: 230, overflowY: 'scroll', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,168,78,.3) transparent', WebkitOverflowScrolling: 'touch' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ animation: 'bjs-msg-in .3s ease forwards', display: 'flex', alignItems: 'flex-end', gap: 7, flexDirection: m.role === 'ai' ? 'row' : 'row-reverse' }}>
                {m.role === 'ai' && <AssistantAvatar size={26} blink={false} />}
                <div style={{
                  maxWidth: '78%',
                  background: m.role === 'ai' ? 'rgba(255,255,255,.07)' : 'linear-gradient(135deg,#c8a84e,#a8843e)',
                  color: '#fff',
                  borderRadius: m.role === 'ai' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                  padding: '9px 12px',
                  fontSize: 13,
                  fontFamily: 'Inter,sans-serif',
                  lineHeight: 1.5,
                  border: m.role === 'ai' ? '1px solid rgba(255,255,255,.08)' : 'none',
                }}>
                  {m.content.split('\n').map((line, li) => {
                    const parts = line.split(/\*\*(.*?)\*\*/g);
                    return (
                      <span key={li} style={{ display: 'block', marginBottom: li < m.content.split('\n').length - 1 ? '3px' : 0 }}>
                        {parts.map((p, pi) => pi % 2 === 1
                          ? <strong key={pi} style={{ color: '#ffd97a', fontWeight: 700 }}>{p}</strong>
                          : p
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
                <AssistantAvatar size={26} blink={false} />
                <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'rgba(255,255,255,.07)', borderRadius: '4px 14px 14px 14px', border: '1px solid rgba(255,255,255,.08)' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8a84e', animation: `bjs-dot 1.2s ease ${i*.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Quick chips — hidden once user sends first message */}
          {showChips && <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            {onboardingStep === 0 && [
              { label: "Yes, I'm ready", key: 'yes' },
              { label: "No", key: 'no' },
              { label: "I'm not ready", key: 'not' },
              { label: "I'd like to connect on that line", key: 'connect' }
            ].map(c => (
              <button key={c.key} onClick={() => handleSend(c.label)} style={{ background: 'rgba(0,153,255,0.1)', color: '#7dd3fc', border: '1px solid rgba(0,153,255,0.3)', borderRadius: 20, padding: '5px 11px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>{c.label}</button>
            ))}
            {onboardingStep === 1 && [
              { label: "🚢 Sea Freight", key: 'sea' },
              { label: "✈️ Air Freight", key: 'air' },
              { label: "🚛 Land Freight", key: 'land' }
            ].map(c => (
              <button key={c.key} onClick={() => handleSend(c.label)} style={{ background: 'rgba(0,153,255,0.1)', color: '#7dd3fc', border: '1px solid rgba(0,153,255,0.3)', borderRadius: 20, padding: '5px 11px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>{c.label}</button>
            ))}
            {onboardingStep === 2 && [
              { label: "💰 Lower Costs", key: 'cost' },
              { label: "⚡ Faster Transit", key: 'speed' },
              { label: "🛡️ Better Reliability", key: 'trust' },
              { label: "🏛️ Zero-Delay Customs", key: 'zatca' }
            ].map(c => (
              <button key={c.key} onClick={() => handleSend(c.label)} style={{ background: 'rgba(0,153,255,0.1)', color: '#7dd3fc', border: '1px solid rgba(0,153,255,0.3)', borderRadius: 20, padding: '5px 11px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>{c.label}</button>
            ))}
          </div>}

          {/* Input */}
          <div style={{ padding: '10px 12px 14px', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={ar ? 'اسأل أي شيء...' : 'Ask anything about shipping...'}
              style={{
                flex: 1, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 20, padding: '9px 14px', color: '#fff', fontSize: 13,
                fontFamily: 'Inter,sans-serif', outline: 'none',
              }}
            />
            <button onClick={() => handleSend()} disabled={isTyping} style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: 'linear-gradient(135deg,#c8a84e,#a8843e)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isTyping ? .5 : 1,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Speech bubble (closed state) ── */}
      {!isOpen && showBubble && (
        <div onClick={() => setIsOpen(true)} style={{
          background: 'linear-gradient(135deg,#0f2340,#1a3a60)',
          color: '#f0e6c8', border: '1px solid rgba(200,168,78,.35)',
          borderRadius: '16px 16px 16px 4px',
          padding: '10px 15px', fontSize: 13, fontWeight: 500,
          fontFamily: 'Inter,sans-serif', maxWidth: 210,
          boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          animation: 'bjs-bubble-in .4s ease forwards',
          lineHeight: 1.45, cursor: 'pointer',
        }}>
          {ASSISTANT_BUBBLES[bubbleIdx]}
        </div>
      )}

      {/* ── Avatar FAB ── */}
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsOpen(o => !o)}>
        {/* Pulse ring */}
        {!isOpen && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 20,
            border: '2px solid rgba(200,168,78,.5)',
            animation: 'bjs-ring 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        {/* Floating full-body avatar */}
        <div style={{ animation: isOpen ? 'none' : 'bjs-float 3s ease-in-out infinite', position: 'relative' }}>
          <AssistantAvatar fullBody={true} />
          {/* Online dot */}
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 13, height: 13, borderRadius: '50%',
            background: '#22c55e', border: '2.5px solid #0a0a0f',
            boxShadow: '0 0 7px rgba(34,197,94,.7)',
          }} />
        </div>
      </div>

    </div>
  );
}

// ============================================
// FLOATING STICKY CTA — slides up after hero scroll
// ============================================
function FloatingCTA({ onQuoteClick, lang = 'en' }) {
  const ar = lang === 'ar';
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('promoDismissed') === 'true'
  );

  const dismiss = () => {
    sessionStorage.setItem('promoDismissed', 'true');
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
  };

  useEffect(() => {
    if (dismissed) return;
    const HERO_HEIGHT = window.innerHeight * 0.9;
    const handleScroll = () => setVisible(window.scrollY > HERO_HEIGHT);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className={`floating-cta${visible ? ' floating-cta--visible' : ''}`} role="complementary" aria-label="Get a quote">
      <div className="floating-cta-inner">
        <div className="floating-cta-text">
          <span className="floating-cta-headline">{ar ? 'لوجستيات المستقبل.' : 'AI-Optimized Shipping.'}</span>
          <span className="floating-cta-sub">{ar ? 'شحن مدعوم بالذكاء الاصطناعي في السعودية' : 'Intelligent Sea, Air & Land Freight'}</span>
        </div>
        <div className="floating-cta-actions">
          <button className="floating-cta-btn" onClick={onQuoteClick}>
            {ar ? 'عرض مجاني' : 'Free Quote'}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button className="floating-cta-dismiss" onClick={dismiss} aria-label="Dismiss">×</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CHAPTER SECTION
// ============================================
function ChapterSection({ chapter, lang = 'en', onBook, compact = false }) {
  const sectionRef = useRef(null);
  const blockRef   = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const block   = blockRef.current;
    if (!section || !block) return;

    let enter = null;
    if (chapter.isHero) {
      // Hero: visible immediately, no animation delay
      block.style.opacity = '1';
      gsap.set(Array.from(block.children), { opacity: 1, y: 0 });
    } else {
      // Non-hero: start visible, only exit animation remains
      block.style.opacity = '1';
      gsap.set(block, { opacity: 1, y: 0 });
    }

    const exit = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'bottom 75%', end: 'bottom 35%', scrub: 0.8 },
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
        <div ref={blockRef} className="chapter-hero-layout-wrapper" style={{ opacity: 1, width: '100%', position: 'relative' }}>
          <div className="chapter-hero-grid">
            {/* COLUMN 1: IMPACT WORDING */}
            <div className="chapter-hero-col chapter-hero-col--left">
              <h2 className="section-title-hero">
                {titleLines.map((line, i) => (
                  <span key={i} style={{ display: 'block' }}>
                    {line}
                  </span>
                ))}
              </h2>
              <p className="section-body-hero">{body}</p>
            </div>

            {/* COLUMN 2: VISUAL FOCUS (SPACER FOR BG SHIP) */}
            <div className="chapter-hero-col chapter-hero-col--center" />

            {/* COLUMN 3: REALITY FORM */}
            <div className="chapter-hero-col chapter-hero-col--right">
              <div className="hero-form-anchor">
                <HeroQuoteForm lang={lang} onBook={onBook} />
              </div>
            </div>
          </div>

          {/* BOTTOM: UNIFIED REALITY STATS */}
          <div className="chapter-hero-stats-row">
            <HeroTrustBar lang={lang} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={`section-${chapter.id}`}
      className={`chapter-section${compact ? ' chapter-section--compact' : ''} chapter-section-${chapter.align} relative z-10`}
    >
      <div ref={blockRef} className="chapter-block" style={{ opacity: 1 }}>

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

        {/* Mini CTA pill — appears on chapters with hasMiniCTA flag */}
        {chapter.hasMiniCTA && (
          <div className={`mini-cta-wrap${isRight ? ' mini-cta-wrap--right' : ''}`}>
            <button
              className="mini-cta-pill"
              onClick={() => onBook?.()}
            >
              <span className="mini-cta-dot" />
              {lang === 'ar' ? 'احصل على عرض مجاني' : 'Get a Free Quote'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <span className="mini-cta-hint">{lang === 'ar' ? 'رد خلال 30 دقيقة · بدون التزام' : '30-min response · No commitment'}</span>
          </div>
        )}

        {/* CTA */}
        {chapter.hasCTA && (
          <div style={{ marginTop: '2.8rem', display: 'flex', flexDirection: 'column', alignItems: isCenter ? 'center' : 'flex-start', gap: '1rem' }}>
            <button
              id="cta-start-journey"
              className="cta-button cta-button-prominent"
              onClick={() => onBook?.()}
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
function CBMCalculator({ lang = 'en' }) {
  const ar = lang === 'ar';
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
    if (totalCBM <= 25)      container = ar ? 'حاوية 20 قدم قياسية (≤25 م³)' : '20ft Standard (≤25 CBM)';
    else if (totalCBM <= 67) container = ar ? 'حاوية 40 قدم قياسية (≤67 م³)' : '40ft Standard (≤67 CBM)';
    else if (totalCBM <= 76) container = ar ? 'حاوية 40 قدم مرتفعة (≤76 م³)' : '40ft High Cube (≤76 CBM)';
    else                     container = ar ? 'مطلوب أكثر من حاوية' : 'Multiple containers needed';
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-7H6a2 2 0 0 0-2 2v12"/>
          <path d="M14 2v6h6"/>
          <path d="M4 12h16"/>
        </svg>
        <h3 className="calc-title">{ar ? 'حاسبة CBM' : 'CBM Calculator'}</h3>
      </div>
      <p className="calc-subtitle">{ar ? 'احسب الأمتار المكعبة لحاويات الشحن البحري' : 'Calculate cubic meters for sea freight containers'}</p>

      {/* Unit toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['cm', 'm'].map(u => (
          <button key={u} onClick={() => setUnit(u)} className={`unit-btn${unit === u ? ' active' : ''}`}>
            {u === 'cm' ? (ar ? 'سنتيمتر' : 'Centimetres') : (ar ? 'متر' : 'Metres')}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="calc-row-header">
        <span>{ar ? `ط (${unit})` : `L (${unit})`}</span>
        <span>{ar ? `ع (${unit})` : `W (${unit})`}</span>
        <span>{ar ? `ا (${unit})` : `H (${unit})`}</span>
        <span>{ar ? 'الكمية' : 'Qty'}</span>
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
          <button onClick={() => removeRow(i)} className="row-remove-btn" disabled={rows.length === 1}>×</button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
        <button onClick={addRow} className="calc-secondary-btn">{ar ? '+ إضافة صف' : '+ Add Row'}</button>
        <button onClick={calculate} className="calc-primary-btn">{ar ? 'احسب' : 'Calculate'}</button>
      </div>

      {result && (
        <div className="calc-result">
          <div className="calc-result-main">
            <span className="calc-result-value">{result.cbm}</span>
            <span className="calc-result-unit">{ar ? 'م³' : 'CBM'}</span>
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
function AirWeightCalculator({ lang = 'en' }) {
  const ar = lang === 'ar';
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
        <h3 className="calc-title">{ar ? 'الوزن المحاسب الجوي' : 'Air Chargeable Weight'}</h3>
      </div>
      <p className="calc-subtitle">{ar ? 'الوزن الفعلي مقابل الحجمي — تدفع الأعلى' : 'Actual vs volumetric — you pay the higher'}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label style={labelStyle}>{ar ? 'الوزن الفعلي (كجم)' : 'Actual Weight (kg)'}</label>
          <input
            type="number" min="0" placeholder="0.00"
            value={actual} onChange={e => setActual(e.target.value)}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div>
          <label style={labelStyle}>{ar ? 'الكمية (قطعة)' : 'Qty (pieces)'}</label>
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
        {(ar
        ? [['الطول (سم)', length, setLength], ['العرض (سم)', width, setWidth], ['الارتفاع (سم)', height, setHeight]]
        : [['Length (cm)', length, setLength], ['Width (cm)', width, setWidth], ['Height (cm)', height, setHeight]]
      ).map(([lbl, val, setter]) => (
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
        {ar ? 'احسب الوزن المحاسب' : 'Calculate Chargeable Weight'}
      </button>

      {result && (
        <div className="calc-result" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="calc-mini-stat">
              <span className="calc-mini-label">{ar ? 'الفعلي' : 'Actual'}</span>
              <span className="calc-mini-value">{result.actual} kg</span>
            </div>
            <div className="calc-mini-stat">
              <span className="calc-mini-label">{ar ? 'الحجمي' : 'Volumetric'}</span>
              <span className="calc-mini-value">{result.volumetric} kg</span>
            </div>
          </div>
          <div className="calc-result-main">
            <span className="calc-result-value">{result.chargeable}</span>
            <span className="calc-result-unit">{ar ? 'كجم محاسب' : 'kg chargeable'}</span>
          </div>
          <div className="calc-result-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.7)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            {ar
              ? `الفاتورة على أساس الوزن ${result.basis === 'volumetric' ? 'الحجمي' : 'الفعلي'}`
              : `Billed on ${result.basis} weight`}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TOOLS SECTION
// ============================================
function ToolsSection({ sectionRef, lang = 'en', onCalcOpen }) {
  const ar = lang === 'ar';
  return (
    <div ref={sectionRef} id="tools-section" className="tools-section">
      {/* Background texture */}
      <div className="tools-bg-line" />

      <div className="tools-inner">
        {/* Header */}
        <div className="tools-header">
          <div className="chapter-label" style={{ justifyContent: 'center' }}>
            {ar ? 'الذكاء اللوجستي' : 'Freight Intelligence'}
          </div>
          <h2 className="tools-title">
            {ar ? 'احسب.' : 'Calculate.'}<br />
            <span className="title-accent">{ar ? 'قرِّر. اشحن.' : 'Decide. Ship.'}</span>
          </h2>
          <p className="tools-subtitle">
            {ar
              ? 'تكنولوجيا بيجويس تمنحك الوضوح الكامل. اختر أداة للبدء.'
              : 'Bejoice technology gives you total clarity. Choose a tool to begin.'}
          </p>
        </div>

        {/* AI Highlight Card — Featured Path to Load Analyzer */}
        <div 
          onClick={onCalcOpen}
          style={{ 
            background: 'linear-gradient(135deg, rgba(200,168,78,0.15), rgba(5,5,8,0.4))',
            border: '1px solid rgba(200,168,78,0.3)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            marginBottom: '2rem',
            cursor: 'pointer',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="ai-tool-highlight"
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.borderColor = 'rgba(200,168,78,0.6)';
            e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4), 0 0 20px rgba(200,168,78,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.borderColor = 'rgba(200,168,78,0.3)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'40%', height:'140%', background:'radial-gradient(circle, rgba(200,168,78,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
          
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
            <div style={{ padding:'1rem', background:'rgba(200,168,78,0.1)', borderRadius:'50%', border:'1px solid rgba(200,168,78,0.2)' }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#c8a84e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            
            <div>
              <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#c8a84e', letterSpacing:'0.25em', textTransform:'uppercase', display:'block', marginBottom:'0.5rem' }}>
                {ar ? 'أداة ذكية جديدة' : 'NEW INTELLIGENT TOOL'}
              </span>
              <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.8rem', color:'#fff', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>
                {ar ? 'محلل الحمولة بالذكاء الاصطناعي' : 'AI LOAD ANALYSER'}
              </h3>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'1rem', maxWidth:'500px', margin:'0 auto 1.5rem', lineHeight:1.6 }}>
                {ar 
                  ? 'قم بتحسين مساحة الحاوية الخاصة بك على الفور. خوارزمياتنا المتقدمة تحسب أفضل طريقة لتعبئة شحنتك.' 
                  : 'Optimize your container space instantly. Our advanced algorithms calculate the most efficient way to pack your cargo.'}
              </p>
              
              <div 
                style={{ 
                  display:'inline-flex', alignItems:'center', gap:'0.75rem', 
                  background:'#c8a84e', color:'#0a0a0f', 
                  padding:'0.9rem 2rem', borderRadius:'3rem',
                  fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:'0.85rem'
                }}
              >
                {ar ? 'ابدأ التحليل الآن' : 'START ANALYSIS NOW'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Existing calculators in smaller grid */}
        <div className="tools-grid" style={{ gridTemplateColumns:'1fr 1fr', opacity:0.8 }}>
          <CBMCalculator lang={lang} />
          <AirWeightCalculator lang={lang} />
        </div>

        {/* Footer note */}
        <p className="tools-footnote">
          {ar
            ? 'الحسابات تقديرية بناءً على معادلات الناقلين القياسية. تُؤكَّد الأسعار النهائية عند الحجز.'
            : 'Calculations are estimates based on standard carrier formulas. Final rates confirmed at booking.'}
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
  const [blNum, setBlNum]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null); // null | 'ok' | 'error'
  const [inputErr, setInputErr] = useState(false);

  const handleTrack = () => {
    if (!blNum.trim()) {
      setInputErr(true);
      return;
    }
    setInputErr(false);
    setLoading(true);
    setResult(null);

    // Simulate lookup delay, then redirect to WhatsApp with pre-filled message
    setTimeout(() => {
      setLoading(false);
      setResult('ok');
      const msg = lang === 'ar'
        ? `مرحباً، أرغب في تتبع الشحنة: ${blNum.trim()}`
        : `Hi, I'd like to track shipment: ${blNum.trim()}`;
      window.open(`https://wa.me/966550000000?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }, 1200);
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
          onChange={e => { setBlNum(e.target.value); setInputErr(false); setResult(null); }}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${inputErr ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '0.45rem',
            padding: '0.6rem 0.9rem',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.82rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(200,168,78,0.5)')}
          onBlur={e => (e.target.style.borderColor = inputErr ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.1)')}
        />
        <button
          onClick={handleTrack}
          className="calc-primary-btn"
          disabled={loading}
          style={{ minWidth: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          {loading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : t.trackBtn}
        </button>
      </div>
      {inputErr && (
        <p style={{ marginTop: '0.4rem', fontSize: '0.68rem', color: 'rgba(255,100,100,0.9)', fontFamily: "'Inter', sans-serif" }}>
          {lang === 'ar' ? 'الرجاء إدخال رقم البوليصة أو AWB' : 'Please enter a BL or AWB number'}
        </p>
      )}
      {result === 'ok' && (
        <div className="tracking-toast">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(37,211,102,1)" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
          <span>
            {t.trackToast}{' '}
            <a
              href={`https://wa.me/966550000000?text=${encodeURIComponent(lang === 'ar' ? `مرحباً، أرغب في تتبع الشحنة: ${blNum.trim()}` : `Hi, I'd like to track shipment: ${blNum.trim()}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(37,211,102,0.9)', textDecoration: 'underline' }}
            >
              {lang === 'ar' ? 'واتساب' : 'Open WhatsApp'}
            </a>
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================
// STICKY TRACKER BAR — fixed below header on scroll
// ============================================
function StickyTracker({ lang = 'en' }) {
  const t = TRANSLATIONS[lang];
  const ar = lang === 'ar';
  const [visible, setVisible] = useState(false);
  const [blNum, setBlNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [inputErr, setInputErr] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTrack = () => {
    if (!blNum.trim()) { setInputErr(true); return; }
    setInputErr(false);
    setLoading(true);
    setDone(false);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      const msg = ar
        ? `مرحباً، أرغب في تتبع الشحنة: ${blNum.trim()}`
        : `Hi, I'd like to track shipment: ${blNum.trim()}`;
      window.open(`https://wa.me/966550000000?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      setTimeout(() => setDone(false), 4000);
    }, 1200);
  };

  return (
    <div className={`sticky-tracker${visible ? ' sticky-tracker--visible' : ''}`} dir={ar ? 'rtl' : 'ltr'}>
      <div className="sticky-tracker-inner">
        {/* Label */}
        <div className="sticky-tracker-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a84e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span>{ar ? 'تتبع الشحنة' : 'Track Shipment'}</span>
        </div>

        {/* Input + Button */}
        <div className="sticky-tracker-form">
          <input
            type="text"
            className={`sticky-tracker-input${inputErr ? ' sticky-tracker-input--err' : ''}`}
            placeholder={ar ? 'رقم البوليصة / AWB' : 'BL No. or AWB (e.g. MSKU1234567)'}
            value={blNum}
            onChange={e => { setBlNum(e.target.value); setInputErr(false); setDone(false); }}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
          />
          <button
            className="sticky-tracker-btn"
            onClick={handleTrack}
            disabled={loading}
          >
            {loading ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : done ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            ) : (ar ? 'تتبع' : t.trackBtn)}
          </button>
        </div>

        {/* Status */}
        {done && (
          <span className="sticky-tracker-toast">
            {ar ? '✓ جارٍ التتبع عبر واتساب' : '✓ Tracking via WhatsApp'}
          </span>
        )}
        {inputErr && (
          <span className="sticky-tracker-toast sticky-tracker-toast--err">
            {ar ? 'أدخل رقم الشحنة' : 'Enter a BL or AWB number'}
          </span>
        )}
      </div>
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
    <div id="services-section" className="trust-strip">
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
    { value: '96%',    label: t.saudiStat1Label },
    { value: '18 Days', label: t.saudiStat2Label },
    { value: '120+',   label: t.saudiStat3Label },
  ];
  return (
    <section id="about-section" className="saudi-section">
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
    <section id="clients-section" className="cases-section">
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
// TESTIMONIALS — cinematic moving cards marquee
// ============================================
function Testimonials({ lang = 'en' }) {
  const cards = [
    { company: 'Saudi Auto Industries', quote: 'Flawless clearance. Germany to Jeddah in 18 days.', tag: 'Sea Freight', initial: 'S' },
    { company: 'PharmaGulf FZCO', quote: 'Cold-chain from Amsterdam to RUH. Not a degree off.', tag: 'Air Reefer', initial: 'P' },
    { company: 'GCC Industrial Corp', quote: 'ZATCA compliance handled end-to-end. Zero headaches.', tag: 'Customs', initial: 'G' },
    { company: 'Al-Rajhi Logistics', quote: '40ft HC from Shenzhen. Port-to-door in 22 days flat.', tag: 'FCL', initial: 'A' },
    { company: 'Rawabi Holdings', quote: 'Project cargo, OOG permits, escort — all coordinated.', tag: 'Project Cargo', initial: 'R' },
    { company: 'Thiqah Trading Co.', quote: 'Three ports, two modes, one invoice. Brilliant.', tag: 'Multimodal', initial: 'T' },
    { company: 'MedPlus KSA', quote: 'Pharma import licence, ATP certification — sorted fast.', tag: 'Air Freight', initial: 'M' },
    { company: 'Al-Futtaim Retail', quote: 'Seasonal stock shipped sea freight. Never missed a window.', tag: 'LCL', initial: 'A' },
  ];

  // Duplicate for seamless loop
  const all = [...cards, ...cards];

  return (
    <section className="testimonials-marquee-section">
      <div className="testimonials-marquee-header">
        <div className="chapter-label" style={{ justifyContent: 'center', marginBottom: '0.6rem' }}>
          {lang === 'ar' ? 'آراء العملاء' : 'CLIENT VOICES'}
        </div>
        <h2 className="testimonials-marquee-title">
          {lang === 'ar' ? 'يثقون بنا.' : 'Trusted by'}
          {' '}<span className="title-accent">{lang === 'ar' ? 'ولسبب وجيه.' : 'Industry Leaders.'}</span>
        </h2>
        <p className="testimonials-marquee-sub">
          {lang === 'ar'
            ? 'من كبرى شركات الشحن إلى شركات الأدوية — نُنجز المهمة.'
            : 'From FMCG giants to pharmaceutical specialists — we deliver.'}
        </p>
      </div>

      {/* Row 1 — moves left */}
      <div className="marquee-track-wrap">
        <div className="marquee-fade-left" />
        <div className="marquee-track marquee-track--left">
          {all.map((c, i) => (
            <div key={i} className="marquee-card">
              <div className="marquee-card-top">
                <div className="marquee-avatar">{c.initial}</div>
                <div>
                  <div className="marquee-company">{c.company}</div>
                  <div className="marquee-tag">{c.tag}</div>
                </div>
              </div>
              <p className="marquee-quote">"{c.quote}"</p>
              <div className="marquee-stars">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="rgba(200,168,78,0.85)">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="marquee-fade-right" />
      </div>

      {/* Row 2 — moves right (reversed) */}
      <div className="marquee-track-wrap" style={{ marginTop: '1.25rem' }}>
        <div className="marquee-fade-left" />
        <div className="marquee-track marquee-track--right">
          {[...all].reverse().map((c, i) => (
            <div key={i} className="marquee-card marquee-card--dim">
              <div className="marquee-card-top">
                <div className="marquee-avatar">{c.initial}</div>
                <div>
                  <div className="marquee-company">{c.company}</div>
                  <div className="marquee-tag">{c.tag}</div>
                </div>
              </div>
              <p className="marquee-quote">"{c.quote}"</p>
            </div>
          ))}
        </div>
        <div className="marquee-fade-right" />
      </div>
    </section>
  );
}

// ============================================
// PRICING ESTIMATOR
// ============================================
function PricingEstimator({ lang = 'en' }) {
  const [mode, setMode] = useState('sea');
  const [route, setRoute] = useState('eu-sa');
  const [size, setSize] = useState('medium');

  const modes = [
    { id: 'sea',  icon: '🚢', label: lang === 'ar' ? 'بحري'  : 'Sea Freight',  sub: 'FCL / LCL' },
    { id: 'air',  icon: '✈️', label: lang === 'ar' ? 'جوي'   : 'Air Freight',  sub: lang === 'ar' ? 'عاجل / اقتصادي' : 'Express / Economy' },
    { id: 'land', icon: '🚛', label: lang === 'ar' ? 'بري'   : 'Land Freight', sub: 'FTL / LTL' },
  ];

  const routes = {
    sea:  [
      { id: 'eu-sa', label: lang === 'ar' ? 'أوروبا → السعودية'  : 'Europe → KSA',  days: '18–22' },
      { id: 'cn-sa', label: lang === 'ar' ? 'الصين → السعودية'   : 'China → KSA',   days: '22–28' },
      { id: 'us-sa', label: lang === 'ar' ? 'أمريكا → السعودية'  : 'USA → KSA',     days: '26–34' },
    ],
    air:  [
      { id: 'eu-sa', label: lang === 'ar' ? 'أوروبا → السعودية'  : 'Europe → KSA',  days: '2–4' },
      { id: 'cn-sa', label: lang === 'ar' ? 'الصين → السعودية'   : 'China → KSA',   days: '3–5' },
      { id: 'us-sa', label: lang === 'ar' ? 'أمريكا → السعودية'  : 'USA → KSA',     days: '4–6' },
    ],
    land: [
      { id: 'ae-sa', label: lang === 'ar' ? 'الإمارات → السعودية' : 'UAE → KSA',    days: '1–2' },
      { id: 'kw-sa', label: lang === 'ar' ? 'الكويت → السعودية'   : 'Kuwait → KSA', days: '1–2' },
      { id: 'jo-sa', label: lang === 'ar' ? 'الأردن → السعودية'   : 'Jordan → KSA', days: '2–3' },
    ],
  };

  const sizes = {
    sea:  [
      { id: 'small',  label: 'LCL / 20ft', sub: lang === 'ar' ? 'شحن مشترك' : 'Shared load',  range: '$900 – $1,800' },
      { id: 'medium', label: '40ft Std',    sub: lang === 'ar' ? 'حاوية كاملة' : 'Full container', range: '$1,400 – $2,600' },
      { id: 'large',  label: '40ft HC',     sub: lang === 'ar' ? 'مرتفعة' : 'High cube',       range: '$1,600 – $3,000' },
    ],
    air:  [
      { id: 'small',  label: '< 100 kg',   sub: lang === 'ar' ? 'طرد صغير' : 'Small parcel',   range: '$4 – $8 /kg' },
      { id: 'medium', label: '100–500 kg', sub: lang === 'ar' ? 'بضاعة عامة' : 'General cargo',  range: '$3 – $6 /kg' },
      { id: 'large',  label: '500 kg+',    sub: lang === 'ar' ? 'شحن ضخم' : 'Bulk cargo',       range: '$2 – $5 /kg' },
    ],
    land: [
      { id: 'small',  label: 'LTL',        sub: lang === 'ar' ? 'حمولة جزئية' : 'Partial load',  range: '$350 – $700' },
      { id: 'medium', label: 'FTL',        sub: lang === 'ar' ? 'شاحنة كاملة' : 'Full truck',    range: '$700 – $1,400' },
      { id: 'large',  label: 'Multi-truck',sub: lang === 'ar' ? 'أسطول' : '2+ trucks',           range: lang === 'ar' ? 'عرض مخصص' : 'Custom quote' },
    ],
  };

  const currentRoute = routes[mode].find(r => r.id === route) || routes[mode][0];
  const currentSize  = sizes[mode].find(s => s.id === size)   || sizes[mode][1];

  const handleModeChange = (m) => {
    setMode(m);
    setRoute(routes[m][0].id);
    setSize('medium');
  };

  return (
    <section className="pricing-section">
      <div className="pricing-inner">
        <div className="chapter-label" style={{ justifyContent: 'center' }}>
          {lang === 'ar' ? 'أسعار تقديرية' : 'Rate Estimates'}
        </div>
        <h2 className="pricing-title">
          {lang === 'ar' ? 'تعرّف على' : 'Know Your'}<br />
          <span className="title-accent">{lang === 'ar' ? 'تكلفة الشحن.' : 'Freight Cost.'}</span>
        </h2>
        <p className="pricing-subtitle">
          {lang === 'ar'
            ? 'تقديرات سريعة بناءً على المسار والحجم. الأسعار النهائية تُؤكَّد عند الحجز.'
            : 'Indicative ranges based on route and shipment size. Final rates confirmed at booking.'}
        </p>

        {/* Mode selector */}
        <div className="pricing-modes">
          {modes.map(m => (
            <button
              key={m.id}
              className={`pricing-mode-btn${mode === m.id ? ' active' : ''}`}
              onClick={() => handleModeChange(m.id)}
            >
              <span className="pricing-mode-icon">{m.icon}</span>
              <span className="pricing-mode-label">{m.label}</span>
              <span className="pricing-mode-sub">{m.sub}</span>
            </button>
          ))}
        </div>

        <div className="pricing-body">
          {/* Route list */}
          <div className="pricing-col">
            <div className="pricing-col-title">{lang === 'ar' ? 'المسار' : 'Route'}</div>
            <div className="pricing-route-list">
              {routes[mode].map(r => (
                <button
                  key={r.id}
                  className={`pricing-route-btn${route === r.id ? ' active' : ''}`}
                  onClick={() => setRoute(r.id)}
                >
                  <span>{r.label}</span>
                  <span className="pricing-route-days">{r.days} {lang === 'ar' ? 'يوم' : 'days'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="pricing-col">
            <div className="pricing-col-title">{lang === 'ar' ? 'الحجم' : 'Size / Volume'}</div>
            <div className="pricing-size-list">
              {sizes[mode].map(s => (
                <button
                  key={s.id}
                  className={`pricing-size-btn${size === s.id ? ' active' : ''}`}
                  onClick={() => setSize(s.id)}
                >
                  <span className="pricing-size-label">{s.label}</span>
                  <span className="pricing-size-sub">{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="pricing-result-card">
            <div className="pricing-result-eyebrow">{lang === 'ar' ? 'التقدير' : 'Estimate'}</div>
            <div className="pricing-result-range">{currentSize.range}</div>
            <div className="pricing-result-meta">
              <div className="pricing-result-route">{currentRoute.label}</div>
              <div className="pricing-result-days">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,78,0.7)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {currentRoute.days} {lang === 'ar' ? 'يوم' : 'days transit'}
              </div>
            </div>
            <div className="pricing-result-divider" />
            <button
              className="pricing-cta-btn"
              onClick={() => document.getElementById('quick-quote-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {lang === 'ar' ? 'احصل على عرض رسمي' : 'Get Exact Quote'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <p className="pricing-disclaimer">
              {lang === 'ar' ? '* تقديرات إرشادية. الأسعار النهائية حسب تفاصيل الشحن.' : '* Indicative only. Final rates depend on cargo details.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CLIENT LOGOS
// ============================================
// SVG logo marks for each company
const LOGOS = {
  'SPEC':           { svg: <><circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M10 16h12M16 10v12" stroke="currentColor" strokeWidth="2"/></>, color: '#c8a84e', tag: 'Oil & Gas' },
  'Aldahra':        { svg: <><path d="M8 20 L16 8 L24 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 20 L16 13 L20 20" fill="currentColor" opacity="0.4"/></>, color: '#4ade80', tag: 'Agriculture' },
  'TotalEnergies':  { svg: <><rect x="7" y="7" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M11 16 L15 12 L19 16 L23 12" stroke="currentColor" strokeWidth="2" fill="none"/></>, color: '#f87171', tag: 'Energy' },
  'Bahri':          { svg: <><path d="M8 20 Q16 8 24 20" fill="none" stroke="currentColor" strokeWidth="2.5"/><path d="M6 20 H26" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/></>, color: '#a78bfa', tag: 'Shipping' },
  'Gutmann':        { svg: <><rect x="9" y="9" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="13" y="13" width="6" height="6" fill="currentColor" opacity="0.6"/></>, color: '#fb923c', tag: 'Industrial' },
  'Petrochem':      { svg: <><path d="M16 6 L26 22 H6 Z" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="17" r="3" fill="currentColor" opacity="0.5"/></>, color: '#38bdf8', tag: 'Chemicals' },
  'Samsung':        { svg: <><ellipse cx="16" cy="16" rx="10" ry="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M11 16 L15 20 L21 12" stroke="currentColor" strokeWidth="2.5" fill="none"/></>, color: '#60a5fa', tag: 'Electronics' },
  'NAFFCO':         { svg: <><path d="M8 24 L16 8 L24 24" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="11" y1="19" x2="21" y2="19" stroke="currentColor" strokeWidth="2"/></>, color: '#f87171', tag: 'Safety' },
  'Trosten':        { svg: <><circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 13 Q16 10 20 13 Q20 19 16 22 Q12 19 12 13Z" fill="currentColor" opacity="0.4"/></>, color: '#34d399', tag: 'HVAC' },
  'Radius Global':  { svg: <><circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="16" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/><line x1="16" y1="6" x2="16" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.5"/><line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.5"/></>, color: '#38bdf8', tag: 'Logistics' },
  'AquaChemie':     { svg: <><path d="M16 6 C16 6 8 14 8 19 C8 23.4 11.6 27 16 27 C20.4 27 24 23.4 24 19 C24 14 16 6 16 6Z" fill="none" stroke="currentColor" strokeWidth="2" transform="scale(0.75) translate(5,4)"/></>, color: '#22d3ee', tag: 'Chemicals' },
  'Kenwood':        { svg: <><rect x="7" y="12" width="18" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="11" cy="16" r="2" fill="currentColor" opacity="0.6"/><circle cx="21" cy="16" r="2" fill="currentColor" opacity="0.6"/></>, color: '#f87171', tag: 'Electronics' },
  'MG Motors':      { svg: <><path d="M7 20 L7 14 L16 8 L25 14 L25 20 Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M13 20 L13 15 L16 12 L19 15 L19 20" fill="none" stroke="currentColor" strokeWidth="1.5"/></>, color: '#f87171', tag: 'Automotive' },
  'Hyundai':        { svg: <><path d="M8 16 C8 11.6 11.6 8 16 8 C20.4 8 24 11.6 24 16 C24 20.4 20.4 24 16 24 C11.6 24 8 20.4 8 16Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M11 16 L16 12 L21 16" stroke="currentColor" strokeWidth="2" fill="none"/></>, color: '#60a5fa', tag: 'Automotive' },
  'L&T':            { svg: <><rect x="8" y="8" width="7" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="17" y="8" width="7" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1.5"/></>, color: '#fbbf24', tag: 'Engineering' },
  'Nuroil':         { svg: <><path d="M16 7 C16 7 10 13 10 18 C10 21.3 12.7 24 16 24 C19.3 24 22 21.3 22 18 C22 13 16 7 16 7Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 18 C14.3 18 13 16.7 13 15" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/></>, color: '#fb923c', tag: 'Oil & Gas' },
  'DP World':       { svg: <><rect x="6" y="14" width="20" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 14 L9 10 L23 10 L23 14" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5"/><line x1="16" y1="10" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5"/><line x1="20" y1="10" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5"/></>, color: '#c8a84e', tag: 'Ports' },
  'Maersk':         { svg: <><path d="M6 18 Q16 8 26 18" fill="none" stroke="currentColor" strokeWidth="2.5"/><rect x="9" y="18" width="14" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/></>, color: '#42b0d5', tag: 'Shipping' },
  'MSC':            { svg: <><path d="M6 20 L10 12 L16 20 L22 12 L26 20" fill="none" stroke="currentColor" strokeWidth="2.5"/><line x1="6" y1="22" x2="26" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/></>, color: '#fbbf24', tag: 'Shipping' },
  'Hapag-Lloyd':    { svg: <><rect x="7" y="10" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M7 16 H25" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><circle cx="11" cy="13" r="1.5" fill="currentColor" opacity="0.6"/></>, color: '#f97316', tag: 'Shipping' },
  'Emirates SkyCargo': { svg: <><path d="M6 18 L14 10 L26 14 L22 18 Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M14 10 L14 18" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/><path d="M6 20 L26 20" stroke="currentColor" strokeWidth="1" opacity="0.3"/></>, color: '#f87171', tag: 'Air Cargo' },
  'CMA CGM':        { svg: <><path d="M8 20 Q8 10 16 10 Q24 10 24 20" fill="none" stroke="currentColor" strokeWidth="2.5"/><line x1="8" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="2"/><line x1="14" y1="10" x2="14" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.4"/><line x1="18" y1="10" x2="18" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.4"/></>, color: '#38bdf8', tag: 'Shipping' },
  'DHL':            { svg: <><path d="M6 14 L26 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M6 19 L20 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M20 19 L26 14" stroke="currentColor" strokeWidth="2.5"/></>, color: '#fde047', tag: 'Express' },
  'Kuehne+Nagel':   { svg: <><circle cx="12" cy="16" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="16" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="22" x2="26" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/></>, color: '#38bdf8', tag: 'Logistics' },
};

function HcStatBar({ lang }) {
  const ar = lang === 'ar';
  const [clients, clientsRef] = useCountUp(200);
  const [industries, industriesRef] = useCountUp(24);
  return (
    <div className="hc-stat-bar">
      <div className="hc-stat-item" ref={clientsRef}>
        <span className="hc-stat-val">{clients}<sup>+</sup></span>
        <span className="hc-stat-lbl">{ar ? 'عميل راضٍ' : 'Satisfied Clients'}</span>
      </div>
      <div className="hc-stat-divider" />
      <div className="hc-stat-item" ref={industriesRef}>
        <span className="hc-stat-val">{industries}</span>
        <span className="hc-stat-lbl">{ar ? 'صناعة' : 'Industries Served'}</span>
      </div>
      <div className="hc-stat-divider" />
      <div className="hc-stat-item">
        <span className="hc-stat-val">KSA <span style={{fontSize:'0.6em', opacity:0.7}}>& GCC</span></span>
        <span className="hc-stat-lbl">{ar ? 'تغطية إقليمية' : 'Regional Coverage'}</span>
      </div>
    </div>
  );
}

function ClientLogos({ lang = 'en' }) {
  const row1 = ['SPEC','Aldahra','TotalEnergies','Bahri','Gutmann','Petrochem','Samsung','NAFFCO'];
  const row2 = ['Trosten','Radius Global','AquaChemie','Kenwood','MG Motors','Hyundai','L&T','Nuroil'];
  const row3 = ['DP World','Maersk','MSC','Hapag-Lloyd','Emirates SkyCargo','CMA CGM','DHL','Kuehne+Nagel'];

  const LogoCard = ({ name }) => {
    const info = LOGOS[name] || { svg: null, color: '#c8a84e', tag: 'Partner' };
    return (
      <div className="hc-card" style={{ '--brand': info.color }}>
        <div className="hc-card-topbar" />
        <div className="hc-card-body">
          <div className="hc-card-icon" style={{ color: info.color }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {info.svg}
            </svg>
          </div>
          <div className="hc-card-text">
            <span className="hc-card-name">{name}</span>
            <span className="hc-card-tag">{info.tag}</span>
          </div>
        </div>
        <div className="hc-card-shimmer" />
      </div>
    );
  };

  const MarqueeRow = ({ items, reverse = false, speed = 30 }) => (
    <div className="hc-row-wrap">
      <div className={`hc-track ${reverse ? 'hc-track--rtl' : 'hc-track--ltr'}`}
           style={{ '--speed': `${speed}s` }}>
        {[...items, ...items, ...items].map((name, i) => <LogoCard key={i} name={name} />)}
      </div>
    </div>
  );

  return (
    <section className="hc-section">
      {/* Animated mesh background */}
      <div className="hc-mesh" aria-hidden="true" />

      {/* Header */}
      <div className="hc-header">
        <div className="hc-eyebrow">
          <span className="hc-eyebrow-line" />
          <span>{lang === 'ar' ? 'شركاؤنا' : 'TRUSTED BY INDUSTRY LEADERS'}</span>
          <span className="hc-eyebrow-line" />
        </div>
        <h2 className="hc-headline">
          {lang === 'ar' ? 'موثوق به من قِبل' : 'Trusted by'}{' '}
          <span className="hc-headline-gold">{lang === 'ar' ? 'قادة الصناعة' : 'Industry Leaders'}</span>
        </h2>
        <p className="hc-desc">
          {lang === 'ar'
            ? 'شركات عالمية رائدة تثق في بيجويس لتحريك بضائعها حول العالم'
            : 'Global enterprises that trust Bejoice to move what matters'}
        </p>
      </div>

      {/* Three alternating marquee rows */}
      <div className="hc-marquees">
        <MarqueeRow items={row1} reverse={false} speed={35} />
        <MarqueeRow items={row2} reverse={true}  speed={28} />
        <MarqueeRow items={row3} reverse={false} speed={40} />
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
      {/* Gold accent top bar */}
      <div className="footer-gold-bar" />

      <div className="footer-inner">
        <div className="footer-brand">
          <BJSLogo />
          <p className="footer-tagline" style={{ whiteSpace: 'pre-line' }}>{t.footerTagline}</p>
          {/* Certifications row */}
          <div className="footer-certs">
            {['ZATCA', 'ISO 9001', 'FIATA', 'IATA'].map(cert => (
              <span key={cert} className="footer-cert-badge">{cert}</span>
            ))}
          </div>
        </div>
        <div className="footer-contact">
          <h4 className="footer-col-title">{t.footerContactTitle}</h4>
          <address className="footer-address" style={{ whiteSpace: 'pre-line' }}>
            Bejoice Group{'\n'}{t.footerAddress}
          </address>
          <div className="footer-links-list">
            <a href="tel:+966550000000" className="footer-link footer-link-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3-8.69A2 2 0 0 1 3.82 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 16z"/></svg>
              +966 55 000 0000
            </a>
            <a href="https://wa.me/966550000000?text=Hello%2C+I+need+a+freight+quote" target="_blank" rel="noopener noreferrer" className="footer-link footer-link-wa footer-link-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              {t.footerWhatsapp}
            </a>
            <a href="mailto:info@bejoice.com" className="footer-link footer-link-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              info@bejoice.com
            </a>
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
        <span className="footer-compliance-row">{t.footerCompliance}</span>
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
      {CHAPTERS[currentAct]?.label || ''}
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
  const [loadProgress, setLoadProgress] = useState(100);
  const [isLoaded, setIsLoaded]         = useState(true);
  const [showLoader, setShowLoader]     = useState(false);
  const [currentAct, setCurrentAct]     = useState(1);
  const [lang, setLang]                 = useState('en');
  const [airOpen,  setAirOpen]  = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const { openCalPopup } = useCalBooking('sudeshna-pal-ruww5f/freight-consultation');
  const openBooking = openCalPopup;

  // Prevent browser from restoring scroll position on refresh
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

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
    // desynchronized: false → full compositing quality (no tearing, no softness)
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: false, willReadFrequently: false });
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalCompositeOperation = 'source-over';

    // Smooth mouse/gyro parallax
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

    // Ultra-High Resolution (Retina Extreme) Logic
    const dpr    = Math.max(3, window.devicePixelRatio || 1);
    const t      = performance.now() / 1000;
    const driftX = (Math.sin(t * 0.17) * 4 + Math.sin(t * 0.08) * 2) * dpr;
    const driftY = (Math.cos(t * 0.13) * 3 + Math.cos(t * 0.09) * 1) * dpr;

    // Portrait → contain; landscape → cover
    const isPortrait = ch > cw;
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, cw, ch);

    // Force cover for scrollytelling backgrounds to avoid black bars
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    const bleedX = Math.max((dw - cw) / 2, 0);
    const bleedY = Math.max((dh - ch) / 2, 0);
    const rawPx  = isPortrait ? 0 : mouseRef.current.x * 12 * dpr + driftX;
    const rawPy  = isPortrait ? 0 : mouseRef.current.y *  8 * dpr + driftY;
    const px     = Math.max(-bleedX, Math.min(bleedX, rawPx));
    const py     = Math.max(-bleedY, Math.min(bleedY, rawPy));

    const dx  = (cw - dw) / 2 + px;
    const dy  = (ch - dh) / 2 + py;
    const ddw = dw;
    const ddh = dh;

    // ── HDR & Sharpening — enhances perceived resolution ──────────────────────
    const contrast = 1.05;
    const brightness = 1.02;
    const saturate = 1.08;
    ctx.filter = `contrast(${contrast}) brightness(${brightness}) saturate(${saturate})`;
    
    // ── Base draw ──────────────────────────────────────────────────────────────
    ctx.drawImage(img, dx, dy, ddw, ddh);

    // Reset filter for effects
    ctx.filter = 'none';

    // ── HDR-like enhancement passes ────────────────────────────────────────────
    // Pass 1: soft-light at 18% — lifts midtone saturation and perceived depth
    ctx.globalAlpha = 0.18;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(img, dx, dy, ddw, ddh);

    // Pass 2: overlay at 10% — punches contrast in highlights and shadows
    ctx.globalAlpha = 0.10;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(img, dx, dy, ddw, ddh);

    // Reset compositing for vignette
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    // Vignette — lighter touch to preserve frame detail and mid-tones
    const vigCx    = cw / 2;
    const vigCy    = ch / 2;
    const vigInner = isPortrait ? Math.min(dw, dh) * 0.12 : ch * 0.15;
    const vigOuter = isPortrait ? Math.max(dw, dh) * 0.80 : Math.max(cw, ch) * 0.90;
    const vig = ctx.createRadialGradient(vigCx, vigCy, vigInner, vigCx, vigCy, vigOuter);
    vig.addColorStop(0,    'rgba(0,0,0,0)');
    vig.addColorStop(0.50, 'rgba(0,0,0,0)');
    vig.addColorStop(0.78, 'rgba(0,0,0,0.12)');
    vig.addColorStop(1,    'rgba(0,0,0,0.38)');
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
    // Use actual DPR, minimum 2 for crisp rendering on all screens
    const dpr = Math.max(3, window.devicePixelRatio || 1);
    const w   = Math.round(window.innerWidth  * dpr);
    const h   = Math.round(window.innerHeight * dpr);
    canvas.width        = w;
    canvas.height       = h;
    canvas.style.width  = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: false, willReadFrequently: false });
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

    // Load first 40 frames before unlocking (hero chapter),
    // then stream the remaining 436 in sequential batches.
    const CRITICAL = 1;
    let critLoaded = 0;
    let totalLoaded = 0;

    const onCritLoad = () => {
      if (cancelled) return;
      critLoaded++;
      totalLoaded++;
      if (critLoaded === CRITICAL) {
        loadRest();
      }
    };

    // Stream remaining frames sequentially in batches of 8.
    // Each batch starts only after the previous batch completes,
    // guaranteeing frames are ready in scroll order — no repeats.
    const loadRest = () => {
      const BATCH = 8;

      const loadBatch = (start) => {
        if (cancelled || start >= TOTAL_FRAMES) return;
        const end = Math.min(start + BATCH, TOTAL_FRAMES);
        const batchSize = end - start;
        let batchDone = 0;

        for (let i = start; i < end; i++) {
          if (cancelled) return;
          const img = new Image();
          img.onload = img.onerror = () => {
            if (cancelled) return;
            totalLoaded++;
            setLoadProgress((totalLoaded / TOTAL_FRAMES) * 100);
            if (++batchDone === batchSize) loadBatch(end); // trigger next batch
          };
          img.src = FRAME_URL(i);
          images[i] = img;
        }
      };

      loadBatch(CRITICAL);
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

    const tween = gsap.to(frameObjRef.current, {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      scrollTrigger: {
        trigger: '#scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
      onUpdate: () => {
        const frame = Math.round(frameObjRef.current.frame);
        drawFrame(frame);
        // Debug overlay
        const el = document.getElementById('debug-frame-num');
        if (el) el.textContent = frame;
        // Find current chapter index
        const chapterIndex = CHAPTERS.findIndex(c => frame >= c.frameStart && frame <= c.frameEnd);
        if (chapterIndex !== -1) {
          setCurrentAct(chapterIndex);
        }
      }
    });

    // Fade canvas out as scroll-container bottom approaches viewport bottom
    // so post-scroll sections emerge cleanly with no frozen-frame dead zone
    const fadeOut = gsap.to('.canvas-container', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#scroll-container',
        start: 'bottom 80%',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      fadeOut.scrollTrigger?.kill();
      fadeOut.kill();
    };
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
      wheelMultiplier: 0.7,
      touchMultiplier: 1.2,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return () => lenis.destroy();
  }, []);

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <>
      {showLoader && <LoadingScreen progress={loadProgress} isLoaded={isLoaded} onDone={() => setShowLoader(false)} />}

      {/* Fixed canvas — all frames paint here */}
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>

<Header onToolsClick={scrollToTools} onQuoteClick={openBooking} lang={lang} toggleLang={toggleLang} airOpen={airOpen} setAirOpen={setAirOpen} calcOpen={calcOpen} setCalcOpen={setCalcOpen} />
      <ActIndicator currentAct={currentAct} />

      <div id="scroll-container" className="relative z-10">
        {/* Chapter 0 — Hero */}
        <ChapterSection chapter={CHAPTERS[0]} lang={lang} onBook={openBooking} />

        {/* Chapters 1–2 — Maritime & Port */}
        {CHAPTERS.slice(1, 3).map(ch => (
          <ChapterSection key={ch.id} chapter={ch} lang={lang} compact />
        ))}

        {/* Chapter 4 — CTA (air chapter skipped to avoid overlap with frame sequence) */}
        <ChapterSection chapter={CHAPTERS[4]} lang={lang} onBook={openBooking} compact />
      </div>

      {/* Post-scroll sections — tight, no dead space */}
      <TrustStrip lang={lang} />
      <HowItWorks lang={lang} />
      <CaseStudies lang={lang} />
      <ClientLogos lang={lang} />
      <ToolsSection sectionRef={toolsSectionRef} lang={lang} onCalcOpen={() => setCalcOpen(true)} />

      <SiteFooter lang={lang} />

      <StickyTracker lang={lang} />
      <AIAssistant lang={lang} />
      <WhatsAppButton />
      <ProgressBar />

      {/* Cal.com popup — opened via useCalBooking hook */}

      {/* Floating sticky CTA bar — slides in after hero */}
      <FloatingCTA onQuoteClick={openBooking} lang={lang} />

      {/* Veo watermark cover — masks AI video branding bottom-right of canvas */}
      <div className="veo-cover" aria-hidden="true" />
    </>
  );
}

// components/FloatingBookCTA.jsx
// Animated friendly chat assistant — waves at user, cycles messages, expands to mini chat

import { useState, useEffect, useRef } from "react";
import { useCalBooking } from "../hooks/useCalBooking";

const CAL_LINK = "sudeshna-pal-ruww5f/freight-consultation";

const MESSAGES = [
  "Hey there! 👋 Need help with shipping?",
  "Get a free freight quote in 60 seconds!",
  "We ship anywhere in Saudi Arabia 🇸🇦",
  "Sea · Air · Land — we cover it all!",
  "Talk to a freight expert, free of charge!",
];

const QUICK_REPLIES = [
  { label: "📦 Get a Quote", action: "quote" },
  { label: "✈️ Air Freight", action: "quote" },
  { label: "🚢 Sea Freight", action: "quote" },
  { label: "📞 Call Expert", action: "call" },
];

// Inject keyframes once
const STYLE_ID = "chat-assistant-keyframes";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes ca-wave {
      0%   { transform: rotate(0deg);   }
      15%  { transform: rotate(20deg);  }
      30%  { transform: rotate(-10deg); }
      45%  { transform: rotate(18deg);  }
      60%  { transform: rotate(-6deg);  }
      75%  { transform: rotate(12deg);  }
      100% { transform: rotate(0deg);   }
    }
    @keyframes ca-float {
      0%, 100% { transform: translateY(0px);   }
      50%       { transform: translateY(-6px);  }
    }
    @keyframes ca-pulse-ring {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.7); opacity: 0;   }
    }
    @keyframes ca-bubble-in {
      0%   { opacity: 0; transform: scale(0.8) translateY(6px); }
      100% { opacity: 1; transform: scale(1)   translateY(0);   }
    }
    @keyframes ca-msg-fade {
      0%   { opacity: 0; transform: translateY(4px);  }
      15%  { opacity: 1; transform: translateY(0);    }
      80%  { opacity: 1; transform: translateY(0);    }
      100% { opacity: 0; transform: translateY(-4px); }
    }
    @keyframes ca-panel-in {
      0%   { opacity: 0; transform: translateY(20px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes ca-dot-bounce {
      0%, 80%, 100% { transform: translateY(0);    }
      40%            { transform: translateY(-6px); }
    }
    @keyframes ca-slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    .ca-wave-hand { display: inline-block; animation: ca-wave 1.8s ease-in-out; transform-origin: 70% 80%; }
    .ca-wave-hand:hover { animation: ca-wave 0.8s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
}

export default function FloatingBookCTA({ onQuoteClick, lang }) {
  const { openCalPopup } = useCalBooking(CAL_LINK, "freight");
  const [visible, setVisible]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [msgIndex, setMsgIndex]   = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [typing, setTyping]       = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hi! I'm Bejoice Assistant 👋 How can I help you today?" }
  ]);
  const [waving, setWaving]       = useState(true);
  const chatEndRef                = useRef(null);
  const ar = lang === "ar";

  // Show/hide on scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollY   = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const viewH     = window.innerHeight;
      setVisible(scrollY > 300 && scrollY + viewH < docHeight - 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cycle speech bubble messages
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setShowBubble(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length);
        setShowBubble(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  // Wave on mount + periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setWaving(true);
      setTimeout(() => setWaving(false), 2000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, typing]);

  const handleQuickReply = (action, label) => {
    setChatMessages(prev => [...prev, { from: "user", text: label }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (action === "call") {
        setChatMessages(prev => [...prev, {
          from: "bot",
          text: "Great! Let me connect you with a freight expert right now. 📞",
          cta: { label: "Book Free Call", action: "call" }
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          from: "bot",
          text: "Sure! Fill out a quick quote form and we'll get back to you within the hour. 🚀",
          cta: { label: "Open Quote Form", action: "quote" }
        }]);
      }
    }, 1200);
  };

  const handleCTA = (action) => {
    if (action === "call") openCalPopup();
    else {
      document.getElementById("quick-quote-section")?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          width: 320,
          background: "linear-gradient(160deg, #0d1b2e 0%, #0a1220 100%)",
          border: "1px solid rgba(200,168,78,0.25)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,168,78,0.1)",
          animation: "ca-panel-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(90deg, #0f2340 0%, #1a3a60 100%)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(200,168,78,0.15)",
          }}>
            <div style={{ position: "relative" }}>
              <Avatar size={36} />
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: "50%",
                background: "#22c55e", border: "2px solid #0f2340",
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "Inter, sans-serif" }}>Bejoice Assistant</div>
              <div style={{ color: "#22c55e", fontSize: 11, fontFamily: "Inter, sans-serif" }}>● Online now</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ height: 220, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ animation: "ca-slide-up 0.3s ease forwards", display: "flex", flexDirection: "column", alignItems: msg.from === "bot" ? "flex-start" : "flex-end", gap: 6 }}>
                <div style={{
                  maxWidth: "85%",
                  background: msg.from === "bot"
                    ? "rgba(255,255,255,0.07)"
                    : "linear-gradient(135deg, #c8a84e, #a8843e)",
                  color: "#fff",
                  borderRadius: msg.from === "bot" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                  padding: "9px 13px",
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.5,
                  border: msg.from === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}>
                  {msg.text}
                </div>
                {msg.cta && (
                  <button onClick={() => handleCTA(msg.cta.action)} style={{
                    background: "linear-gradient(135deg, #c8a84e, #a8843e)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: "0.03em",
                  }}>
                    {msg.cta.label} →
                  </button>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "rgba(255,255,255,0.07)", borderRadius: "4px 14px 14px 14px", width: "fit-content", border: "1px solid rgba(255,255,255,0.08)" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#c8a84e",
                    animation: `ca-dot-bounce 1.2s ease ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: "8px 14px 14px", display: "flex", flexWrap: "wrap", gap: 7, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {QUICK_REPLIES.map(r => (
              <button key={r.label} onClick={() => handleQuickReply(r.action, r.label)} style={{
                background: "rgba(255,255,255,0.06)",
                color: "#e8d48a",
                border: "1px solid rgba(200,168,78,0.3)",
                borderRadius: 20,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,168,78,0.15)"; e.currentTarget.style.borderColor = "rgba(200,168,78,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(200,168,78,0.3)"; }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Speech bubble (when closed) ── */}
      {!open && showBubble && (
        <div style={{
          background: "linear-gradient(135deg, #0f2340, #1a3a60)",
          color: "#f0e6c8",
          border: "1px solid rgba(200,168,78,0.35)",
          borderRadius: "16px 16px 4px 16px",
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          maxWidth: 220,
          textAlign: "right",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          animation: "ca-bubble-in 0.4s ease forwards",
          lineHeight: 1.45,
          cursor: "pointer",
          pointerEvents: "auto",
        }} onClick={() => setOpen(true)}>
          <span style={{ animation: "ca-msg-fade 4s ease forwards", display: "block" }}>
            {MESSAGES[msgIndex]}
          </span>
        </div>
      )}

      {/* ── Avatar button ── */}
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        {/* Pulse ring */}
        {!open && (
          <div style={{
            position: "absolute", inset: -4,
            borderRadius: "50%",
            border: "2px solid rgba(200,168,78,0.5)",
            animation: "ca-pulse-ring 2s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}

        {/* Avatar */}
        <div style={{
          animation: open ? "none" : "ca-float 3s ease-in-out infinite",
          position: "relative",
        }}>
          <Avatar size={56} />

          {/* Wave hand overlay */}
          <div style={{
            position: "absolute",
            bottom: -4, right: -6,
            fontSize: 20,
            lineHeight: 1,
          }}>
            <span className="ca-wave-hand">👋</span>
          </div>

          {/* Online dot */}
          <div style={{
            position: "absolute", top: 2, right: 2,
            width: 12, height: 12, borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid #0a0a0f",
            boxShadow: "0 0 6px rgba(34,197,94,0.6)",
          }} />
        </div>
      </div>

    </div>
  );
}

// ── Avatar SVG face ──────────────────────────────────────────────
function Avatar({ size }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #1e3a5f 0%, #0f2340 60%, #162d4a 100%)",
      border: "2px solid rgba(200,168,78,0.5)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(200,168,78,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 40 40" fill="none">
        {/* Head */}
        <circle cx="20" cy="15" r="10" fill="#f5d9b0" />
        {/* Hair */}
        <path d="M10 14 Q10 5 20 5 Q30 5 30 14" fill="#3b2507" />
        {/* Eyes */}
        <circle cx="16.5" cy="13.5" r="1.5" fill="#1a1a2e" />
        <circle cx="23.5" cy="13.5" r="1.5" fill="#1a1a2e" />
        {/* Eye shine */}
        <circle cx="17.2" cy="12.8" r="0.5" fill="white" />
        <circle cx="24.2" cy="12.8" r="0.5" fill="white" />
        {/* Smile */}
        <path d="M16 17.5 Q20 21 24 17.5" stroke="#c0785a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Body */}
        <path d="M12 28 Q12 22 20 22 Q28 22 28 28 L28 40 L12 40 Z" fill="#1e3a5f" />
        {/* Collar */}
        <path d="M17 22 L20 26 L23 22" fill="#c8a84e" />
      </svg>
    </div>
  );
}

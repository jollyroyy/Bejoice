// components/FloatingBookCTA.jsx
// Sticky floating pill in bottom-right — appears after user scrolls 400px
// Disappears near footer to avoid overlap
// Drop this into your App.jsx or Layout component

import { useState, useEffect } from "react";
import { useCalBooking } from "../hooks/useCalBooking";

const CAL_LINK = "sudeshna-pal-ruww5f/freight-consultation";

export default function FloatingBookCTA() {
  const { openCalPopup } = useCalBooking(CAL_LINK, "freight");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const viewportH = window.innerHeight;
      // Show after 400px scroll, hide when near footer (last 400px)
      const nearFooter = scrollY + viewportH > docHeight - 400;
      setVisible(scrollY > 400 && !nearFooter);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div style={containerStyle}>
      <button onClick={openCalPopup} id="floating-book-btn" style={buttonStyle} aria-label="Book a call with a freight expert">
        <span style={{ fontSize: "18px" }}>📅</span>
        <span style={textStyle}>Call a Freight Expert</span>
        <span style={badgeStyle}>FREE</span>
      </button>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const containerStyle = {
  position: "fixed",
  bottom: "28px",
  right: "28px",
  zIndex: 9999,
  animation: "fadeSlideIn 0.35s ease forwards",
};

const buttonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "50px",
  padding: "14px 22px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 8px 30px rgba(30,58,95,0.45)",
  letterSpacing: "0.01em",
  transition: "transform 0.2s, box-shadow 0.2s",
  whiteSpace: "nowrap",
};

const textStyle = {
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "0.02em",
};

const badgeStyle = {
  background: "#f0a500",
  color: "#0a1628",
  fontSize: "10px",
  fontWeight: "800",
  padding: "2px 7px",
  borderRadius: "20px",
  letterSpacing: "0.05em",
};

// Inject keyframes once
if (typeof document !== "undefined") {
  const styleId = "floating-cta-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      #floating-book-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 36px rgba(30,58,95,0.55);
      }
    `;
    document.head.appendChild(style);
  }
}

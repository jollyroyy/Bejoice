// components/BookExpertButton.jsx
// Reusable "Book a Freight Expert" button — drops into any section
// Usage: <BookExpertButton />  or  <BookExpertButton variant="ghost" label="Talk to Us" />

import { useCalBooking } from "../hooks/useCalBooking";

// ─────────────────────────────────────────────
//  ↓  CHANGE THIS TO YOUR CAL.COM USERNAME/SLUG
//     After you create your Cal.com account &
//     event type, replace the string below.
// ─────────────────────────────────────────────
const CAL_LINK = "sudeshna-pal-ruww5f/freight-consultation";

export default function BookExpertButton({
  label = "Book a Freight Expert",
  variant = "primary",   // "primary" | "ghost" | "hero" | "header"
  className = "",
}) {
  const { openCalPopup } = useCalBooking(CAL_LINK, "freight");

  const styles = {
    primary: {
      background: "#1e3a5f",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "12px 24px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transition: "background 0.2s, transform 0.15s",
    },
    ghost: {
      background: "transparent",
      color: "#1e3a5f",
      border: "2px solid #1e3a5f",
      borderRadius: "6px",
      padding: "11px 22px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s",
    },
    hero: {
      background: "#f0a500",
      color: "#0a1628",
      border: "none",
      borderRadius: "6px",
      padding: "14px 28px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      transition: "background 0.2s, transform 0.15s",
    },
    header: {
      // Inherits your existing .header-book-btn class; just bind the click
      cursor: "pointer",
    },
  };

  return (
    <button
      onClick={openCalPopup}
      style={styles[variant] || styles.primary}
      className={className}
      aria-label={label}
    >
      📅 {label}
    </button>
  );
}

// hooks/useCalBooking.js
// Drop this file into your src/hooks/ directory

import { useEffect } from "react";

/**
 * useCalBooking
 * Initializes Cal.com embed once on mount.
 * Call openCalPopup() from any button onClick.
 *
 * @param {string} calLink  - Your Cal.com link, e.g. "bejoice/freight-consultation"
 * @param {string} namespace - Unique namespace string, e.g. "freight-consultation"
 * @param {string} brandColor - Hex color matching your site, default Bejoice blue
 */
export function useCalBooking(
  calLink = "YOUR_USERNAME/freight-consultation",
  namespace = "freight",
  brandColor = "#1e3a5f"
) {
  useEffect(() => {
    // Already initialized in index.html — skip
    if (window.Cal && window.Cal.ns && window.Cal.ns[namespace]) return;

    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const ns = ar[1];
            api.q = api.q || [];
            typeof ns === "string"
              ? (cal.ns[ns] = api) && p(api, ar)
              : p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    window.Cal("init", namespace, { origin: "https://app.cal.com" });

    window.Cal.ns[namespace]("ui", {
      theme: "dark",
      styles: {
        branding: { brandColor },
      },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, [calLink, namespace, brandColor]);

  // Returns the function to call on button click
  // Uses pre-rendered inline overlay (window.__openCal) for instant open — no network fetch on click
  const openCalPopup = () => {
    if (window.__openCal) {
      window.__openCal();
    } else if (window.Cal && window.Cal.ns && window.Cal.ns[namespace]) {
      // Fallback to modal if overlay not ready
      window.Cal.ns[namespace]("modal", {
        calLink,
        config: { layout: "month_view" },
      });
    }
  };

  return { openCalPopup };
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackChatgptPageView } from "@/lib/analytics/chatgpt";
import { CONSENT_EVENT, MARKETING_CONSENT_KEY } from "@/lib/analytics/ga4";

export default function ChatgptPixel() {
  const pathname = usePathname();
  useEffect(() => {
    if (new URLSearchParams(location.search).get("chatgpt_pixel_debug") === "1") {
      try { sessionStorage.setItem("cv-chatgpt-pixel-debug", "1"); } catch { return; }
    }
  }, []);
  useEffect(() => {
    const send = () => { trackChatgptPageView(); };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === MARKETING_CONSENT_KEY || event.key === null) send();
    };
    send();
    window.addEventListener(CONSENT_EVENT, send);
    window.addEventListener("storage", storageChanged);
    return () => {
      window.removeEventListener(CONSENT_EVENT, send);
      window.removeEventListener("storage", storageChanged);
    };
  }, [pathname]);
  return null;
}

import { marketingConsent } from "@/lib/analytics/ga4";

type Oaiq = ((...args: unknown[]) => void) & { q?: unknown[][] };
declare global {
  interface Window { oaiq?: Oaiq; }
}

export const CHATGPT_PIXEL_ID = "JrvXcurpdqPxLqn524L1dE";
const SCRIPT_ID = "cv-chatgpt-pixel";
let initialized = false;
let ready = false;
let lastPage: string | null = null;

export function chatgptDebugMode() {
  if (typeof window === "undefined") return false;
  try { return new URLSearchParams(location.search).get("chatgpt_pixel_debug") === "1" || sessionStorage.getItem("cv-chatgpt-pixel-debug") === "1"; } catch { return false; }
}

export function chatgptEnabled() {
  return typeof window !== "undefined" && (/^(www\.)?charmvilla\.com$/.test(location.hostname) || chatgptDebugMode());
}

function clearPixelCookies() {
  for (const name of ["__oppref", "__obref"]) {
    for (const domain of ["", location.hostname, ".charmvilla.com"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax; Secure`;
    }
  }
}

export function trackChatgptPageView() {
  if (typeof window === "undefined") return false;
  if (!chatgptEnabled() || marketingConsent() !== "granted" || /\/(account|tasks)(\/|$)/.test(location.pathname)) {
    window.oaiq?.("consent", false);
    clearPixelCookies();
    lastPage = null;
    return false;
  }
  if (!initialized) {
    if (!window.oaiq) {
      const queue: Oaiq = (...args) => { queue.q!.push(args); };
      queue.q = [];
      window.oaiq = queue;
    }
    window.oaiq("consent", false);
    window.oaiq("init", { pixelId: CHATGPT_PIXEL_ID, debug: chatgptDebugMode() });
    initialized = true;
  }
  if (!ready) {
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
      script.onload = () => { ready = true; trackChatgptPageView(); };
      script.onerror = () => script.remove();
      document.head.prepend(script);
    }
    return false;
  }
  window.oaiq!("consent", true);
  if (lastPage === location.pathname) return false;
  window.oaiq!("measure", "page_viewed", { type: "contents" }, { opt_out: true });
  lastPage = location.pathname;
  return true;
}

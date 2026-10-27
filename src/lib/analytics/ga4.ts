import type { Product } from "@/data/catalog";
import type { Cart } from "@/lib/shopify/types";
import { preorderPurchase } from "@/lib/shopify/preorder-batch";

export type AnalyticsItem = { item_id: string; item_name: string; item_brand: string; item_category?: string; item_variant?: string; price?: number; quantity: number; index?: number };
export type Consent = "granted" | "denied";
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag; Shopify?: { customerPrivacy?: { setTrackingConsent: (settings: Record<string, unknown>, callback: (result?: { error?: string }) => void) => void } }; }
  interface Navigator { readonly globalPrivacyControl?: boolean; }
}
export const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";
export const CONSENT_KEY = "cv-analytics-consent-v1";
export const MARKETING_CONSENT_KEY = "cv-marketing-consent-v1";
export const CONSENT_EVENT = "cv-analytics-consent";
export const SETTINGS_EVENT = "cv-cookie-settings";
const shortId = (id: string) => id.split("/").pop()!;
let initialized = false;
let privacyReady: Promise<void> | undefined;
let analyticsChoice: Consent | undefined;
let marketingChoice: Consent | undefined;
let pendingCampaign: { fields: Record<string, string>; capturedAt: number } | undefined;
const CAMPAIGN_PARAMETERS = {
  utm_source: "campaign_source", utm_medium: "campaign_medium", utm_campaign: "campaign_name",
  utm_id: "campaign_id", utm_term: "campaign_term", utm_content: "campaign_content",
};

export function consent(): Consent | null {
  if (typeof window === "undefined") return null;
  if (analyticsChoice !== undefined) return analyticsChoice;
  try { const v = localStorage.getItem(CONSENT_KEY); return v === "granted" || v === "denied" ? v : null; } catch { return null; }
}
export function marketingConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  if (navigator.globalPrivacyControl) return "denied";
  if (marketingChoice !== undefined) return marketingChoice;
  try { const value = localStorage.getItem(MARKETING_CONSENT_KEY); return value === "granted" || value === "denied" ? value : null; } catch { return null; }
}
export function debugMode() {
  try { return new URLSearchParams(location.search).get("analytics_debug") === "1" || sessionStorage.getItem("cv-analytics-debug") === "1"; } catch { return false; }
}
export function analyticsEnabled() {
  return typeof window !== "undefined" && /^G-[A-Z0-9]+$/.test(GA_ID) && (location.hostname === "www.charmvilla.com" || location.hostname === "charmvilla.com" || debugMode());
}
export function commerceReferrer(raw: string) {
  try { const host = new URL(raw).hostname; return ["charmvilla.com", "charmvilla.us", "zcs0bg-10.myshopify.com", "shop.app", "paypal.com"].some(domain => host === domain || host.endsWith(`.${domain}`)); } catch { return false; }
}
export function cleanUrl(raw: string, campaign = false) {
  try {
    const u = new URL(raw); const params = new URLSearchParams();
    if (!["https:", "http:"].includes(u.protocol)) return "";
    if (/^\/(?:en\/|zh\/)?account(?:\/|$)/.test(u.pathname)) return `${u.origin}/account`;
    if (/^\/checkouts?(?:\/|$)/.test(u.pathname)) return `${u.origin}/checkout`;
    if (commerceReferrer(raw) && !/^(www\.)?charmvilla\.com$/.test(u.hostname)) return `${u.origin}/`;
    if (campaign) for (const key of [...Object.keys(CAMPAIGN_PARAMETERS), "gclid"]) { const value = u.searchParams.get(key); if (value) params.set(key, value.slice(0, 120)); }
    return u.origin + u.pathname + (params.size ? `?${params}` : "");
  } catch { return ""; }
}
function captureCampaign() {
  if (initialized || !analyticsEnabled() || consent() === "denied") return;
  const params = new URLSearchParams(location.search);
  const fields: Record<string, string> = {};
  for (const [parameter, field] of Object.entries(CAMPAIGN_PARAMETERS)) {
    const value = params.get(parameter);
    if (value) fields[field] = value.slice(0, 120);
  }
  if (Object.keys(fields).length) pendingCampaign = { fields, capturedAt: Date.now() };
}
function bootstrap() {
  if (!analyticsEnabled() || consent() !== "granted") return;
  captureCampaign();
  if (initialized) { loadGoogleTag(); return; }
  initialized = true;
  window.dataLayer ??= [];
  // gtag requires an Arguments object (not an Array) in the data layer.
  // eslint-disable-next-line prefer-rest-params -- Google gtag consumes Arguments entries in dataLayer.
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("set", "linker", { domains: ["www.charmvilla.com", "account.charmvilla.us", "zcs0bg-10.myshopify.com", "shop.app"] });
  const campaign = pendingCampaign && Date.now() - pendingCampaign.capturedAt < 30 * 60 * 1000 ? pendingCampaign.fields : {};
  window.gtag("config", GA_ID, { send_page_view: false, page_location: cleanUrl(location.href, true), page_referrer: cleanUrl(document.referrer), ignore_referrer: commerceReferrer(document.referrer), ...campaign, allow_google_signals: false, allow_ad_personalization_signals: false, ...(debugMode() ? { debug_mode: true } : {}) });
  pendingCampaign = undefined;
  loadGoogleTag();
}
function loadGoogleTag() {
  if (document.getElementById("cv-ga4")) return;
  const script = document.createElement("script"); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`; script.id = "cv-ga4";
  script.onerror = () => script.remove();
  document.head.append(script);
}
export function track(name: string, params: Record<string, unknown> = {}) {
  captureCampaign();
  if (!analyticsEnabled() || consent() !== "granted" || /\/(account|tasks)(\/|$)/.test(location.pathname)) return false;
  bootstrap();
  window.gtag?.("set", { page_location: cleanUrl(location.href, true), page_referrer: cleanUrl(document.referrer) });
  window.gtag?.("event", name, { ...params, send_to: GA_ID, page_location: cleanUrl(location.href, true), page_referrer: cleanUrl(document.referrer), ...(debugMode() ? { debug_mode: true } : {}) });
  return true;
}
export function setConsent(value: Consent, marketing: Consent = "denied") {
  const advertising = value === "granted" && !navigator.globalPrivacyControl ? marketing : "denied";
  try { localStorage.setItem(MARKETING_CONSENT_KEY, advertising); marketingChoice = undefined; } catch { marketingChoice = advertising; }
  try { localStorage.setItem(CONSENT_KEY, value); analyticsChoice = undefined; } catch { analyticsChoice = value; }
  applyAnalyticsConsent();
  window.dispatchEvent(new Event(CONSENT_EVENT));
  void syncShopifyConsent();
}
function applyAnalyticsConsent() {
  const allowed = consent() === "granted";
  Object.assign(window, { [`ga-disable-${GA_ID}`]: !allowed });
  if (allowed) {
    bootstrap();
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
  } else {
    pendingCampaign = undefined;
    window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    for (const name of document.cookie.split(";").map(c => c.trim().split("=")[0]).filter(n => n === "_ga" || n.startsWith("_ga_"))) {
      for (const domain of ["", location.hostname, ".charmvilla.com"]) document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax; Secure`;
    }
  }
}
export function refreshAnalyticsConsent() {
  analyticsChoice = undefined;
  marketingChoice = undefined;
  applyAnalyticsConsent();
  window.dispatchEvent(new Event(CONSENT_EVENT));
  void syncShopifyConsent();
}
export async function syncShopifyConsent() {
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!token || !/^(www\.)?charmvilla\.com$/.test(location.hostname)) return;
  privacyReady ??= new Promise<void>((resolve, reject) => {
    if (window.Shopify?.customerPrivacy) return resolve();
    const s = document.createElement("script"); s.src = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js"; s.onload = () => resolve(); s.onerror = () => reject(new Error("Consent API unavailable")); document.head.append(s);
  });
  try {
    await Promise.race([privacyReady, new Promise((_, reject) => setTimeout(() => reject(new Error("Consent timeout")), 2500))]);
    await new Promise<void>(resolve => { const timer = setTimeout(resolve, 1500); window.Shopify?.customerPrivacy?.setTrackingConsent({ analytics: consent() === "granted", marketing: false, preferences: false, sale_of_data: false, headlessStorefront: true, checkoutRootDomain: "account.charmvilla.us", storefrontRootDomain: "charmvilla.com", storefrontAccessToken: token }, () => { clearTimeout(timer); resolve(); }); });
  } catch { /* Checkout remains available; its pixel also requires explicit storefront consent. */ }
}
export async function checkoutAnalytics() {
  const allowed = analyticsEnabled() && consent() === "granted";
  if (!allowed) return { consent: "denied" as const };
  bootstrap();
  const get = (field: string) => new Promise<string | undefined>(resolve => { const timer = setTimeout(() => resolve(undefined), 1000); window.gtag?.("get", GA_ID, field, (v: unknown) => { clearTimeout(timer); resolve(v == null ? undefined : String(v)); }); });
  const [clientId, sessionId] = await Promise.all([get("client_id"), get("session_id"), syncShopifyConsent()]);
  return { consent: "granted" as const, clientId, sessionId, debug: debugMode() };
}
export function productItem(p: Product, variantId?: string): AnalyticsItem {
  const variant = p.shopifyData?.variants.find(v => v.id === variantId) ?? p.shopifyData?.variants[0];
  const preorder = variant && p.preOrderRemaining !== undefined ? preorderPurchase(variant.id) : null;
  return { item_id: variant ? shortId(preorder?.batch.variantId ?? variant.id) : p.slug, item_name: p.english || p.name, item_brand: "CHARM VILLA", item_category: p.category, ...(variant ? { item_variant: variant.title, price: Number(variant.price) } : p.price ? { price: p.price.amount } : {}), quantity: 1 };
}
export function cartItems(cart: Cart): AnalyticsItem[] {
  return cart.lines.edges.filter(({ node }) => node.quantity > 0).map(({ node: n }) => ({ item_id: shortId(n.merchandise.id), item_name: n.merchandise.product.title, item_brand: "CHARM VILLA", item_variant: n.sellingPlanAllocation?.sellingPlan.name ?? n.merchandise.title, price: Number(n.cost.totalAmount.amount) / n.quantity, quantity: n.quantity }));
}
export function trackCartChange(before: Cart | null, after: Cart) {
  // Different selling plans share a SKU; compare actual cart lines, not just SKU.
  const byLine = (cart: Cart | null) => {
    const ids = cart?.lines.edges.filter(({ node }) => node.quantity > 0).map(({ node }) => node.id) ?? [];
    return new Map((cart ? cartItems(cart) : []).map((item, i) => [ids[i], item]));
  };
  const old = byLine(before);
  const next = byLine(after);
  for (const id of new Set([...old.keys(), ...next.keys()])) {
    const delta = (next.get(id)?.quantity ?? 0) - (old.get(id)?.quantity ?? 0);
    if (!delta) continue;
    const item = { ...(delta > 0 ? next.get(id)! : old.get(id)!), quantity: Math.abs(delta) };
    track(delta > 0 ? "add_to_cart" : "remove_from_cart", { currency: after.cost.subtotalAmount.currencyCode, value: Number(((item.price ?? 0) * item.quantity).toFixed(2)), items: [item] });
  }
}

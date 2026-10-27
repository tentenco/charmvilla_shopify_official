"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useT } from "@/i18n/LocaleProvider";
import { localeHref } from "@/i18n/config";
import { analyticsEnabled, consent, marketingConsent, setConsent, syncShopifyConsent, track, CONSENT_EVENT, SETTINGS_EVENT, type AnalyticsItem } from "@/lib/analytics/ga4";
import { chatgptEnabled } from "@/lib/analytics/chatgpt";

export default function Analytics() {
  const pathname = usePathname(); const { lang, t } = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      if (!analyticsEnabled() && !chatgptEnabled()) return;
      try { if (new URLSearchParams(location.search).get("analytics_debug") === "1") sessionStorage.setItem("cv-analytics-debug", "1"); } catch { /* private mode */ }
      setShow(consent() === null || marketingConsent() === null); void syncShopifyConsent();
    });
    const open = () => setShow(true);
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);
  useEffect(() => {
    let pageSent = false; const seen = new Set<Element>(); const observed = new WeakSet<Element>();
    const page = () => { if (!pageSent) pageSent = track("page_view", { page_title: document.title }); };
    page();
    const observer = new IntersectionObserver(entries => {
      const items: AnalyticsItem[] = [];
      for (const entry of entries) if (entry.isIntersecting && !seen.has(entry.target) && consent() === "granted") {
        try { const item = JSON.parse((entry.target as HTMLElement).dataset.analyticsItem!) as AnalyticsItem; items.push(item); seen.add(entry.target); } catch { /* unrelated or malformed card */ }
      }
      if (items.length) track("view_item_list", { item_list_id: pathname, item_list_name: pathname, items });
    }, { threshold: 0.3 });
    const observe = () => { document.querySelectorAll<HTMLElement>("[data-analytics-item]").forEach(el => { if (!observed.has(el)) { observed.add(el); observer.observe(el); } }); };
    observe();
    const mutations = new MutationObserver(observe); mutations.observe(document.body, { childList: true, subtree: true });
    const changed = () => { page(); document.querySelectorAll<HTMLElement>("[data-analytics-item]").forEach(el => { observer.unobserve(el); observer.observe(el); }); };
    const click = (event: MouseEvent) => {
      const card = (event.target as Element).closest<HTMLElement>("[data-analytics-item]");
      if (card && (event.target as Element).closest("a")) { try { track("select_item", { item_list_id: pathname, item_list_name: pathname, items: [JSON.parse(card.dataset.analyticsItem!)] }); } catch { /* invalid card */ } }
    };
    window.addEventListener(CONSENT_EVENT, changed); document.addEventListener("click", click);
    return () => { observer.disconnect(); mutations.disconnect(); window.removeEventListener(CONSENT_EVENT, changed); document.removeEventListener("click", click); };
  }, [pathname]);
  if (!show) return null;
  return <section className="cookie-banner tc" role="region" aria-label={t("Cookie 偏好設定", "Cookie preferences")}>
    <p>{t("我們使用必要的儲存功能提供購物服務。你可以另外允許 Google Analytics 分析瀏覽與購買流程，以及 OpenAI 衡量 ChatGPT 廣告帶來的網頁瀏覽。", "We use essential storage for shopping. You can also allow Google Analytics to measure browsing and purchases, and OpenAI to measure page views from ChatGPT ads.")} <Link href={localeHref(lang, "/privacy#cookies")}>{t("隱私權政策", "Privacy policy")}</Link></p>
    <div><button type="button" onClick={() => { setConsent("denied"); setShow(false); }}>{t("僅必要功能", "Essential only")}</button><button type="button" onClick={() => { setConsent("granted"); setShow(false); }}>{t("允許分析", "Allow analytics")}</button>{!navigator.globalPrivacyControl && <button type="button" onClick={() => { setConsent("granted", "granted"); setShow(false); }}>{t("允許分析與廣告", "Allow analytics & ads")}</button>}</div>
  </section>;
}

export function CookieSettings() {
  const { t } = useT();
  return <button type="button" className="tc underline underline-offset-4" onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}>{t("Cookie 設定", "Cookie settings")}</button>;
}

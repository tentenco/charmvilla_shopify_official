import type { Metadata, Viewport } from "next";
import { Outfit, Noto_Sans_TC } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import Analytics from "@/components/analytics/Analytics";
import CartDrawer from "@/components/cart/CartDrawer";
import NewsletterPopup from "@/components/chrome/NewsletterPopup";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { social } from "@/data/content";
import JsonLd from "@/components/seo/JsonLd";
import { siteEntities } from "@/lib/seo/schema";
import { homeSeo, pageMetadata } from "@/lib/seo/metadata";
import { locales, defaultLocale, isLocale, htmlLang, siteUrl } from "@/i18n/config";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const notoTC = Noto_Sans_TC({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-noto-tc", display: "swap" });

type Props = { params: Promise<{ lang: string }> };
// Hides the preloader before first paint once it has played in this tab (key: INTRO_SEEN in components/engine/Preloader.tsx).
const introSeenScript = `try{if(sessionStorage.getItem("cv-intro-seen"))document.documentElement.classList.add("intro-seen")}catch(e){}`;

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : defaultLocale;
  return {
    metadataBase: new URL(siteUrl),
    ...pageMetadata({ lang, path: "/", ...homeSeo(lang) }),
    robots: { googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ebeae4" };

export default async function RootLayout({ children, params }: Props & { children: React.ReactNode }) {
  const { lang: raw } = await params;
  // The proxy only ever sends "zh" or "en" here; a stray value (a file-like URL) falls back to the default and its page answers 404.
  const lang = isLocale(raw) ? raw : defaultLocale;
  return (
    <html lang={htmlLang[lang]} className={`${outfit.variable} ${notoTC.variable}`} suppressHydrationWarning>
      <body className="bg-page text-ink"><script dangerouslySetInnerHTML={{ __html: introSeenScript }} /><JsonLd nodes={siteEntities(lang, social.map(link => link.href))} /><LocaleProvider lang={lang}><CartProvider>{children}{process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true" && <aside className="design-preview-notice" aria-label={lang === "zh" ? "測試站說明" : "Preview notice"}>{lang === "zh" ? "設計預覽 · 購物連接正式商店" : "Design preview · Connected to the live store"}</aside>}<CartDrawer /><NewsletterPopup /><Analytics /></CartProvider></LocaleProvider></body>
    </html>
  );
}

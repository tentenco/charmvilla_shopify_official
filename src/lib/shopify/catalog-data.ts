// Shared, credential-free adapter. Shopify owns facts; the local catalogue owns every image and layout.
import type { Product } from "@/data/catalog";
import type { Locale } from "@/i18n/config";

export type ShopifyVariant = {
  id: string; title: string; sku: string | null; price: string; inventoryQuantity: number;
  inventoryPolicy: string; selectedOptions: { name: string; value: string }[];
  availableForSale: boolean; quantityAvailable: number | null; currentlyNotInStock: boolean;
};
export type ShopifyProduct = {
  id: string; handle: string; title: string; status: string; descriptionHtml: string; tags: string[];
  currency: string; published: boolean; availableForSale: boolean; variants: ShopifyVariant[];
  metafields: { namespace: string; key: string; type: string; value: string }[];
  translations: { key: string; value: string }[];
  preorderBatch?: { remaining: number; unit: "box" | "set"; mixBoxes?: number; mixAvailable?: boolean };
};
export type ShopifyChineseCopy = {
  version: 1; locale: "zh-TW"; title: string; description: string;
  facts: (Product["facts"][number] & { source?: { key: string; value: string } })[];
  story?: Product["story"]; teaNotes?: Product["teaNotes"];
  brew?: Omit<NonNullable<Product["brew"]>, "image">; imageNote?: string; choiceLabel?: string;
};
/** Product translations hold title/description; this Shopify CMS field holds the remaining approved Chinese copy. */
export function chineseCopy(source: ShopifyProduct): ShopifyChineseCopy | undefined {
  const value = source.metafields.find(m => m.namespace === "custom" && m.key === "headless_copy_zh_tw")?.value;
  if (!value) return undefined;
  const copy = JSON.parse(value) as ShopifyChineseCopy;
  if (copy.version !== 1 || copy.locale !== "zh-TW" || !Array.isArray(copy.facts) || typeof copy.description !== "string") throw new Error(`Invalid Chinese CMS copy: ${source.handle}`);
  return copy;
}

/** Merchant-owned bilingual packaging notice; absent on products without special packaging terms. */
function packagingDetails(source: ShopifyProduct) {
  const raw = source.metafields.find(m => m.namespace === "custom" && m.key === "packaging_details")?.value;
  if (!raw) return undefined;
  const data = JSON.parse(raw) as { version: number; notice: Record<Locale, string>; imageNote: Record<Locale, string> };
  if (data.version !== 1 || ["zh", "en"].some(lang => typeof data.notice?.[lang as Locale] !== "string" || !data.notice[lang as Locale].trim() || typeof data.imageNote?.[lang as Locale] !== "string")) throw new Error(`Invalid packaging details: ${source.handle}`);
  return data;
}

/** Merchant-owned campaign setting. Explicit false also disables legacy preorder tags. */
function preorderDetails(source: ShopifyProduct, lang: Locale) {
  const raw = source.metafields.find(m => m.namespace === "custom" && m.key === "preorder_details")?.value;
  if (!raw) return undefined;
  const data = JSON.parse(raw);
  if (data.version !== 1 || typeof data.enabled !== "boolean") throw new Error(`Invalid preorder setting: ${source.handle}`);
  if (!data.enabled) return { enabled: false };
  const validNotice = (notice: { shipping?: unknown; terms?: unknown } | undefined) => typeof notice?.shipping === "string" && Boolean(notice.shipping.trim()) && typeof notice.terms === "string" && Boolean(notice.terms.trim());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.shipBy) || !validNotice(data.notice?.zh) || !validNotice(data.notice?.en)) throw new Error(`Invalid preorder terms: ${source.handle}`);
  return { enabled: true, policy: { shipBy: data.shipBy as string, shipping: data.notice[lang].shipping as string, terms: data.notice[lang].terms as string } };
}

/** Text only, rendered by React (never dangerouslySetInnerHTML). */
export const htmlText = (html: string) => html.replace(/<\/(?:p|li|h[1-6])\s*>|<br\s*\/?\s*>/gi, "\n").replace(/<[^>]*>/g, "")
  .replace(/&(?:amp|nbsp|lt|gt|quot|apos|#39);/g, x => ({ "&amp;": "&", "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'" })[x] ?? x)
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/\n{3,}/g, "\n\n").trim();
const sectionsOf = (html: string) => {
  const chunks = html.split(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
  const sections: Record<string, string> = { intro: htmlText(chunks[0]) };
  for (let i = 1; i < chunks.length; i += 2) sections[htmlText(chunks[i]).toLowerCase()] = htmlText(chunks[i + 1] ?? "");
  return sections;
};
const words: Record<string, string> = {
  "First Prize Rose Oolong Tea": "頭等獎玫瑰烏龍茶", "Third Prize Oriental Beauty Tea": "參等獎東方美人茶",
  "Second Prize Oriental Beauty Tea": "貳等獎東方美人茶", "Rose Oolong Tea": "玫瑰烏龍茶",
  "Rose & Honey-Scented Black Tea": "玫瑰蜜香紅茶", "Ruby Black Tea": "紅玉紅茶", "Oriental Beauty Tea": "東方美人茶",
  "Jin Xuan Tea": "金萱烏龍茶", "Jin Xuan Oolong Tea": "金萱烏龍茶", "Mixed Teas": "綜合茶款",
  "Gold": "金色", "Yellow": "黃色", "Red": "紅色", "Pink": "粉紅色", "Blue": "藍色", "Orange": "橘色",
};
export const variantLabel = (title: string, lang: Locale) => lang === "en" ? title : title.split(" / ").map(s => words[s] ?? s).join("／");
const normalize = (s: string) => {
  // Match 粉紅色 before 紅色 so adding Red never breaks existing Pink photos.
  for (const [en, zh] of Object.entries(words).sort((a, b) => b[1].length - a[1].length)) s = s.replaceAll(zh, en);
  return s.replace(/\s*[／/]\s*/g, " / ").replace(/First[- ]Prize |Third[- ]Prize /g, "").replace("Tea Assortment", "Mixed Teas").replace(/Stocking|聖誕襪/g, "Blue").replace(/Candy Cane|拐杖糖/g, "Orange").replace("Jin Xuan Oolong Tea", "Jin Xuan Tea").toLowerCase();
};

export function applyShopifyProduct(local: Product, source: ShopifyProduct, lang: Locale, visualChoices = local.giftBox?.choices): Product {
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  // Client 2026-10-16: Reunion now offers Gold/Yellow/Red in Shopify.
  // Use current source variants; the preorder adapter checks each plan separately.
  const variants = source.variants;
  const translated = Object.fromEntries(source.translations.map(x => [x.key, x.value]));
  const copy = lang === "zh" ? chineseCopy(source) : undefined;
  const packaging = packagingDetails(source);
  const sections = sectionsOf((lang === "zh" && translated.body_html) || source.descriptionHtml);
  const meta = Object.fromEntries(source.metafields.map(m => [m.key, m.value]));
  const countMatch = htmlText(source.descriptionHtml).match(/contain(?:s|ing)\s+(\d+|two|six|twelve|fifteen|eighteen)\s+Goldfish Tea Bags/i);
  const counts: Record<string, number> = { two: 2, six: 6, twelve: 12, fifteen: 15, eighteen: 18 };
  const pieces = Number(meta.teabag_count) || (countMatch ? (counts[countMatch[1].toLowerCase()] || Number(countMatch[1])) : 0);
  const choices = variants.length > 1 ? variants.map(v => {
    const visual = visualChoices?.find(c => normalize(c.label) === normalize(v.title));
    const tea = v.selectedOptions.find(o => /tea|flavo/i.test(o.name))?.value;
    // Client final reply 2026-10-14: Blue is the Stocking lid, Orange is Candy Cane.
    // Keep Shopify variant identities and availability; only the storefront labels change.
    const lidValue = v.selectedOptions.find(o => /color|lid/i.test(o.name))?.value;
    const lid = local.slug === "christmas-gift-box" && lidValue
      ? /^(Blue|Teal|Stocking)$/i.test(lidValue) ? t("聖誕襪", "Stocking")
        : /^(Orange|Candy Cane)$/i.test(lidValue) ? t("拐杖糖", "Candy Cane") : undefined
      : lidValue ? variantLabel(lidValue, lang) : undefined;
    const selection = tea && lid ? { tea: variantLabel(tea, lang), lid } : undefined;
    return {
      label: selection ? `${selection.tea}${t("／", " / ")}${selection.lid}` : variantLabel(v.title, lang),
      selection, contents: tea && pieces ? [{ name: variantLabel(tea, lang), count: pieces }] : [],
      price: Number(v.price), shopifyVariantId: v.id, availableForSale: v.availableForSale,
      quantityAvailable: v.quantityAvailable, sku: v.sku ?? undefined,
      ...(visual?.views ? { views: visual.views } : {}),
    };
  }) : undefined;
  const facts: Product["facts"] = [];
  const add = (label: string, value?: string) => { if (value) facts.push({ label, value }); };
  add(t("販售單位", "Contents"), meta.product_contents || meta.short_product_desc || (pieces ? t(`每盒 ${pieces} 包小金魚茶包`, `${pieces} Goldfish Tea Bags per box`) : undefined));
  add(t("盒型與材質", "Packaging"), sections.packaging || meta.packaging_material);
  add(t("材質", "Material"), meta.product_material);
  add(t("尺寸", "Dimensions"), meta.packaging_dimensions);
  add(t("重量", "Weight"), meta.product_weight);
  add(t("盒內茶款", "Tea selection"), sections["what is included"]);
  if (choices) facts.push({ label: t("商品選項", "Options"), value: choices.map(c => c.label).join(", "), items: choices.map(c => c.label) });
  add(t("商品須知", "Product notice"), sections["product notice"]);
  const description = sections.intro || htmlText(source.descriptionHtml);
  const preorder = preorderDetails(source, lang);
  const scheduledPreOrder = preorder?.enabled ?? (source.tags.some(s => /pre.?order/i.test(s)) || /crafted upon pre-order/i.test(source.descriptionHtml));
  const preOrder = scheduledPreOrder || variants.some(v => v.currentlyNotInStock && v.availableForSale);
  const hasTea = variants.some(v => v.selectedOptions.some(o => /tea|flavo/i.test(o.name)));
  const hasColor = variants.some(v => v.selectedOptions.some(o => /color/i.test(o.name)));
  const teaNames = [...new Set(variants.flatMap(v => v.selectedOptions.filter(o => /tea|flavo/i.test(o.name)).map(o => o.value)))];
  const teaIdentity = (name: string) => {
    const value = normalize(name);
    return ["rose oolong", "honey", "oriental beauty", "ruby", "jin xuan"].find(key => value.includes(key));
  };
  const notes = copy?.teaNotes ?? local.teaNotes;
  const teaNotes = notes && { ...notes, items: notes.items.map(note => {
    const identity = teaIdentity(note.name);
    const name = identity && teaNames.find(name => teaIdentity(name) === identity);
    return name && !note.term ? { ...note, name: variantLabel(name, lang) } : note;
  }) };
  const localizedFacts = copy?.facts.map(({ source: binding, ...fact }) => {
    if (!binding || meta[binding.key] === binding.value) return fact;
    const value = binding.key === "teabag_count" ? `1 盒／小金魚茶包 ${pieces} 入` : meta[binding.key];
    return value ? { label: fact.label, value } : undefined;
  }).filter((f): f is Product["facts"][number] => Boolean(f));
  if (localizedFacts && choices) localizedFacts.push({ label: hasTea && !hasColor ? "可選茶款" : "商品選項", value: choices.map(c => c.label).join("、"), items: choices.map(c => c.label) });
  return {
    ...local,
    teaNotes,
    brew: copy?.brew ? { ...local.brew, ...copy.brew } : local.brew,
    imageNote: packaging?.imageNote[lang] ?? copy?.imageNote,
    packagingNote: packaging?.notice[lang],
    name: lang === "en" ? source.title : translated.title || copy?.title || (local.slug === "snowflake-gift-box" ? "聖誕心意禮（2 入）" : local.slug === "christmas-gift-box" ? "聖誕禮盒（12 入）" : local.name),
    english: source.title.toUpperCase(), description: copy && !translated.body_html ? copy.description : description,
    summary: copy ? localizedFacts?.find(f => f.label === "販售單位")?.value ?? copy.description : meta.short_product_desc || (pieces ? t(`${pieces} 入小金魚茶包`, `${pieces} Goldfish Tea Bags`) : meta.product_contents || ""),
    facts: localizedFacts ?? facts,
    story: copy?.story ?? { ...local.story, title: sections.story ? t("故事", "Story") : meta.product_story_title || source.title, body: sections.story || meta.product_story || "", more: undefined },
    price: variants.length && (source.currency === "USD" || source.currency === "TWD") ? { amount: Math.min(...variants.map(v => Number(v.price))), currency: source.currency } : undefined,
    soldOut: !source.availableForSale || !variants.some(v => v.availableForSale), preOrder, preOrderPolicy: preorder?.policy, preOrderRemaining: source.preorderBatch?.remaining, preOrderUnit: source.preorderBatch?.unit, priceTbd: false, teaTbd: false,
    shopify: { handle: source.handle, variantId: variants.length === 1 ? variants[0].id : "" },
    shopifyData: { productId: source.id, published: source.published, status: source.status, scheduledPreOrder, variants, mixAvailable: source.preorderBatch?.mixAvailable },
    giftBox: local.giftBox ? { ...local.giftBox, pieces, contents: [], choices, mixBoxes: source.preorderBatch?.mixBoxes, choiceLabel: local.slug === "christmas-gift-box" ? t("選擇茶款與盒蓋", "Choose your tea and lid") : copy?.choiceLabel || (hasTea && hasColor ? t("選擇茶款與盒色", "Choose your tea and box color") : hasColor ? t("選擇包裝", "Choose your packaging") : t("選擇茶款", "Choose your tea")) } : undefined,
    // Editorial leaf photographs and general brewing guide remain; product-specific facts above come only from Shopify.
  };
}

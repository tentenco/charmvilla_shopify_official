"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import { localeHref } from "@/i18n/config";
import { useProductOption } from "@/components/catalog/ProductOption";
import { useCart } from "./CartProvider";
import { formatPrice, type Product } from "@/data/catalog";
import { useT } from "@/i18n/LocaleProvider";
import { useLiveProduct } from "@/components/catalog/useLiveProduct";

// One full-width ink button, after the reference's FIND RETAILERS (user 2026-10-01: 「做成加入購物車的按鈕，原本的相同功能的設計
// 拿掉」). The quantity stepper and the bar docked to the page bottom are gone; quantity is set in the bag drawer.
// Gift boxes sold "one tea per box" (心有愛、春曉、暮雪) ask for the tea first; the choice travels with the bag line (2026-10-02).
export default function AddToCart({ product }: { product: Product }) {
  const cart = useCart(); const { t, lang } = useT();
  const choices = product.giftBox?.choices;
  const { option, setOption } = useProductOption(); // shared with the gallery (ProductOption.tsx)
  const separateOptions = Boolean(choices?.length && choices.every(c => c.selection));
  const [tea, setTea] = useState("");
  const [lid, setLid] = useState("");
  const selectCombination = (nextTea: string, nextLid: string) => {
    setTea(nextTea); setLid(nextLid);
    const index = choices?.findIndex(c => c.selection?.tea === nextTea && c.selection?.lid === nextLid);
    setOption(index !== undefined && index >= 0 ? index : undefined);
  };
  // Each box chooses one tea. Repeated flavors are allowed; the entire set is one cart line.
  const boxes = product.giftBox?.mixBoxes;
  const [boxTeas, setBoxTeas] = useState<string[]>(() => Array.from({ length: boxes ?? 0 }, () => ""));
  const mix = (choices ?? []).map(c => boxTeas.filter(id => id && id === c.shopifyVariantId).length);
  const picked = mix.reduce((a, b) => a + b, 0);
  const missing = boxes ? picked !== boxes : Boolean(choices) && option === undefined;
  // No list price yet (the bird chopstick rest): the button waits instead of putting a priceless line in the bag (2026-10-13 commerce audit).
  const live = useLiveProduct(product);
  const noPrice = !live.price;
  // Availability follows the selected Shopify variant, refreshed while the page stays open.
  const selectedId = option === undefined ? product.shopify?.variantId : choices?.[option]?.shopifyVariantId;
  const selected = live.variants?.find(v => v.id === selectedId);
  const soldOut = live.soldOut || (boxes ? live.mixAvailable === false || boxTeas.some(id => id && !live.variants?.find(v => v.id === id)?.availableForSale) : selectedId ? !selected?.availableForSale : false);
  const optionSuffix = (i: number) => {
    const choice = choices?.[i];
    const variant = live.variants?.find(v => v.id === choice?.shopifyVariantId);
    const price = variant ? Number(variant.price) : choice?.price;
    return `${price && price !== live.price?.amount ? `・${formatPrice(price, live.price?.currency)}` : ""}${variant && !variant.availableForSale ? t("（售罄）", " (Sold out)") : ""}`;
  };
  const unavailableCombination = (nextTea: string, nextLid: string) => {
    const matching = choices?.filter(c => (!nextTea || c.selection?.tea === nextTea) && (!nextLid || c.selection?.lid === nextLid)) ?? [];
    return live.checked && !live.error && !matching.some(c => live.variants?.find(v => v.id === c.shopifyVariantId)?.availableForSale);
  };
  const lidLabel = product.slug === "christmas-gift-box" ? t("選擇盒蓋", "Choose your lid") : t("選擇盒色", "Choose your box color");
  const lidPlaceholder = product.slug === "christmas-gift-box" ? t("請選擇盒蓋", "Select a lid") : t("請選擇盒色", "Select a box color");
  // Display-only pieces (客戶答覆 B1–B4, 2026-10-12) have no options and no button at all — not a disabled one.
  if (product.displayOnly) return null;
  return <>
    {choices && boxes && <fieldset className="product-variants product-mix">
      <legend className="tc">{product.giftBox?.choiceLabel}</legend>
      <p className="product-mix-help tc">{t(`每組 ${boxes} 盒，每盒 ${product.giftBox!.pieces / boxes} 包同一種茶。三盒可選不同口味，也可重複。`, `Each set has ${boxes} boxes, with ${product.giftBox!.pieces / boxes} tea bags of one variety per box. Mix different teas or repeat a favorite.`)}</p>
      <div className="product-split-options">
        {boxTeas.map((value, box) => <Fragment key={box}>
          <label className="tc" htmlFor={`mix-${product.slug}-${box}`}>{t(`第 ${box + 1} 盒茶款`, `Tea for box ${box + 1}`)}</label>
          <select id={`mix-${product.slug}-${box}`} value={value} onChange={e => setBoxTeas(current => current.map((id, index) => index === box ? e.target.value : id))}>
            <option value="">{t("請選擇茶款", "Select a tea")}</option>
            {choices.map((c, i) => <option key={c.shopifyVariantId} value={c.shopifyVariantId}>{c.label}{optionSuffix(i)}</option>)}
          </select>
        </Fragment>)}
      </div>
      <p className="product-choice-note tc" aria-live="polite">{picked === boxes ? t(`已選好 ${boxes} 盒`, `All ${boxes} boxes chosen`) : t(`已選 ${picked}／${boxes} 盒`, `${picked} of ${boxes} boxes chosen`)}</p>
    </fieldset>}
    {choices && separateOptions && !boxes && <div className="product-split-options">
      <label className="tc" htmlFor={`tea-${product.slug}`}>{t("選擇茶款", "Choose your tea")}</label>
      <select id={`tea-${product.slug}`} value={tea} onChange={e => selectCombination(e.target.value, lid)}>
        <option value="">{t("請選擇茶款", "Select a tea")}</option>
        {[...new Set(choices.map(c => c.selection!.tea))].map(value => <option key={value} value={value}>{value}{unavailableCombination(value, lid) && t("（售罄）", " (Sold out)")}</option>)}
      </select>
      <label className="tc" htmlFor={`lid-${product.slug}`}>{lidLabel}</label>
      <select id={`lid-${product.slug}`} value={lid} aria-describedby={product.packagingNote ? `packaging-${product.slug}` : undefined} onChange={e => selectCombination(tea, e.target.value)}>
        <option value="">{lidPlaceholder}</option>
        {[...new Set(choices.map(c => c.selection!.lid))].map(value => <option key={value} value={value}>{value}{unavailableCombination(tea, value) && t("（售罄）", " (Sold out)")}</option>)}
      </select>
    </div>}
    {choices && !separateOptions && !boxes && <div className="product-split-options">
      <label className="tc" htmlFor={`option-${product.slug}`}>{product.giftBox?.choiceLabel ?? t("選擇茶款（每盒擇一）", "Choose Your Tea")}{product.teaTbd && <span className="product-tbd tc"> {t("茶款待確認", "Teas to be confirmed")}</span>}</label>
      <select id={`option-${product.slug}`} value={option ?? ""} onChange={e => setOption(e.target.value === "" ? undefined : Number(e.target.value))}>
        <option value="">{t("請選擇商品選項", "Select an option")}</option>
        {choices.map((c, i) => <option key={c.shopifyVariantId ?? c.label} value={i}>{c.label}{optionSuffix(i)}</option>)}
      </select>
      {/* the chosen packaging in one line (user 2026-10-07: the 包裝選項 texts 「可以精簡呈現在這區」) */}
      {option !== undefined && choices[option]?.note && <p className="product-choice-note tc">{choices[option].note}</p>}
    </div>}
    {product.packagingNote && <p id={`packaging-${product.slug}`} className="product-mix-help tc">{product.packagingNote}</p>}
    {product.preOrder && product.preOrderPolicy && <aside className="product-preorder-notice tc" aria-label={t("預購說明", "Pre-order information")}>
      <p>{product.preOrderPolicy.shipping}</p>
      <details><summary>{t("預購付款與取消", "Pre-order payment and cancellation")}</summary>
        <p>{product.preOrderPolicy.terms} <Link href={`${localeHref(lang, "/policy")}#preorders`}>{t("查看完整政策", "Read the full policy")}</Link></p>
      </details>
    </aside>}
    <button type="button" className="product-buy tc" onClick={() => (boxes ? cart.add(product, 1, undefined, mix) : cart.add(product, 1, option))} disabled={cart.busy || !live.checked || live.error || missing || soldOut || noPrice}>{live.error ? t("暫時無法確認庫存", "Availability temporarily unavailable") : !live.checked ? t("確認庫存中", "Checking availability") : soldOut ? t("已售罄", "Sold out") : noPrice ? t("價格確認中", "Price coming soon") : missing && boxes ? t(`還要選 ${boxes - picked} 盒`, `Choose ${boxes - picked} more boxes`) : missing ? t("請先選擇商品選項", "Choose your option") : product.preOrder ? t("加入預購", "Pre-order") : t("加入購物車", "Add to bag")}</button>
  </>;
}

"use client";
// Right-hand cart drawer (Bang & Olufsen style): lines with quantity steppers, subtotal, shipping note, checkout.
import { useEffect, useRef } from "react";
import { CONSENT_EVENT, track } from "@/lib/analytics/ga4";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { productHref, categoryHref } from "@/data/catalog";
import { localeHref } from "@/i18n/config";
import { useT } from "@/i18n/LocaleProvider";
import { supportEmail, freeShippingMin } from "@/data/commerce";
import { preOrderShipping } from "@/data/tea-gifts";
import { MAX_LINE_QUANTITY } from "@/lib/shopify/types";

export default function CartDrawer() {
  const cart = useCart();
  const { lang, t } = useT();
  const viewed = useRef(false);
  useEffect(() => {
    if (!cart.open) { viewed.current = false; return; }
    const send = () => {
      if (!viewed.current && cart.ready && cart.lines.length) viewed.current = track("view_cart", { currency: cart.currency, value: cart.subtotal, items: cart.lines.map(l => ({ item_id: l.variantId?.split("/").pop() ?? l.slug, item_name: l.name, item_brand: "CHARM VILLA", price: l.unitAmount, quantity: l.quantity })) });
    };
    send(); window.addEventListener(CONSENT_EVENT, send);
    return () => window.removeEventListener(CONSENT_EVENT, send);
  }, [cart.open, cart.ready, cart.lines, cart.currency, cart.subtotal]);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cart.setOpen(false); }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [cart]);
  useEffect(() => { document.documentElement.classList.toggle("cart--open", cart.open); return () => document.documentElement.classList.remove("cart--open"); }, [cart.open]);
  // Shopify's subtotal once connected (CartProvider); in local mode the lines are summed per currency
  const currencyTotals = cart.mode === "shopify" ? [[cart.currency, cart.subtotal] as [string, number]] : Array.from(cart.lines.reduce((totals, line) => {
    if (!line.onRequest) totals.set(line.currency, (totals.get(line.currency) ?? 0) + line.unitAmount * line.quantity);
    return totals;
  }, new Map<string, number>()));
  const mixedCurrencies = currencyTotals.length > 1;
  return (
    <div className={`cart-root ${cart.open ? "is-open" : ""}`} aria-hidden={!cart.open}>
      <button type="button" className="cart-backdrop" aria-label={t("關閉購物車", "Close bag")} onClick={() => cart.setOpen(false)} tabIndex={cart.open ? 0 : -1} />
      <aside className="cart-panel" role="dialog" aria-modal="true" aria-label={t("購物車", "Bag")} inert={!cart.open}>
        <header className="cart-head"><h2 className="tc">{t("購物車", "Bag")} <span>{cart.count}</span></h2><button type="button" onClick={() => cart.setOpen(false)} aria-label={t("關閉購物車", "Close bag")} className="cart-close">✕</button></header>
        {/* above both the empty and the filled bag, so a first add that fails (pre-order full, piece not set up) still says why */}
        {(cart.error || cart.notice) && <div className="cart-messages">
          {cart.error && <p className="cart-error tc" role="alert">{cart.error}</p>}
          {cart.notice && <p className="cart-notice tc" role="status">{cart.notice}</p>}
        </div>}
        {!cart.ready && cart.mode === "shopify" ? (
          <div className="cart-empty tc" aria-busy="true"><p>{t("購物車載入中…", "Loading your bag…")}</p></div>
        ) : cart.lines.length === 0 ? (
          <div className="cart-empty tc"><p>{t("購物車是空的。", "Your bag is empty.")}</p><Link href={categoryHref("tea", lang)} onClick={() => cart.setOpen(false)} className="catalog-button tc">{t("選購茶包禮盒", "Browse tea gifts")}</Link></div>
        ) : (
          <>
            <ul className="cart-lines">
              {cart.lines.map((l) => (
                <li key={l.key} className="cart-line">
                  <div className="cart-line-image">{l.image && <img src={l.image.src} alt={l.image.alt} />}</div>
                  <div className="cart-line-body">
                    <p className="tc cart-line-name">{l.slug ? <Link href={productHref(l.slug, lang)} onClick={() => cart.setOpen(false)}>{l.name}</Link> : l.name}</p>
                    <p className="cart-line-price">{l.onRequest ? t("價格洽詢", "Price on request") : cart.formatPrice(l.unitAmount, l.currency)}</p>
                    {/* pre-order lines carry their shipping time in the bag (pre-launch shopper review, user 2026-10-14) */}
                    {l.preOrder && <p className="cart-line-preorder tc">{lang === "en" ? preOrderShipping.en : preOrderShipping.zh}</p>}
                    <div className="cart-line-tools">
                      <div className="cart-qty" role="group" aria-label={t("數量", "Quantity")}>
                        <button type="button" onClick={() => cart.update(l.key, l.quantity - 1)} disabled={cart.busy || l.quantity <= 1} aria-label={t("減少數量", "Decrease quantity")}>−</button>
                        <span aria-live="polite">{l.quantity}</span>
                        <button type="button" onClick={() => cart.update(l.key, l.quantity + 1)} disabled={cart.busy || l.quantity >= MAX_LINE_QUANTITY} aria-label={t("增加數量", "Increase quantity")}>+</button>
                      </div>
                      <button type="button" className="cart-remove tc" onClick={() => cart.remove(l.key)} disabled={cart.busy}>{t("移除", "Remove")}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="cart-foot" aria-busy={cart.busy}>
              {cart.busy && <p className="cart-note tc" role="status">{t("更新中…", "Updating…")}</p>}
              <div className="cart-subtotal"><span className="tc">{t("小計", "Subtotal")}</span><strong>{currencyTotals.map(([currency, amount]) => cart.formatPrice(amount, currency)).join(" + ")}</strong></div>
              {/* sales tax is worked out by Shopify at checkout from the delivery address (2026-10-13 commerce audit) */}
              {!mixedCurrencies && cart.currency === "USD" && <p className="cart-note tc">{t("稅金於結帳時計算。", "Taxes are calculated at checkout.")}</p>}
              {/* free shipping: US$199 or more, 199 included, to the contiguous 48 states (client's final answers 2026-10-12, D1) */}
              <p className="cart-note tc">{mixedCurrencies
                ? t("購物車內含不同幣別，金額分開列示，不合併換算。正式結帳時將依購買市場顯示可售商品與幣別。", "Your bag contains different currencies, so the subtotals are shown separately without conversion. Available products and currency will follow your market when checkout opens.")
                : cart.currency === "USD" ? (cart.subtotal >= freeShippingMin
                  ? t("此訂單配送至美國本土相連 48 州可享免運。", "This order qualifies for complimentary shipping to the contiguous United States (48 states).")
                  : t(`訂單金額滿 US$ ${freeShippingMin}（含）配送至美國本土相連 48 州免運；未達則於結帳時依地址與配送方式計算運費。`, `Complimentary shipping on orders of US$${freeShippingMin} or more to the contiguous United States (48 states); below that, shipping is calculated at checkout by address and service.`)) : t("運費、稅金與關稅於結帳時依配送國家計算。", "Shipping, taxes and duties are calculated at checkout by destination country.")}</p>
              {cart.mode === "shopify" && cart.checkoutUrl
                ? <a href={cart.checkoutUrl} aria-disabled={cart.busy} onClick={async e => { e.preventDefault(); if (cart.busy) return; const url = await cart.checkout(); if (url) window.location.assign(url); }} className="catalog-button cart-checkout tc">{t("前往結帳", "Go to checkout")}</a>
                : <button type="button" className="catalog-button cart-checkout tc" disabled title={t("金流串接完成後開放", "Online checkout is not open yet")}>{t("前往結帳", "Go to checkout")}</button>}
              <p className="cart-note tc"><Link href={localeHref(lang, "/policy#us-shipping")} onClick={() => cart.setOpen(false)} className="underline underline-offset-4">{t("運送、付款與退換貨說明", "Delivery, payment and returns")}</Link></p>
              {cart.mode === "local" && <p className="cart-note tc">{process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true" ? t("此為設計測試站，購物車僅供操作預覽，不會建立訂單。", "This is a design preview. Your bag is for testing only; no order will be placed.") : t(`線上結帳即將開放；目前可先加入購物車，或來信 ${supportEmail} 洽詢。`, `Online checkout is not open yet. For now you can add pieces to your bag, or email us at ${supportEmail}.`)}</p>}
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

"use client";
import { useEffect, useRef } from "react";
import type { Product } from "@/data/catalog";
import { useProductOption } from "@/components/catalog/ProductOption";
import { CONSENT_EVENT, consent, productItem, track } from "@/lib/analytics/ga4";

export default function ProductAnalytics({ product }: { product: Product }) {
  const { option } = useProductOption();
  const variant = option === undefined ? undefined : product.giftBox?.choices?.[option]?.shopifyVariantId;
  const sent = useRef<string | null>(null);
  useEffect(() => {
    const send = () => { if (consent() !== "granted") { sent.current = null; return; } const item = productItem(product, variant); if (sent.current === item.item_id) return; const recorded = track("view_item", { currency: product.price?.currency ?? "USD", ...(item.price === undefined ? {} : { value: item.price }), items: [item] }); if (recorded) sent.current = item.item_id; };
    send(); window.addEventListener(CONSENT_EVENT, send);
    return () => window.removeEventListener(CONSENT_EVENT, send);
  }, [product, variant]);
  return null;
}

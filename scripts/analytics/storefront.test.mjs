import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

async function storefront(url = "https://www.charmvilla.com/collections/tea", stored = {}) {
  const values = new Map(Object.entries(stored));
  const scripts = new Map();
  const writes = [];
  let storageBlocked = false;
  const context = vm.createContext({
    window: new EventTarget(), navigator: {}, location: new URL(url), URL, URLSearchParams, Event,
    Date, setTimeout, clearTimeout, process: { env: { NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-D3YCFQMZ2W" } },
    localStorage: {
      getItem(key) { if (storageBlocked) throw new Error("Storage unavailable"); return values.get(key) ?? null; },
      setItem(key, value) { if (storageBlocked) throw new Error("Storage unavailable"); values.set(key, value); },
    },
    sessionStorage: { getItem() { return null; } },
    document: {
      referrer: "https://www.tiktok.com/",
      get cookie() { return "_ga=test; _ga_D3YCFQMZ2W=test; cv-cart=keep"; },
      set cookie(value) { writes.push(value); },
      getElementById(id) { return scripts.get(id) ?? null; },
      createElement() { return { remove() { scripts.delete(this.id); } }; },
      head: { append(script) { scripts.set(script.id, script); } },
    },
  });
  const dependency = new vm.SyntheticModule(["preorderPurchase"], function () {
    this.setExport("preorderPurchase", () => null);
  }, { context });
  const code = stripTypeScriptTypes(readFileSync(new URL("../../src/lib/analytics/ga4.ts", import.meta.url), "utf8"));
  const gaModule = new vm.SourceTextModule(code, { context });
  await gaModule.link(() => dependency);
  await gaModule.evaluate();
  return {
    ga: gaModule.namespace, context, scripts, values, writes,
    blockStorage() { storageBlocked = true; },
    calls() { return Array.from(context.window.dataLayer ?? [], value => Array.from(value)); },
  };
}

test("a TikTok landing keeps its campaign when consent follows navigation, without pre-consent storage or requests", async () => {
  const p = await storefront("https://www.charmvilla.com/collections/tea?utm_source=tiktok&utm_medium=paid_social&utm_campaign=holiday&utm_id=ad-23&email=private@example.test");
  assert.equal(p.ga.track("page_view"), false);
  assert.equal(p.scripts.size, 0);
  assert.equal(p.values.size, 0);
  p.context.location = new URL("https://www.charmvilla.com/products/christmas-gift-box");
  assert.equal(p.ga.track("page_view"), false);
  p.ga.setConsent("granted");
  p.ga.track("page_view");
  const config = p.calls().find(call => call[0] === "config")[2];
  assert.equal(config.campaign_source, "tiktok");
  assert.equal(config.campaign_medium, "paid_social");
  assert.equal(config.campaign_name, "holiday");
  assert.equal(config.campaign_id, "ad-23");
  assert.equal(config.send_page_view, false);
  const page = p.calls().find(call => call[0] === "event");
  assert.equal(page[2].page_location, "https://www.charmvilla.com/products/christmas-gift-box");
  assert.ok(!JSON.stringify(p.calls()).includes("private@example.test"));
});

test("a later explicit campaign replaces the pending landing campaign as a whole", async () => {
  const p = await storefront("https://www.charmvilla.com/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=old&utm_id=old-id");
  p.ga.track("page_view");
  p.context.location = new URL("https://www.charmvilla.com/collections/tea?utm_source=newsletter&utm_medium=email&utm_campaign=new");
  p.ga.setConsent("granted");
  const config = p.calls().find(call => call[0] === "config")[2];
  assert.equal(config.campaign_source, "newsletter");
  assert.equal(config.campaign_name, "new");
  assert.equal(config.campaign_id, undefined);
});

test("a failed Google script retries on the next tracked action with one initialization and the queued events intact", async () => {
  const p = await storefront();
  p.ga.setConsent("granted");
  p.ga.track("page_view");
  const first = p.scripts.get("cv-ga4");
  if (first.onerror) first.onerror();
  else first.remove();
  p.context.location = new URL("https://www.charmvilla.com/about");
  p.ga.track("page_view");
  assert.equal(p.scripts.size, 1);
  assert.notEqual(p.scripts.get("cv-ga4"), first);
  assert.equal(p.calls().filter(call => call[0] === "config").length, 1);
  assert.equal(p.calls().filter(call => call[0] === "event").length, 2);
});

test("an explicit analytics choice works in memory when storage is unavailable and can still be withdrawn", async () => {
  const p = await storefront();
  p.blockStorage();
  assert.equal(p.ga.track("page_view"), false);
  p.ga.setConsent("granted");
  assert.equal(p.ga.track("page_view"), true);
  p.ga.setConsent("denied");
  assert.equal(p.ga.track("view_item"), false);
  assert.equal(p.ga.consent(), "denied");
  assert.ok(p.writes.every(value => value.startsWith("_ga=") || value.startsWith("_ga_")));
});

test("a stored refusal never loads GA and discards the earlier campaign before a later fresh opt-in", async () => {
  const p = await storefront("https://www.charmvilla.com/?utm_source=tiktok&utm_medium=paid_social");
  p.ga.track("page_view");
  p.ga.setConsent("denied");
  p.context.location = new URL("https://www.charmvilla.com/about");
  assert.equal(p.ga.track("page_view"), false);
  assert.equal(p.scripts.size, 0);
  p.ga.setConsent("granted");
  const config = p.calls().find(call => call[0] === "config")[2];
  assert.equal(config.campaign_source, undefined);
});

test("withdrawal from another tab updates the loaded tag, blocks queued measurement and keeps shopping storage", async () => {
  const p = await storefront(undefined, { "cv-cart-id": "keep" });
  p.ga.setConsent("granted");
  p.ga.track("page_view");
  p.values.set("cv-analytics-consent-v1", "denied");
  p.ga.refreshAnalyticsConsent();
  assert.equal(p.context.window["ga-disable-G-D3YCFQMZ2W"], true);
  assert.equal(p.calls().filter(call => call[0] === "consent").at(-1)[2].analytics_storage, "denied");
  assert.equal(p.ga.track("view_item"), false);
  assert.equal(p.values.get("cv-cart-id"), "keep");
  p.ga.setConsent("granted");
  assert.equal(p.context.window["ga-disable-G-D3YCFQMZ2W"], false);
});

test("pending campaign metadata expires after thirty minutes without writing browser storage", async () => {
  const p = await storefront("https://www.charmvilla.com/?utm_source=tiktok&utm_medium=paid_social");
  let now = 1000;
  p.context.Date = class extends Date { static now() { return now; } };
  p.ga.track("page_view");
  now += 31 * 60 * 1000;
  p.context.location = new URL("https://www.charmvilla.com/about");
  assert.equal(p.values.size, 0);
  p.ga.setConsent("granted");
  const config = p.calls().find(call => call[0] === "config")[2];
  assert.equal(config.campaign_source, undefined);
});

test("URL sanitization keeps campaign IDs but removes sensitive path tokens, queries and unsupported schemes", async () => {
  const { ga } = await storefront();
  assert.equal(ga.cleanUrl("https://www.charmvilla.com/collections/tea?utm_id=ad-23&email=private@example.test", true), "https://www.charmvilla.com/collections/tea?utm_id=ad-23");
  assert.equal(ga.cleanUrl("https://account.charmvilla.us/checkouts/cn/private-checkout/en-us?key=private"), "https://account.charmvilla.us/checkout");
  assert.equal(ga.cleanUrl("https://www.charmvilla.com/account/reset/private-reset?email=private"), "https://www.charmvilla.com/account");
  assert.equal(ga.cleanUrl("javascript:private"), "");
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const source = name => stripTypeScriptTypes(readFileSync(new URL(`../../src/lib/analytics/${name}.ts`, import.meta.url), "utf8"));

async function pixel(url = "https://www.charmvilla.com/", stored = {}) {
  const values = new Map(Object.entries(stored));
  const scripts = new Map();
  const calls = [];
  const cookieWrites = [];
  let storageBlocked = false;
  const context = vm.createContext({
    window: new EventTarget(), navigator: {}, location: new URL(url), URL, URLSearchParams, Event,
    setTimeout, clearTimeout, process: { env: {} },
    localStorage: {
      getItem(key) { if (storageBlocked) throw new Error("Storage unavailable"); return values.get(key) ?? null; },
      setItem(key, value) { if (storageBlocked) throw new Error("Storage unavailable"); values.set(key, value); },
    },
    sessionStorage: { getItem() { return null; } },
    document: {
      get cookie() { return "cv-cart=preserved"; },
      set cookie(value) { cookieWrites.push(value); },
      getElementById(id) { return scripts.get(id) ?? null; },
      createElement() { return { remove() { scripts.delete(this.id); } }; },
      head: { prepend(script) { scripts.set(script.id, script); } },
    },
  });
  const preorder = new vm.SyntheticModule(["preorderPurchase"], function () {
    this.setExport("preorderPurchase", () => null);
  }, { context });
  const ga4 = new vm.SourceTextModule(source("ga4"), { context });
  await ga4.link(() => preorder);
  await ga4.evaluate();
  const chatgpt = new vm.SourceTextModule(source("chatgpt"), { context });
  await chatgpt.link(specifier => {
    assert.equal(specifier, "@/lib/analytics/ga4");
    return ga4;
  });
  await chatgpt.evaluate();
  return {
    context, values, scripts, calls, cookieWrites, ga4: ga4.namespace, sdk: chatgpt.namespace,
    grant() { ga4.namespace.setConsent("granted", "granted"); },
    blockStorage() { storageBlocked = true; },
    load() {
      const script = scripts.get("cv-chatgpt-pixel");
      calls.push(...context.window.oaiq.q);
      context.window.oaiq = (...args) => calls.push(args);
      script.onload();
    },
    events() { return calls.filter(args => args[0] === "measure"); },
  };
}

test("new visitors and existing analytics consent cannot silently enable advertising", async () => {
  for (const stored of [{}, { "cv-analytics-consent-v1": "granted" }, { "cv-marketing-consent-v1": "denied" }]) {
    const p = await pixel(undefined, stored);
    assert.equal(p.sdk.trackChatgptPageView(), false);
    assert.equal(p.scripts.size, 0);
    p.ga4.setConsent("granted");
    assert.equal(p.ga4.marketingConsent(), "denied");
    assert.equal(p.sdk.trackChatgptPageView(), false);
    assert.equal(p.scripts.size, 0);
  }
});

test("explicit advertising consent loads one head script and initializes denied before sending the exact page event", async () => {
  const p = await pixel();
  p.grant();
  assert.equal(p.sdk.trackChatgptPageView(), false);
  assert.equal(p.sdk.trackChatgptPageView(), false);
  assert.equal(p.scripts.size, 1);
  const script = p.scripts.get("cv-chatgpt-pixel");
  assert.equal(script.src, "https://bzrcdn.openai.com/sdk/oaiq.min.js");
  assert.equal(script.async, true);
  assert.equal(p.events().length, 0);
  p.load();
  assert.deepEqual(JSON.parse(JSON.stringify(p.calls.slice(0, 2))), [
    ["consent", false], ["init", { pixelId: "JrvXcurpdqPxLqn524L1dE", debug: false }],
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(p.events())), [["measure", "page_viewed", { type: "contents" }, { opt_out: true }]]);
  p.sdk.trackChatgptPageView();
  assert.equal(p.events().length, 1);
});

test("client navigation sends one event per pathname visit without counting query changes or effect replays", async () => {
  const p = await pixel();
  p.grant(); p.sdk.trackChatgptPageView(); p.load();
  for (const url of ["/products/kyoto-gift-box", "/products/kyoto-gift-box?variant=1", "/zh/about", "/"]) {
    p.context.location = new URL(url, "https://www.charmvilla.com");
    p.sdk.trackChatgptPageView(); p.sdk.trackChatgptPageView();
  }
  assert.equal(p.events().length, 4);
  assert.equal(p.calls.filter(args => args[0] === "init").length, 1);
});

test("revocation during script loading does not replay a previously allowed page event", async () => {
  const p = await pixel();
  p.grant(); p.sdk.trackChatgptPageView();
  p.ga4.setConsent("denied"); p.sdk.trackChatgptPageView(); p.load();
  assert.equal(p.events().length, 0);
  p.grant(); p.sdk.trackChatgptPageView();
  assert.equal(p.events().length, 1);
});

test("revocation stops future events and clears only pixel attribution cookies without removing shopping data", async () => {
  const p = await pixel(undefined, { "cv-cart-id": "preserved-cart" });
  p.grant(); p.sdk.trackChatgptPageView(); p.load();
  p.ga4.setConsent("granted", "denied");
  assert.equal(p.sdk.trackChatgptPageView(), false);
  p.context.location = new URL("https://www.charmvilla.com/about");
  p.sdk.trackChatgptPageView();
  assert.equal(p.events().length, 1);
  assert.equal(p.calls.at(-1)[0], "consent");
  assert.equal(p.calls.at(-1)[1], false);
  assert.equal(p.values.get("cv-cart-id"), "preserved-cart");
  assert.equal(p.ga4.consent(), "granted");
  assert.ok(p.cookieWrites.every(value => value.startsWith("__oppref=") || value.startsWith("__obref=")));
});

test("GPC and sensitive account or task pages prevent advertising measurement", async () => {
  for (const path of ["/account", "/zh/account/reset/private", "/en/tasks", "/tasks"]) {
    const p = await pixel(`https://www.charmvilla.com${path}`);
    p.grant(); p.sdk.trackChatgptPageView();
    assert.equal(p.scripts.size, 0);
  }
  const p = await pixel();
  p.context.navigator.globalPrivacyControl = true;
  p.grant(); p.sdk.trackChatgptPageView();
  assert.equal(p.ga4.marketingConsent(), "denied");
  assert.equal(p.scripts.size, 0);
});

test("previews are off by default and explicit debug enables only the test pixel mode", async () => {
  for (const host of ["localhost", "preview.vercel.app", "charmvilla-demo2.vercel.app", "www.charmvilla.com.example.test"]) {
    const p = await pixel(`https://${host}/`);
    p.grant(); p.sdk.trackChatgptPageView();
    assert.equal(p.scripts.size, 0);
  }
  const p = await pixel("http://localhost/?chatgpt_pixel_debug=1");
  p.grant(); p.sdk.trackChatgptPageView(); p.load();
  assert.equal(p.calls.find(args => args[0] === "init")[1].debug, true);
  assert.equal(p.events().length, 1);
});

test("a blocked SDK can retry on a later visit without duplicating initialization or inventing events", async () => {
  const p = await pixel();
  p.grant(); p.sdk.trackChatgptPageView();
  p.scripts.get("cv-chatgpt-pixel").onerror();
  assert.equal(p.scripts.size, 0);
  assert.equal(p.events().length, 0);
  p.sdk.trackChatgptPageView(); p.load();
  assert.equal(p.calls.filter(args => args[0] === "init").length, 1);
  assert.equal(p.events().length, 1);
});

test("withdrawal still works when storage becomes unavailable and no customer data or purchase is supplied", async () => {
  const p = await pixel("https://www.charmvilla.com/?email=private@example.test&token=private&oppref=click-ref");
  p.grant(); p.sdk.trackChatgptPageView(); p.load();
  p.blockStorage(); p.ga4.setConsent("denied"); p.sdk.trackChatgptPageView();
  assert.equal(p.ga4.marketingConsent(), "denied");
  const payload = JSON.stringify(p.calls);
  assert.ok(!payload.includes("private"));
  assert.ok(!payload.includes("order_created"));
  assert.ok(!payload.includes("user"));
  assert.equal(p.events().length, 1);
});

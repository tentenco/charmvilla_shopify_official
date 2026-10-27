import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createRequire, registerHooks } from "node:module";
import { AsyncLocalStorage } from "node:async_hooks";

globalThis.AsyncLocalStorage = AsyncLocalStorage;
const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const { unstable_doesMiddlewareMatch } = require("next/experimental/testing/server");
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === "next/server" ? "next/server.js" : specifier, context);
  },
});
const { proxy, config } = await import("../../src/proxy.ts");
hooks.deregister();

beforeEach(t => {
  const original = { VERCEL: process.env.VERCEL, VERCEL_ENV: process.env.VERCEL_ENV };
  process.env.VERCEL = "1";
  process.env.VERCEL_ENV = "production";
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
});

function request(path = "/", { country = "TW", host = "www.charmvilla.com", method = "GET", headers = {} } = {}) {
  return new NextRequest(`https://${host}${path}`, {
    method,
    headers: { ...(country === null ? {} : { "x-vercel-ip-country": country }), ...headers },
  });
}

test("Taiwan page visits redirect from both production hosts and all locale paths without caching", () => {
  for (const host of ["www.charmvilla.com", "charmvilla.com"]) {
    for (const path of ["/", "/zh", "/en", "/products/kyoto-gift-box", "/zh/products/kyoto-gift-box", "/en/collections/tea"]) {
      for (const method of ["GET", "HEAD"]) {
        const response = proxy(request(path, { host, method }));
        assert.equal(response.status, 302);
        assert.equal(response.headers.get("location"), "https://www.charmvilla.com.tw/");
        assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
        assert.equal(response.headers.get("x-middleware-rewrite"), null);
      }
    }
  }
});

test("advertising attribution survives while cart, account, arbitrary redirect and fragment values stay on the US origin", () => {
  const query = new URLSearchParams({
    utm_source: "google", utm_medium: "cpc", utm_campaign: "臺灣 冬季", utm_id: "winter-26",
    utm_term: "tea gifts", utm_content: "snowflake", gclid: "click-1", dclid: "click-2",
    gbraid: "click-3", wbraid: "click-4", fbclid: "click-5", msclkid: "click-6", oppref: "openai-click",
    cart: "private-cart", key: "private-key", token: "private-token", email: "private@example.test",
    redirect: "https://example.test/", next: "/account", market: "US",
  });
  const response = proxy(request(`/zh/products/snowflake-gift-box?${query}#private-fragment`));
  const destination = new URL(response.headers.get("location"));
  assert.equal(destination.origin, "https://www.charmvilla.com.tw");
  assert.equal(destination.pathname, "/");
  assert.equal(destination.hash, "");
  assert.deepEqual([...destination.searchParams.keys()], [...query.keys()].slice(0, 13));
  for (const [key, value] of destination.searchParams) assert.equal(value, query.get(key));
});

test("non-Taiwan and unknown geography keep the US storefront regardless of language or Cloudflare headers", () => {
  for (const country of ["US", "HK", "JP", "SG", "XX", "", null]) {
    const response = proxy(request("/", {
      country,
      headers: { "accept-language": "zh-TW", "cf-ipcountry": "TW", "x-forwarded-for": "1.2.3.4" },
    }));
    assert.equal(response.headers.get("location"), null);
    assert.equal(new URL(response.headers.get("x-middleware-rewrite")).pathname, "/en");
  }
});

test("local development and previews cannot activate production geography redirects", () => {
  for (const environment of ["preview", "development", undefined]) {
    if (environment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = environment;
    assert.equal(proxy(request("/zh")).headers.get("location"), null);
  }
  process.env.VERCEL_ENV = "production";
  for (const vercel of ["0", undefined]) {
    if (vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = vercel;
    assert.equal(proxy(request("/zh")).headers.get("location"), null);
  }
});

test("other hosts and the Taiwan destination never enter the production redirect", () => {
  for (const host of ["localhost", "charmvilla-demo2.vercel.app", "preview.vercel.app", "www.charmvilla.com.tw", "account.charmvilla.us", "www.charmvilla.com.example.test"]) {
    assert.equal(proxy(request("/zh", { host })).headers.get("location"), null);
  }
});

test("unsafe HTTP methods are never redirected to another storefront", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    assert.equal(proxy(request("/zh", { method })).headers.get("location"), null);
  }
});

test("crawlers use the same geography policy and market cookies cannot bypass the requested hard redirect", () => {
  for (const country of ["TW", "US"]) {
    const response = proxy(request("/zh", {
      country,
      headers: { "user-agent": "Googlebot", cookie: "market=US; country=US" },
    }));
    assert.equal(response.headers.get("location"), country === "TW" ? "https://www.charmvilla.com.tw/" : null);
  }
});

test("the proxy matcher excludes APIs, framework internals, public assets, robots and sitemaps", () => {
  for (const url of ["/api/cart", "/api/products", "/api/preorder", "/api/account/login", "/_next/static/app.js", "/_next/image?url=%2Fmedia%2Ftea.webp&w=640&q=75", "/media/site/tea.webp", "/brand/logo.svg", "/robots.txt", "/sitemap.xml", "/icon.png", "/.well-known/security.txt"]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), false, url);
  }
  for (const url of ["/", "/zh", "/collections/tea", "/products/kyoto-gift-box", "/zh/account"]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true, url);
  }
});

test("existing English canonical redirects, Chinese routes and self-hosted rewrites remain intact", () => {
  const canonical = proxy(request("/en/products/kyoto-gift-box?variant=1", { country: "US" }));
  assert.equal(canonical.status, 308);
  assert.equal(canonical.headers.get("location"), "https://www.charmvilla.com/products/kyoto-gift-box?variant=1");
  const chinese = proxy(request("/zh/products/kyoto-gift-box", { country: "US" }));
  assert.equal(chinese.headers.get("x-middleware-next"), "1");
  const english = proxy(request("/products/kyoto-gift-box?variant=1", { country: "US" }));
  assert.equal(english.headers.get("x-middleware-rewrite"), "https://www.charmvilla.com/en/products/kyoto-gift-box?variant=1");
  delete process.env.VERCEL;
  const rewritten = proxy(request("/en/products/kyoto-gift-box", { headers: { "x-cv-locale-rewrite": "1" } }));
  assert.equal(rewritten.headers.get("x-middleware-next"), "1");
});

# 臺灣流量導向臺灣站

更新：2026-10-27。已依使用者「go live」授權，隨 d00b871 推送並正式發布；Production READY、www／apex aliases 及真實臺灣／美國出口驗證通過。

## 使用者會看到什麼

臺灣 IP 開啟美國官網的首頁或內容頁，會收到 `302`，前往 `https://www.charmvilla.com.tw/`。英文、中文與舊 `/en` 路徑都適用；不提供 Cookie 或網址參數略過，符合本輪「臺灣流量全部導向」要求。

| 請求 | 行為 |
| --- | --- |
| Production 的 `charmvilla.com`／`www.charmvilla.com`、臺灣 IP、GET／HEAD 頁面 | 302 至臺灣首頁；回應 `Cache-Control: private, no-store, max-age=0` |
| 非臺灣 IP，或無法取得國別 | 維持美國站原有路由 |
| API、Next.js 內部資源、圖片、robots.txt、sitemap.xml | 沿用現有 matcher 排除，保持原功能 |
| POST／PUT／PATCH／DELETE／OPTIONS | 不執行跨站 GEO redirect |
| localhost、Vercel Preview、其他子網域 | 不啟用 |
| 搜尋爬蟲 | 與同國別的一般訪客一致，沒有 User-Agent 特例 |
| Shopify hosted checkout／account | 不在這個 Vercel 主機的範圍內 |

只轉送 `utm_source`、`utm_medium`、`utm_campaign`、`utm_term`、`utm_content`、`utm_id`、`gclid`、`dclid`、`gbraid`、`wbraid`、`fbclid`、`msclkid`、`ttclid`、`tt_campaignid`、`oppref`。不轉送其他查詢參數、hash、Cookie、購物車或登入狀態。

## 為什麼放在 Vercel

Cloudflare 已登入後台的 apex 與 www 記錄均為 `DNS only`，CNAME 指向 `463b28ecf678f5be.vercel-dns-016.com`。公開回應由 Vercel 提供，沒有 Cloudflare 的 `cf-ray`；目前官網 HTTP 流量沒有經過 Cloudflare 的代理層。

實作位於 `src/proxy.ts`，使用 Vercel 提供的 `x-vercel-ip-country`，並同時限定 `VERCEL=1`、`VERCEL_ENV=production` 及正式主機。沒有開啟 Cloudflare 橘雲、改 DNS、增加 Worker 或寫 Shopify。

兩站路徑系統不同，不能把美國 `/products/...` 原樣接到臺灣 PHP 網站。這次採用使用者指定的臺灣首頁；若日後要逐商品轉址，需要另外驗證商品 URL 對照。

## 使用上的取捨

這是依 IP 分流，VPN、企業網路與 IP 資料誤差會影響判斷；不是依國籍、瀏覽器語言或收件地址判斷。未知國別繼續留在原站。

一般多市場網站若希望使用者自行選擇市場，可使用地區提示及切換連結。本輪依使用者要求強制導向；臺灣使用者不能用站內選單繼續瀏覽美國站。Google 提醒依地區改變內容可能影響爬取與收錄；本輪使用暫時轉址、保留現有 canonical／hreflang，不宣稱完全沒有 SEO 影響，也不把爬蟲偽裝成其他國別。

## 驗證與上線

- Node 24.18.0 的 `npm run check` 通過：lint 0 errors／7 既有 warnings、typecheck、build。
- `node --test scripts/routing/proxy.test.mjs`：9 項路由測試通過，涵蓋國別、主機、環境、方法、參數、爬蟲、matcher 與原有雙語路由。
- 本機 Next production server 的 10 項 HTTP 案例通過，使用合成國別標頭，並非真實臺灣／美國出口的正式站驗證。結果見 [local-http.json](qa/2026-10-27-taiwan-geo-redirect/local-http.json)。
- Ego Lite 實際開啟本機商品頁並提供測試國別 TW，成功抵達臺灣首頁，保留 utm_source；臺灣站標題與內容可讀。沒有修改臺灣站。
- 首次以一般 `next start` 模擬時，Next 使用 localhost 作為內部 hostname，正式主機限制正確地未啟用轉址；驗證改用正式 hostname、僅監聽 loopback 的 custom Next server，沒有放寬程式限制。

正式發布已核對指定 Git remote、main 與既有 Vercel project；dpl_HHRuxAKfu1bbrpwjH8PGkDfPEqrn 的 Git SHA 為 d00b871，Production READY，www／apex aliases 一致。真實臺灣出口的十項 HTTP 案例與瀏覽器商品頁轉址通過；Globalping 美國 Buffalo 節點的正式 /privacy 為 200、沒有 Location。證據：[正式部署](qa/2026-10-27-taiwan-geo-redirect/production-deployment.json)、[臺灣案例](qa/2026-10-27-taiwan-geo-redirect/production-taiwan-http.json)、[美國探測](qa/2026-10-27-taiwan-geo-redirect/production-us-probe.json)。

回復方式：發布後若需停用，回復本次 `src/proxy.ts` GEO 區塊並重新部署，或依當次授權回到前一個已確認部署。DNS 與 Shopify 無需回復。

## 官方依據

- [Vercel IP 國別標頭](https://vercel.com/docs/headers/request-headers#x-vercel-ip-country)
- [Vercel 地理位置轉址範例](https://vercel.com/docs/routing/redirects/configuration-redirects)
- [Cloudflare Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/)
- [Google：依地區提供不同內容的爬取限制](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)
- [Google：多地區網站與使用者切換](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

2026-10-27追蹤自我修復另補TikTok ttclid與tt_campaignid，發布與驗證見[本輪QA](qa/2026-10-27-analytics-self-repair/README.md)。

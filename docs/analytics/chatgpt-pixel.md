# ChatGPT 廣告頁面量測

更新：2026-10-27。本機實作與驗證完成，尚未提交、推送或部署。

## 量測範圍

- 來源：[使用者提供的交接 PDF](https://s4.tenten.co/charmvilla-chatgpt-pixel-marketing-handoff.pdf)，擷取日期為 2026-10-24 Pacific Time。
- Pixel ID：`JrvXcurpdqPxLqn524L1dE`；SDK：`https://bzrcdn.openai.com/sdk/oaiq.min.js`。
- 沿用既有 `Page Viewed` 轉換事件，呼叫 `oaiq("measure", "page_viewed", { type: "contents" }, { opt_out: true })`。
- 同意後的目前頁面與每次 pathname 導覽各一次；query 變更或 React effect 重跑不重複發送。
- 不新增 `order_created`、checkout pixel、Conversions API、事件或廣告活動，不更動目前 campaign 目標。

## 同意與載入

Cookie banner 提供「僅必要功能」、「允許分析」、「允許分析與廣告」。GA4 分析與廣告量測分開儲存；原有「允許分析」不自動轉為廣告同意。既有使用者尚未做廣告選擇時，會再次看到選項。頁尾 Cookie 設定可隨時變更。

只有明確允許廣告後才把 SDK 加入 head，先排入 `consent=false`，再初始化 Pixel；SDK 載入完成後重查同意，才允許並發送事件。撤回時呼叫 `oaiq("consent", false)`，清除 `__oppref`／`__obref`，停止後續事件。SDK 的 `__oaiq_consent` 是保存拒絕選擇的 Cookie，應保留；購物車及其他網站資料不清除。GPC 訊號會停用廣告量測。

正式主機以外預設停用；`?chatgpt_pixel_debug=1` 才開啟 QA，並在該分頁保留 debug 設定。正式一般瀏覽的 `debug=false`。會員與 tasks 路徑不量測。GA4 的廣告同意維持 denied，Shopify marketing 仍為 false，未擴張到結帳。

## 歸因與既有 Pixel 設定

SDK 讀取 `oppref` 並維護第一方歸因 Cookie；GEO redirect 白名單已保留 `oppref`。GA4 不額外接收它。轉址不轉送任意 query、登入、購物車或 hash。

2026-10-27 從 SDK 的公開設定讀回 `automatic_advanced_matching_enabled=true`，屬既有廣告帳戶設定，本輪沒有更改。OpenAI 官方說明：啟用時 SDK 可能辨識支援的顧客識別資料，在瀏覽器內正規化及 SHA-256 雜湊後進行轉換比對。雙語隱私政策已揭露此行為；不能將本次整合描述為完全不處理識別資料。程式沒有提供手動 user 欄位或顧客名單，事件使用 `opt_out: true` 排除未來個人化用途。

## 驗證

- Node 24.18.0：Pixel 9 項、原 GA4 9 項、GEO 路由 9 項測試通過。
- 實際 Ego Lite：拒絕／僅分析不載入，允許廣告後 SDK 與設定均 HTTP 200；SPA 導覽單次 `page_viewed` 收到 OpenAI event endpoint HTTP **202**。
- 撤回後跨頁沒有新增事件，兩個歸因 Cookie 清除；同意偏好 Cookie 保留。
- 中文／英文、1440×900／390×844 四例無溢出、無 runtime error，按鈕鍵盤順序正確；英文手機含 reduced-motion。四張截圖已目視檢查。
- [SDK 與撤回證據](../qa/2026-10-27-chatgpt-pixel/sdk-browser.json)、[版面矩陣](../qa/2026-10-27-chatgpt-pixel/browser-matrix.json)。測試時間記錄在 JSON 的 UTC 時間欄位；本機時區為 Asia/Taipei。

測試命令：

```sh
node --experimental-vm-modules --test scripts/analytics/chatgpt.test.mjs
node --import ./tests/support/register-ts.mjs --test scripts/analytics/analytics.test.mjs
node --test scripts/routing/proxy.test.mjs
npm run check
```

## 正式套用後仍需核對

本輪瀏覽器登入為 `dev@tenten.co`，Ads Manager 帳號選單只顯示 Tenten，沒有 CHARM VILLA，無法讀取指定 Pixel 的 Event Stream 或確認 campaign 事件連結。HTTP 202 代表量測請求已接受，不等於已在 Event Stream 讀回；兩者須分開回報。需要有權限的 CHARM VILLA 廣告帳號確認，不能另建 Pixel 或改 campaign 目標來完成驗收。

上線後以美國官網、非臺灣出口檢查頁面量測；臺灣訪客會先經 GEO redirect 前往另一個網站，本輪未安裝臺灣站的 Pixel。購買歸因與真實訂單仍不在本次頁面量測範圍。

官方參考：[OpenAI Measurement Pixel](https://developers.openai.com/ads/measurement-pixel)。

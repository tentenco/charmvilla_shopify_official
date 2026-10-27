# Active Agent Plan

Status: `in_progress`
Updated: 2026-10-27

## Active task

- 目標：依使用者最新「go live」授權，將臺灣 GEO redirect 與指定 ChatGPT Pixel 正式發布，完成線上驗證後寄英文通知。
- 授權：使用者2026-10-27明確回覆「go live」，已涵蓋兩項commit／push到指定main、Vercel Production與線上驗證；通知寄送沿用原To／Cc及英文要求，不再要求確認。
- Git：main／origin/main e5b35ec；GEO 已在本機完成並向使用者回報。既有 diff 包含 src/proxy.ts、docs/geo-redirect.md、scripts/routing/proxy.test.mjs、GEO HTTP QA 與 PLAN，全部保留。不覆蓋其他工作樹。
- 完成條件：依真實 PDF 內容接入正確 Pixel／事件，遵守同意、避免重複與洩漏敏感資料，執行本機與瀏覽器驗證；上線狀態如實區分。

## Steps and evidence

| 狀態 | 動作 | 如何證明完成 | 實際結果／證據 |
| --- | --- | --- | --- |
| completed | 讀 PDF 與現行 analytics／Shopify 契約 | 真實 Pixel ID、來源script、事件與同意設定 | curl一般UA成功；Pixel JrvXcurpdqPxLqn524L1dE／page_viewed(type=contents)，官方確認consent false/true、opt_out、oppref；僅頁面量測，不加購買或修改campaign目標 |
| completed | 最小接入並測試 | 同意前不載入、正確事件、無重複、無敏感資料 | 獨立marketing同意、三選項banner、GPC、sdk同意false先於init／onload後才measure、撤回清cookie；9Pixel＋9GA4＋9路由測試通過；GEO白名單補oppref |
| completed | 驗證與記錄 | Node24 check、針對性測試、瀏覽器 | 最終Node24 check通過0 errors／7既有warnings；27測試；SDK200、設定200、page_viewed HTTP202；Ego雙語1440／390、鍵盤與reduced-motion通過，4截圖已目視；最新隱私文案雙語HTTP200及canonical通過 |
| in_progress | 兩項更新commit／push與正式部署 | 指定remote／main／Vercel project、READY與alias | go live已授權；fresh fetch無新提交，其他worktree乾淨；核對Vercel project中 |
| pending | 正式GEO與Pixel驗證 | TW真實出口302；非TW行為與SDK同意／收件狀態如實核對 | 尚未執行 |

## FIFO queue

| 順位／收到時間 | 使用者要求 | 已知授權、限制與完成條件 |
| --- | --- | --- |
| 1／2026-10-27 | 兩項完成後寄英文 email；To: haoying.us.llc@gmail.com；Cc: kuan@tenten.co | 使用者已明確授權寄信；列實際完成／上線／驗證結果，不能把本機完成說成已上線。使用既有 Gmail OAuth，核對寄件帳號；英文套用指定 Humanizer。 |

## Completed preceding task: GEO 本機實作

- Cloudflare 使用者已登入；後台核對 apex／www 皆 CNAME 463b28ecf678f5be.vercel-dns-016.com、DNS only；公開NS為Cloudflare，HTTP直連Vercel。沒有改DNS或設無效Cloudflare規則。
- src/proxy.ts 使用 Vercel x-vercel-ip-country=TW，限定正式環境及兩個正式主機、GET／HEAD頁面；302 no-store至臺灣首頁。保留UTM／主要廣告click參數白名單，不轉送其他query／hash／Cookie。API／靜態資源／robots／sitemap沿用matcher排除，非臺灣／未知國別及Preview不啟用；爬蟲同國別同規則。
- Node24 check通過：0 errors／7既有warnings；9路由測試通過；10組實際Next HTTP通過；Ego測試TW商品頁成功抵達臺灣站，保留utm_source；沒有真實臺灣／美國出口正式驗證。文件見[規格與驗證](../geo-redirect.md)、[HTTP QA](../qa/2026-10-27-taiwan-geo-redirect/local-http.json)。
- 本機已交付，尚未commit／push／部署；正式轉址未啟用。後續若獲發布授權，必須包含此項並實際驗證。測試server已停止、GEO Ego task9已finish；未改使用者資料。

## Attempts and decisions

- GEO test helper 的安裝文件名稱 doesProxyMatch 與實際包匯出不同；核對 source 後採 unstable_doesMiddlewareMatch 及測試環境 AsyncLocalStorage，9測試通過，未改node_modules或降低assertions。
- 一般next start的內部hostname是localhost，Production guard正常不啟用；以正式hostname、僅監聽loopback的custom Next server完成HTTP驗證，未放寬guard。
- FIFO遵循循序：GEO本機成果已先交付，再開始Pixel；英文通知仍排隊。Agent Memory無可用保存工具，意圖 fifo-task-queue／active-task-preservation 保留於此。

## Verification and delivery

- GEO：本機完成；未commit、未push、無Preview／Production部署。
- Pixel：本機完成並驗證；尚未commit／push／部署。官方ID與page_viewed沿用PDF。
- Email：寄送已授權；兩項正式套用與驗證後才寄，目前未寄。Gmail auth status與getProfile皆確認既有OAuth erik@tenten.co，無重新登入或匯出token。To haoying.us.llc@gmail.com，Cc kuan@tenten.co，英文套用Humanizer。

## Resume

go live已授權。完成Vercel project核對後，將本輪限定檔案commit／push，讀回READY／alias，TW實際出口驗證GEO，非TW行為依可用出口如實記錄；完成後寄英文通知並讀回SENT。Ego task10仍agent-owned：p1本機隱私頁，p2目前只有Tenten的AdsManager；3258是本輪Node24 production server（session38321）。沒有其他使用者程序被停止；兩個其他worktree維持原SHA且乾淨。

- Pixel實作檔案：src/lib/analytics/chatgpt.ts、ChatgptPixel.tsx、ga4.ts、Analytics.tsx、layout.tsx、globals.css、commerce.ts；不修改Shopify checkout pixel或廣告campaign。既有GA4分析同意不能自動升格為marketing；Google廣告同意仍denied，Shopify marketing仍false。
- PDF未附帶的HTML不需要另索取：PDF與OpenAI官方文件足以確認腳本／ID／事件呼叫。預設debug false，明確chatgpt_pixel_debug=1只供QA。

- 真實SDK本機測試：拒絕與僅分析均不載入；明確廣告同意後SDK200／設定200並發出page_viewed。SDK使用no-cors，fetch response.status=0是opaque，不是HTTP失敗；先前等待truthy status逾時已查證並改以CDP狀態驗證，不改應用程式迎合測試。
- 真實公開Pixel設定讀回 automatic_advanced_matching_enabled=true（既有來源設定）。不更動廣告後台或偽稱沒有雜湊比對；須在隱私文案揭露SDK可能在瀏覽器雜湊支援的顧客識別資料，仍受明確廣告同意與opt_out控制。
- AdsManager目前dev@tenten.co／Tenten，帳號選單無CHARM VILLA，不能查本Pixel的Event Stream或確認campaign連結；不登出或改動現有登入。

- 瀏覽器撤回檢查曾把必要的 __oaiq_consent 拒絕偏好Cookie也視為歸因Cookie而失敗；已檢查真實Cookie名稱，修正驗證範圍為契約的 __oppref／__obref，保留拒絕偏好，程式沒有為測試清除其他Cookie。
- 本機真實出口Cloudflare trace為loc=TW／warp=off，可在發布後做真實臺灣IP驗證；未以此宣稱已在線上啟用。

- 正式發布問題已獲使用者明確「go live」回答，取代前次等待授權狀態；無待問問題。
- 英文通知草稿存於本機暫存區，Gmail dry-run檢查To／Cc／寄件者成功；未寄送。草稿明確需Production READY、正式TW redirect與Pixel驗證後才可寄，不得提前把未上線說成已完成。
- 最新隱私說明的SHA-256文字在既有Cookie摺疊區內，首次直接等全文可見逾時；依UI展開Cookie後已看到更新說明，沒有改動既有摺疊元件。

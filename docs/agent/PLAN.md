# Active Agent Plan

Status: `in_progress`
Updated: 2026-10-27

## Active task

- 目標：診斷Aaron所述「前兩天TikTok約1,000點擊、GA只顯示2位」差異，從Cloudflare／Vercel／Shopify／GA4建立證據，整理英文report寄給Aaron（haoying.us.llc@gmail.com）。使用者附訊息截圖與口述；點擊數與使用者數尚未驗證，不視為同一口徑。
- 授權：讀取相關平台與既有帳號的設定／流量紀錄、製作報告並寄給Aaron。這是診斷與報告，未授權改GA同意政策、廣告campaign、商店資料或為提高數字而重設追蹤。
- Git基準：main／origin/main d00b871；目前只有本輪發布後的QA／交接／PLAN文件更新。其他兩個worktree保持原SHA且乾淨。診斷原始資料與報告不得把顧客個資／憑證提交Git。
- 可觀察完成條件：對齊日期／時區／平台指標與目的網址，核對GA收集與篩選狀態、可用伺服器／商店證據，區分已證實原因、可能原因與資料限制；完成可讀英文report並寄出、讀回SENT。
- 重要限制：新GEO於2026-10-27本輪才發布，不能用它解釋上線前兩天差異。不得憑1000 clicks推算1000唯一真人訪客或98%拒絕率。

## Steps and evidence

| 狀態 | 動作 | 如何證明完成 | 實際結果／證據 |
| --- | --- | --- | --- |
| in_progress | 核對來源、日期、指標與可用權限 | 原始報表／平台時區／目的URL／GA property | 尚未執行；先完成前項發布QA文件提交 |
| pending | 讀取Cloudflare／Vercel／Shopify／GA4證據 | 合理可比較的期間與事件／流量資料 | 尚未執行 |
| pending | 複查追蹤與歸因、形成原因排序 | 正常／拒絕同意／in-app等實際行為或平台證據 | 尚未執行 |
| pending | 整理英文report並寄Aaron | 支持結論、可執行建議、SENT讀回 | 尚未執行 |

## FIFO queue

無。原#1上線通知已完成；原#2診斷現為active，不因後續訊息丟掉。

## Completed preceding tasks

- GEO與ChatGPT Pixel應用 `d00b871` 已commit／push到指定GitHub main。Vercel project prj_QWvvqmrK6UCFkDhY9DyPAQe2Cx23、team tentenco、Node24；部署 dpl_HHRuxAKfu1bbrpwjH8PGkDfPEqrn READY，www／apex aliases與來源SHA確認。
- 真實TW出口：六頁302 no-store，API cart／robots／sitemap／logo四項200；Ego商品頁到臺灣站。Globalping US Buffalo/privacy200、無Location。證據在[正式GEO QA](../qa/2026-10-27-taiwan-geo-redirect/production-deployment.json)。
- 已部署artifact的Pixel：未選／僅分析不載入，允許廣告後SDK／設定200、event202；撤回必要偏好後結束Ego space12。未讀回CHARM VILLA Event Stream（目前AdsManager dev@tenten.co只有Tenten）；不改campaign／購買追蹤。
- Node24 check0 errors／7既有warnings；27路由／Pixel／GA4測試及本機雙語1440／390／鍵盤／reduced-motion通過。詳[Pixel QA](../analytics/chatgpt-pixel.md)、[GEO](../geo-redirect.md)。
- 英文上線通知已寄出：Gmail id 1a17bd1244dfe8df、SENT已讀回；From erik@tenten.co，To Aaron haoying.us.llc@gmail.com，Cc kuan@tenten.co。不得重寄。寄件OAuth auth status與getProfile確認，無重登入／匯出token。
- 通知不包含本輪診斷結論，已說明會另寄TikTok／GA4報告。診斷報告的使用者新指示只指定Aaron，未自動新增其他收件人。

## Attempts and decisions

- Cloudflare於前項核對apex／www為DNS only，只在Vercel執行GEO；Cloudflare的HTTP總數可能來自其他proxied子網域，不能當www訪客數。此為盤點線索，診斷時再核對相關期間。
- 前項發布只有新check.log尾端空白需要正規化，未更改應用。Vercel自動Git部署成功，無需另建project或CLI重部署。
- 新go-live回合舊Ego space10已不存在，沒有claim使用者空間；發布驗證使用新授權目標space12，已finish。診斷是新的獨立任務，可建立一個新space，保留使用者原tabs與登入。
- Agent Memory工具無可用保存介面；fifo-task-queue／active-task-preservation意圖依此計畫保存。

## Verification and delivery

- 前兩項本機、Git push、Production、通知已完成。後續QA文件commit可再次觸發Vercel，須讀回READY與alias，但來源應用程式仍同d00b871。
- 本輪診斷尚未開始資料讀取，報告／報告email未產生、未寄。
- 憑證：Gmail /Users/ekc-m5max/.local/bin/gws-tenten 為erik@tenten.co，token refresh ready；Shopify既有server credentials可唯讀；不得輸出token或顧客資料。

## Resume

先將本輪發布的限定QA／交接文件commit與push，確認最終READY；再開始診斷。可用Ego Lite預設登入（先依技能建立一個診斷space）；不要claim使用者既有space。先找現行可用GA／Vercel／Cloudflare工具與權限，再問不可從來源取得的資料。

暫存資料：/tmp/charmvilla-chatgpt-pixel-20261027/ 內有原PDF、上線通知final eml及sent/verified JSON，已寄信不得重送。原本本機3258服務如仍在，僅停止確認屬本輪者；不改其他服務或工作樹。

# Active Agent Plan

Status: `in_progress`
Updated: 2026-10-27

## Active task

- 使用者要求：全面自我檢查與修復追蹤／歸因／轉址／Cloudflare或Vercel安全層可能造成的流量差異；最新補充已收到Aaron email附件，須讀取原始匯出作診斷基礎，找原因並回信Aaron。這是active的補充，不另排獨立任務。
- 授權：讀相關平台、重現與修復確認的程式／設定問題；不擅自放寬同意政策、全面停用安全防護、購買方案或變更廣告／商店事實。設計師bypass目前仍只有建議，不混入這輪。
- 基準：main／origin/main4522af7；既有未提交PLAN／handoff／診斷QA為本session工作，保留。fetch成功，其他worktrees不修改。
- 完成條件：建立追蹤載入／同意／首次歸因／SPA／GEO／checkout證據矩陣；重現的bug加必要回歸驗證並修復；Node24 check與相關測試、Ego雙語桌機手機與失敗／拒絕／撤回／導頁路徑驗證；清楚區分歷史無法回補、缺TikTok數據與發布狀態。

## Steps

| 狀態 | 動作 | 可觀察驗證 |
| --- | --- | --- |
| in_progress | 讀現行契約與來源、比對實際GA／Vercel／Cloudflare設定 | 對應檔案、平台設定、可重現條件 |
| pending | 重現同意前後／SPA導航／UTM與click ID／debug／checkout／GEO邊界 | failing測試或瀏覽器network證據 |
| pending | 最小修復確認的問題 | 原失敗案例轉通過、無私資與同意退化 |
| pending | 完整必要驗證、交接與交付 | check、相關tests、Ego實際路徑及清楚發布狀態 |

## FIFO queue

無。原診斷任務先寄送並交付，再處理本方案諮詢，順序保留。

## Completed preceding tasks

- Git已同步指定origin https://github.com/tentenco/charmvilla_shopify_official.git。GEO與ChatGPT Pixel應用d00b871、QA文件4522af7已push；最新已確認正式部署dpl_Agg3E7Ai7Uu81Ft5zm2VhDHhvQse READY，應用同d00b871。原完整驗收dpl_HHRuxAKfu1bbrpwjH8PGkDfPEqrn亦READY；www／apex aliases已核對。其他工作樹未修改。
- Node24 check0 errors／7既有warnings、27路由／Pixel／GA4測試與本機雙語1440／390／鍵盤／reduced-motion通過。真實TW十項HTTP與瀏覽器轉址、Globalping US/privacy200通過。Pixel已部署artifact的SDK／設定200、event202，撤回有效；AdsManager只有Tenten，CHARM VILLA Event Stream／campaign未核對。詳[GEO](../geo-redirect.md)與[Pixel](../analytics/chatgpt-pixel.md)。
- 上線通知已寄Aaron並Cc Kuan，Gmail1a17bd1244dfe8df讀回SENT；不得重寄。
- Aaron診斷英文兩頁PDF已寄，Gmail1a17be4b849a7143，讀回SENT／收件人／PDF附件6860bytes正確，沒有新增Cc；不得重寄。PDF文字與兩頁render已檢查。[診斷QA](../qa/2026-10-27-tiktok-ga4-diagnosis/README.md)。

## Diagnosis findings and limits

- Aaron補充Landing page views、Oct23–26、/collections/tea。GA4／Shopify現況America/Los_Angeles；GA快照55 sessions／35 active users、TikTok2 sessions／0 engaged／7 events、該landing8 sessions／7 active users。Oct26約22:40仍在進行，近期彙總可更新。
- GA同意前完全不載入，舊production與目前相同；沒有歷史同意率，不能量化其對約1000LPV差異的貢獻，更不能推算拒絕率。來源遺失也不足以單獨解釋55 total與1000LPV。
- Cloudflare apex／www DNS only。Vercel Web Analytics未啟用，custom aggregate／一日以上UI受Plus限制；50筆runtime logs僅Oct27 UTC約8分鐘。近期DDoS denied／challenged未與TikTok對上；未改防火牆或買方案。
- Shopify6 human sessions為Headless checkout landing（account.charmvilla.us5、shop.app1），不是主站流量。MCP app無read_reports；用既有Admin UI查未儲存報表，不擴權。沒有保存checkout token URLs。
- GEO在Oct27臺北發布，與Oct26 Pacific晚間重疊；不能解釋較早天數，最後一天需用實際時間戳分段。
- 完整差異原因尚未量化。已向Aaron請求TikTok daily/hourly export、時區、完整目的URL／UTM、campaign/ad與country/device/placement；收到後可繼續對齊。報告交付完成不代表已證實單一完整原因。

## Attempts and verification

- Vercel query兩次scope400後依schema錯誤補正，最終402 Plus限制；未盲試或繞過。GA使用明確匹配的Bitwarden service Gmail2026登入與Authenticator通過；憑證保持captured pipe／memory。
- 診斷使用Ego space13，已finish，不可重開操作。Shopify查詢唯讀，report無Save。原始私人證據／PDF／Gmail回條在/tmp/charmvilla-tiktok-ga4-diagnosis-20261027/，不進Git。
- 本輪只改診斷QA、PLAN與handoff；按文件任務檢查diff／相對連結，未重跑已通過的應用build與測試。
- Agent Memory沒有可用保存工具；fifo-task-queue／active-task-preservation依本計畫保存。未使用子agent。

## Resume

本輪可交付設計師流程建議。只有使用者明確要求實作後，才讀Next.js16.3.8相關文件、更新路由測試並實作團隊例外；原go-live授權不自動擴張至本次新方案。收到TikTok原始export後才繼續量化報告，不重寄已寄出的兩封信。

- 前輪設計師建議已交付：團隊簽章短效cookie，Vercel alias可看畫面（實際200）；未實作。新自我修復任務獨立記錄，不把舊completed當現況。

- 自我修復進度：瀏覽器舊build已重現TikTok UTM在先導航／後同意時遺失；6個新回歸案例初跑5失敗、1通過（不等於5個獨立根因），最小修復後含新增跨分頁／過期案例共35 tests通過。Node24 check首次因新測試變數module命名被lint拒絕，改gaModule後check通過（7既有warnings）。新版真實Google SDK collect已看到cs=tiktok、cm=paid_social、cn=self-audit、ci=self-audit-23，實際頁面仍商品URL；這輪viewport1741非1440，尚未冒稱完成尺寸QA。Vercel dropdown CSS選擇失敗後evaluate click未改選取狀態，改用已觀察searchbox鍵盤操作；不重試相同無效方式。

- 2026-10-27使用者提供Aaron回信截圖並授權讀信／附件與回信：截圖述Oct23–26 API 1072 destination clicks／934 LPV，3campaign；首頁舊活動86 LPV、目的URL無UTM；2個/collections/tea活動848 LPV有campaign tags；iPhone597、Android313、iPad24，全標US；desktop Chrome與真實Android Chrome同意後進DebugView，TikTok實際in-app未驗。以email原文／附件核對後採用，尚未下載附件或回新信。

- Aaron附件已實際下載（Gmail1a17c041449b1d97，原report thread），7 CSV／120 campaign-hour獨立加總與country/device/day完全相符、無重複campaign-hour。已核對固定UTC-5換算與NY UTC-4敏感度，兩者所有非零LPV小時均在GA Oct23–26內；最後非零hour為Oct25 12:00 Pacific（固定-5假設）。首個GEO deployment READY為2026-10-27T05:19:09.356Z，遠晚於該批流量。原始廣告IDs／花費／完整匯出僅/tmp私有。
- 新附件URL含tt_campaignid，與ttclid一併補入GEO allowlist並回歸；不加入未知Pixel ID、不改TikTok campaign。近期GA重查仍55 sessions／tiktok paid_social2；目前tagged網址沒有analytics_debug。
- 發布判斷：使用者先前明確go live，本輪又明確要求同一已上線追蹤問題自我修復；延續既有Production授權，僅發布本輪已驗證的追蹤修復。不含設計師bypass、同意政策、DNS／Cloudflare橘雲、防火牆放寬或付費方案。完整報告與Aaron回信需在正式驗收後給出實際狀態。

# Active Agent Plan

Status: `completed`
Updated: 2026-10-27

## Delivered task

全面自我檢查／修復追蹤與歸因，依Aaron郵件原始TikTok匯出補充診斷並英文回信。沿用先前go-live及同一追蹤問題修復授權，確認的修復已正式上線；沒有實作設計師bypass、放寬同意／防護或改廣告與商店設定。

## FIFO queue

無。設計師流程建議前輪已交付，仍未要求實作。Aaron附件為本輪診斷補充，不另排獨立任務。

## Completed steps

| 狀態 | 動作 | 可觀察驗證 |
| --- | --- | --- |
| completed | 核對平台、附件與時間窗 | 七CSV／120 campaign-hour與daily／country／device對帳相符；固定-5／NY-4所有非零LPV均在GA期間，早於GEO部署 |
| completed | 重現並最小修復 | 導航後同意UTM、SDK失敗重試、重新同意去重／跨分頁撤回、URL路徑遮蔽；GEO保留ttclid／tt_campaignid |
| completed | 本機必要驗證 | Node24 check（7既有warnings）、35相關tests、真實Google SDK、英中1440／390／鍵盤／reduced-motion、真實cart CRUD且清空 |
| completed | 已授權正式發布與驗收 | 應用6021eb4已push；dpl_EyaoMSE7qWsH7tkohrTS5kuXVcyV READY、www／apex aliases一致；TW302保留IDs、API／robots200；Production唯一URL SDK204且campaign正確、撤回／重新同意通過 |
| completed | 原信串英文回覆 | Gmail讀回SENT、原thread／Aaron收件人／全文一致；未重寄舊通知或舊報告 |

## Evidence

- [修復與正式驗收](../qa/2026-10-27-analytics-self-repair/README.md)。應用版本6021eb4；後續只補驗收文件，不重跑已通過的應用check。
- Aaron原附件／對帳與回信回條僅在私有 `/tmp/charmvilla-analytics-self-repair-20261027/`；原報告與兩封既有寄信回條在 `/tmp/charmvilla-tiktok-ga4-diagnosis-20261027/`。不得重寄。
- 文件diff檢查通過；本輪新增連結皆存在。全檔63個相對連結中，handoff既有preorder-setup歷史連結缺檔，與HEAD相同，未修改無關歷史證據。
- 開始已fetch成功、origin為指定charmvilla_shopify_official；其他worktrees未修改。沒有子agent；Agent Memory無可用工具，本檔保存fifo-task-queue／active-task-preservation。

## Limits and next safe action

- 完整歷史差異尚未量化，不能斷言單一原因、同意拒絕率或機器人比例；已修復問題無法回補過去流量。GA彙總與SDK HTTP204是不同證據。
- Cloudflare apex／www DNS only，Vercel處理HTTP安全；可用歷史查詢受方案／保留限制，現有掃描樣本無法與TikTok活動join。未停用防護、擴權或購買方案。
- 已請Aaron補UI實際時區offset、placement CSV／設定與美國iPhone／Android實際TikTok App旅程，優先最大LPV活動；收到後再對齊，不假稱一般Chrome等於App內測試。
- 新活動可依回信建議分開量測HTML到站、安全結果、同意涵蓋與GA收集；新增同意選擇統計需先檢視隱私設計，目前只是建議。
- 前兩項GEO／ChatGPT Pixel與上線通知早已交付；AdsManager CHARM VILLA Event Stream仍無權限未核對，不自行重開。無其他已授權待處理任務。

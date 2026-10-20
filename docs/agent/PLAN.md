# Design preview setup — 2026-10-20

Status: `completed`

## Active task
- 建立可分享的獨立官網測試站，供後續美術館建築線條視覺修改。
- 授權：建立、推送測試分支及部署獨立測試專案；不改正式 main、正式專案或 Shopify 資料。
- 基準：origin/main 4a241830b03312de521a7217e103ba7538dd1a7a，與正式部署一致。
- 工作樹：/Users/kuan/Documents/Codex/charmvilla-design-preview；分支 design/museum-preview。
- 原工作樹既有文件與圖片 WIP 全部保留。
- 完成條件：固定匿名可訪問 URL；雙語桌手機可瀏覽；本機商品展示、禁止交易／會員／訂閱寫入；noindex；正式部署 ID 不變。
- 本次建立基礎測試站，不實作尚未定稿的美術館視覺。

## Steps and evidence
1. completed：核對正式 Git／Vercel 與建立隔離 worktree。
2. completed：設計預覽開關、審稿提示、隔離交易。
3. completed：Node 24 check、測試站部署、瀏覽器與正式部署對照。

## Verification and delivery
- Node 24 `npm run check` 通過，0 errors / 7 既有 warnings；沒有修改 dependencies。
- 應用提交 e1b2a2f 已推送 design/museum-preview。初次 push 因 active GitHub lumifamily1613-cell 無權限失敗；改用既有 kuanyu16 的 repo admin 憑證，只在該次子程序生效，全域帳號不變。
- 獨立 Vercel charmvilla-design-preview：dpl_m1rfUkTetav9Sho2ddkesXV9ERWF，READY，固定匿名 URL https://charmvilla-design-preview.vercel.app/ 。沒有 Git 自動部署連結；後續用文件中的明確 CLI 命令更新。
- HTTP：雙語首頁／分類／商品、產品 API 200；會員頁同站 307；交易／帳號／訂閱 API 403；noindex header 通過。
- Ego 33：雙語首頁 1440×900 / 390×844 無溢出／runtime errors／GA tracking；桌手機截圖已檢視；reduced-motion=true 通過。商品頁路由與標題確認；商品首屏截圖拍攝時主圖尚未出現，不當作完整商品影像驗收。
- 電子報錯誤流程顯示「此為設計測試站，不會送出訂閱資料。」；未送資料到 Shopify。空購物車可開啟；未驗證付款／真實訂單，測試站不提供此功能。
- 正式部署仍 dpl_HZVUjqj8nUtUt6LbNKDzdD47h6sf，遠端 main 仍 4a241830b03312de521a7217e103ba7538dd1a7a。
- QA 全在 docs/qa/2026-10-20-design-preview。美術館新視覺未實作。

## FIFO queue
無。

## Resume
測試站已建立；後續改版從此 worktree / design/museum-preview 接續。未授權正式上線，不推 main。

## Previous plan (preserved)

# Active Agent Plan

Status: `completed`
Updated: 2026-10-16

## Active task

- 使用者已明確要求「直接發佈」並「更新Github」：發布三款主打排序至www.charmvilla.com，推送指定tentenco/charmvilla_shopify_official的main。
- 範圍：已驗證的merchandising.ts、FeaturedProducts及collection page；同步500額度的操作文件與交接。IG三張仍僅試稿，不套用官網，不發布社群；其他WIP不帶入。
- Git fetch成功，main/origin/main db67cc7；正式目前dpl_EEZJDoT2vMfFeYMEAPqLcMwRNVoY，來源亦db67cc7。其他worktree在本次三檔無重疊修改，index空。
- 既有check與13商品測試在本次來源修改後完成；來源之後未改，沿用結果。發布後驗證實際alias/來源SHA與中英文桌機1440、手機390的首頁/tea/all，圖片和排序、500額度、console/failed requests。
- 完成條件：main push成功，正確Git SHA部署READY，www正式受影響路由確認。無必要待問問題。

## Completed preceding IG task

已交付三款IG首稿，詳output/imagegen/ig-holiday-20261016/README.md；未替換官網。每張原生1122×1402，使用內建imagegen各一次，原圖與prompt保存。

## Completed preceding display task

- 使用者轉貼客戶要求：聖誕兩款置頂，連同15入團圓在網站更凸顯。
- 首頁推薦區前三位依序為聖誕12入、聖誕心意禮、團圓15入；茶禮盒與全部商品清單同步置頂，其他商品保持相對順序，其他分類不受影響。
- 只改展示排序與既有推薦區文案，沿用核准圖片和Shopify商品資料／價格／額度；不寫原商品、不新增圖片、不改購物流程。
- Git main/origin/main db67cc7，fetch成功；既有QA、圖片output及同事WIP保留。三個應用檔為本輪已驗證修改，使用者現已授權發布／push。
- 完成條件：中英文首頁／茶清單／全部清單前三位一致，連結與圖片正常，metadata及ItemList排序一致，桌1440／手機390與鍵盤／reduced-motion可用，check通過。

## Steps and evidence

| 狀態 | 動作 | 驗證 |
| --- | --- | --- |
| completed | 核對首頁／清單資料路徑 | FeaturedProducts現有6款、CollectionPage live順序，Shopify來源契約保持 |
| completed | 共用主打排序並調首頁前三位 | 單一slug清單，首頁6格維持、其他商品保留 |
| completed | 本機驗證 | check、13商品測試、Ego12例、鍵盤與動畫結束截圖 |
| completed | 交付本機預覽與文件 | 本機3246；500額度已線上 |
| completed | Git commit/push與正式部署 | 3578a0e已push；Git部署ns4YKpbQ1NYmMVFjzKpdb1nq9FSG READY／www alias一致 |
| completed | 正式URL驗證 | Ego65正式12例通過、4張截圖已看、無runtime／非取消failed request；API兩款500 |

## FIFO queue

無。行事曆需求已排除。

## Completed preceding task

- 聖誕預購兩款各500已完成並回報：12入500盒；2入經使用者確認500組＝1500小盒。兩款各增300；原商品現貨／售價不變。
- 2入CAS及metafield receipts成功、四商品回讀；正式API兩款preOrderRemaining500，中文頁「預購・剩餘 500 組」、3盒一組及US$60確認。
- QA：docs/qa/2026-10-16-christmas-capacity-500。無程式變更或部署需求，不可再增300。未付款／下單；首單扣量仍待驗證。

## Attempts and decisions

- 首頁截圖首次卡在preloader／newsletter，關閉電子報後body overflow仍為hidden，第二次等待也逾時；停止等待同一路徑，改重新載入（已正常關閉電子報）後用實際hover導覽至推薦卡。未改瀏覽器storage或網站程式；DOM排序矩陣已通過，已補動畫結束截圖並檢視。

- 提升展示順位，使用同一slug清單，避免首頁與分類不同步，不更改Shopify商品事實。

## Resume

本次發布已完成：應用3578a0e已push，正式www的Git部署及12例瀏覽器通過，見docs/qa/2026-10-16-promoted-gifts/production-release.json。最後文件提交只記錄驗收，應用檔不再改。Ego65保留正式首頁；本機3246與其他WIP保留。IG首稿未發布，兩款500額度已生效不可再增加，真實付款首單扣量未測。FIFO無。

# 2026-10-20 商品購物介面對齊
Status: completed

## Active task
- 使用者指出設計測試站 snowflake-gift-box 購物介面與正式站不一致。
- 只修 design/museum-preview，保持正式站與 Shopify 資料不變；完成後更新既有測試網址。
- Git clean，origin/main 4a24183；目前分支66842f9，fetch成功。
- 完成條件：雙語三盒混搭、價格/預購/選項與正式展示一致；Shopify購物車增減移除正常，保留原結帳流程但不測付款；1440/390瀏覽器與check通過。

## Steps and evidence
- completed: Ego38確認正式站三盒混搭/剩餘500組；測試站單一選單/售罄。原因為舊快照缺少preorderBatch。
- 使用者最新指示：直接複製正式站，只做前台設計，不更改購物車功能。
- completed: 撤回快照方案，commerce/catalog/proxy/newsletter檔逐一回到origin/main；測試專案使用正式Shopify設定，只有設計標示與分析隔離。
- completed: commerce檔與origin/main零diff；八項正式同商店設定已配置到獨立專案。
- completed: check/13商品測試/本機與線上Shopify cart CRUD/雙語1440與390瀏覽器通過；QA在docs/qa/2026-10-20-shopping-alignment。

## FIFO queue
無。

## Resume
工作樹 /Users/kuan/Documents/Codex/charmvilla-design-preview；Ego38 p1測試站/p2正式站，只讀正式頁。

## Attempts and decisions
- Vercel正式Secret無法pull，僅回傳佔位符；未部署佔位設定，已以本機已驗證商店連線覆寫八項設定，後續用即時API確認。憑證檔忽略且0600，不輸出。

## Delivery
應用4e2a94d已push，最終獨立測試站 dpl_4oM21PZ8ZMvsP3ZAUeY8dVPUSzp9 READY。正式站部署未變。測試cart全清空，未付款。

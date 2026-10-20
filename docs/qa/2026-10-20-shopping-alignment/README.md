# 2026-10-20 設計測試站購物功能對齊

## 結果

- 使用者最終指示：正式站副本，只做前台設計，不改購物車。正式基準 origin/main 4a24183；應用提交 97684d7，提示標示調整最終4e2a94d。
- 所有購物車、商品選項、catalog、資料、Shopify、API、proxy檔與origin/main完全相同（commerce-diff.txt為空）。
- 最初local模式缺少preorderBatch，出現單一選單與錯誤售罄。曾唯讀擷取快照供定位，但已依最新指示撤回，不在最終程式內。
- 獨立測試專案使用同一Shopify，保留原會員/購物車/hosted checkout。未付款、未下單、未訂閱、未修改商店商品/庫存。非Shopify sandbox，實際付款會建立正式訂單。

## 驗證

- Node24 npm run check：通過，7項既有lint warnings、無errors。13項catalog測試通過。
- 本機與線上shopify:verify：14款商品、CMS、cart create/read/update/remove、正確checkout host、會員307、非法空cart400，測試cart清空。
- Ego38本機及線上雙語1440/390：三個茶款選單、US$60、預購剩餘500組；無水平溢出。手機reduced motion，記錄runtime exception為0。
- 本機三種茶混搭：未選滿按鈕停用；鍵盤加入成功、1組60/2組120/減回60/移除成功。
- 線上英文瀏覽器重複茶款（Rose Oolong×2/Ruby×1）可加購；增減/移除成功；checkoutHost為account.charmvilla.us，未進行付款。關閉既有newsletter popup後操作（沒有更改該功能）。
- 聖誕12入顯示茶款與盒蓋兩選單/US$120，團圓盒色一選單/US$170。
- 正式站部署前後同為dpl_HZVUjqj8nUtUt6LbNKDzdD47h6sf，未部署正式站。
- desktop/mobile截圖已檢視。後續提示標示移到header內，購物車開啟時隱藏；最終位置另見final-header截圖。

## 範圍

僅代表性路徑；沒有真實手機或全站每頁驗收。Ego自動捲動商品按鈕失敗後改鍵盤聚焦Enter完成；newsletter遮住點擊時按實際關閉按鈕後繼續。沒有修改購物功能來繞過測試。

最新部署資料見deploy-url.txt及deployment.log；穩定網址 https://charmvilla-design-preview.vercel.app/zh/products/snowflake-gift-box 。

- 最終商品頁文字、3個選單/值/價格/按鈕與正式站直接比對相同（final-compare.json），HTTP200/noindex。最終header提示top48，已看final-header-zh-390.png；中文390購物車另有live-cart-mobile.json/截圖，加入後移除。

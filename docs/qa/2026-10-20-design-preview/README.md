# 2026-10-20 官網獨立設計測試站

網址：https://charmvilla-design-preview.vercel.app/zh

部署與資料隔離說明見 [DESIGN_PREVIEW.md](../../DESIGN_PREVIEW.md)。

- `check.log`：Node 24 lint、typecheck、build 通過；7 既有 lint warnings。
- `live-http.json` / `live-routes.json`：匿名存取、noindex、交易封鎖、會員導回首頁、代表頁面 HTTP。
- `live-browser.json`：雙語首頁 1440 / 390 瀏覽器、錯誤與追蹤檢查。
- `live-interactions.json`：測試訂閱回應，不寫 Shopify。
- `reduced-motion.json`：手機 reduced-motion。
- `deployment.json` / `project-verified.json`：獨立部署與僅 CV_DESIGN_PREVIEW 環境變數；無正式憑證。
- `production-before.json` / `production-after.log`：正式部署未改。
- `en-1440.png` / `zh-390.png` 等：已看首頁截圖。
- `product-en-1440.png` 是導航後尚未等待主圖顯示的截圖，不作完整商品影像驗收。商品標題及路由通過，不宣稱完成所有商品圖／真實手機／結帳驗收。

修正驗證腳本：Vercel 將 Location 回傳相對路徑，先 urljoin 再比較；Ego CDP viewport 僅該輪生效，各輪需重設並回讀尺寸。

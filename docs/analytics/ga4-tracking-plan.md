# CHARM VILLA GA4 電商追蹤

## 2026-10-27 ChatGPT 廣告量測（本機完成，未發布）

GA4 與 ChatGPT Pixel 使用分開同意，原有分析同意不視為廣告同意。Cookie banner 新增「允許分析與廣告」，GA4 廣告同意與 Shopify marketing 仍維持 denied／false。ChatGPT 只新增同意後的 `page_viewed`，不修改既有 GA4 checkout pixel 或購買事件；[實作、同意與驗證](chatgpt-pixel.md)。以下 10 月 15 日內容保留作既有 GA4 契約。

2026-10-15；正式網站 https://www.charmvilla.com/。

- GA4 property：559053952（CHARM VILLA | www.charmvilla.com），account 352026591。
- Web stream：16130398768，measurement ID **G-D3YCFQMZ2W**。
- 時區 America/Los_Angeles；幣別 USD；事件／使用者保留 14 個月。
- `purchase` 為重要事件，每個事件計算一次，採事件實際金額。
- GA4 跨網域：charmvilla.com、account.charmvilla.us、zcs0bg-10.myshopify.com、shop.app。
- Search Console 已連結既有 verified property `https://www.charmvilla.com/`。
- Developer QA 篩選器有效，排除帶 debug_mode／debug_event 的測試流量；不猜測內部 IP。未設定固定 IP 排除。
- Enhanced measurement 關閉，由程式發送 SPA page_view，避免重複 page_view 與表單內容蒐集。Google Signals／個人化廣告在程式停用；廣告同意維持 denied。

## 事件契約

| GA4 事件 | 觸發與負責端 |
| --- | --- |
| page_view | Next.js 路由變更；同意後目前頁面一次 |
| view_item_list | 清單商品至少 30% 進入視窗；每個頁面每張卡一次 |
| select_item | 點選清單商品連結 |
| view_item | 商品頁與不同選中 variant |
| add_to_cart | Shopify 成功回應的實際增加數量（含增量按鈕） |
| remove_from_cart | Shopify 成功回應的實際減少數量（含移除） |
| view_cart | 開啟非空且已載入的購物車 |
| begin_checkout | Shopify `checkout_started`，前台點擊不重複發送 |
| add_shipping_info | Shopify `checkout_shipping_info_submitted` |
| add_payment_info | Shopify `payment_info_submitted` |
| purchase | Shopify `checkout_completed`，必須有真實 order ID |

商品 item_id 始終為 Shopify numeric variant ID。傳送名稱、variant、數量、實際折後商品金額與幣別；purchase 的 value 不含稅／運費，tax、shipping 分欄，transaction_id 為 Shopify order ID。以 transaction_id 與 browser storage 防止感謝頁重複計算。不送 email、地址、電話、付款資料、cart key 或 checkout URL token。

2026-10-15 預購批次：view_item 的 item_id 轉為實際預購 SKU，與原生 checkout 一致；不同茶／盒蓋以 selling plan 區分，購物車增減以 line ID 比對，避免相同SKU互相覆蓋。Shopify回傳quantity 0的行不送事件。未修改既有checkout pixel與同意規則。

## 同意與歸因

首次造訪顯示雙語 Cookie banner；同意前完全不載入 gtag。選「僅必要功能」仍可購物。頁尾 Cookie 設定可撤回；只刪除 GA cookies，保留購物車。

正式站透過 Shopify Customer Privacy API 同步 analytics 同意；marketing、preferences、sale_of_data 均 false。前往結帳前，`/api/cart/analytics` 寫入私有 cart attributes：`cv_analytics__`、`cv_ga_client_id__`、`cv_ga_session_id__`、`cv_ga_debug__`。這些欄位已在真實 Shopify checkout pixel 讀到，前後端共用 GA client/session。拒絕同意時清空 analytics IDs。

Shopify custom pixel **217153900**（CHARM VILLA GA4 Checkout）已 connected，Required permission 僅 Analytics、非資料販售。來源為 `scripts/analytics/shopify-checkout-pixel.js`。Custom Pixel 的隱私 API 必須使用 `api.customerPrivacy`，不是 app pixel 的裸 `customerPrivacy`。

首頁／商品 canonical 與 GA URL 會移除非必要 query；保留標準 UTM/gclid。網站返回時以 `ignore_referrer` 排除自家 checkout、Shop Pay 和 PayPal，避免覆蓋取得來源。跨網域及 cart attributes 保留同一購物流程。

## 報表與操作

GA4「報表 → 提升銷售量」已有「電子商務購買、購物歷程、結帳流程、交易」；Search Console 報表也可查看查詢／Google 自然搜尋流量。

- 商品轉換：購物歷程的 view_item → add_to_cart → begin_checkout → purchase。
- 結帳完成率：結帳流程的 begin_checkout → add_shipping_info → add_payment_info → purchase。Shop Pay／快速付款可能略過部分配送或付款步驟，解讀漏斗時應分開看。
- 訂單／收益：交易與電子商務購買報表。
- 網站轉換率：工作階段重要事件比率，重要事件選 purchase；分母為可量測的 GA 工作階段，並非 Shopify 全部訂單／訪客。
- `?analytics_debug=1` 開啟本分頁 DebugView；只在 QA 使用。Vercel 預覽預設不追蹤，明確 debug 才啟用。測試完刪除 sessionStorage `cv-analytics-debug` 並移除 query。

## 驗證及界線

已在正式站測到同意前／撤回後不載入 GA、Shopify analytics 同意、瀏覽／加購／增減／移除，以及 checkout 的 begin_checkout payload。GA DebugView 已實際收到 page_view、view_item、view_item_list、add_to_cart、remove_from_cart、view_cart 與 begin_checkout；select_item 的真實點選 payload 也已驗證。正式彙總報表仍有處理延遲。

沒有付款或製造假 purchase。購買金額、交易去重、無 order 不送、同意雙重檢查與 checkout stages 以離線 fixture 測試驗證。第一次真實付款後應以 Shopify order ID 對照 GA4 transaction_id。瀏覽器追蹤仍受使用者同意、阻擋器和關閉頁面影響，Shopify 訂單是財務依據。退款／取消訂單的伺服器端同步未包含在此瀏覽器 pixel，不能把 GA4 收益當成退款後淨營收。

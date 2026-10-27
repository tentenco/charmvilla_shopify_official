# 分析追蹤自我檢查與修復

2026-10-27；應用修復已完成本機驗證並正式發布、完成線上驗收及Aaron英文回信。原始TikTok附件、商業數字、廣告ID與私人郵件不進Git。

## 已重現與修復

- 先以TikTok UTM進茶禮頁、導航到商品頁、再允許分析，舊版config沒有原campaign。[修復前](before-delayed-consent.json)／[修復後](after-delayed-consent.json)。現在僅在分頁記憶體暫存UTM 30分鐘，未同意不寫campaign storage、不載入或傳送GA；拒絕會清除，換活動整組取代。當下page_location仍是真實商品頁。保留utm_id並使用Google正式campaign欄位。
- Google SDK初次載入失敗，舊版initialized會阻止後續重試。現在失敗移除script，下次已同意的追蹤動作重試，保持單一初始化與原隊列。[真實SDK故障／恢復](sdk-retry.json)：未載入→成功載入、config始終1次、兩次頁面瀏覽，collect204、runtime exception0。這是模擬暫時載入失敗，不是證明TikTok當時有阻擋器。
- 撤回後在同頁重新允許，舊版page／商品／購物車／清單去重狀態會漏掉新同意期間的瀏覽。現在撤回重設相關去重狀態；跨分頁storage同意變化也同步GA opt-out／Consent Mode。storage受阻時僅遵循當前分頁的明確選擇，不自動允許。[瀏覽器同意驗證](consent.json)：page_view與view_item各1→2，拒絕時ga-disable=true且GA cookies清除，另一分頁拒絕同步生效。
- URL清理補上account／checkout路徑token遮蔽與非HTTP(S)阻擋；僅保留允許的活動參數，不新增個資蒐集。
- GEO少了TikTok ttclid及附件實際使用的tt_campaignid，已加入既有allowlist；其他路由／國別／方法與排除規則不改。此新修復只影響未來轉址歸因，不能用來解釋早於GEO部署的流量。

## 驗證

- Node24 check：lint0 errors／7既有warnings、typecheck、production build通過；35項routing／GA storefront／checkout／ChatGPT單元驗證通過。最初新fixture命名module被lint拒絕，改為gaModule後通過；未放寬lint。
- 真實Google SDK：延後同意仍送cs=tiktok／cm=paid_social／cn與ci，當下頁面保持正確；[SPA頁面](sdk-spa.json)只有一筆page_view/news，Google collect204、debug=true。沒有把204當成全部正式彙總已處理。
- 真實Shopify cart新增／讀取／改量／清空、HTTPS checkout host、hosted account redirect、非法cart400通過；未下單或付款。已核對遠端checkout pixel仍為既有G-D3YCFQMZ2W、Required Analytics／非資料販售；未寫Shopify pixel或商店資料。
- [尺寸／鍵盤／reduced-motion](responsive.json)：英／中390×844、桌機1440×900，無水平溢出，Cookie按鈕與鍵盤順序正常，拒絕時沒有GA script。四張截圖已實看：[英桌](en-desktop.png)、[英手機](en-mobile.png)、[中桌](zh-desktop.png)、[中手機](zh-mobile.png)。

## 平台與歷史限制

- Cloudflare正式apex／www重新核對為DNS only、同一Vercel CNAME；未開橘雲或改DNS。HTTP安全層由Vercel執行。近期system DDoS明確含/.env、/.env.local、WordPress等掃描路徑，不是TikTok活動的證據；未停用防護或加白名單。
- GA4串流與ID相符，Enhanced Measurement現況false，避免與手動SPA page_view重複。Developer QA排除維持，正式廣告URL不可加analytics_debug。
- Vercel歷史查詢超過一日／custom aggregate受方案限制；目前安全樣本不能連回較早TikTok投放。API供應商的國別／裝置彙總也不能當成獨立真人驗證。
- 已核對Aaron的CSV附件與來源限制，兩種可能時區的所有非零投放小時都位於GA查詢日期範圍內。新GEO首個部署READY時間見[first-geo-deployment.json](first-geo-deployment.json)，晚於附件所有已記錄LPV小時；不能以它解釋該批流量。
- 修復的歷史影響量仍無法回推；拒絕率／機器人比例／TikTok實際App內iPhone與Android測試／placement仍待直接證據。手機Chromium視窗不等於真實TikTok App內瀏覽器。

## 正式發布與回信

- 應用提交 `6021eb4a1940ae5fe0b0ec49006ccb7ae0e974a1` 已推送指定GitHub main；[Production部署](production-deployment.json) `dpl_EyaoMSE7qWsH7tkohrTS5kuXVcyV` READY，2026-10-27T06:40:08.028Z，www／apex aliases一致。最終CLI inspect亦回讀READY與同一組aliases。
- [臺灣正式HTTP](production-taiwan-http.json)：tea頁302、private no-store，UTM／ttclid／tt_campaignid保留；API／robots200且沒有Location。這是臺灣實際出口，未偽造國別header。
- [正式artifact真實SDK](production-sdk.json)：先帶TikTok UTM進站、導航至商品後同意，送出正確campaign欄位／當下商品URL，collect204、page_view1、runtime exception0；只有分析同意，沒有廣告SDK。臺灣正式hostname會轉走，因此此項使用同一Production唯一URL及QA debug，非美國正式hostname的實際App測試。
- [正式重新同意](production-reconsent.json)：page_view與view_item各1→2，清單事件重發、撤回ga-disable有效。完整本機SDK失敗恢復、跨分頁、雙語尺寸與cart檢查見上節，未把本機結果冒稱正式站重測。
- 已依最新附件完成英文補充診斷並回覆Aaron原信串；Gmail讀回SENT、原thread／收件人／全文完全相符。未重寄前兩封郵件。私人原始附件、報告本文與寄信回條保留私有/tmp，不進Git。
- 完整歷史差異仍不能量化；已請Aaron提供UI實際UTC offset、placement匯出與真實TikTok iPhone／Android旅程，優先最大LPV活動。沒有把測試故障當成歷史事故、沒有斷言同意率或機器人比例，沒有擅自新增同意量測。

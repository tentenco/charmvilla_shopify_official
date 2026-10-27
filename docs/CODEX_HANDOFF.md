# CHARM VILLA 開發交接

## 2026-10-27 分析追蹤自我修復與Aaron附件回信（已完成）

- 使用者明確要求自我檢查與修復，並提供Aaron的TikTok匯出、要求按新證據回信。修復了先導航後同意的UTM遺失、SDK初次載入失敗不可重試、跨分頁撤回／同頁再同意的去重狀態與storage受阻的明確選擇；URL遮蔽checkout/account路徑token，GEO保留ttclid與實際廣告使用的tt_campaignid。沒有實作設計師bypass。
- Node24 check與35相關測試通過；真實Google SDK已見活動欄位與204、暫時阻擋後恢復、同頁重同意與跨分頁撤回通過。英／中1440及390、鍵盤／reduced-motion驗證通過；Shopify獨立cart CRUD清空、checkout／account host驗證通過，未下單。詳[本輪QA](qa/2026-10-27-analytics-self-repair/README.md)。
- Aaron附件已下載至私有/tmp，7CSV／120campaign-hour對帳相符；固定-5與紐約-4兩假設所有非零LPV都落GA查詢期間內，且早於新GEO規則部署。不可把完整歷史差異斷言為同意或機器人。實際TikTok in-app／placement／完整歷史WAF join仍缺。
- 應用6021eb4已push main，Production dpl_EyaoMSE7qWsH7tkohrTS5kuXVcyV READY、www／apex aliases一致。臺灣正式302保留TikTok IDs，API／robots200；同一Production唯一URL真實Google SDK collect204、延後同意campaign與重新同意去重驗收通過。臺灣出口使用唯一URL作SDK QA，不代表真實TikTok App測試。
- Aaron英文補充診斷已回原信串，Gmail讀回SENT／收件人／全文一致；前兩封通知／報告不得重寄。已提供placement匯出欄位與App內測試步驟；完整歷史差異未量化，等待實際UTC offset、placement與TikTok iPhone／Android證據。沿用既有go-live授權，只發布已確認修復；不改同意政策、GA filters、DNS、防火牆或廣告設定。

## 2026-10-27 TikTok／GA4 診斷報告已寄

- Aaron確認指標為Landing page views、Oct23–26、/collections/tea。GA4 Pacific快照55 sessions／35 active users，TikTok2 sessions、該landing8 sessions；明確同意前不載入GA。沒有原始TikTok export／帳戶時區／完整URL與歷史同意率，無法量化完整差異。
- Cloudflare DNS only；Vercel一日以上／custom query受Plus限制，且最近一日system DDoS有denied/challenged，未與TikTok對上。Shopify6 sessions全為Headless checkout landing，非主站流量。GEO與Oct26 Pacific晚間重疊，不能用它解釋較早天數。
- 兩頁英文PDF已寄Aaron，Gmail 1a17be4b849a7143／SENT與附件已讀回，未新增Cc；勿重寄。已向Aaron索取最後核對資料，未更動追蹤政策／防火牆／商店。詳[診斷QA](qa/2026-10-27-tiktok-ga4-diagnosis/README.md)。
- 新需求為設計師在臺灣看美國站的最佳流程建議（VPN／套件／GEO bypass）；目前僅諮詢授權，尚未實作或發布新例外。現況src/proxy.ts無cookie／query bypass，正式Vercel alias hostname不套用GEO。當次PLAN保存建議與範圍。

## 2026-10-27 臺灣 GEO redirect 與 ChatGPT Pixel（已正式發布）

- 使用者「go live」明確授權。應用提交 `d00b871` 已push至指定GitHub main；Vercel `dpl_HHRuxAKfu1bbrpwjH8PGkDfPEqrn` Production READY，來源SHA、www／apex aliases與既有project一致。後續僅補驗收文件，不更改應用程式。
- Cloudflare apex／www為DNS only、直連Vercel；未改DNS。臺灣實際出口的首頁／商品等六頁302 no-store至臺灣站、四項API／靜態／robots／sitemap排除200；Ego商品頁實際到臺灣站。US Buffalo正式/privacy200且沒有Location。[GEO規格與證據](geo-redirect.md)。
- 指定Pixel `JrvXcurpdqPxLqn524L1dE`／page_viewed已部署，獨立marketing同意、GPC、撤回、去重及雙語隱私說明；GEO保留oppref。Pixel既有automatic advanced matching為true，未更動後台；程式事件opt_out，不新增購買或修改campaign。[Pixel規格與證據](analytics/chatgpt-pixel.md)。
- Node24 check（7既有warnings）、27項測試、本機雙語1440／390／鍵盤／reduced-motion已通過。因臺灣出口會從正式主機轉走，部署後SDK瀏覽器驗證使用相同Production的唯一URL與明確debug：未選／僅分析不載入，SDK／設定200、event202；不是已登入CHARM VILLA Ads Event Stream的證據。
- 既有AdsManager session只有dev@tenten.co／Tenten，無CHARM VILLA權限，Event Stream及campaign連結未確認。未冒稱已收到後台事件。
- 上線英文通知已由erik@tenten.co寄給Aaron並Cc Kuan，Gmail讀回SENT；不要因接手重寄。使用者另要求診斷前兩天TikTok約1000點擊、GA2位的差異及report email，已依FIFO成為目前任務，見[PLAN](agent/PLAN.md)。新GEO的上線時間不得拿來解釋歷史差異。

## 2026-10-16 IG 三款攝影首稿（僅交付試稿）

- 內建imagegen三次各一張；聖誕12入橘盒、聖誕心意禮三盒組、團圓香檳金。沿用官網淺暖灰底，加少量松枝／緞帶和冬日光影，無額外廣告文字。
- 三張原生1122×1402 PNG，全圖及原尺寸已檢視；來源、完整提示詞、hash及驗收限制見 `output/imagegen/ig-holiday-20261016/README.md`。心意禮三盒與金色封口確認，但生成對細部圖案及金魚輪廓有局部重繪，屬氛圍首稿，尚未核准替換商品圖。
- 未發布IG、未替換官網、未push/deploy。主打排序已依後續指示正式發布；500盒／500組額度已生效，不可重複增加。

## 2026-10-16 三款主打展示（已正式發布）

- 首頁推薦前三位與tea/all清單同步：聖誕12入、聖誕心意禮、團圓15入。共用merchandising.ts；metadata及ItemList同步，Shopify資料與核准圖不變。
- check與13商品測試通過；本機及正式Ego雙語1440/390十二例排序／圖片／無溢出通過，本機鍵盤亦通過，見[QA](qa/2026-10-16-promoted-gifts/README.md)。應用提交3578a0e已push，Git Production dpl_ns4YKpbQ1NYmMVFjzKpdb1nq9FSG READY，www alias與來源SHA一致；四張正式截圖已檢視。
- 使用者「直接發佈／並更新Github」授權本次。正式API仍為12入500盒／心意禮500組，本輪不寫Shopify、不下單付款；IG試稿不套用官網。

## 2026-10-16 聖誕預購額度調整（兩款已完成）

- 使用者轉貼客戶「12入跟2入預購調到各500」並要求改。12入batch 15425915552108於Hayward由200增300至500，custom.preorder_batch allocation.limit同步500；舊值比較及idempotency receipt成功，committed=0，正式API六選項均可售並共用剩餘500。
- 使用者確認2入為500組＝1500小盒後，batch 15425915519340的available200→500、allocation.limit200→500，committed0；CAS/idempotency成功。正式中文頁顯示「預購・剩餘 500 組」，仍3盒一組、US$60，正式API成功。原兩商品及已完成12入batch前後deep-equal。證據見[本輪QA](qa/2026-10-16-christmas-capacity-500/README.md)。
- 額度即時生效，無網站程式修改或部署；Git仍db67cc7，交接文件尚在本機。兩款均不可再增加300。未下單付款；下一項為聖誕兩款置頂及15入團圓主打呈現，行事曆需求已排除。

## 2026-10-16 核准圖庫與選單正式發布（已完成）

- 使用者已確認四張金色圖庫，明確授權Production及Push GitHub。Gold為新香檳米金三角度＋原15包開盒，Yellow保留原黃款，Red沿用已確認三張＋原開盒。
- 本批來源為先前19檔Preview加金色三張與映射、相關測試與文件；下方Preview-only敘述是歷史快照，發布結果以[本輪QA](qa/2026-10-16-reunion-release/README.md)為準。
- Node24 check、20 unit、41 API、24 E2E通過；Ego60雙語1440/390三色切換及已載入圖片、無溢出／錯誤通過，桌機／手機截圖已檢視；真實Shopify cart CRUD通過並清空，未下單付款。
- 本輪不寫Shopify原商品／價格／庫存、不重跑初始化。其他歷史QA與未核准生成圖仍在本機WIP；禁止git add全部。
- 應用提交39ade00已push；正式Git部署dpl_Gy2jpUGvbXKmnLZertfET963At8y READY，www／apex／demo2 aliases相同。正式48例圖片、原檔hash、商品API與真實mixed cart60/120／清空通過；未下單付款。後續僅交接文件提交。

## 2026-10-16 團圓金色布面四張圖庫（僅本機圖片交付）

- 最新實物色樣是淺香檳米金布面，與目前 Preview 金色選項仍用的亮黃主圖不同；使用者要求保留印刷與刺繡，只換布面底色。
- 使用者已確認金色主圖並要求完成其他角度；補正面俯拍及另一側斜角，各原生1122×1402。第4張沿用原15包開盒實拍，hash相同。全圖與200%局部已檢視，圖片及prompt見 `output/imagegen/reunion-champagne-gold-20261016/README.md`。
- 四張本機預覽為同目錄 `preview.html`；Ego58桌1440／手機390、點圖放大及Escape驗證通過，保留結果頁給使用者。
- 沒有改網站圖片引用／Shopify／部署或push；新角度尚未套用網站。主圖來源比對Ego57已finish。現有混搭與紅色圖庫 Preview 仍以以下 fwasds9u4 為準。

更新：2026-10-16。這是有日期的接手快照，不是新任務或發布授權。進行中任務與 FIFO queue 只看 [PLAN.md](agent/PLAN.md)，工作規則看 [AGENTS.md](../AGENTS.md)。

## 2026-10-16 聖誕心意禮三盒混搭 Preview

- 每盒各一個下拉，可重複或選3種茶；未選滿禁購。保留US$60／組，2組US$120；每盒2包／共6包，摘要及茶介紹同步。cart以原variant GID記錄盒數，server驗證總數與live購買資格，重建Teas供出貨；不讓client字串決定價格。
- 既有200組pool只加mixed plan `694183395692`，保留原5plans。原商品、現貨、價格及pool庫存回讀不變；不重跑初始化。實單扣量尚未測，測試cart全部清空；後台讀寫及本機／Preview證據見[QA](qa/2026-10-16-snowflake-mix/README.md)。
- [最新Preview](https://charmvilla-demo2-fwasds9u4-tentenco.vercel.app/zh/products/snowflake-gift-box) READY `dpl_6rEnnX34CAQfkuXJpZZFhnPi5jaA`，包含紅色團圓四張圖庫。check、20unit、41API、20E2E通過；摘要修正後相關6E2E重跑通過。Ego56雙語桌手機／真實Preview cart通過，紅色桌機淡入結束狀態補驗，截圖已檢視。
- 尚未commit/push或Production；www仍`dpl_2yVuVGM8gTmuq7bha97yzQZKunAL`。隔離stage `charmvilla-preview-snowflake-mix-20261016`＝5439c02＋source.json列的19檔，勿以所有WIP批次發布。root3240為本輪已測本機production build，Ego56留中文Preview。

## 2026-10-16 紅色團圓四張圖庫 Preview

- 已補正面、反向斜角兩張紅色圖；第4張無盒蓋，共用原15包實拍；保留第1張與全部金色圖。原生兩張1122×1402，同角度占比差小於0.1百分點。
- [新版Preview](https://charmvilla-demo2-ptpqhv4gs-tentenco.vercel.app/zh/products/reunion-paper-gift-box) READY dpl_BABWHhjQTi3LGUv4ePqoxSoKxq36；check與16例圖片切換通過，手機圖已檢視；桌機截圖在動畫中，後續混搭回歸補拍。詳見[QA](qa/2026-10-16-reunion-red-gallery/README.md)。未commit/push或正式部署。
- 使用者追加聖誕心意禮三盒可混搭，目前單選不符需求；紅色圖庫網址已交付，接續處理混搭，不能只加UI而讓Shopify紀錄／額度錯誤。

## 2026-10-16 團圓三色預購、下拉選單與紅色圖片（獨立 Preview）

- 使用者追加要求直接提供預覽網址；本輪以基準5439c02加指定8個檔案建立隔離CLI Preview：<https://charmvilla-demo2-om1gzlfpw-tentenco.vercel.app/zh/products/reunion-paper-gift-box>，deployment `dpl_9o3k2GMTURVhTh1j1Hd9FH7pgmt1` READY／target preview。`www.charmvilla.com`前後仍指向`dpl_2yVuVGM8gTmuq7bha97yzQZKunAL`，未改正式站、未commit/push。
- 紅色圖已以新檔名`studio-reunion-gift-box-red-angle-v1.png`接入紅色選項；保留金色4張及其他原圖。原生1122×1402，只有斜角一張，尚未正式核准HD資產。中英文1440/390、切換紅/金/空選項、手機reduced及圖片載入／無溢出通過；桌機、雙語手機截圖已檢視，無console/failed request。公開資產經瀏覽器下載SHA256與本機一致，直接Node fetch會遇到HTML保護頁。
- 本輪Node24 check通過（0 errors、9個既有/暫存腳本warnings），商品13測試通過；上一輪API39、E2E16結果保留，不宣稱重跑。來源清單／hash／部署及瀏覽器證據在[本批QA](qa/2026-10-16-reunion-options/README.md)。Ego53保留紅色預覽頁供使用者檢視；不再重跑後台plan腳本。

- 客戶已在原商品將團圓改為Gold／Yellow／Red；新增既有預購group的Yellow／Red plans，原Gold保留，三色共用原100盒額度。本輪未寫原商品、現貨、CMS或重設預購數量。三色真實cart、原商品與庫存深度回讀通過。
- 本機移除Gold only篩選、同步團圓來源snapshot/map，新增實際plan GIDs；各商品選項統一下拉式，茶／盒色為兩欄。Node24 check、19商品測試、39 API、16 E2E通過，Ego12組雙語桌手機DOM與鍵盤／reduced通過。手機截圖工具逾時，未聲稱圖片驗收；詳見[QA](qa/2026-10-16-reunion-options/README.md)。
- main/origin/main基準5439c02；本輪來源修改未commit/push，已依上段發布Preview。3147是先前本機production build預覽；Ego51已finish。舊QA／未核准資產WIP保留。
- 原中文材質仍有舊粉紅／藍色，依客戶原商品不用動保留。紅色圖來源`output/imagegen/reunion-red-20261016/reunion-red-angle-v2.png`，並排preview.html保留。主體寬61.85%／金色62.88%、高45.58%／金色44.96%，背景採樣最大差4/255；目前僅上方獨立Preview已引用，不是Production核准。禁止恢復舊粉紅／藍色選項或初始化預購。

## 2026-10-15 預購整合（已正式發布）

- 使用者已明確同意「現貨與預購分開、依表格設定上限、額滿停單」，已無數量定義等待。新的10款/29plans已建立並初始化100/20/20/100/10/10/10/10/200盒及200組，團圓Gold only。原商品/價格/實物庫存逐一回讀未變。
- native tracked SKU + PRE_ORDER plan（ON_SALE、100%全額、DENY）提供同款跨茶/盒蓋共用原子額度。前台映射見`shopify-preorders.json`，29選項真實cart及最後1單位的跨plan上限已驗證。
- Node24 check、19商品/批次測試、38 API、16 E2E、9 analytics與Ego12組雙語桌手機通過。實際付款與訂單扣量尚未測試；測試cart清空，不改原現貨讓測試過關。
- [後台操作](shopify/preorder-batch-2026-11.md)與[QA](qa/2026-10-15-preorder-batch/README.md)。原商品改價需同步plan PRICE；不同步會禁購；取消回補以Shopify restock為準，勿重設剩餘額度為原始上限。
- `4755c7c` 已推送指定GitHub；Production `dpl_8uFKZ7LhFs3nV6QShyA2W8PXgvBp` READY，來源SHA及www/apex/demo2 aliases一致。正式8組Ego雙語桌手機、10款額度API與真實cart CRUD／invalid input／hosted account redirect通過。未實際付款下單；首單仍須核對Available/Committed。後續文件提交不更動應用程式。
- 以下前階段「等待定義／無可行方案／Christmas未公開」已由本節取代。預購額度已初始化，禁止因接手而再執行初始化或重設原始上限，避免將已售名額補回。

## 2026-10-15 MCP 已接通、團圓金色與沖泡橫線

- 本機既有 CMS app／Headless02 憑證已接通，保留原secret；API實際18 scopes、倉庫讀取、MCP三個工具握手均通過。只新增read_locations/write_inventory並更新原app安裝權限，未寫入商品／庫存。限定寫入工具需CAS/idempotency；詳見 [MCP QA](qa/2026-10-15-shopify-mcp-connected/README.md)。
- 團圓前台只使用既有Gold GID，粉紅／藍選單暫時隱藏，無多餘選色步驟；商店原始三variants與庫存保持。Gold目前Hayward可用0，因此售罄；不可把Blue3轉算Gold。舊購物車仍能識別隱藏色款。
- 沖泡頭尾橫線移除，只保留中間4條；留白／垂直進度線／底部對齊不變。Node24 check、Shopify13、相關購物車E2E7、Ego中英文1440/390×motion/reduced共8組通過；桌機底緣差0px，無console／request／溢出問題。[本批 QA](qa/2026-10-15-gold-only-brew-dividers/README.md)。`df2a777`已提交推送；正式 deployment `dpl_6Xiapgg8FSQSzsURFbriNJr4NFWY` READY，www/apex/demo2 aliases及來源SHA一致，正式8組Ego QA也通過。
- 新需求：使用者授權照建議修改Shopify預購，需分現貨與未來預購額度、共用上限且結帳控量。已詢問原10款上限是否不含現貨的新批次額度或含現貨總量；待答前只做不依賴此定義的讀取／方案驗證。不能只開缺貨繼續銷售。FIFO及接續點見PLAN。
- 預購讀取盤點已完成：[盤點與實作限制](qa/2026-10-15-preorder-setup/README.md)。10款既有allocation仍只是記錄，全variants DENY，沒有selling plan。商店非Plus；不能假設自建Functions可用。可讀近60天的2筆訂單均已退款／履行、未標預購；不能據此推論整批已接數量為0。使用者詢問是否需客戶確認，已建議確認額度定義、外部既有訂單、團圓金色實數；未新增預購設定或寫庫存。
- root port3146為本輪Node24已建置真實Shopify模式。Ego task44已finish一次，依使用者需要保留p1本機與p2已登入Shopify Admin；沒有再等待登入。預購數字確認前不再操作瀏覽器。

## 2026-10-15 root 同步與 Shopify MCP 接續

- 本輪使用者授權本機／GitHub 最新版整合、正式 www 發布與 Ego／Shopify MCP 設定。root fetch/push 都是 `tentenco/charmvilla_shopify_official.git`。
- root 原 main `2232e74` 的21個本機修改檔已保存為本機分支 `codex/preserved-local-client-work-20261015`／`4589147`，再 fast-forward 到 `729d6fa`。舊 WIP 的核准圖片／文案已在先前 release curated merge；本輪合併補回影像 Lessons，沒有把舊檔覆蓋到同事新 Shopify。歷史 CSV、QA、rejected 圖片及 output 原路保留、未批次發布。
- root 應用程式與已驗收 `afc5199` 相同；Node24 check／Shopify12及 MCP 改動後 lint 通過，本機與 www 各5路由及5圖片 hash 通過。`729d6fa` 已由正式 www/apex/demo2 alias 指向 READY deployment `dpl_7byj5Wsz4zprzHPbxYBsR1pwxtCg`。本輪後續 MCP／文件提交不變更 storefront 程式。
- root `npm start` port3146 為本輪持有，Ego task44 p1 已開此網址。p2 Shopify 密碼登入已 handOff；沒有使用者確認前不可操作 task44。MCP server handshake 通過但商店查詢缺 Admin credentials；production sensitive env 不可回讀。未修改 Shopify 商品、庫存、憑證或 app scopes。接續見 [整合文件](shopify-integration.md) 與 [QA](qa/2026-10-15-local-sync/README.md)。
- 團圓金色可售數量仍待使用者回答，不能把目前藍色3盒當成金色。此舊等待決策已被使用者後續「選單先隱藏」取代，見本文件最新段落。

## 2026-10-15 核准雪花圖片與客戶定稿正式發布

- 在隔離 `charmvilla-release-20261015` 整理核准五張圖片、定稿、政策連結、聖誕兩選單、最新加大的沖泡留白；已整合 `9beeb11`，保留同事最新 Shopify/checkout/SEO/配送/庫存與 Logo 修正。
- Node24 check、Shopify12、API37、E2E16、Ego zh/en1440/390 通過。67a9091 圖片與定稿已正式發布；底部對齊補充 afc5199 的正式部署為 dpl_79UtGMhWkVkjfG1jHKHA4zipXjmP，READY/www/apex/demo2，正式12組視窗/語言/motion檢查通過，桌機底緣差0px。[本批 QA](qa/2026-10-15-client-images-release/README.md)。
- 當時 root `10-02-charmvilla-demo2` 在舊主線2232e74並保留WIP；其後已依上節保存與同步。照片只有五個核准新檔案納入，不納入 rejected outputs。
- Shopify後台本輪無寫入；後續團圓金色庫存待使用者提供實際數量，粉紅/藍隱藏選單為獨立新任務。

## 本輪交付（2026-10-15）

- 使用者明確授權「commit、push everything」及merge同事branch，全部已完成：`d18197e`全部WIP、`7809393`整合已部署Logo、`6ac2081`合併`origin/checkout-tests-wip`（kuankuan16，tip`abdc4c4`）。不是squash/cherry-pick，分支tip確為main祖先；其餘舊設計分支未批次合併。
- 正式Vercel `dpl_FeZSFXA9NWEwWCWKmu5iW3v4umJG` READY，來源`6ac2081`，www/apex aliases已指向，GitHub status success。所有SEO/schema、Search移除、配送前台、Logo、預購UI與三盒組資料均在線上。[完整release QA](qa/2026-10-15-full-release/README.md)。後續文件提交只補證據，程式同6ac2081。
- 驗證：check0 errors/7既有warnings、API37、E2E16、Shopify11、SEO7、GA4 8；正式56頁/43資產/12控制路徑0錯誤，12組zh/en桌機手機UI、Logo、真實cart CRUD/hosted account redirect通過。測試車清空，無訂單/付款/寄信。
- 庫存表：前8款Hayward/線上合計3/0/1/58/4/2/2/0保持正確；10款allocation已寫入。使用者確認聖誕心意禮三盒一組US$60、200組，已同步五款variant售價、雙語規格、共6包。兩款Christmas仍未Headless發布，未新增現貨或混搭variants。[庫存QA](qa/2026-10-15-inventory-alignment/README.md)。
- 配送：Hayward default/online，SGV/Fremont不配送，SGV現場銷售；本土48州+DC、滿199免運、AK/HI/軍郵不寄，Shopify及前台均一致。[配送QA](qa/2026-10-15-shipping-alignment/README.md)。
- 同事整合保留cart恢復/quantity/錯誤同步與測試；沒有恢復舊本機預購扣額度。mock只用loopback與測試token。正式會員仍Shopify hosted。test build與production build不能並行（同在.next）。
- Logo錯誤是沖泡動畫passive cleanup晚於首頁layout refresh，已改layout cleanup；另採用同事自架127.0.0.1英文rewrite marker修正（僅非Vercel），不是同一根因。[Logo QA](qa/2026-10-15-logo-navigation/README.md)。
- PLAN已完成、queue空。本機3026保留可檢視；brew-cup/3027與release工作樹均保留。使用者瀏覽器購物車未清除。以下段落保留歷史背景，以本節及最新Git讀回為準。

## 已驗證：結帳 Logo 返回正式首頁（2026-10-15）

- 使用者要求修正結帳 Logo 返回舊網站。檢查時，active Shopify theme `187176714604`（Updated copy of Balance）的 `layout/theme.liquid` **原本已存在** index → `https://www.charmvilla.com` redirect；本輪沒有修改主題、DNS、商店 primary domain 或結帳設定。
- 原生 Logo href 仍是 Shopify primary domain `https://account.charmvilla.us/`，瀏覽器執行 redirect 後回到正式 www 首頁。從全新獨立購物車實際點擊 **Shop Pay accelerated checkout** 與 **Guest checkout** Logo，兩者均到 `https://www.charmvilla.com/`。不要只憑 href 是 account 網域便判斷仍有錯誤。
- 未付款／建單／退款；獨立測試購物車已清空（quantity 0）、含 key 的暫存檔已移除。前輪 SEO 未提交／未部署狀態不變。[結帳 Logo QA](qa/2026-10-15-checkout-logo/README.md)。

## 全站 SEO／schema（2026-10-15；已隨6ac2081發布）

- 使用者指定 AgricIDaniel/claude-seo 優化全部頁面並建立正確 business／entity schema；最初完成本機實作與驗證，後經使用者明確授權，已隨6ac2081 commit/push並部署。
- 基準 `main`／`origin/main` 為 `2232e74`，初始乾淨。現在未提交 diff 為這次 SEO；不覆蓋或當成已發布。既有 `.claude/worktrees/brew-cup` 與 port 3027 沒有動。
- 完成 56 個雙語頁面的 metadata、OG／Twitter，及 `OnlineStore`（Haoying LLC）、`Brand`、`WebSite`、各頁型／麵包屑／分類清單／Product／逐 variant Offer／Article／台日 Store 的 JSON-LD。美國僅線上銷售；門市沒有掛成美國經銷商分店。日本官網品牌創立年份與核准 About 不同，schema 省略有爭議年份。
- 實作入口：`src/lib/seo/{metadata,schema}.ts`、`src/components/seo/JsonLd.tsx`；`catalog-data.ts` 新增 `scheduledPreOrder` 區分明確預購與 BackOrder，保留原有 UI 行為。官方 logo 的 schema 版本只補白底留白，原圖保留。
- Node 24 `npm run check` 通過（0 errors／7 原有 warnings）；SEO 7/7、Shopify 8/8；56 URL、43 資產、12 控制路徑無錯誤；Schema.org 驗證器 0 errors／0 warnings；1440／390 中英文、reduced-motion、鍵盤與 Ego 導覽通過。
- [完整 QA／來源](qa/2026-10-15-seo-schema/README.md)、[entity 決策](qa/2026-10-15-seo-schema/SCHEMA-REPORT.md)、[JSON-LD 樣本](qa/2026-10-15-seo-schema/generated-schema.json)。本機 production server 在 port 3026 供檢視，實際部署仍是下方已發布版本。

## 接手時先確認

- 2026-10-15 沖泡區整合：`main` 在 `e83cc1b` 之後多了 `fe38a98`（merge `brew-cup-scroll`）、`297936e`（agent 文件整理）與沖泡區調整 commit。push／部署結果以下方「最近已交付」與 [沖泡區整合 QA](qa/2026-10-15-brew-cup-integration/README.zh-TW.md) 為準；接手時仍要 `git fetch` 回讀。
- `origin` fetch／push：`https://github.com/tentenco/charmvilla_shopify_official.git`。Vercel 專案名稱仍是 `tentenco/charmvilla-demo2`，不可因 Git repo 改名就另建部署專案。
- `.claude/worktrees/brew-cup`（分支 `brew-cup-scroll`、`c8380b9`）已於 2026-10-15 合併進 `main`（`fe38a98`）。工作樹、分支與其 dev server（port 3027）本輪沒有刪除；清理前先確認沒有其他執行者，這不是刪除指示。
- Node 以 `.nvmrc` 的 24 為準；本輪 shell 為 22.23.1，替代執行方式見 [VERIFY.md](agent/VERIFY.md)。不要沿用另一台機器的路徑。
- 既有本機測試使用 port 3026；動服務前先查證。使用者的 localhost 購物車要保留。

## 最近已交付：正式站、Shopify、GA4、SEO

正式站：<https://www.charmvilla.com/>。英文無前綴、中文 `/zh`；結帳測試入口：<https://www.charmvilla.com/zh/products/kyoto-gift-box>。

2026-10-15 已依使用者授權正式上線。當時核對 www／apex 都指向既有 Vercel 專案，沒有更動 DNS；`main` push 會觸發 Production。最後一次應用程式驗證的部署是 `dpl_B3uNgcUTgd2eZhcu8K8K4YAQrgd8`（2026-10-15 05:11，來源 `864f7a0` 沖泡區整合，READY，www／apex alias 已指向；正式站 zh／en 商品頁實際捲動到 stage 4，見整合 QA）。之前的 `dpl_HkGe1sYsA6Z2277GYwErpRdbY7mt`（`548a52a`）是 Shopify 上線版。現在的線上部署仍須即時回讀，不能從這些 ID 推測。

| 已交付內容 | 核對結果與證據 |
| --- | --- |
| 商品與結帳 | 14 商品／35 variants 對齊；商品、價格、庫存與購買資格跟隨原 Shopify，照片保留 demo2 Visual；[整合契約](shopify-integration.md) |
| 繁中 CMS | 14 商品、28 個原生商品翻譯、33 個資源涵蓋 37 個選項標籤、14 個中文 CMS 欄位；[遷移說明](shopify/chinese-copy-migration.md)、[中文 QA](qa/2026-10-14-shopify-chinese/README.md) |
| GA4 | `G-D3YCFQMZ2W`；property `559053952`、stream `16130398768`；checkout pixel `217153900` 已 connected。購買重要事件、營收／轉換率、購物／結帳漏斗、同意與跨域已配置；[事件契約](analytics/ga4-tracking-plan.md) |
| Search Console | 連結 GA4；sitemap Success，56 URLs；首頁與中文京都頁 request indexing 成功。提交不等於 Google 已收錄；[上線 QA](qa/2026-10-15-production-launch/README.md) |
| 核准圖片 | 保留遠端 `4b1e83a`、`860e631` 的主圖清晰度調整；桌機主圖原始 WebP、手機／縮圖最佳化；[圖片 QA](qa/2026-10-14-product-image-clarity/README.md) |
| 沖泡區固定杯子（2026-10-15） | 商品頁「沖泡方式」一只線稿杯子釘在旁邊、隨五步累積，最後交棒給核准照片（Daily Harvest「What's in the cup」方向，研究在 `10-14-charmv-landing-try/reports/`）。合併 `brew-cup-scroll` 後依 Ego Lite 檢視微調：桌機軸線起點 60%、照片交棒 3.6→4、照片 104%→100% settle。10 個茶禮盒 × 中英文、390／1024／1440、reduced-motion 驗證；[整合 QA](qa/2026-10-15-brew-cup-integration/README.zh-TW.md)、[分支 QA](qa/2026-10-14-brew-cup-scroll/README.zh-TW.md) |

Git 證據：`c767233` Shopify／中文／GA4，`96e9207` 整合遠端圖片調整，`548a52a` 追蹤網址保護及線上驗證，`e83cc1b` 最終發布文件，`fe38a98` 合併沖泡區分支，`297936e` agent 文件整理，其後的沖泡區調整 commit 見整合 QA。歷史內容可從 Git 讀取，不另複製舊 handoff。

使用者另授權的上線通知已透過 Gmail 寄出並讀回 `SENT`；這項已交付，不因接手而重寄。

## 工程入口

| 範圍 | 檔案／文件 |
| --- | --- |
| Shopify 即時內容與庫存 | `src/lib/shopify/catalog.ts`、`catalog-data.ts`；`src/components/catalog/useLiveProduct.ts`、`LiveProductPrice.tsx`；`src/app/api/products/route.ts` |
| 商品身分與快照 | `src/data/shopify-map.json`、`src/data/shopify-products.json`；快照不作即時庫存備援 |
| 購物車／會員 | `src/app/api/cart/`、`src/app/api/account/`；公開會員入口跳 Shopify hosted accounts，沒有重做 Customer Account API OAuth 前端 |
| Admin 憑證更新 | `src/lib/shopify/admin-auth.ts`、`scripts/shopify/runtime.mjs`；server-only client credentials；不輸出或提交 token |
| CMS／MCP | [Shopify 整合](shopify-integration.md)；`.mcp.json` 與 `.codex/config.toml` 的兩個 server；query工具拒絕mutations，另有商品metafield及庫存的限定CAS寫入工具 |
| GA4 前台／checkout | `src/lib/analytics/ga4.ts`、`src/components/analytics/`、`scripts/analytics/shopify-checkout-pixel.js` |
| 商品頁沖泡區 | `src/components/catalog/TeaPages.tsx`、`BrewCup.tsx`、`brew-drawing.tsx`；`src/lib/motion/animations.ts` `brewProcess()` 輸出 `--brew-stage` 0→4；`src/app/globals.css` `.brew-*`／`.bc-*`；步驟資料在 `src/data/tea-gifts.ts` `brew`，中文由 `catalog-data.ts` 合併。無 JS／reduced-motion 只顯示照片 |
| 秘密與設定 | `.env.example` 只有鍵名；真實值在忽略的 `.env.local`，先前已設 0600。不要讀出值來做交接或健康檢查 |

Shopify API 網域為 `zcs0bg-10.myshopify.com`，checkout host `account.charmvilla.us`。CMS app 使用 client credentials 自動換發 token；不用重建 app 或再遷移中文。zh-TW 未對 Shopify Online Store 發佈，翻譯需用 `translatableResourcesByIds` 讀取；不要因 `Product.translations` 為空而覆寫或發布整個語系。

## 已驗證與尚未驗證

以下是上線時證據，不是本輪重新測試。完整輸出見 [正式上線 QA](qa/2026-10-15-production-launch/README.md) 與 [初次整合 QA](qa/2026-10-14-shopify-headless/README.md)。

- `npm run check` 通過：0 errors／7 既有 warnings；Shopify 測試 8/8、analytics 測試 8/8。
- 正式 Shopify API／獨立測試購物車 CRUD、非法輸入與 hosted account redirect 通過；QA 購物車已清空。
- 英文 1440px／中文 390px、鍵盤、reduced-motion、同意／撤回；沒有 runtime errors、failed requests、破圖或水平溢出。56 個 sitemap URL 的 HTTP／canonical／hreflang 檢查通過。
- DebugView 實際收到瀏覽、加購／移除、購物車與 Shopify `begin_checkout`；配送、付款、purchase 邏輯以離線 fixture 測試。
- 未實際付款、未建立訂單。首筆真實訂單仍須對照 Shopify order ID 與 GA transaction_id；退款／取消的伺服器同步未包含，GA 收益不等於退款後淨營收。
- Newsletter 真實訂閱、登入 OTP、付款完成未測試；不要把 account redirect 通過當成完整會員測試。

## 保留限制，不自動啟動工作

- 兩款 Christmas 商品未開 Headless；保留展示但不可購買。最新使用者已明確指定小盒改為三盒一組，共200組；每組US$60已依使用者確認寫入，取代之前單盒規則。
- Joyful Reunion 缺 Pink／Blue 專用照片，使用共用核准圖庫；四款 UNLISTED 工藝商品維持展示模式。
- 商品中文已遷移，品牌／News／政策頁未遷 CMS；英文一般編輯內容仍用既有來源。
- Shopify CLI 曾安裝 4.9.3，未建立該商店 CLI auth；Headless API／MCP 不依賴它。MCP 歷史 handshake 成功不等於目前 session 已載入工具。
- 上線時 npm audit 曾列 7 個既有 high advisories；目前情況須重新查證，不為文件任務執行 `audit fix --force`。
- [TASKS.md](../TASKS.md) 有上線前的價格／預購／帳戶假設；它是公開頁面內容，不是目前待執行任務。需更新時另按內容範圍核對，不能照舊清單改商店。

本輪 Agent 工作區整理的結果與驗證見 [PLAN.md](agent/PLAN.md)。後續發布依當次使用者指示，先核對 Git、專案與環境；不要把 push 當備份。

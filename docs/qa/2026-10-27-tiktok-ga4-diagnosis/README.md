# TikTok／GA4 診斷交付

2026-10-27；唯讀診斷，未修改應用、同意政策、GA filter、Vercel防火牆或Shopify資料。

- 使用者補充Aaron：Landing page views、10月23–26日、/collections/tea；TikTok帳戶時區與含參數完整URL仍缺。約1000為Aaron提供，未取得原始export核對。
- GA4 property559053952、stream16130398768／G-D3YCFQMZ2W；現況為America/Los_Angeles，stream近48小時有收資料。All users、無附加報表filter。Developer QA排除有效，Internal Traffic為測試。
- Oct23–26 Pacific快照：55 sessions／35 active users；tiktok / paid_social為2 sessions、0 engaged、7 events；/collections/tea為8 sessions／7 active users。Direct36、Google organic11、自家referral4、not set1、Bing organic1。Oct26約22:40仍在進行，近期GA彙總可更新，不能視為最終全日報表。
- 舊production e5b35ec與目前版本均明確同意後才載入GA；未選／拒絕／storage受阻者不收。沒有歷史同意率，不能推算98%拒絕；GA總量55也使「全部只是歸入Direct」不足以解釋差異。導航至沒有UTM的頁面再同意，有來源丟失的程式路徑，影響量未證實。
- Cloudflare apex／www為DNS only直連Vercel；HTTP analytics的2 visits不是主站完整訪客數，未確認所有歷史DNS狀態。
- Vercel Web Analytics未啟用；完整aggregate API被402 Observability Plus限制，UI一日以上亦限制。現有50筆runtime logs僅Oct27 UTC約8分鐘。最近一日Production CDN約9.2K requests；防火牆project overview約2.6K denied／757 challenged、system DDoS mitigation active，含多hosts／資源，沒有與TikTok對上，不能用來推算人數或認定TikTok遭封。
- Shopify Admin唯讀QL：同Pacific日期6個human sessions，App=Headless。分組landing URL的6列全部checkout（account.charmvilla.us五列、shop.app一列），沒有charmvilla.com landing；因此不是主站流量census。不保存checkout token網址。前台有GA與Shopify consent sync，沒有獨立Shopify storefront pageview publisher。MCP現app沒有read_reports，未擴scope，使用既有Admin UI查報表，未Save。
- GEO於Oct27臺北發布，不能解釋較早的campaign天數；上線其實重疊Oct26 Pacific晚間，最後一天需按TikTok時間戳分段。新臺灣流量轉往.tw須在目的站核對量測。
- 英文兩頁PDF經pdftotext核對及兩頁render實看，無溢出；已由erik@tenten.co寄Aaron，沒有新增Cc。Gmail id 1a17be4b849a7143，讀回SENT／收件人／PDF附件6860bytes正確；不得重寄。
- 報告明確保留完整差異原因未量化，請Aaron提供daily/hourly LPV、destination clicks、account timezone、campaign/ad IDs、country/device/placement及完整UTM網址；建議真實TikTok iOS/Android同意前後測試與未來隱私合規的分階段聚合量測。未假稱已解決1000與2的完整差異。

原始私人資料、PDF與寄信回條僅在本機/tmp/charmvilla-tiktok-ga4-diagnosis-20261027/，不提交顧客資料、IP、checkout URL或憑證。Ego space13已finish，不可再操作。

# 官網設計測試站

- 固定網址：https://charmvilla-design-preview.vercel.app/ （中文：/zh）
- GitHub：tentenco/charmvilla_shopify_official，分支 `design/museum-preview`。
- 本機：`/Users/kuan/Documents/Codex/charmvilla-design-preview`。
- 獨立 Vercel 專案：`charmvilla-design-preview`，ID `prj_65MpfXn5Q9unfzER1xUABTVSCxuK`。
- 基準：正式站提交 `4a241830b03312de521a7217e103ba7538dd1a7a`。

## 修改與發佈

在此工作樹修改並推送 `design/museum-preview`；不要 push main。新專案採明確 CLI 部署，沒有連接 Git 自動更新，因此正式站 main 的推送不會覆蓋這個測試站。

```sh
npx -y -p node@24 -c 'npm run check'
git push origin design/museum-preview
vercel deploy --prod --project charmvilla-design-preview --scope tentenco --non-interactive
```

此命令的 `--prod` 是**獨立測試專案**的固定網址，不是 `www.charmvilla.com`。每次部署前核對 `.vercel/project.json` 與明確 project 名稱。不要將此工作樹連結到 `charmvilla-demo2`，不要移動正式網域。

## 資料隔離

`CV_DESIGN_PREVIEW=true` 已設定在獨立專案的三種環境；專用分支亦自動啟用，避免原專案的 Git Preview 繼承正式交易模式。

- 強制本機商品展示資料，保留核准圖片與頁面結構。價格、選項、數量和文案可能與即時 Shopify 不同，不作商品事實驗收。
- 不複製 Shopify Admin／Storefront 憑證，不修改正式商品、庫存或 CMS。
- 購物車僅存於瀏覽器，無結帳；購物車／會員／電子報 API 回應 403 `design_preview`。
- 隱藏會員入口，直接會員頁回到同語言首頁；GA4 與 Shopify 追蹤關閉。
- 所有非正式網域已由現有設定送出 `X-Robots-Tag: noindex, nofollow`；分享頁不需登入。Noindex 不等於存取保護。
- 畫面保留雙語設計測試提示。

## 改版方向（尚未實作）

保留既有網站結構，後續研究世界美術館建築線條、極致工藝與前衛極簡的張力。此輪只建立可用測試環境；未自行加入建築圖像或更動商品視覺。

客戶核准後，另行整理視覺改動、對照當時 main 並測試 Shopify 正式流程，再依正式發佈授權合併。不可直接將含測試開關的環境當成正式交易站。

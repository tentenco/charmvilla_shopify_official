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

## 正式站副本與資料來源（2026-10-20 使用者修正）

使用者指定「直接拉正式站複製一份，只做前台設計，不更改購物車功能」。因此撤除早期 local 模擬方案。

- 商品與 CMS 即時讀取同一 Shopify 商店，價格、茶款、混搭、盒色、預購庫存與正式站一致。
- `src/components/cart`、`src/components/catalog`、`src/lib/shopify`、商品資料檔、API、proxy 和 newsletter 元件與基準 `origin/main` 相同。
- Shopify 購物車、會員與 hosted checkout 均沿用原功能。**測試站不是 Shopify sandbox；付款會成為正式商店訂單。** 驗證只操作測試購物車並清空，不付款、不提交訂閱。
- 專案只部署到 charmvilla-design-preview，正式網域與正式 main 不變。只有前台設計、預覽標示、分析停用等測試環境差異。
- `CV_DESIGN_PREVIEW=true` 現在僅控制預覽標示並停用 GA/Shopify analytics；不再覆寫 commerce 或 accounts mode，不再阻擋 API。
- 八項 commerce/account 環境設定取自本機已驗證的同商店連線並設定到獨立 Vercel 專案；沒有將憑證放入 Git、文件或 client bundle。
- 非正式網域仍有 `X-Robots-Tag: noindex, nofollow`；分享網址維持可直接開啟。

## 改版方向（2026-10-20 v1 已實作）

保留既有網站結構，後續研究世界美術館建築線條、極致工藝與前衛極簡的張力。v1 已加入螺旋／穹頂／玻璃幾何的原創線稿，更新首頁展示與故事背景；商品原圖保留。

客戶核准後，另行整理視覺改動、對照當時 main 並測試 Shopify 正式流程，再依正式發佈授權合併。合併時只挑選核准視覺改動，預覽標示與測試分析設定不帶入正式環境。

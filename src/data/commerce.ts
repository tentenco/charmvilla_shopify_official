// The US store's FAQ and policies (user 2026-10-07, 「CHARM VILLA Website FAQ and Policies.pdf」): the FAQ (/faq), the Shipping &
// Returns Policy (/policy), the Privacy Policy (/privacy), the Terms of Service (/terms) and the California Proposition 65 warning
// (/prop65). English is the document's wording; the Chinese is a faithful translation. The document's policy update dates are kept.
// The document says "contact us via our contact page"; this site has no contact page, so those lines name the email instead.
// Before 2026-10-07 this file held the Taiwan store's terms (消費者保護法, 子村宥宥股份有限公司), kept in git history.

import { translator, type Locale } from "../i18n/config";

/** A paragraph, a bulleted list, a question with its answer, or a fact still to be supplied. */
export type PolicyBlock = string | { list: string[] } | { q: string; a: string } | { pending: string } | { before: string; link: { label: string; href: string }; after: string };
export type PolicySection = { id: string; heading: string; blocks: PolicyBlock[]; source?: string };
export type PolicyDoc = { title: string; intro?: string; updated?: string; sections: PolicySection[] };

export const supportEmail = "us@charmvilla.com";
// The US company behind the store, shown publicly (client's final answers 2026-10-12, A1): the footer, the FAQ, the policies'
// contact lines and the Organization JSON-LD in [lang]/layout.tsx all read it from here.
export const company = {
  legalName: "Haoying LLC", street: "25509 Industrial Blvd, Ste G5", locality: "Hayward", region: "CA", postalCode: "94545", country: "US",
  line: "Haoying LLC, 25509 Industrial Blvd, Ste G5, Hayward, CA 94545, USA",
} as const;
// Free shipping (client's final answers 2026-10-12, D1): orders of US$199 or more, US$199 itself included, to the contiguous
// 48 states. CartDrawer uses this same number for its note.
export const freeShippingMin = 199;

const build = (lang: Locale) => {
  const t = translator(lang);
  const qa = (q: [string, string], a: [string, string]) => ({ q: t(...q), a: t(...a) });
  const email = supportEmail;
  const operator = company.line;
  // D2/D3 (client's final answers 2026-10-12): the approved English for dispatch and delivery, replacing the earlier
  // "before noon, same day" promise, and the pre-order schedule (B7) that is shown separately.
  const dispatch = t("現貨訂單於 1–2 個工作天內出貨，出貨後通常另需 3–7 個工作天送達。週末及美國聯邦假日不出貨。",
    "In-stock orders ship within 1–2 business days. Delivery typically takes an additional 3–7 business days after dispatch. We do not dispatch orders on weekends or U.S. federal holidays.");
  // Client's final English, 2026-10-14; newer owner shipping exclusions below remain authoritative.
  const preorder = t("預購商品預計最晚於 2026 年 11 月底前出貨。",
    "Pre-orders are expected to ship by the end of November 2026.");
  // Owner 2026-10-15 shipping scope supersedes the earlier client AK/HI delivery wording.
  const christmas = t("聖誕節下單截止日：寄送美國本土 48 州的訂單，請於 2026 年 12 月 15 日前下單，以便在聖誕節前送達。",
    "Christmas order deadline: for delivery before Christmas to the contiguous 48 states, please order by December 15, 2026.");
  // Owner 2026-10-15: replaces the earlier screenshot's separately charged AK/HI shipping.
  const remote = t("目前不寄送阿拉斯加與夏威夷。",
    "We do not ship to Alaska or Hawaii.");
  const military = t("APO／FPO／DPO 軍郵及外交郵件地址：上線初期暫不寄送。",
    "At launch, we do not ship to APO/FPO/DPO addresses.");

  // Frequently Asked Questions (/faq). Each answer keeps the document's order; `highlights` are the ones the About page repeats.
  const faqGroups: { id: string; heading: string; items: ({ id: string } & ReturnType<typeof qa>)[] }[] = [
    { id: "about", heading: t("關於 Charm Villa 與我們的理念", "About Charm Villa & Our Mission"), items: [
      { id: "unique", ...qa(["Charm Villa 的茶有什麼特別之處？", "What is unique about Charm Villa's tea?"],
        ["我們的小金魚茶包把台灣茶與優雅的設計結合在一起。茶葉浸泡時，金魚會在杯中慢慢成形——一份可以觀看、品嚐與分享的小小樂趣。", "Our Goldfish Tea Bags bring Taiwanese tea and graceful design together. As the tea steeps, the goldfish takes shape in your cup—a small pleasure to watch, taste, and share."]) },
      { id: "us-model", ...qa(["你們在美國的營運模式是什麼？", "Who operates the US store?"],
        [`我們是 CHARMVILLA 在美國的授權獨立經銷商，直接進口商品，並從加州出貨。美國商店由 ${operator} 經營。`, `We are CHARMVILLA's authorized independent distributor in the US. We import directly and ship orders from California. The US store is operated by ${operator}.`]) },
      { id: "contact", ...qa(["如果還有其他問題，要怎麼聯絡你們？", "How do I contact you if I have more questions?"],
        [`無論是挑選禮物或既有訂單的協助，歡迎來信 ${email}，我們很樂意為您服務。`, `For help choosing a gift or with an existing order, email us at ${email}. We would be happy to hear from you.`]) },
    ] },
    { id: "origin", heading: t("產品來源與品質", "Product Origin & Quality"), items: [
      { id: "origin", ...qa(["你們的茶來自哪裡？", "Where do your teas come from?"],
        ["我們的茶來自台灣。各款茶的介紹有風味說明；成分與產地細節請參考包裝。", "Our teas come from Taiwan. Explore the individual tea descriptions for tasting notes, and refer to the package for ingredients and origin details."]) },
      { id: "experience", ...qa(["小金魚茶包的體驗是什麼樣子？", "What is the Goldfish Tea Bag experience like?"],
        ["小金魚茶包兼具茶包的便利，以及看著它在杯中舒展成形的樂趣。依您喜歡的風味與香氣選擇茶款即可。", "The Goldfish Tea Bag brings the convenience of a tea bag together with the pleasure of watching its shape unfold in your cup. Choose your tea by the flavors and aromas you enjoy."]) },
      { id: "storage", ...qa(["該如何保存 Charm Villa 的茶？", "How should I store my Charm Villa tea?"],
        ["請放在陰涼乾燥處，避免陽光、高溫與潮濕。單包茶包開封後，請盡快享用，以保有最佳香氣。", "Keep your tea in a cool, dry place away from sunlight, heat, and moisture. Once you open an individual tea package, enjoy it promptly for the best aroma."]) },
      { id: "caffeine", ...qa(["你們的茶含咖啡因嗎？", "Does your tea contain caffeine?"],
        ["我們的烏龍茶與紅茶天然含有咖啡因。選購時請參考各商品的說明。", "Our oolong and black teas naturally contain caffeine. Check the individual product information when choosing a tea."]) },
      { id: "fabric", ...qa(["布面禮盒會和照片完全一樣嗎？", "Will my fabric gift box look exactly like the photographs?"],
        ["布料顏色在螢幕上可能略有差異，不同批次之間也會有些微不同。織紋受光的方式也各不相同，讓每一只禮盒都有自己細微的個性。", "Fabric colors may look different on screen and can vary slightly between batches. Woven textures also catch the light differently, giving each box its own subtle character."]) },
    ] },
    { id: "materials", heading: t("材質與茶葉檢測", "Materials & Tea Testing"), items: [
      { id: "tea-bag", ...qa(["茶包是什麼材質？放進熱水安全嗎？", "What material are the tea bags made of, and are they safe in hot water?"],
        ["小金魚茶包以食品級不織布製成，製程中不使用化學黏著劑。請依包裝上的沖泡說明使用。", "Our Goldfish Tea Bags are made from food-grade nonwoven fabric, without chemical adhesives in the manufacturing process. Follow the brewing instructions on the package."]) },
      { id: "testing", ...qa(["你們的茶有經過檢測嗎？", "Are your teas tested?"],
        [`據 CHARMVILLA 台灣團隊表示，小金魚茶包使用的茶葉皆經過 SGS 檢測。如需特定茶款或批次的資訊，請來信 ${email}。`, `CHARMVILLA's Taiwan team reports that the teas used in its Goldfish Tea Bags have undergone SGS testing. For information about a particular tea or batch, please contact us at ${email}.`]) },
    ] },
    { id: "brewing", heading: t("沖泡與品茗指南", "Brewing & Tasting Guide"), items: [
      { id: "recommend", ...qa(["我第一次接觸 Charm Villa，推薦哪些茶？", "I am new to Charm Villa. Which teas do you recommend?"],
        ["玫瑰烏龍茶有花香，紅玉紅茶帶有天然的肉桂與薄荷氣息，東方美人茶則有蜜香與果香。選擇您喜歡的風味，或試試綜合茶款，找到最愛。", "Rose Oolong offers floral fragrance, Ruby Black Tea has natural notes of cinnamon and mint, and Oriental Beauty has honeyed and fruity notes. Choose the profile you enjoy, or explore an assortment to find a favorite."]) },
      { id: "brew", ...qa(["小金魚茶包最好的沖泡方式是什麼？", "What is the best way to brew the Goldfish Tea Bag?"],
        ["將 150 mL（約 5 fl oz）、95°C（203°F）的熱水倒入杯中，建議使用透明玻璃杯欣賞金魚的姿態。沿缺口將包裝完整撕開，取出小金魚茶包，放入水中；用茶匙或攪拌棒輕輕將茶包壓入水裡，再讓它浮起。浸泡約 5 分鐘，看茶色漸漸加深、金魚慢慢成形。聞一聞茶香，啜飲一口，為自己留一段時間。", "Pour 150 mL (about 5 fl oz) of hot water at 95°C (203°F) into your cup. Use a clear glass cup to enjoy the goldfish's shape. Tear the package fully open at the notch and lift out the goldfish tea bag. Add the tea bag to the water. Using a teaspoon or stirrer, gently submerge the tea bag, then let it float. Steep for about 5 minutes as the tea's color deepens and the goldfish takes shape. Enjoy the fragrance, take a sip, and make a little time for yourself."]) },
      { id: "re-steep", ...qa(["茶包可以回沖嗎？", "Can the tea bags be re-steeped?"],
        ["可以。為了最好的體驗，建議依照我們的沖泡說明，在第一泡風味與香氣最佳的時候享用。", "Yes, our tea bags can be re-steeped. For the best experience, we recommend following our brewing instructions and enjoying the first infusion at its peak of flavor and aroma."]) },
    ] },
    { id: "orders", heading: t("訂單、運送與送禮", "Orders, Shipping & Gifting"), items: [
      { id: "shipping-cost", ...qa(["運費怎麼計算？", "How is shipping calculated?"],
        ["運費於結帳時依您的訂單與收件地址計算。完成購買前，您可以先查看可用的配送方式與適用的運費優惠。訂單金額滿 US$ 199（含 US$ 199）配送至美國本土相連 48 州即享免運。目前不寄送阿拉斯加、夏威夷及 APO／FPO／DPO 地址。", "Shipping costs are calculated at checkout based on your order and delivery address. You can review the available services and any applicable shipping offers before completing your purchase. Complimentary shipping on orders of US$199 or more to the contiguous United States (48 states). We do not ship to Alaska, Hawaii, or APO/FPO/DPO addresses."]) },
      { id: "delivery-time", ...qa(["配送需要多久？", "How long does delivery take?"],
        [`訂單從加州出貨。${dispatch}${preorder}${christmas}可用的配送方式會顯示在結帳頁；訂單出貨後，我們會寄送追蹤連結給您。`, `Orders ship from California. ${dispatch} ${preorder} ${christmas} Available shipping options are shown at checkout, and we will send a tracking link once your order ships.`]) },
      { id: "store", ...qa(["你們有實體店面嗎？", "Do you have a physical store?"],
        ["我們的美國商店為線上商店。CHARMVILLA 在台灣與日本的門市資訊，請見首頁的「台日門市」介紹。", "Our US store is online. For CHARMVILLA locations in Taiwan and Japan, see Stores in Taiwan & Japan on our home page."]) },
      { id: "gifting", ...qa(["商品適合送禮嗎？有提供提袋嗎？", "Are your products suitable for gifting, and do you offer gift bags?"],
        ["我們的茶禮盒很適合用來致謝、慶祝，或分享相聚的時光。請查看商品說明，或與我們聯絡，確認您選購的款式是否附有搭配的提袋。", "Our tea gift boxes are a thoughtful choice for thank-yous, celebrations, and time shared together. Check the product details or contact us to confirm whether a matching gift bag is included with your selection."]) },
      { id: "corporate", ...qa(["有企業送禮或大量訂購服務嗎？", "Do you offer corporate gifting or bulk order services?"],
        ["無論是送給同事、客戶，或用於慶祝與活動，我們都很樂意協助。大量或客製訂單請至少在預定日期前一個月與我們聯絡，並告知您想要的數量與商品。", "We would be happy to help with gifts for colleagues, clients, celebrations, or events. Please contact us at least one month before your preferred date for large or customized orders, with the quantity and products you have in mind."]) },
    ] },
  ];
  const faq: PolicyDoc = {
    title: t("常見問題", "Frequently Asked Questions"),
    intro: t("關於小金魚茶包、沖泡、產品保養與訂單的常見問題解答。", "Find answers to commonly asked questions about Goldfish Tea Bags, brewing, product care, and orders."),
    sections: faqGroups.map((g) => ({ id: g.id, heading: g.heading, blocks: g.items.map(({ q, a }) => ({ q, a })) })),
  };
  const allFaq = faqGroups.flatMap((g) => g.items);
  const faqHighlights = ["shipping-cost", "delivery-time", "store", "recommend", "re-steep", "corporate"].map((id) => allFaq.find((f) => f.id === id)!);

  // Shipping & Returns Policy (/policy)
  const policy: PolicyDoc = {
    title: t("運送與退換貨政策", "Shipping & Returns Policy"),
    // D5 (client 2026-10-12): the date the final policies are actually published on the site. Change it to the launch date at launch.
    updated: t("最後更新：2026 年 10 月 15 日", "Last Updated: October 15, 2026"),
    intro: t("關於運費、配送時間與退換貨規定，您需要知道的一切。", "Everything you need to know about our shipping rates, delivery times, and return guidelines."),
    sections: [
      { id: "returns", heading: t("退換貨與退款政策", "Return & Refund Policy"), blocks: [
        t("在 Charm Villa，我們以產品的品質、安全與完整為優先。由於我們同時販售易腐的茶品與手工茶具，退換貨政策依商品類別而有所不同。", "At Charm Villa, we prioritize the quality, safety, and integrity of our products. Because we offer both perishable teas and artisan teaware, our return policy varies by product category."),
      ] },
      { id: "returns-tea", heading: t("茶品與消耗性商品", "Teas & Consumable Items"), blocks: [
        t("由於我們的特選茶品屬於可食用且易腐的商品，我們遵守嚴格的食品安全標準。因此，所有茶品與消耗性商品的銷售均為最終交易。商品一經寄出，在一般情況下，我們無法接受退貨、換貨或退款。", "Because our specialty teas are ingestible and perishable, we adhere to strict food safety standards. Therefore, all sales of tea and consumable products are final. We cannot accept returns, exchanges, or issue refunds for these items under standard circumstances once they have been dispatched."),
      ] },
      // D4 (client's final answers 2026-10-12): the non-tea return policy, replacing the earlier 14-day ceramics policy. It applies
      // once non-tea items go on sale; at launch they are display-only (B1–B4). The id stays so existing links keep working.
      { id: "returns-ceramics", heading: t("非茶商品（茶具、陶瓷與配件）", "Non-Tea Items (Teaware, Ceramics & Accessories)"), blocks: [
        t("此政策於非茶商品開始販售時適用；上線初期，這些商品僅供展示。", "This policy applies once our non-tea items go on sale. At launch, these items are shown for display only."),
        t("您可於收到商品後 30 天內提出退貨申請。可退貨的商品必須：", "You may request a return within 30 days of delivery. To be eligible for a return, your item must be:"),
        { list: [t("未使用且無損壞。", "Unused and undamaged."), t("保留原包裝及所有配件。", "In its original packaging, with all included accessories.")] },
        t("您可以拆開包裝檢查商品。", "You are welcome to open the packaging to inspect your item."),
        t(`退貨前請先來信 ${email} 並附上您的訂單編號；退貨獲准後，請於 7 天內將商品寄回。`, `Before sending anything back, please contact us at ${email} with your order number. Once your return is approved, please ship the item back within 7 days.`),
        t("因個人意願改變而退貨時，退回運費由顧客負擔，原已支付的出貨運費恕不退還。我們不收取重新入庫費，也不會追扣原訂單享有的免運費用。", "For returns due to a change of mind, the customer pays the return shipping, and the original shipping charges are non-refundable. We do not charge a restocking fee, and we do not deduct the value of complimentary shipping from your refund."),
        t("若商品損壞、有瑕疵或寄錯，必要的運費由我們負擔，並為您更換商品或退款。", "If your item arrives damaged or defective, or you receive the wrong item, we will cover the necessary shipping costs and offer a replacement or a refund."),
        t("退回的商品經我們檢查後，款項將退回您原本的付款方式。", "Once we receive and inspect your return, your refund will be issued to your original payment method."),
        t("寄回易碎商品時，強烈建議使用可追蹤的物流服務或購買運送保險；退貨運送途中損壞或遺失的商品，我們無法退款。", "We highly recommend using a trackable shipping service or purchasing shipping insurance when returning fragile items, as we cannot issue refunds for items damaged or lost in return transit."),
      ] },
      { id: "damages", heading: t("損壞與訂單問題", "Damages & Order Issues"), blocks: [
        t("雖然茶品無法接受一般退貨，但您的體驗對我們非常重要。若您的訂單有任何部分在送達時損壞、有瑕疵，或收到錯誤的商品，我們會負責處理到好。收到包裹時請仔細檢查。", "While we cannot accept standard returns on tea, your experience is deeply important to us. If any part of your order arrives damaged, defective, or if you receive the incorrect item, we are here to make it right. Please inspect your package carefully upon receipt."),
        t(`如需為損壞或錯誤的訂單申請例外處理，請在送達後 7 天內來信 ${email}。為了盡快處理，請在信中附上：`, `To request an exception for a damaged or incorrect order, please contact our support team at ${email} within 7 days of delivery. To ensure a swift resolution, please include the following in your email:`),
        { list: [t("您的訂單編號。", "Your order number."), t("瑕疵、損壞或錯誤的清楚說明。", "A clear description of the defect, damage, or error."), t("清楚呈現茶包、陶瓷商品或包裝問題的照片。", "Clear photos showing the issue with the tea bag, ceramic product, or packaging.")] },
        t("收到您的來信並確認資料後，我們會評估問題，並以補寄（視庫存而定）或退款的方式為您處理。", "Once we receive your email and verify the documentation, we will evaluate the issue and make it right by issuing a replacement (subject to stock availability) or a refund."),
      ] },
      { id: "refunds", heading: t("退款處理", "Processing Refunds"), blocks: [
        t(`若退貨或損壞商品的退款獲得核准，款項將在 10 個工作天內自動退回您原本的付款方式。請留意，您的銀行或信用卡公司可能需要一些時間處理並入帳。若退款核准後已超過 15 個工作天仍未收到，請來信 ${email}。`, `If a refund is approved for a return or a damaged item, you will be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund. If more than 15 business days have passed since we approved your refund, please contact us at ${email}.`),
      ] },
      { id: "processing", heading: t("運送與處理時間", "Shipping & Processing Times"), blocks: [
        // D2/D3 (client 2026-10-12): replaces "Most orders placed before noon Pacific Time ... are shipped the same day".
        dispatch,
        preorder,
        christmas,
        t("訂單寄出後，您會收到含追蹤資訊的確認信。", "Once your order ships, we will email your tracking information."),
      ] },
      // Client reply 2026-10-14 §6: full payment at order; cancel before shipping for a full refund; after shipping, the tea policy
      { id: "preorders", heading: t("預購付款與取消", "Pre-Order Payment & Cancellation"), blocks: [
        { list: [
          t("預購商品於下單時收取全額款項。", "Pre-orders are charged in full when you place your order."),
          t("預購商品預計最晚於 2026 年 11 月底前出貨。", "Pre-orders are expected to ship by the end of November 2026."),
          t(`出貨前可申請取消並獲得全額退款，請來信 ${email} 並附上您的訂單編號。`, `You may cancel a pre-order for a full refund before it ships. Please email us at ${email} with your order number.`),
        ] },
        { before: t("訂單出貨後，適用我們的", "Once your order has shipped, our "),
          link: { label: t("茶品與消耗性商品", "Teas & Consumable Items"), href: "#returns-tea" },
          after: t("退換貨政策。", " return policy applies.") },
      ] },
      { id: "address", heading: t("地址正確性", "Address Accuracy"), blocks: [
        t("請確認結帳時輸入的收件地址正確無誤。因顧客提供的地址錯誤而送達他處的包裹，或物流商標示為「已送達」但未收到的包裹，Charm Villa 恕不負責。", "Please ensure your shipping address is entered correctly at checkout. Charm Villa is not responsible for packages delivered to incorrect addresses provided by the customer, or for packages marked as \"Delivered\" by the carrier but not received."),
      ] },
      { id: "us-shipping", heading: t("美國運費與配送時間", "US Shipping & Delivery Estimates"), blocks: [
        { list: [
          // D1 (client 2026-10-12): US$199 or more, 199 included, to the contiguous 48 states (was: over $99)
          t("免運費：訂單金額滿 US$ 199（含 US$ 199）配送至美國本土相連 48 州即享免運。", "Complimentary Shipping: Complimentary shipping on orders of US$199 or more to the contiguous United States (48 states)."),
          t("標準運費：訂單未達 US$ 199，或不符合免運條件時，運費依您的地區與選擇的配送方式於結帳時計算並顯示。", "Standard Shipping: For orders under US$199, or orders not eligible for complimentary shipping, shipping rates are calculated and displayed at checkout based on your location and selected service."),
          remote,
          military,
        ] },
      ] },
      { id: "delays", heading: t("配送預估與物流延誤", "Delivery Estimates & Carrier Delays"), blocks: [
        t("請注意，所有配送時間皆為物流商提供的預估值。我們一律盡快從加州倉庫包裝並寄出您的商品，但偶爾仍可能發生無法預期的物流延誤、天候因素或出貨量高峰。包裹交付物流商後，Charm Villa 對運送途中的延誤不負責任。", "Please note that all delivery times are estimates provided by the carrier. While we always strive to pack and ship your items promptly from our California facility, unforeseen carrier delays, weather events, or high shipping volumes may occasionally occur. Once a package is handed over to the carrier, Charm Villa is not liable for transit delays."),
      ] },
      { id: "lost", heading: t("運送途中遺失", "Lost in Transit"), blocks: [
        t(`若您的包裹不幸在運送途中遺失，請來信 ${email}。雖然我們無法為物流商的疏失負責，但我們會代您與物流商密切聯繫，協助找回包裹或提出申訴，以提供合適的解決方案。`, `In the unfortunate event that your package is lost in transit, please contact us at ${email}. While we cannot take responsibility for carrier errors, we will work closely with the carrier on your behalf to locate your shipment or file a claim to provide a suitable resolution.`),
      ] },
      // A1 (client 2026-10-12): the operator of the US store. Not a return address: returns are arranged by email first.
      { id: "contact", heading: t("聯絡我們", "Contact Us"), blocks: [
        t(`Charm Villa 美國商店由 ${operator} 經營。關於運送或退換貨的問題，請來信 ${email}。`, `Charm Villa's US store is operated by ${operator}. For questions about shipping or returns, please contact us at ${email}.`),
      ] },
    ],
  };

  // Privacy Policy (/privacy)
  const privacy: PolicyDoc = {
    title: t("隱私權政策", "Privacy Policy"),
    // D5 (client 2026-10-12): the date the final policies are actually published on the site. Change it to the launch date at launch.
    updated: t("最後更新：2026 年 10 月 27 日", "Last Updated: October 27, 2026"),
    intro: t("本隱私權政策說明 Charm Villa 在您造訪本網站或於本站購物時，如何蒐集、使用與揭露您的個人資料。", "This Privacy Policy describes how Charm Villa (\"we\", \"us\", or \"our\") collects, uses, and discloses your Personal Information when you visit or make a purchase from our website (the \"Site\")."),
    sections: [
      { id: "platform", heading: t("1. 資料的蒐集與儲存（我們的平台）", "1. How We Collect and Store Data (Our Platform)"), blocks: [
        t("我們使用 Shopify 作為後端電子商務平台，並透過其 API 連接。我們不會將您的付款或個人資料直接儲存在自己的實體伺服器上；您的資料會安全地傳送至 Shopify 並由其處理，Shopify 作為我們的資料處理者，協助我們營運商店。關於 Shopify 如何使用您的個人資料，請見 www.shopify.com/legal/privacy。", "We use Shopify as our backend e-commerce platform and connect to it via their API. We do not directly store your payment or personal data on our own physical servers. Instead, your data is securely transmitted to and processed by Shopify, which acts as our data processor to help us run our store. You can read more about how Shopify uses your Personal Information here: www.shopify.com/legal/privacy."),
      ] },
      { id: "collected", heading: t("2. 我們蒐集哪些個人資料", "2. What Personal Information We Collect"), blocks: [
        t("您造訪本站時，我們（透過 Shopify 的基礎架構）會蒐集關於您的裝置、您與本站的互動，以及處理您的購買所需的資訊。", "When you visit the Site, we (through our Shopify infrastructure) collect certain information about your device, your interaction with the Site, and information necessary to process your purchases."),
        { list: [
          t("訂單資訊：當您購買或嘗試購買時，我們會蒐集您的姓名、帳單地址、收件地址、付款資訊（包括經由我們的金流閘道安全處理的信用卡號）、電子郵件與電話號碼。", "Order Information: When you make a purchase or attempt to make a purchase, we collect your name, billing address, shipping address, payment information (including credit card numbers processed securely via our payment gateways), email address, and phone number."),
          t("裝置資訊：我們會自動蒐集您裝置的部分資訊，包括網頁瀏覽器、IP 位址、時區，以及安裝在您裝置上的部分 Cookie。", "Device Information: We automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device."),
        ] },
      ] },
      { id: "use", heading: t("3. 我們如何使用您的個人資料", "3. How We Use Your Personal Information"), blocks: [
        t("我們蒐集的訂單資訊主要用於履行您在本站下的訂單（包括處理付款資訊、安排運送，以及提供發票或訂單確認）。此外，我們也會使用訂單資訊來：", "We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:"),
        { list: [
          t("與您聯繫訂單或客服相關事宜。", "Communicate with you about your order or customer service inquiries."),
          t("篩查訂單是否有潛在風險或詐欺。", "Screen our orders for potential risk or fraud."),
          t("（若您已同意）提供與我們產品或服務相關的資訊或廣告。", "(If you have opted in) Provide you with information or advertising relating to our products or services."),
        ] },
      ] },
      { id: "sharing", heading: t("4. 個人資料的分享", "4. Sharing Your Personal Information"), blocks: [
        t("為了依上述方式使用您的個人資料，我們會與第三方分享您的個人資料。", "We share your Personal Information with third parties to help us use your Personal Information, as described above."),
        { list: [
          t("Shopify：如前所述，我們使用 Shopify 營運線上商店並儲存顧客資料。", "Shopify: As mentioned, we use Shopify to power our online store and store customer data."),
          t("物流商：我們會將您的收件資訊提供給物流商（如 USPS、UPS 等）以配送包裹。", "Carriers: We share your shipping details with carriers (like USPS, UPS, etc.) to deliver your packages."),
          t("法令遵循：我們也可能為了遵守適用的法律法規、回應傳票、搜索令或其他合法的資料請求，或為了保護我們的權利，而分享您的個人資料。", "Compliance with Laws: We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights."),
        ] },
      ] },
      { id: "cookies", heading: t("5. Cookie", "5. Cookies"), blocks: [
        t("Cookie 是您造訪本站時儲存在裝置上的少量資訊。我們使用必要的 Cookie 與本機儲存功能提供購物服務，並依您的選擇使用分析或廣告量測 Cookie。必要功能包括：", "Cookies are small pieces of information stored on your device. We use essential cookies and local storage for shopping, and analytics or advertising measurement cookies according to your choices. Essential functions include:"),
        { list: [
          t("維持您的購物車工作階段。", "Maintain your active shopping cart session."),
          t("在登入時驗證您的身分並保護您的帳號。", "Authenticate your identity and secure your user account during login."),
          t("防止跨站請求偽造（CSRF）攻擊，確保您的資料安全。", "Prevent cross-site request forgery (CSRF) attacks to keep your data safe."),
        ] },
        t("您可選擇「允許分析」或「僅必要功能」，並隨時透過頁尾的「Cookie 設定」變更選擇。經您同意後，Google Analytics 4 會記錄網頁與商品瀏覽、購物車操作、結帳及完成購買事件，包含商品、金額、幣別、訂單編號與匿名瀏覽器識別資訊，用於分析購買流程與轉換率。我們不會將您的姓名、電子郵件、電話、地址或付款資料傳送至 Google Analytics，也未啟用廣告個人化。", "You can choose Allow analytics or Essential only, and change your choice at any time through Cookie settings in the footer. With your permission, Google Analytics 4 records page and product views, cart actions, checkout and completed purchases, including products, amounts, currency, order IDs and pseudonymous browser identifiers, to measure shopping journeys and conversion rates. We do not send names, email addresses, phone numbers, addresses or payment details to Google Analytics, and advertising personalization is disabled."),
        t("若您另外選擇「允許分析與廣告」，我們會使用 OpenAI 的 ChatGPT 廣告量測 Pixel 記錄網頁瀏覽事件，並使用廣告點擊參考值及瀏覽器識別 Cookie 衡量廣告成效。只允許分析不會載入這個 Pixel。您可以隨時撤回廣告量測同意；撤回後停止傳送後續事件，並刪除 Pixel 的歸因與瀏覽器識別 Cookie。這項量測目前不包含購買事件，且事件不供個人化廣告使用。", "If you choose Allow analytics & ads, we use OpenAI's ChatGPT Ads Measurement Pixel to record page views and measure ad performance using ad click references and browser identifier cookies. Allow analytics alone does not load this pixel. You can withdraw advertising measurement consent at any time. We then stop sending new events and delete the pixel's attribution and browser identifier cookies. This measurement does not currently include purchases, and events opt out of personalization."),
        t("依 Pixel 設定，OpenAI 也可能在您允許廣告量測後，辨識網站上的電子郵件、電話等支援的顧客識別資訊，在您的瀏覽器內以 SHA-256 雜湊後用於廣告轉換比對，不傳送這些識別欄位的原始內容。", "Depending on the pixel settings, OpenAI may also detect supported customer details on the site, such as email addresses and phone numbers, after you allow advertising measurement. It hashes those details in your browser using SHA-256 to match ad conversions, without sending those fields in plain text."),
        // D7 (client 2026-10-12, checked against the code): local mode keeps the bag in localStorage; with Shopify on, the bag is a Shopify
        // cart and the browser keeps only its id (CartProvider.tsx). Neither is a cookie or used for tracking (cart audit 2026-10-14).
        process.env.NEXT_PUBLIC_COMMERCE_MODE === "shopify"
          ? t("您的購物車內容由 Shopify 保存，以便結帳；您的瀏覽器只會在本機儲存空間（local storage）記住購物車編號，讓您再次造訪時仍能看到。若您允許分析，我們也會將分析同意狀態與匿名工作階段識別碼傳遞至 Shopify 結帳，以銜接購買流程。", "Your shopping bag is kept by Shopify so you can check out; your browser remembers the bag's ID in local storage so it is still there when you return. If you allow analytics, we also pass your consent and pseudonymous session identifiers to Shopify checkout to connect the shopping journey.")
          : t("您的購物車內容會儲存在您瀏覽器的本機儲存空間（local storage），讓您再次造訪時仍能看到；這些資訊只留在您的裝置上，不會用於追蹤。", "Your shopping bag is saved in your browser's local storage on your device, so it is still there when you return. This information stays on your device and is not used for tracking."),
      ] },
      { id: "rights", heading: t("6. 您的資料權利（GDPR 與 CCPA）", "6. Your Data Rights (GDPR & CCPA)"), blocks: [
        t("依您的所在地，您可能有權存取我們持有的您的個人資料、將其轉移至新的服務，以及要求更正、更新或刪除您的個人資料。由於您的資料儲存於 Shopify，若您希望行使這些權利，請透過下方的電子郵件與我們聯絡。我們會透過 Shopify 管理後台處理您的請求，確保您的資料被妥善匯出或自其伺服器刪除。", "Depending on where you live, you may have the right to access the Personal Information we hold about you, to port it to a new service, and to ask that your Personal Information be corrected, updated, or erased. Because your data is stored in Shopify, if you wish to exercise these rights, please contact us at the email below. We will then process your request through our Shopify administrative dashboard to ensure your data is appropriately exported or deleted from their servers."),
      ] },
      { id: "retention", heading: t("7. 資料保存", "7. Data Retention"), blocks: [
        t("當您透過本站下單，我們會將您的訂單資訊保存在 Shopify 的紀錄中作為我們的紀錄，直到您要求我們刪除為止。", "When you place an order through the Site, we will retain your Order Information in Shopify unless and until you ask us to delete this information."),
      ] },
      { id: "contact", heading: t("8. 聯絡我們", "8. Contact Us"), blocks: [
        t(`如需進一步了解我們的隱私權做法、有任何疑問或希望提出申訴，請來信 ${email}。`, `For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us at ${email}.`),
        // A1 (client 2026-10-12)
        t(`Charm Villa 美國商店由 ${operator} 經營。`, `Charm Villa's US store is operated by ${operator}.`),
      ] },
    ],
  };

  // Terms of Service (/terms)
  const terms: PolicyDoc = {
    title: t("服務條款", "Terms of Service"),
    // D5 (client 2026-10-12): the date the final policies are actually published on the site. Change it to the launch date at launch.
    updated: t("最後更新：2026 年 10 月 13 日", "Last Updated: October 13, 2026"),
    intro: t("歡迎來到 Charm Villa。本服務條款（「本條款」）規範您對 Charm Villa 網站（「本站」）的存取與使用，以及向 Charm Villa（「我們」）購買商品的行為。造訪本站及／或向我們購買商品，即表示您使用我們的「服務」，並同意受以下條款約束。若您不同意本協議的全部條款與條件，則不得存取本網站或使用任何服務。", "Welcome to Charm Villa. These Terms of Service (\"Terms\") govern your access to and use of the Charm Villa website (the \"Site\") and the purchase of products from Charm Villa (\"we\", \"us\", or \"our\"). By visiting our Site and/or purchasing something from us, you engage in our \"Service\" and agree to be bound by the following Terms. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services."),
    sections: [
      { id: "health", heading: t("1. 健康、食品安全與產品免責聲明", "1. Health, Food Safety & Product Disclaimers"), blocks: [
        t("重要：本站販售的商品，包括所有特選茶品與陶瓷器皿，僅供飲食與享用之目的。", "Important: The products sold on our Site, including all specialty teas and ceramic wares, are strictly for culinary and enjoyment purposes."),
        t("非醫療建議：我們的產品以及本站提供的任何說明或資訊，均非用於診斷、治療、治癒或預防任何疾病或醫療狀況。本站的聲明未經美國食品藥物管理局（FDA）評估。", "Not Medical Advice: Our products and any descriptions or information provided on the Site are not intended to diagnose, treat, cure, or prevent any disease or medical condition. The statements on this Site have not been evaluated by the Food and Drug Administration (FDA)."),
        t("過敏原與成分：您有責任檢視我們產品的成分，確認其適合您個人食用，特別是當您有已知的食物過敏、敏感體質，或正在懷孕／哺乳時。若有醫療上的疑慮，請在使用前諮詢醫療專業人員。", "Allergens & Ingredients: You are responsible for reviewing the ingredients of our products to ensure they are safe for your personal consumption, especially if you have known food allergies, sensitivities, or are pregnant/nursing. Consult with a healthcare professional before use if you have medical concerns."),
        t("陶瓷產品保養：我們的手工陶瓷產品（例如筷架）已通過 FDA 食品安全認證。但它們易碎，且不可用於微波爐或洗碗機，必須小心手洗。因不當使用、摔落或未遵守保養說明而造成的任何損壞、破損或傷害，Charm Villa 概不負責。", "Ceramic Product Care: Our handmade ceramic products (such as chopstick rests) have been certified by the FDA as food-safe. However, they are fragile and are not microwave or dishwasher safe. These items must be carefully hand-washed. Charm Villa is not liable for any damage, breakage, or injury resulting from improper use, dropping, or failure to follow these care instructions."),
      ] },
      { id: "ip", heading: t("2. 智慧財產權", "2. Intellectual Property Rights"), blocks: [
        t("本站包含的所有內容，例如文字、圖像、標誌、圖片、產品設計、音訊片段、數位下載與資料彙編，均為 Charm Villa 或其內容供應者的專屬財產，受美國及國際著作權法保護。未經我們明確的書面許可，您不得重製、複製、拷貝、販售、轉售或利用本服務或本站的任何部分。", "All content included on this Site, such as text, graphics, logos, images, product designs, audio clips, digital downloads, and data compilations, is the exclusive property of Charm Villa or its content suppliers and is protected by United States and international copyright laws. You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service or the Site without express written permission from us."),
      ] },
      { id: "pricing", heading: t("3. 產品與定價", "3. Products and Pricing"), blocks: [
        t("變更：我們產品的價格可能不經通知而變更。我們保留隨時不經通知修改或終止本服務（或其任何部分或內容）的權利。", "Modifications: Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice."),
        t("手工差異：部分商品，例如我們的手工陶瓷筷架，均為手工製作。基於手工製作的特性，顏色、釉面、質地與尺寸上的細微差異屬正常且可預期。這些獨特的差異不構成瑕疵，您實際收到的產品可能與本站顯示的圖片略有不同。", "Handmade Variations: Certain items, such as our artisan ceramic chopstick rests, are handmade. Due to the nature of artisan crafting, slight variations in color, glaze, texture, and size are normal and expected. These unique variations do not constitute a defect, and the actual product you receive may differ slightly from the images displayed on our Site."),
        t("正確性：我們已盡力準確呈現商店中產品的顏色與圖片，但無法保證您的電腦螢幕所顯示的任何顏色都準確無誤。", "Accuracy: We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate."),
        t("供應：所有產品說明或產品定價，我們可自行決定隨時變更，不另行通知。我們保留隨時停售任何產品的權利。", "Availability: All descriptions of products or product pricing are subject to change at any time without notice, at our sole discretion. We reserve the right to discontinue any product at any time."),
      ] },
      { id: "billing", heading: t("4. 帳單與帳戶資訊", "4. Billing and Account Information"), blocks: [
        t("我們保留拒絕您所下任何訂單的權利。我們可自行決定限制或取消每人、每戶或每筆訂單的購買數量。這些限制可能包括由同一顧客帳號、同一張信用卡下的訂單，及／或使用相同帳單及／或收件地址的訂單。您同意為在我們商店的所有購買提供最新、完整且正確的購買與帳戶資訊。", "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store."),
      ] },
      { id: "third-party", heading: t("5. 第三方連結", "5. Third-Party Links"), blocks: [
        t("透過本服務提供的部分內容、產品與服務可能包含第三方的素材。本站上的第三方連結可能將您導向與我們無關的第三方網站。我們不負責檢查或評估其內容或正確性，對任何第三方素材或網站亦不提供保證，也不承擔任何責任。", "Certain content, products, and services available via our Service may include materials from third parties. Third-party links on this Site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy, and we do not warrant and will not have any liability or responsibility for any third-party materials or websites."),
      ] },
      { id: "liability", heading: t("6. 責任限制", "6. Limitation of Liability"), blocks: [
        t("在任何情況下，Charm Villa 及我們的董事、主管、員工、關係企業、代理人、承包商、實習生、供應商、服務提供者或授權人，均不對因您使用本服務或透過本服務取得的任何產品而產生的任何傷害、損失、索賠，或任何直接、間接、附帶、懲罰性、特殊或衍生性損害負責，包括但不限於利潤損失、收入損失、儲蓄損失、資料遺失、替換成本或任何類似損害，無論其依據為契約、侵權（包括過失）、嚴格責任或其他。", "In no case shall Charm Villa, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the Service or any products procured using the Service."),
      ] },
      { id: "indemnification", heading: t("7. 賠償", "7. Indemnification"), blocks: [
        t("您同意就任何第三方因您違反本服務條款、或違反任何法律或第三方權利而提出的索賠或要求（包括合理的律師費），對 Charm Villa 及我們的母公司、子公司、關係企業、合作夥伴、主管、董事、代理人、承包商、授權人、服務提供者、分包商、供應商、實習生與員工進行賠償、抗辯並使其免受損害。", "You agree to indemnify, defend and hold harmless Charm Villa and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees from any claim or demand, including reasonable attorneys' fees, made by any third-party due to or arising out of your breach of these Terms of Service or your violation of any law or the rights of a third-party."),
      ] },
      { id: "law", heading: t("8. 準據法", "8. Governing Law"), blocks: [
        t("本服務條款以及我們向您提供服務的任何個別協議，均依美國加州法律規範與解釋，不適用其法律衝突規定。", "These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions."),
      ] },
      { id: "changes", heading: t("9. 服務條款的變更", "9. Changes to Terms of Service"), blocks: [
        t("您可以隨時在本頁面查看最新版本的服務條款。我們保留自行決定透過在網站上發布更新與變更，來更新、修改或替換本服務條款任何部分的權利。定期查看我們的網站以了解變更，是您的責任。", "You can review the most current version of the Terms of Service at any time on this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes."),
      ] },
      { id: "contact", heading: t("10. 聯絡資訊", "10. Contact Information"), blocks: [
        t(`關於服務條款的問題，請來信 ${email}。`, `Questions about the Terms of Service should be sent to us at ${email}.`),
        // A1 (client 2026-10-12)
        t(`Charm Villa 美國商店由 ${operator} 經營。`, `Charm Villa's US store is operated by ${operator}.`),
      ] },
    ],
  };

  // California Proposition 65 Warning (/prop65)
  const prop65: PolicyDoc = {
    title: t("加州 65 號提案警語", "California Proposition 65 Warning"),
    sections: [
      { id: "warning", heading: t("警告", "Warning"), blocks: [
        t("警告：食用本站販售的食品與飲品，或使用本站販售的陶瓷器皿，可能使您接觸到包括鉛與鎘在內的化學物質，加州政府已知這些物質會導致癌症、先天缺陷或其他生殖系統傷害。更多資訊請見 www.P65Warnings.ca.gov/food。", "WARNING: Consuming the food and beverage products or using the ceramic wares sold on this site can expose you to chemicals including lead and cadmium, which are known to the State of California to cause cancer and birth defects or other reproductive harm. For more information, please visit www.P65Warnings.ca.gov/food."),
      ] },
    ],
  };

  const footer = {
    help: [
      { label: t("常見問題", "FAQ"), href: "/faq" },
      { label: t("運送與退換貨", "Shipping & Returns"), href: "/policy" },
      { label: t("退換貨", "Returns"), href: "/policy#returns" },
      { label: t("聯絡我們", "Contact us"), href: `mailto:${email}` },
    ],
    legal: [
      { label: t("隱私權政策", "Privacy Policy"), href: "/privacy" },
      { label: t("服務條款", "Terms of Service"), href: "/terms" },
      { label: t("加州 65 號提案", "Proposition 65"), href: "/prop65" },
    ],
  };

  return {
    email, faq, faqHighlights, policy, privacy, terms, prop65, footer,
    labels: { contents: t("本頁內容", "On this page"), pending: t("待品牌方提供", "To be confirmed"), source: t("資料來源：", "Source: ") },
  };
};

const built: Partial<Record<Locale, ReturnType<typeof build>>> = {};
export const getCommerce = (lang: Locale) => (built[lang] ??= build(lang));

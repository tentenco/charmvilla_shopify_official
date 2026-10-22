import { teaGiftProductsFor, type TeaContents } from "./tea-gifts";
import shopifyMap from "./shopify-map.json";
import studioListing from "./studio-listing.json";
import { getContent, gallery, site, type Img } from "./content";
import type { Locale } from "../i18n/config";
import { sizeText } from "./measure";
import shopifyProducts from "./shopify-products.json";
import { applyShopifyProduct, type ShopifyProduct, type ShopifyVariant } from "@/lib/shopify/catalog-data";

// Tea gift box gallery photographs that have a normalised `-even2.webp` copy (same grey ground and box size; user 2026-10-12).
const evenGalleryFiles = [
  "listing-tea-blossoming-prosperity-gift-box-v4.webp",
  "official-gift-front-blossoming-prosperity-gift-box-cutout-v3.webp",
  "studio-blossoming-prosperity-gift-box-angle-v2.webp",
  "gift-box-unboxed-18.webp",
  "listing-tea-orchid-gift-box-v4.webp",
  "official-gift-front-orchid-gift-box-gold-cutout-v3.webp",
  "official-gift-front-orchid-gift-box-pink-cutout-v3.webp",
  "studio-orchid-gift-box-angle-v2.webp",
  "listing-tea-purple-butterfly-gift-box-v4.webp",
  "official-gift-front-purple-butterfly-gift-box-cutout-v3.webp",
  "studio-purple-butterfly-gift-box-angle-v2.webp",
  "listing-tea-spring-dawn-gift-box-v4.webp",
  "official-gift-front-spring-dawn-gift-box-blue-cutout-v3.webp",
  "studio-spring-dawn-gift-box-end-angle.webp",
  "gift-box-unboxed-12-v2.webp",
  "studio-spring-dawn-gift-box-pink-cover.webp",
  "official-gift-front-spring-dawn-gift-box-pink-cutout-v3.webp",
  "studio-spring-dawn-gift-box-pink-end-angle.webp",
  "listing-tea-winter-blossom-gift-box-v4.webp",
  "official-gift-front-winter-blossom-gift-box-cutout-v3.webp",
  "studio-winter-blossom-gift-box-end-angle.webp",
  "listing-tea-year-of-plenty-gift-box-v4.webp",
  "official-gift-front-year-of-plenty-gift-box-cutout-v3.webp",
  "studio-year-of-plenty-gift-box-angle-v2.webp",
  "listing-tea-kyoto-gift-box-v3.webp",
  "studio-kyoto-gift-box-official.webp",
  "listing-tea-reunion-gift-box-us-v1.webp",
  "studio-reunion-gift-box-us-closed-angle.webp",
  "listing-tea-reunion-paulownia-gift-box-v4.webp",
  "studio-reunion-paulownia-gift-box-closed-angle-v2.webp",
  "studio-reunion-paulownia-gift-box-unboxed-v5.webp",
];

// Product facts come from the existing approved content and asset manifest.
// No inferred prices, stock, metal purity, gemstone grades, sizes or tea brewing times. Prices, metal and sizes added
// 2026-10-02 are copied from www.charmvilla.com.tw product pages (read that day); where the official page could not be
// matched to a piece with certainty (the two diamond earrings, the Prosperity stands), nothing was added.
//
// Bilingual (2026-10-01): buildCatalog(lang) builds the same products in Chinese (the source) or English. Every visible
// string is written as t("中文", "English"); slugs, images, prices and Shopify ids are shared.
export type CategoryId = "bags" | "jewelry" | "tea" | "scents" | "abundance" | "wood-fired";
export type Category = { id: CategoryId; name: string; en: string; intro: string };
// 美國市場不販售真皮包與金飾（使用者 2026-10-07：「全站把交織系列與如魚得水系列隱藏」）：這兩類不進分類與商品清單，
// 所以選單、清單、商品頁（變成 404）、頁尾、網站地圖、相關商品都不會出現。資料保留，要恢復時把這裡清空即可。
// 豐盛系列（點心盤）也隱藏（使用者 2026-10-07：「隱藏所有「豐盛系列」（點心盤）的商品與選單按鈕」）
export const hiddenCategories: ReadonlySet<CategoryId> = new Set<CategoryId>(["bags", "jewelry", "abundance"]);
export type ProductView = { label: string; image: Img; placeholder?: boolean; tone?: "grey" }; // placeholder: a beige block (grey where the option awaits the client's photographs), the photograph still to be chosen
export type Product = {
  slug: string; category: CategoryId; name: string; english: string;
  summary: string; description: string;
  /** Listing cover and first gallery view: the studio photograph on the light ground (user 2026-10-01). */
  image: Img;
  /** Scene shown on a listing card while it is hovered. */
  hoverImage?: Img;
  /** Product-page gallery: studio views on the light ground only, all 4:5. */
  views: ProductView[];
  /** Scene photography, laid out below the gallery like a magazine spread. */
  scenes?: Img[];
  /** items: a list fact (a gift box's teas) shown as bullet points; value keeps the same text as one line */
  facts: { label: string; value: string; items?: string[] }[];
  /** `more`: a second titled text under the story (紫斑蝶: about Taiwan's purple crow butterflies); bodies may hold paragraphs separated by blank lines */
  story: { title: string; body: string; image?: Img; more?: { title: string; body: string; source?: string } };
  variant?: { group: string; label: string };
  /** not sold on the US store (tea boxes, user 2026-10-07): kept out of every listing, menu, sitemap and product page; data kept */
  hidden?: boolean;
  officialUrl?: string;
  /** Studio editorial shot for the homepage featured grid (falls back to `image`). */
  featuredImage?: Img;
  /** Local-mode list price: USD on the US catalogue (tea gift boxes, 2026-10-07), the official TWD price elsewhere. In shopify mode the Storefront API price wins. */
  price?: { amount: number; currency: "TWD" | "USD" };
  /** Marked sold out on the official store; the price stays visible and the bag button is disabled. */
  soldOut?: boolean;
  /** Made to order: labelled 預購 / Pre-order beside the price, card and bag button. */
  preOrder?: boolean;
  /** Approved bilingual terms from Shopify custom.preorder_details; no local stock allowance. */
  preOrderPolicy?: { shipBy: string; shipping: string; terms: string };
  /** Pre-order boxes left in the product's one shared allowance (客戶答覆 B7, 2026-10-12): shown as 預購・剩餘 N 盒 beside the price. Until
   *  Shopify inventory replaces it, it equals the allowance unless tea-gifts.ts overrides it (preOrderLeft). Absent: no count is shown. */
  preOrderRemaining?: number;
  preOrderUnit?: "box" | "set";
  priceTbd?: boolean;
  teaTbd?: boolean;
  /** Shown but not sold at launch (客戶答覆 B1–B4, 2026-10-12): no price (NT$ or US$), no bag / pre-order buttons, no Offer in JSON-LD; photographs and text stay. */
  displayOnly?: boolean;
  imageNote?: string;
  /** Packaging notice beside the purchase options, supplied with the product content. */
  packagingNote?: string;
  /** Shopify handle + variant GID from src/data/shopify-map.json; empty until the store is connected. */
  shopify?: { handle: string; variantId: string };
  shopifyData?: { productId: string; published: boolean; status: string; scheduledPreOrder?: boolean; variants: ShopifyVariant[]; mixAvailable?: boolean };
  /** How to brew (tea gift boxes, guide §4); `image` sits at the bottom left of the steps. */
  brew?: { title: string; steps: { title: string; text: string }[]; image?: Img };
  /** 茶款介紹: a note on each tea in the box (tea gift boxes, as on the official product pages). */
  teaNotes?: { title: string; items: { name: string; text: string; term?: string }[] };
  /** The Show more! concept: the protected slogan and the finalized concept copy (guide §5). */
  concept?: { title: string; slogan: string; body: string };
  /** choices: what the bag button offers (a tea, a tea × lid colour, or a packaging option); choiceLabel: the legend above them */
  giftBox?: { pieces: number; series: string; contents: TeaContents; choices?: { label: string; contents: TeaContents; selection?: { tea: string; lid: string }; price?: number; note?: string; shopifyVariantId?: string; availableForSale?: boolean; quantityAvailable?: number | null; sku?: string; viewsFrom?: string; placeholderViews?: number; lidViews?: { cover?: string; angle?: string; front?: string; unboxed?: string; lid?: string; scene?: string }; views?: ProductView[] }[]; choiceLabel?: string; /** mix-and-match set: this many boxes, each one tea picked from `choices`; one price for the set */ mixBoxes?: number };
};

const buildCatalog = (lang: Locale) => {
  const t = (zh: string, en: string) => (lang === "en" ? en : zh);
  const { bags, jewelry } = getContent(lang);

  // Category names and order from the user's Google Doc (2026-10-02): 全部作品 All Pieces · 小金魚茶包 Goldfish Tea Bags · 香氛 Scents
  // (slogan 「香味，是喜悅的記憶。」, the official store's 香味是喜悅的記憶 category: the hinoki pieces) · 金飾 Jewelry · 豐盛系列
  // Abundance Collection · 柴燒系列 Wood-Fired Collection (the chopstick rest) · 門市 Our Stores. The leather bags were kept
  // (user's choice) and renamed 交織系列 Interwoven Collection after their braided handles, in the series naming of the others.
  // The former 茶器與工藝 is split into 香氛, 豐盛系列 and 柴燒系列 (/collections/teaware redirects to /collections/scents).
  const categories: Category[] = [
    { id: "tea", name: t("小金魚茶包", "Goldfish Tea Bags"), en: "GOLDFISH TEA BAGS", intro: t("從織布的經緯到桐木的紋理，一盒茶也有值得細看的風景。以禮盒收藏手作的小金魚，依盒型、入數與茶款，選一份走進日常的心意。", "From woven fabric to the grain of paulownia wood, each tea gift box holds details worth a closer look. Discover handcrafted goldfish tea bags, then choose the box style, tea selection and number of tea bags for the gift you have in mind.") },
    // Chinese names as on the official store www.charmvilla.com.tw (user 2026-10-05: 「全站的商品名稱與分類都跟官網一致」): 香味是喜悅的記憶 and 如魚得水
    { id: "scents", name: t("香味是喜悅的記憶", "Scents"), en: "SCENTS", intro: t("以檜木製作的杯墊、茶匙與筷子。", "Scent holds the memory of joy. Discover hinoki wood coasters, teaspoons and chopsticks, with natural grain and a gentle aroma that bring a quiet pleasure to tea and everyday meals.") /* the slogan is now the Chinese name itself */ },
    { id: "jewelry", name: t("如魚得水", "Jewelry"), en: "JEWELRY", intro: t("金魚的輪廓縮小至耳畔，光澤便有了貼近肌膚的尺度。轉身之間，欣賞金面、珍珠與鑽石各自的表情。", "Our goldfish takes on a new form in jewelry. Explore designs with pearls, diamonds and matte finishes, each catching the light in its own way as you move.") },
    { id: "bags", name: t("交織系列", "Interwoven Collection"), en: "INTERWOVEN COLLECTION", intro: t("從交織的提把看向包身，細紋與線條各有秩序。拿起一只皮革包，也把對材質的欣賞帶進日常。", "A braided handle, textured leather and a carefully considered silhouette. Discover bags that bring distinctive details to the pieces you carry every day.") },
    { id: "abundance", name: t("豐盛系列", "Abundance Collection"), en: "ABUNDANCE COLLECTION", intro: t("以點心盤整理茶席上的高低與層次。從擺放到取用，讓下午茶有自己的節奏。", "A paper dessert tray designed for easy storage, portability and reuse, created by Su Ching-mei. Unfold the tray, place the supplied dessert paper on top and arrange your sweets for the gathering. The dessert paper is single-use and for room-temperature use only.") },
    { id: "wood-fired", name: t("柴燒系列", "Wood-Fired Collection"), en: "WOOD-FIRED COLLECTION", intro: t("以鳥的輪廓構成筷架。小小一件，在餐具與桌面之間，留下有形的留白。", "A little bird rests between the table and your chopsticks, bringing a quiet pause to each place setting. Each wood-fired piece is shaped and finished by hand, with subtle variations in color.") },
  ];

  const bagProducts: Product[] = bags.products.map((p) => ({
    slug: `braided-leather-bag-${p.id}`, category: "bags", name: t(`${bags.product}・${p.name}`, `${bags.product} · ${p.name}`),
    english: `BRAIDED LEATHER BAG / ${p.en}`, summary: t("交織的提把，連起手與皮革。", "A braided handle that joins hand and leather."),
    description: t(`${p.name}荔枝紋真皮，搭配扁平三股編織肩帶與扁銅棒五金。提把的編織線條與包身細紋相接，金屬接點則讓柔軟的材質有了清楚的收束。`,
      `${p.name} lychee-grain leather with a flat three-strand braided strap and a flat brass bar. The lines of the braid meet the grain of the body, and the metal joint gives the soft material a clear point of closure.`),
    image: p.views[0].image, views: p.views.map((v) => ({ label: v.label, image: v.image })),
    facts: [
      { label: t("顏色", "Color"), value: p.name }, { label: t("材質", "Material"), value: t("荔枝紋真皮", "Lychee-grain leather") },
      { label: t("肩帶", "Strap"), value: t("扁平三股編織", "Flat three-strand braid") }, { label: t("五金", "Hardware"), value: t("扁銅棒", "Flat brass bar") },
      { label: t("發明專利", "Invention patent"), value: "TW I728606" },
    ],
    story: {
      title: t("肩上的一件作品", "A piece for the shoulder"),
      body: t("先看輪廓，再走近。荔枝紋在光線下顯出細微起伏，三股編織沿著提把延伸；當包被提起，原本陳列中的線條，也隨身體的動作進入生活。",
        "Take in the outline first, then come closer. Under light the lychee grain shows its fine relief, and the three-strand braid runs the length of the handle. Once the bag is lifted, lines that sat still on display move with the body and into daily life."),
      image: p.views[2].image,
    },
    variant: { group: "braided-leather-bag", label: p.name },
    // Show more! = this bag (user 2026-10-06). The slogan is protected (guide §5): it is shown word for word in both languages.
    // The English concept copy is the finalized text, unchanged; the Chinese is a faithful translation of it.
    concept: {
      title: t("設計概念", "Design concept"),
      slogan: "Simplify to amplify. Show more, in your life!",
      body: t("運用原創的折疊與交扣結構，將一整片平面的皮革轉化為完整成形的包款。不需縫線、不需黏著劑，也無須後續加工，讓皮革保持最自然的狀態，同時開啟再利用與轉化的新可能。這份設計展現了對材質及其所取自的自然資源的深切尊重。",
        "Using an original folding and interlocking structure, a single flat piece of leather is transformed into a fully formed bag. Requiring no stitching, no adhesives, and no further fabrication, the design preserves the leather in its most natural state while opening new possibilities for reuse and transformation. It reflects a deep respect for the material and the natural resources from which it comes."),
    },
  }));

  // 2026-09-30: the charcoal-sketch listings (goldfish-diamond-stud / goldfish-diamond-drop) were the same products as the
  // bezel-diamond and single-diamond earrings; they are merged here as extra views and their URLs redirect (next.config.ts).
  // 2026-09-30 (later): the brand supplied the real product photography — four series: 珍珠長鏈、鑽石、雙魚、璞金. The earlier
  // "bezel diamond at the mouth" listing did not exist as a product; it and "single diamond" merged into 鑽石系列 (redirects in next.config.ts).
  // 2026-10-01 (user): 鑽石系列 has two styles — 垂墜 (fish + short chain + claw-set drop) and 耳釘 (stud, no drop). Scene photos are
  // sorted by which style they show: drop = CV-0370/0371/0372 + drop sketch; stud = CV-0376/0374/0373 + stud sketch.
  const jewelrySlugs = ["pearl-chain-goldfish-earrings", "diamond-goldfish-earrings", "diamond-goldfish-stud-earrings", "twin-goldfish-earrings", "raw-gold-goldfish-earrings", "diamond-bezel-goldfish-earrings"];
  const jewelryEnglish = ["PEARL CHAIN", "DIAMOND DROP", "DIAMOND STUD", "TWIN GOLDFISH", "RAW GOLD", "DIAMOND BEZEL"];
  // the official store's series of each piece (如魚得水 › 珍珠系列／鑽石系列／雙魚系列／璞金系列)
  const jewelrySeries = [t("珍珠系列", "Pearl Series"), t("鑽石系列", "Diamond Series"), t("鑽石系列", "Diamond Series"), t("雙魚系列", "Twin Series"), t("璞金系列", "Raw Gold Series"), t("鑽石系列", "Diamond Series")];
  const jewelryDetails = [
    t("珍珠、長鏈與金魚", "Pearl, long chain and goldfish"),
    t("金魚、短鏈與爪鑲垂墜圓鑽", "Goldfish, short chain and a prong-set round diamond drop"),
    t("單尾金魚耳釘、魚口圓鑽、無垂墜", "Single goldfish stud, round diamond at the mouth, no drop"),
    t("兩尾金魚以短鏈相連", "Two goldfish joined by a short chain"),
    t("單尾小金魚、霧面金屬表面", "Single small goldfish, matte metal surface"),
    t("金魚、短鏈與包鑲垂墜圓鑽", "Goldfish, short chain and a bezel-set round diamond drop"),
  ];
  const jewelryExtra: Record<number, Img[]> = {
    // pearl chain: the olive-coat portrait among ivory pleats (CV-0379) removed (user 2026-10-02: 「刪」)
    0: [gallery("CV-0377", t("珍珠長鏈小金魚耳環・石面光影", "Pearl Chain Goldfish Earrings in light and shadow on stone")), gallery("CV-0380", t("珍珠長鏈小金魚耳環・米白衣領", "Pearl Chain Goldfish Earrings against a cream collar"))],
    // stud: the colour photograph of the stud as worn (CV-0373) was removed and the charcoal sketch kept (user 2026-10-02: 「保留素描的」)
    2: [gallery("CV-0374", t("單鑽小金魚耳環・深綠靜影", "Goldfish Earrings, Diamond Series stud, a still life in deep green")), site("goldfish-stud-sketch.webp", t("單鑽小金魚耳環・炭筆素描配戴圖", "Goldfish Earrings, Diamond Series stud, charcoal sketch of the piece as worn"), 896, 1120)],
    // CV-0372/0370/0371 and the drop sketch show the bezel setting (checked 2026-10-05), so they belong to 包鑲, not 爪鑲
    // CV-0371 (red-brown drapes) and the drop sketch removed from the bezel page (user 2026-10-05: 「刪」)
    5: [// the olive-sofa colour portrait was removed (user 2026-10-05: 「刪」)
      gallery("CV-0372", t("吐鑽小金魚耳環｜包鑲・配戴", "Goldfish Earrings, Diamond Series bezel, as worn")), gallery("CV-0370", t("吐鑽小金魚耳環｜包鑲・暗調肖像", "Goldfish Earrings, Diamond Series bezel, a low-key portrait"))],
    // twin: the as-worn photograph among ivory pleats (CV-0378) was removed (user 2026-10-02: 「刪」), so the twin has no scene
  };
  const jewelryEditorial = [
    {
      description: t("珍珠與長鏈向下延伸，金魚停在鏈末。從耳畔到頸側，細長的線條把觀看的距離拉開，也讓魚形的比例更容易被看見。", "Pearl and long chain extend downward, and the goldfish rests at the chain's end. From the ear to the side of the neck, the slender line opens up the distance of looking and makes the proportions of the fish easier to see."),
      title: t("垂落的線，游動的形", "A falling line, a swimming form"),
      body: t("動作，讓線條有了變化。長鏈隨轉身輕移，珍珠與金魚各自接住光線；靜止時的構圖，到了配戴者身上，又是另一幅畫面。", "Movement changes the line. The long chain shifts as you turn, and pearl and goldfish each catch the light. A composition at rest becomes another picture on the person who wears it."),
    },
    {
      description: t("一尾小金魚停在耳畔，短鏈之下垂著一顆爪鑲圓鑽。金面與鑽石的明暗不同，隨動作各自接住光，讓魚形與那一點光之間有了距離。", "One small goldfish rests at the ear; below a short chain hangs a prong-set round diamond. Gold surface and diamond differ in brightness and catch the light separately as you move, leaving a distance between the fish and that point of light."),
      title: t("魚身之下的一點光", "A point of light beneath the fish"),
      body: t("輪廓之外，還有間距。金魚固定在耳畔，圓鑽隨短鏈輕移；靜與動同時存在，貼近側臉觀看，便能讀出各個細節之間的關係。", "Beyond the outline there is spacing. The goldfish stays fixed at the ear while the diamond moves on its short chain. Stillness and motion exist together; seen close to the profile, the relationship between each detail becomes legible."),
    },
    {
      description: t("單尾小金魚耳釘，魚口嵌著一顆圓鑽，沒有垂墜。光集中在耳畔的一點，轉頭時魚形與鑽石一起接住光。", "A single goldfish stud with a round diamond set at its mouth and no drop. The light gathers at one point by the ear; when the head turns, fish and diamond catch it together."),
      title: t("耳畔的一點光", "A point of light at the ear"),
      body: t("貼近看，才看見魚口那顆鑽。輪廓收斂，光也收斂；配戴時像一枚安靜的印記，只在轉身的瞬間亮一下。", "Only up close do you see the diamond at the fish's mouth. The outline is restrained, and so is the light. Worn, it is like a quiet mark that brightens only for the instant you turn."),
    },
    {
      description: t("兩尾金魚以短鏈相連：一尾停在耳畔，一尾垂落。觀看一尾的輪廓，也留意另一尾的位置；形與形之間的距離，讓耳畔有了小幅的構圖。", "Two goldfish joined by a short chain: one rests at the ear, one hangs below. Look at the outline of one and notice where the other sits; the distance between the two forms makes a small composition at the ear."),
      title: t("兩尾魚之間", "Between two fish"),
      body: t("視線可以來回。先看各自的輪廓，再看兩者如何相處，配戴的比例便從這份呼應裡慢慢清楚。", "The eye can travel back and forth. Look first at each outline, then at how the two sit together; the proportions of the piece, as worn, slowly come clear in that exchange."),
    },
    {
      description: t("單尾小金魚，霧面的金屬表面收住反光，只留下輪廓。收斂的尺度，讓魚形的轉折集中在一起，適合從近處細看。", "A single small goldfish whose matte metal surface holds back reflection and leaves only the outline. At this restrained scale the turns of the fish form gather together, made to be read up close."),
      title: t("只留下輪廓", "Only the outline remains"),
      body: t("少了亮面的反射，形狀便更安靜。魚身與尾鰭的每一處轉折都有被看見的空間，配戴時像一枚貼近耳畔的小印記。", "Without a polished surface to reflect, the shape grows quieter. Every turn of body and tail fin has room to be seen; worn, it is like a small mark kept close to the ear."),
    },
    {
      description: t("一尾小金魚停在耳畔，短鏈之下垂著一顆圓鑽，鑽石外圍由一圈金邊包住。金面與鑽石隨動作各自接住光。", "One small goldfish rests at the ear; below a short chain hangs a round diamond held in a rim of gold. Gold and diamond each catch the light as you move."),
      title: t("金邊裡的一點光", "A point of light held in gold"),
      body: t("包鑲把鑽石收進一圈金邊，輪廓更圓也更完整。金魚停在耳畔，圓鑽隨短鏈輕移，近看能讀出金邊與鑽石的分界。", "The bezel gathers the diamond into a ring of gold, so the outline is rounder and complete. The goldfish stays at the ear while the diamond moves on its short chain; up close you can read the line between gold and stone."),
    },
  ];
  // www.charmvilla.com.tw (2026-10-02): K18 gold, made in Taiwan, sold per single earring, made to order in about 25–60 days,
  // not shipped overseas. List prices only where the official page is certainly this piece.
  // 2026-10-05: 爪鑲 (id 128) 8,600, 單鑽 (id 132) 9,600 and 包鑲 (id 180) 10,300, matched to the official pages by photograph
  const jewelryPrices: Record<string, number> = { "pearl-chain-goldfish-earrings": 9600, "twin-goldfish-earrings": 9600, "raw-gold-goldfish-earrings": 5500, "diamond-goldfish-earrings": 8600, "diamond-goldfish-stud-earrings": 9600, "diamond-bezel-goldfish-earrings": 10300 };
  const jewelryFacts = (slug: string) => [
    { label: t("材質", "Material"), value: slug === "pearl-chain-goldfish-earrings" ? t("K18 純金、珍珠", "18K gold, pearl") : t("K18 純金", "18K gold") },
    { label: t("販售單位", "Contents"), value: t("單只（單耳）", "A single earring") },
    { label: t("產地", "Made in"), value: t("台灣", "Taiwan") },
    { label: t("製作時間", "Making time"), value: t("訂製商品，約 25–60 天；訂購前請先來電洽詢", "Made to order in about 25–60 days; please call before ordering") },
    { label: t("寄送", "Delivery"), value: t("金飾不提供海外寄送", "Jewelry is not shipped overseas") },
  ];
  // the bezel-set drop sits next to the claw-set one
  // the official store marks 吐鑽小金魚耳環｜爪鑲｜ (id 128) ｜售罄｜ (user 2026-10-05: mark it here too)
  const jewelrySoldOut = new Set(["diamond-goldfish-earrings"]);
  const jewelryOrder = ["pearl-chain-goldfish-earrings", "diamond-goldfish-earrings", "diamond-bezel-goldfish-earrings", "diamond-goldfish-stud-earrings", "twin-goldfish-earrings", "raw-gold-goldfish-earrings"];
  const jewelryProducts: Product[] = jewelry.items.map((p, i): Product => ({
    slug: jewelrySlugs[i], category: "jewelry", name: p.title, english: jewelryEnglish[i],
    summary: p.desc, description: jewelryEditorial[i].description,
    image: p.image, views: [{ label: t("商品照", "Product photograph"), image: p.image }, ...(jewelryExtra[i] || []).map((image, j) => ({ label: t(`情境 ${j + 1}`, `Scene ${j + 1}`), image }))],
    // facts only (user 2026-10-05: 「商品 spec 不寫形容文案」): the style repeated the name and is gone; the parts are 「組成」
    facts: [{ label: t("系列", "Series"), value: jewelrySeries[i] }, { label: t("組成", "Parts"), value: jewelryDetails[i] }, ...jewelryFacts(jewelrySlugs[i])],
    ...(jewelryPrices[jewelrySlugs[i]] ? { price: { amount: jewelryPrices[jewelrySlugs[i]], currency: "TWD" as const } } : {}),
    ...(jewelrySoldOut.has(jewelrySlugs[i]) ? { soldOut: true } : {}),
    story: { title: jewelryEditorial[i].title, body: jewelryEditorial[i].body, image: jewelryExtra[i]?.[0] },
  })).sort((a, b) => jewelryOrder.indexOf(a.slug) - jewelryOrder.indexOf(b.slug));

  // The 16 official gift boxes; the two 2026 Christmas editions were removed (user 2026-10-05: 「聖誕節茶包都刪」).
  const teaProducts: Product[] = teaGiftProductsFor(lang);

  const prosperity = t("豐盛系列", "Abundance Collection"), wooden = t("香味是喜悅的記憶", "Scents");
  const tablewareEntries = [
    { slug: "prosperity-dessert-stand", name: t("豐盛點心盤", "Abundance Collection (4-Color Series)"), en: "ABUNDANCE COLLECTION", series: prosperity, ids: ["CV-0068", "CV-0074", "CV-0081"],
      summary: t("把點心與茶，安放在同一席風景。", "Abundance Dessert Tray · Paper serving set"),
      detail: t("以點心盤整理茶席上的高低與層次。從擺放到取用，讓下午茶有自己的節奏。", "A paper dessert tray designed for easy storage, portability and reuse, created by Su Ching-mei. Unfold the tray, place the supplied dessert paper on top and arrange your sweets for the gathering. The dessert paper is single-use and for room-temperature use only."),
      story: { title: t("餐桌上的高與低", "Highs and lows on the table"), body: t("擺放，也是一種構圖。點心有了不同的高度，杯與盤之間便多了可觀看的層次；每次相聚，都能重新安排這一席景致。", "Arranging is a kind of composition. With sweets at different heights there are more layers to look at between cup and plate, and every gathering is a chance to set the scene anew.") } },
    // 豐盛點心盤｜包裝禮盒 removed: the official store sells one product, 豐盛點心盤 (user 2026-10-05: 「照官網的」); the URL redirects
    // 2026-10-02 (user: 「這些商品是分開販售，不要擅自合併」): the cloud coasters are their own product on www.charmvilla.com.tw
    // (id 156); the old "木質杯墊與茶匙" listing merged them with the ginkgo teaspoon, which is sold on its own below.
    { slug: "cloud-coaster", name: t("雲朵杯墊", "Cloud Coaster"), en: "CLOUD COASTER", series: wooden, ids: ["CV-0232"],
      summary: t("一杯茶的旁邊，木紋靜靜相伴。", "Beside a cup of tea, wood grain keeps quiet company."),
      detail: t("雲朵形狀的檜木杯墊，把木質的紋理與自然溫潤的香氣帶到茶杯旁。一組六片，拿起一片感受表面，也觀察每一片的輪廓。", "Cloud-shaped hinoki coasters bring natural wood grain and a gentle aroma to your tea table. Each set includes six pieces; pick one up to feel its surface and trace its softly curved outline."),
      story: { title: t("茶杯旁的木紋", "Wood grain beside the cup"), body: t("手先於目光感受材質。每一次放下茶杯，杯墊表面的紋理與雲朵的輪廓，便一次次回到注意之中。", "Feel the wood beneath your fingers. Each time you set down your cup, the natural grain and cloud-shaped outline invite another moment of attention.") } },
    { slug: "bird-chopstick-rest", name: t("鳥形筷架", "Songbird Chopstick Rest"), en: "SONGBIRD CHOPSTICK REST", series: t("柴燒系列", "Wood-Fired Collection"), ids: ["CV-0256"] /* CV-0248 replaced by scene-bird-rest-gift-box; CV-0239 (birds on a heap of charcoal) removed (user 2026-10-05: 「刪」) */,
      summary: t("讓一雙筷子，有一處停歇。", "Individually handcrafted, with natural variations in color."),
      detail: t("以鳥的輪廓構成筷架。小小一件，在餐具與桌面之間，留下有形的留白。", "A little bird rests between the table and your chopsticks, adding a graceful detail to each place setting and a quiet pause to everyday meals."),
      story: { title: t("餐具之間，一隻鳥", "A bird among the tableware"), body: t("筷子放下時，鳥形的輪廓便與修長的線條相遇。一件小器物改變了桌面的構圖，也讓用餐間的停頓有了可看的細節。", "Set your chopsticks down beside the bird's gently shaped outline. This small piece brings balance to the table and a detail to enjoy between bites.") } },
    { slug: "ginkgo-teaspoon-gift-box", name: t("銀杏茶匙", "Ginkgo Teaspoon"), en: "GINKGO TEASPOON", series: wooden, ids: ["CV-0231", "CV-0234", "CV-0229"],
      summary: t("把一片葉子的形，留在茶席上。", "A hinoki wood teaspoon in the shape of a ginkgo leaf."),
      detail: t("銀杏的輪廓成為茶匙的造型，木紋則為每一次觀看帶來不同細節。以禮盒呈現，收藏一份茶席心意。", "The outline of a ginkgo leaf becomes a hinoki wood teaspoon, with a grain that reveals new details each time you look. Presented in a gift box, it brings a thoughtful touch to the tea table."),
      story: { title: t("一片葉子的轉譯", "A leaf, translated"), body: t("葉形來到茶席。銀杏的輪廓經由茶匙與木質呈現，既可近看造型，也能在取用之間，感受自然形態如何走入生活。", "A ginkgo leaf finds a new form in wood. Look closely at its outline and grain, then enjoy a small expression of nature each time you use it.") } },
    { slug: "wooden-chopsticks", name: t("檜木筷子", "Hinoki Wood Chopsticks"), en: "HINOKI WOOD CHOPSTICKS", series: wooden, ids: ["CV-0227"] /* CV-0245 (birds on charcoal) off the page 2026-10-07 and CV-0243, the same scene, 2026-10-08 (user: 「刪」) */,
      summary: t("從一雙木筷，開始日常的一餐。", "Hinoki Wood Chopsticks · Rest sold separately"),
      detail: t("沿著修長線條看見木質紋理。與鳥形筷架搭配，在餐桌上形成一組安靜的物件。", "Natural wood grain follows the slender lines of these hinoki chopsticks. Pair them with the Songbird Chopstick Rest for a quiet, considered detail at the table."),
      story: { title: t("每日使用的線條", "A line used every day"), body: t("一雙筷子，常在手邊。從修長的外形看到木紋，熟悉的餐具也有可細讀之處；與鳥形筷架一同擺放，便形成餐桌上的小幅構圖。", "Even the most familiar tableware rewards a closer look. Follow the slender shape and natural grain of these chopsticks, then pair them with a bird-shaped rest to create a small composition at the table.") } },
  ];
  // Only facts a buyer needs first (user 2026-10-05). Rows marked Shopify follow the Shopify product descriptions quoted in the
  // English Website Copy Review (2026-10-02); prices stay with the official Taiwan store where known.
  const handWash = { label: t("清潔方式", "Care"), value: t("請輕柔手洗，不可使用洗碗機", "Hand wash gently; not dishwasher safe") };
  const teawareFacts: Record<string, { label: string; value: string }[]> = {
    "prosperity-dessert-stand": [
      { label: t("販售單位", "Contents"), value: t("1 組／盒", "1 set per box") },
      { label: t("材質", "Material"), value: t("紙", "Paper") },
      { label: t("尺寸", "Size"), value: sizeText([29.5, 22, 3.5], lang, "±5%") },
      { label: t("搭配點心紙", "Dessert paper"), value: t("紙＋PE（食品級），12 組／盒；台灣製，符合 ISO 22000 與 HACCP", "Paper + PE (food-contact grade), 12 sets per box; made in Taiwan, ISO 22000 and HACCP compliant") },
      { label: t("使用注意", "Use"), value: t("點心紙僅限常溫、單次使用，請勿加熱；遠離火源，存放於乾燥處", "Dessert paper for room temperature and single use only; do not heat. Keep away from fire and store dry") },
      { label: t("設計", "Design"), value: t("蘇靜媚", "Su Ching-mei") },
    ],
    "bird-chopstick-rest": [
      { label: t("製作", "Making"), value: t("逐件手工塑形與修整，每件色澤與漸層略有不同", "Shaped and finished by hand; color and gradient vary slightly from piece to piece") },
      { label: t("清潔方式", "Care"), value: t("僅限手洗，不可使用洗碗機", "Hand wash only; not dishwasher safe") },
    ],
  };
  const teawareOfficial: Record<string, { price: number; facts: { label: string; value: string }[] }> = {
    "prosperity-dessert-stand": { price: 1880, facts: [] }, // official id 705, 豐盛系列｜豐盛點心盤 (2026-10-05); its facts are above
    "cloud-coaster": { price: 1880, facts: [
      { label: t("販售單位", "Contents"), value: t("6 片／組", "Set of 6 coasters") },
      { label: t("材質", "Material"), value: t("台灣一級檜木", "Taiwan cypress (hinoki), first grade") },
      { label: t("尺寸", "Size"), value: sizeText([8, 10], lang) },
      { label: t("包裝", "Packaging"), value: t("盒蓋表面覆以傳統織布機手工織成的布料", "Box lid covered in fabric handwoven on a traditional loom.") }, // 客戶核准英文（答覆 B8，2026-10-12）：硬質盒蓋外覆手織布，不是整個盒蓋用編織做成
      { label: t("清潔方式", "Care"), value: t("請輕柔手洗，不可使用洗碗機", "Gently hand wash only; not dishwasher safe.") },
    ] },
    "wooden-chopsticks": { price: 680, facts: [
      { label: t("販售單位", "Contents"), value: t("2 雙／組（不含鳥形筷架）", "Set of 2 pairs. Chopstick rest sold separately.") },
      { label: t("材質", "Material"), value: t("台灣一級檜木", "Taiwan cypress (hinoki), first grade") },
      { label: t("尺寸", "Size"), value: `${t("長", "Length")} ${sizeText([23], lang)}` },
      handWash,
    ] },
    "ginkgo-teaspoon-gift-box": { price: 760, facts: [
      { label: t("販售單位", "Contents"), value: t("1 只／盒", "1 per box") },
      { label: t("材質", "Material"), value: t("檜木", "Cypress (hinoki)") },
      { label: t("尺寸", "Size"), value: `${t("長", "Length")} ${sizeText([15.7], lang)}` },
      { label: t("設計", "Design"), value: t("蘇靜媚", "Su Ching-mei") },
      handWash,
    ] },
  };
  // 雲朵杯墊、銀杏茶匙、檜木筷子、鳥形筷架：上線只展示、不販售（客戶答覆 B1–B4，2026-10-12）。teawareOfficial 的台灣售價保留在資料裡備查，但不輸出成 price。
  const displayOnlySlugs = new Set(["cloud-coaster", "ginkgo-teaspoon-gift-box", "wooden-chopsticks", "bird-chopstick-rest"]);
  const teawareProducts: Product[] = tablewareEntries.map((p) => ({
    slug: p.slug, category: (p.series === prosperity ? "abundance" : p.slug === "bird-chopstick-rest" ? "wood-fired" : "scents") as CategoryId, name: p.name, english: p.en, summary: p.summary, description: p.detail,
    image: gallery(p.ids[0], p.name), views: p.ids.map((id, i) => ({ label: i ? t(`細節 ${i}`, `Detail ${i}`) : t("商品全貌", "Full view"), image: gallery(id, p.name) })),
    facts: [
      { label: t("系列", "Series"), value: p.series },
      ...(teawareOfficial[p.slug]?.facts ?? []),
      ...(teawareFacts[p.slug] ?? []),
    ],
    ...(displayOnlySlugs.has(p.slug) ? { displayOnly: true, soldOut: true /* user 2026-10-13: 「這幾個商品改為售完，並加入售完標籤」 */ } : teawareOfficial[p.slug] ? { price: { amount: teawareOfficial[p.slug].price, currency: "TWD" as const } } : {}),
    story: { title: p.story.title, body: p.story.body, image: p.ids[1] ? gallery(p.ids[1], p.name) : undefined },
  }));

  const studioLabel = t("棚拍商品照", "Studio photograph");
  const studioAlt = (name: string) => t(`${name}・棚拍商品照`, `${name}, studio photograph`);
  // User 2026-10-12: real HD front photographs on the site's pale grey studio ground, in the SECOND slot; covers stay unchanged.
  // Later the same day (「統一商品圖中禮盒的大小…4張圖要視覺上是一樣大的」「圖二的俯視圖…放大，並加入一點淡淡的陰影」「圖三…不要大到出血」
  // 「統一4張背景圖的漸層灰色，不要有的偏黃，有的偏紅」): every tea gift box gallery photograph has an `-even2` copy, re-composed from the
  // original pixels (not regenerated) on one neutral grey gradient #e8e7e5 → #dbdad8, the box scaled to the same visible area, its shadow
  // kept and the HD fronts given a faint one. `-even2` (same evening, 「俯視圖的陰影都太假了」「這張陰影也不行」): the fronts' shadow no longer
  // ends at a hard rectangle, and cast shadows are no longer mistaken for the box. Originals stay beside them; the script and contact sheets are in docs/qa/2026-10-12-gift-gallery-even.
  const evenGallery = new Set(evenGalleryFiles);
  const studioImage = (file: string, alt: string): Img => evenGallery.has(file)
    ? site(file.replace(/\.webp$/, "-even2.webp"), alt)
    : { ...site(file, alt), ...(file.startsWith("official-gift-front-") ? { cutout: true } : {}) };
  // Homepage featured grid: studio shots generated 2026-09-30 in the white bag's language (output/featured-editorial-2026-09-30).
  const featuredFiles: Record<string, string> = {
    // ginkgo: the 896 px featured shot filled the frame (user 2026-10-05: 「太滿，縮小一點商品的比例」); the 2K cover is used everywhere (v5: the product about 64 % of the width, after 「再大一點」)
    "reunion-paulownia-gift-box": "featured-reunion-paulownia-gift-box.webp",
    // bird-chopstick-rest: featured-bird-chopstick-rest-55.webp is now its cover everywhere (studio-listing.json; user 2026-10-05: 「所有這個商品都統一用這張當封面」)
  };
  const withShopify = (p: Product): Product => {
    const m = (shopifyMap as Record<string, { handle: string; variantId: string } | string>)[p.slug];
    const f = featuredFiles[p.slug] ? site(featuredFiles[p.slug], studioAlt(p.name)) : undefined;
    const q = f ? { ...p, featuredImage: f, views: p.views.some((v) => v.image.src === f.src) ? p.views : [...p.views, { label: studioLabel, image: f }] } : p;
    return typeof m === "object" && (m.handle || m.variantId) ? { ...q, shopify: m } : q;
  };
  // 2026-10-01 (user, later the same day): 「所有的商品清單都用淺色背景那張為封面，hover 時才出現情境照」 and, on the product page,
  // 「這區塊統一用淺色背景那張放不同視角的圖，其他情境照都用雜誌排版風格在下面」. So every product is split in two:
  //   views  = studio photographs on the light warm-grey ground (scripts/studio-listing.mjs), all 4:5 — the gallery and the cover;
  //   scenes = everything photographed in a setting — the hover image of the card and the magazine spread under the gallery.
  // The scene that used to be the cover leads the scenes.
  const listingScene: Record<string, string> = {
    "braided-leather-bag-blue": "CV-0423", "braided-leather-bag-pink": "CV-0424",
    "pearl-chain-goldfish-earrings": "CV-0377", "diamond-goldfish-stud-earrings": "CV-0376",
  };
  // the bird rest leads with the white CHARMVILLA box and a budding branch, regenerated in the oak-table scene's light
  // (user 2026-10-05: 「重新算這張圖，攝影風格依照剛才的筷架情境照」 for CV-0248)
  const listingSceneSite: Record<string, Img> = {
    // 白包的沙發人物情境：棕色皮沙發換成橄欖綠毛圈布沙發（使用者 2026-10-06：「這2張換」）
    "braided-leather-bag-white": site("scene-white-bag-olive-sofa-woman.webp", t("棕色西裝的女子靠坐在橄欖綠毛圈布沙發上，手握白色編織提把皮革包的提把，包放在坐墊上", "A woman in a brown blazer leans back on an olive bouclé sofa, holding the braided handle of the white Braided Leather Bag as it rests on the seat"), 1792, 2240),
    // a new lifestyle scene (user 2026-10-05: 「我現在要做豐盛點心盤的生品情境照」): the stand with a few petits fours and goldfish tea on an oak table, olive sofa in front
    // v3 (user 2026-10-05): the bottom tier widened to the real piece's 38 : 71 : 100 and the painting navy; v2: an orange wall, a white gold-rimmed cup, a piped-cream tartlet, a fiddle-leaf fig
    "prosperity-dessert-stand": site("scene-dessert-stand-oak-table-tea-v3.webp", t("燒橘色牆面的溫暖客廳，牆上一幅海軍藍的畫，橡木圓桌上的豐盛點心盤擺著幾樣小點心，旁邊一杯白瓷金邊杯泡的小金魚茶，後方是琴葉榕，前景是橄欖綠毛圈沙發", "In a warm room with a burnt-orange wall and a navy painting, the Abundance Dessert Tray on a round oak table with a few petits fours, goldfish tea in a white gold-rimmed cup, a fiddle-leaf fig behind and an olive bouclé sofa in front"), 1792, 2240),
    "bird-chopstick-rest": site("scene-bird-rest-gift-box-v2.webp", t("白色禮盒上的一隻鳥形筷架", "A Songbird Chopstick Rest on a white CHARM VILLA gift box"), 1688, 2110) /* levelled 2.5° (user 2026-10-05: 「修正照片的水平線」) */,
  };
  // 2026-10-01 evening (user, with a screenshot of the white bag page: 「刪」): the two ink-green scenes — the figure looking back
  // (scene-white-bag-over-shoulder-ink-green) and the bag in the air on ink green (gallery CV-0450) — are off the site; the files
  // are in the git history. The white bag's scenes now lead with the bag in the air on Morandi sage.
  // 白包懸空照已拿掉（使用者 2026-10-06：「刪」），目前沒有排在主圖後面的情境照
  const sceneAfterLead: Record<string, Img[]> = {};
  // 2026-10-01 (user: 「先幫我把目前有的都放上官網」): scenes that follow a product's existing scenes.
  const sceneExtra: Record<string, Img[]> = {
    // the brand's own photographs from the asset library (user 2026-10-02: 「更多的官網素材可以從這個網站抓」), two angles the page did not have yet
    "bird-chopstick-rest": [site("scene-bird-rest-tray-closeup.webp", t("檜木筷子擱在鳥形筷架上", "Hinoki Wood Chopsticks resting on a Songbird Chopstick Rest"), 2040, 1360) /* CV-0240 re-staged on the oak scene's tray (2026-10-05) */, site("scene-oak-table-bird-rests.webp", t("托盤上的鳥形筷架與檜木筷子", "Songbird Chopstick Rests and Hinoki Wood Chopsticks on a tray"), 1792, 2240)],
    "braided-leather-bag-pink": [// v3 (user 2026-10-02: the painting and the foreground changed — a deep-blue field painting, an olive bouclé ottoman with a
    // tray, a glass of goldfish tea on a cloud coaster; the bag and chair untouched)
    site("scene-pink-bag-armchair-olive-v2.webp", t("編織提把皮革包・粉紅色，放在橄欖綠布面單椅上；背後是橘色色塊的畫，前景橡木小邊几上一杯小金魚茶與 CHARM VILLA 茶標", "Braided Leather Bag in pink on an olive bouclé armchair; an orange field painting behind, and on an oak side table in front a glass of goldfish tea with its CHARM VILLA tag"), 1760, 2336)],
    // 客廳照（橄欖綠扶手椅、芥末黃躺椅、團圓桐木盒）已從粉紅包頁拿掉（使用者 2026-10-06：「刪」），團圓桐木木盒頁仍保留
  };
  // the twin-earring portrait on a mustard sofa (user 2026-10-05: 「加入對應的商品圖」): the twin earrings, the blue bag and the cloud coaster are all in it
  // 參考 9 張包款廣告照的拍法生成的人物情境照，臉只露到唇下（使用者 2026-10-06：「這2個放上官網商品內容頁」）
  sceneExtra["braided-leather-bag-white"] = [...(sceneExtra["braided-leather-bag-white"] ?? []), site("scene-white-bag-walking-tobacco.webp", t("身穿菸草棕針織衫與寬褲的女子走過米白灰泥牆，手提白色編織提把皮革包，午後陽光把包的影子投在牆上", "A woman in a tobacco-brown knit and wide trousers walks past an off-white plaster wall, the white Braided Leather Bag in her hand, late sun casting its shadow on the wall"), 1792, 2240)];
  // 粉紅包手提行走：象牙白細條紋襯衫與寬褲，參考使用者的手提姿勢（使用者 2026-10-06：「放上官網」）
  sceneExtra["braided-leather-bag-pink"] = [...(sceneExtra["braided-leather-bag-pink"] ?? []), site("scene-pink-bag-olive-sofa-tea-tray.webp", t("一隻手提著粉紅色編織提把皮革包，斜射的暖陽落在橄欖綠絨布沙發上；前景木邊几的托盤裡，一杯小金魚茶放在雲朵杯墊上，旁邊是 CHARM VILLA 茶標", "A hand holds the pink Braided Leather Bag by its handle in slanting warm sun over an olive velvet sofa; on the tray of the wooden side table in front, a cup of goldfish tea on a cloud coaster beside its CHARM VILLA tag"), 1360, 1700)];
  // 藍包肩背近拍：暖灰羊毛西裝配象牙白絲質圍巾，斜射陽光切過包蓋（使用者 2026-10-06）
  sceneExtra["braided-leather-bag-blue"] = [...(sceneExtra["braided-leather-bag-blue"] ?? []), site("scene-blue-bag-shoulder-taupe-blazer-wide.webp", t("暖灰色寬肩羊毛西裝外套與象牙白絲質圍巾的女子側身站立，土耳其藍色編織提把皮革包背在肩上、貼著身側，斜射的陽光灑在淡紫灰的牆面上", "A woman in a taupe oversized wool blazer and an ivory silk scarf stands in profile, the turquoise Braided Leather Bag on her shoulder, slanting sun across a pale mauve wall"), 1520, 2688)];
  // 團圓繽紛紙盒：橄欖綠毛圈沙發旁的核桃木桌上，禮盒、茶包袋、茶葉與玫瑰花苞、右邊出血的玻璃杯小金魚茶（Nano Banana 2.1 v4，
  // 桌面「金魚商品圖」裡使用者 2026-10-07 挑的那張：「大圖換成我剛剛挑的那張」；關於頁 01 也是同一張，各存一份）。
  // 它取代了橘牆圓桌的版本（scene-reunion-paper-gift-box-olive-sofa-orange-wall，PNG 留在桌面「金魚商品圖」），更早是直接上架的使用者照片
  // （腰封上的 M 壞掉）與深咖啡枯木那張（scene-reunion-paper-gift-box-driftwood.webp，使用者：「刪」；檔案留著，首頁茶葉禮盒的格子還在用）
  // 團圓（美國版）曾有第二張情境照：先是 gallery CV-0445「金色禮盒與小金魚茶包｜木桌光影」（使用者 2026-10-07：「用這張情境圖」），
  // 2026-10-08 換成胡桃木圓桌的直式新場景（scene-reunion-gift-box-us-walnut-olive-chair-portrait），同日使用者看了說「這張不對，刪」——
  // 已移除（留在 git 歷史）。橘盒的橄欖綠沙發照（scene-reunion-paper-gift-box-olive-sofa-pouch.webp）只留給首頁輪播
  // 兩人喝茶的氛圍照（黑橡木圓桌、畫冊、兩杯玻璃杯小金魚茶；Nano Banana 2.1，照使用者給的五張攝影風格參考生成）：每個茶葉禮盒商品頁的
  // 情境照最後一張（使用者 2026-10-07：「放到情境照」「商品內容頁」）
  const twoPeopleTea = site("scene-two-people-tea-black-oak-table.webp", t("兩個人一起享用小金魚茶", "Two people sharing goldfish tea"), 1856, 2304);
  // 雙手捧米白斑點陶杯的小金魚茶照（Nano Banana 2.1，照使用者的參考照光影加入茶包）：和兩人喝茶照一起是每個茶葉禮盒商品頁共用的最後
  // 兩張情境照，兩張都以小圖呈現 — 頁尾「兩小一大」的那兩張小圖，大圖是該款自己的情境照（使用者 2026-10-08：「這張加入所有茶類的內容頁」,
  // 「我想要每一個茶葉禮盒這２張共用，而且都是小圖呈現」）；春曉的故事照也是它，去重
  const handsMug = site("scene-hands-speckled-mug-goldfish-tea-warm-light.webp", t("雙手捧著一杯泡開的小金魚茶", "Two hands holding a cup of brewed goldfish tea"), 1856, 2304);
  for (const s of ["reunion-paper", "spring-dawn", "winter-blossom", "orchid", "purple-butterfly", "kyoto", "year-of-plenty", "blossoming-prosperity", "christmas", "snowflake"]) sceneExtra[`${s}-gift-box`] = [...(sceneExtra[`${s}-gift-box`] ?? []), twoPeopleTea, handsMug];
  // 蝴蝶蘭：兩人在橄欖綠扶手椅旁對飲、杯中各有小金魚茶包，禮盒是焦點（使用者 2026-10-13 選定：「上情境」）
  sceneExtra["orchid-gift-box"] = [...(sceneExtra["orchid-gift-box"] ?? []), site("scene-orchid-gift-box-two-friends-tea.webp", t("兩個人在扶手椅旁享用小金魚茶，桌上是粉紅色蝴蝶蘭禮盒", "Two people enjoying goldfish tea by the armchairs, the pink Royal Orchid gift box on the table"), 2784, 3456)];
  // 雪花三盒組：照紫斑蝶沙發照的構圖，三盒同斜角（使用者 2026-10-13）
  sceneExtra["snowflake-gift-box"] = [...(sceneExtra["snowflake-gift-box"] ?? []), site("scene-snowflake-gift-box-olive-sofa-pouch-gold-seal-v3.webp", t("胡桃木邊桌上的三盒聖誕心意禮，旁邊是茶包與一杯小金魚茶", "Three Christmas Charming Gift boxes on a walnut side table, with a tea pouch and a cup of goldfish tea"), 2784, 3456)];
  // 春曉：藍色與粉紅盒蓋並列的窗光照（使用者 2026-10-13：「幫我生一張 春曉 的雙封面情境照/heroimage」，4K）
  sceneExtra["spring-dawn-gift-box"] = [...(sceneExtra["spring-dawn-gift-box"] ?? []), site("scene-spring-dawn-gift-box-blue-pink-sunbeam.webp", t("陽光下並列的藍色與粉紅色盒蓋春曉禮盒，旁邊是一杯小金魚茶", "Spring Awakening gift boxes with blue and pink lids side by side in the sun, beside a cup of goldfish tea"), 2784, 3456)];
  // 蝴蝶蘭：金色與粉紅盒蓋並列的情境照（使用者 2026-10-13：「一次擺2種顏色封面的禮盒示意」/luxuryshot；窗光、木桌、背景柔焦植物、盒子加厚、4K）
  sceneExtra["orchid-gift-box"] = [...(sceneExtra["orchid-gift-box"] ?? []), site("scene-orchid-gift-box-gold-pink-sunbeam.webp", t("陽光下並列的金色與粉紅色盒蓋蝴蝶蘭禮盒，旁邊是一杯小金魚茶", "Royal Orchid gift boxes with gold and pink lids side by side in the sun, beside a cup of goldfish tea"), 2784, 3456)];
  // 聖誕佳禮：酒紅牆斜窗光的情境照（使用者 2026-10-13 給三張聖誕參考圖「/lifestyleshot」；Nano Banana 2.1）成為頁尾那組的大圖
  sceneExtra["christmas-gift-box"] = [...(sceneExtra["christmas-gift-box"] ?? []), site("scene-christmas-gift-box-burgundy-sunbeam.webp", t("兩色盒蓋的聖誕禮盒（限量版）與一杯小金魚茶", "Christmas Giftbox (Limited Edition) in both lid colors with a cup of goldfish tea"), 1856, 2304)];
  // 年年有魚：米白圓桌斜陽照（禮盒無緞帶、青瓷咖啡杯裡泡開的小金魚、尤加利，標籤藏在杯後；Nano Banana 2.1，照使用者給的 EAU 書那張的色調）放進商品頁，
  // 排在共用的兩張之後、成為頁尾那組的大圖（使用者 2026-10-08：「放入內容頁」，之後「右取代左」——胡桃木桌白瓷杯金標籤那張換成這張）
  sceneExtra["year-of-plenty-gift-box"] = [...(sceneExtra["year-of-plenty-gift-box"] ?? []), site("scene-year-of-plenty-cream-table-sun-celadon-cup.webp", t("年年有魚禮盒與一杯小金魚茶", "The Abundance & Prosperity gift box with a cup of goldfish tea"), 1856, 2304)];
  // 春曉：手持玻璃杯的俯角照（胡桃木桌、打開的畫冊、橄欖綠沙發；Nano Banana 2.1，照使用者給的三張編輯攝影參考——暖斜光、淺景深、手入鏡——
  // 延續全站風格）放進商品頁，排在共用的兩張之後、成為頁尾那組的大圖（使用者 2026-10-08：「高度學習這幾張圖，並延續全站的攝影風格，重新生成一張…
  // 的商品圖」，兩版中選了亮光的第一版：「放進商品說明頁」）
  sceneExtra["spring-dawn-gift-box"] = [...(sceneExtra["spring-dawn-gift-box"] ?? []), site("scene-spring-dawn-gift-box-hand-glass-cup-book-walnut.webp", t("春曉禮盒與雲朵杯墊上的一杯小金魚茶", "The Spring Awakening gift box with goldfish tea on a Cloud Coaster"), 1856, 2304)];
  // 橄欖綠沙發旁的核桃木桌那張（盒子已換成松針盒）也放進商品頁，排在木桌光影之後（使用者 2026-10-07：「放上商品圖的內容頁」）
  sceneExtra["reunion-paper-gift-box"] = [...(sceneExtra["reunion-paper-gift-box"] ?? []), site("scene-reunion-gift-box-us-olive-sofa-pouch.webp", t("團圓禮盒與一杯小金魚茶", "The Joyful Reunion gift box with a glass of goldfish tea"), 1856, 2304)];
  // 藍色包放在橄欖綠扶手椅上的客廳，橘色系的畫、藤編茶几（使用者 2026-10-06：「放進商品內容頁（要大張）」）
  sceneExtra["braided-leather-bag-blue"] = [...(sceneExtra["braided-leather-bag-blue"] ?? []), site("scene-blue-bag-olive-armchair-rattan.webp", t("暖色客廳一角，橄欖綠毛圈布扶手椅上靠著藍色編織提把皮革包；牆上是橘色系的抽象大圓弧畫，椅子左邊是一張藤編茶几", "A warm corner of a living room: the blue Braided Leather Bag rests on an olive bouclé armchair, an orange arched abstract painting on the wall and a woven rattan side table to the left"), 1520, 2688)];
  // 白包肩背近拍：深藍薄紗襯衫、側光照出荔枝紋（使用者 2026-10-06：「放上官網」）
  // 橘牆、橄欖綠沙發、藤編茶几與冒煙的熱茶；女子從鼻子一半往下裁切，不露出眼睛（使用者 2026-10-06）
  sceneExtra["braided-leather-bag-white"] = [...(sceneExtra["braided-leather-bag-white"] ?? []), site("scene-white-bag-orange-wall-olive-sofa.webp", t("赭橘色牆前，棕色西裝的女子靠坐在橄欖綠毛圈布沙發上，手握白色編織提把皮革包的提把，沙發旁的藤編茶几上一杯冒著熱氣的茶；畫面從鼻子一半往下", "Before an ochre wall a woman in a brown blazer sits on an olive bouclé sofa, a hand on the braided handle of the white Braided Leather Bag; a steaming cup of tea on the woven rattan table beside her. The frame starts halfway down the nose"), 1360, 1513)];
  sceneExtra["braided-leather-bag-white"] = [...(sceneExtra["braided-leather-bag-white"] ?? []), site("scene-white-bag-olive-velvet-chair.webp", t("暗暖光線下，白色編織提把皮革包放在橄欖綠絲絨扶手椅的坐墊上，荔枝紋顆粒、側邊銅色金屬棒與編織提把都清楚可見", "In low warm light the white Braided Leather Bag rests on the seat of an olive velvet armchair, the lychee grain, the brass bars at the sides and the braided handle in sharp detail"), 1360, 2048)];
  sceneExtra["braided-leather-bag-blue"] = [...(sceneExtra["braided-leather-bag-blue"] ?? []), site("scene-blue-bag-shoulder-oatmeal-coat.webp", t("穿燕麥色羊毛大衣的女子側身回望，藍色編織提把皮革包背在肩上、貼著身側", "A woman in an oatmeal wool coat glances back over her shoulder, the blue Braided Leather Bag worn on her shoulder close to her side"), 1792, 2240)];
  for (const slug of ["twin-goldfish-earrings", "braided-leather-bag-blue", "cloud-coaster"]) sceneExtra[slug] = [...(sceneExtra[slug] ?? []), site("scene-twin-earring-profile-mustard-sofa.webp", t("金髮女子靠在芥末黃毛圈沙發上的側臉，耳垂上戴著雙星小金魚耳環；小邊桌上雲朵杯墊承著一杯小金魚茶，旁邊是藍色編織提把皮革包", "A blonde woman in profile on a mustard bouclé sofa, wearing the Twin Goldfish Earrings; on a side table a glass of goldfish tea on a Cloud Coaster beside the blue Braided Leather Bag"), 1792, 2240)];
  // a second dessert-tray scene: a desert lounge with a larger marble table (user 2026-10-05)
  // a third: a fireplace lounge at night, after the user's hotel afternoon-tea references (2026-10-05); flutes, teapot and jars removed, the tray at true size; v2 stands it on the tabletop, further right (user: 「應該在桌面上，不要往上浮，並右移」)
  sceneExtra["prosperity-dessert-stand"] = [...(sceneExtra["prosperity-dessert-stand"] ?? []), site("scene-dessert-stand-fireplace-lounge-v2.webp", t("夜晚的酒廊，大理石層架與壁爐火光前，深色桌上的豐盛點心盤擺著幾樣精緻小點心，旁邊一杯紅茶、巧克力與閃電泡芙", "A lounge at night, backlit marble shelves and a fire behind: on a dark table the Abundance Dessert Tray with a few refined petits fours, a cup of tea, chocolates and an éclair"), 1792, 2240)];
  sceneExtra["prosperity-dessert-stand"] = [...(sceneExtra["prosperity-dessert-stand"] ?? []), site("scene-dessert-stand-marble-desert-lounge.webp", t("落地玻璃窗外是陽光下的沙漠與金合歡樹，暖白大理石圓桌上的豐盛點心盤擺著幾樣小點心，旁邊是玻璃茶壺與白瓷茶杯，前景是干邑色皮椅", "Beyond a glass wall, a sunlit desert and an acacia; on a round warm-white marble table the Abundance Dessert Tray with a few petits fours, a glass teapot and a white cup, cognac leather chairs in front"), 1792, 2240)];
  // Interior scenes of the wooden tableware (user-approved 2026-10-01, gallery CV-0447 / CV-0448, output/wooden-goods-interior-scenes-2026-10-01):
  // they lead the scenes of the pieces they show.
  // 2026-10-02 (user: 「這張商品的情境照要換室內擺飾…喜歡他光影的呈現」, logos where the real pieces carry them): a new sunlit interior
  // replaces the black tray table by the sofa (scene-wooden-tray-table-sofa.webp, still in git).
  const woodenSofa = site("scene-wooden-interior-sunlit.webp", t("陽光下的雲朵杯墊與銀杏茶匙", "The Cloud Coaster and Ginkgo Teaspoon in sunlight"), 1792, 2240);
  const woodenCloseup = site("scene-wooden-tray-table-closeup-v2.webp", t("檜木筷子擱在鳥形筷架上，旁邊是雲朵杯墊", "Hinoki Wood Chopsticks on a Songbird Chopstick Rest beside a Cloud Coaster"));
  // after the user's coffee-table reference (2026-10-02: the vase and a book 換 our pieces, plus a cup of goldfish tea, the tag correct)
  const coffeeTable = site("scene-coffee-table-tea-coasters-tagfix.webp", t("雲朵杯墊上的小金魚茶，旁邊是銀杏茶匙", "Goldfish tea on a Cloud Coaster beside the Ginkgo Teaspoon"), 1792, 2240);
  // the tray table by the olive sofa, box, coaster and spoon engraved CHARMVILLA (user 2026-10-05: 「換剛剛那張」 on the spoon's
  // ottoman photograph, which stays in the repo)
  const traySofa = site("scene-wooden-tray-table-sofa-v4.webp", t("雲朵杯墊與銀杏茶匙放在托盤邊几上", "The Cloud Coaster and Ginkgo Teaspoon on a tray table"), 1376, 2048);
  const sceneLead: Record<string, Img[]> = {
    // the only scene of the Raw Gold earring, so its listing card has a hover image too. The user's chosen model (dark green
    // satin), the goldfish outline taken from the brand's own silhouette, matte gold generated
    // (output/raw-gold-earring-scene-2026-10-01/v4-official-outline, approved 2026-10-01).
    // Every earring's hover image in the drop earring's language (user 2026-10-02: 「金飾系列的 hover 圖都參考這個，黑白背景，金飾彩色」;
    // people after the user's references, never facing the camera, faces invented): black and white, only the piece in colour.
    // The earring is generated on the sitter, never pasted on (user 2026-10-02: 「飾品真戴在圖裡面…不要分開處理」).
    "pearl-chain-goldfish-earrings": [site("scene-pearl-chain-goldfish-earrings-profile-bw-v2.webp", t("黑白照片，長髮女子一手扶著後頸，耳垂上的珍珠長鏈小金魚耳環是唯一的彩色", "Black-and-white photograph of a woman with long hair, a hand at the nape of her neck; the Pearl Chain Goldfish Earring is the only color"), 1792, 2240)],
    "diamond-goldfish-stud-earrings": [site("scene-diamond-goldfish-stud-earrings-profile-bw-v2.webp", t("黑白照片，短黑髮女子側頭低眼，耳垂上的鑽石小金魚耳釘是唯一的彩色", "Black-and-white photograph of a woman with short black hair, head turned and eyes lowered; the diamond goldfish stud is the only color"), 1792, 2240)],
    "twin-goldfish-earrings": [site("scene-twin-goldfish-earrings-profile-bw-v2.webp", t("黑白側臉照片，金髮綁馬尾的女子手撫後頸，耳垂上的雙魚小金魚耳環是唯一的彩色", "Black-and-white profile of a blonde woman with a ponytail, a hand at the nape of her neck; the Twin Goldfish Earring is the only color"), 1792, 2240)],
    "raw-gold-goldfish-earrings": [site("scene-raw-gold-goldfish-earrings-profile-bw-v3.webp", t("黑白側臉照片，低髮髻的女子坐在沙發邊平視前方，耳垂上的璞金小金魚耳釘是唯一的彩色", "Black-and-white profile of a woman with a low bun seated at the edge of a sofa, looking ahead; the Raw Gold goldfish earring is the only color"), 1792, 2240),
      site("scene-raw-gold-earring-model.webp", t("璞金小金魚耳環配戴在耳垂上，霧面金，墨綠緞面", "Raw Gold goldfish earring worn on the earlobe, matte gold, against dark green satin"))],
    // black-and-white profile, only the earring in colour (user 2026-10-02: 側臉、黑白照片，只有耳環是彩色); a new image, the face
    // invented, generated with the site's own photograph of the earring as reference
    // the bezel: the brand's CV-0371 turned black and white with only the earring kept in colour (2026-10-05, no generation)
    "diamond-bezel-goldfish-earrings": [site("scene-diamond-bezel-goldfish-earring-profile-bw.webp", t("黑白側臉照片，閉眼的女子在布幔之間，耳垂上的包鑲吐鑽小金魚耳環是唯一的彩色", "Black-and-white profile of a woman with closed eyes between drapes; the bezel-set diamond goldfish earring is the only color"), 1920, 2400)],
    "diamond-goldfish-earrings": [site("scene-diamond-goldfish-earring-profile-bw.webp", t("黑白側臉照片，閉眼的短髮女子，耳垂上的鑽石垂墜小金魚耳環是唯一的彩色", "Black-and-white profile of a short-haired woman with her eyes closed; the diamond goldfish drop earring on her lobe is the only color"), 1792, 2240)],
    "cloud-coaster": [coffeeTable, woodenSofa, woodenCloseup], "ginkgo-teaspoon-gift-box": [traySofa, woodenSofa, coffeeTable],
    "wooden-chopsticks": [woodenCloseup], // off the bird page (user 2026-10-05: 「刪」)
  };
  // 每款茶葉禮盒的第一張情境照（也是卡片的 hover 圖）統一照團圓的 scene-reunion-gift-box-us-olive-sofa-pouch：橄欖綠毛圈沙發旁的核桃木桌、
  // 盒子平放、金色茶包袋靠著盒子、幾粒茶葉與玫瑰花苞、右下角玻璃杯小金魚茶出血；各款以團圓那張為場景參考、自己核准的封面圖為盒子參考
  // 生成（Nano Banana 2.1，1856 × 2304；使用者 2026-10-08：「每一個茶禮盒第一張情境圖都用這個模式，hover 也是這張」「幫我把沒有的補完」）
  for (const [slug, zh, en] of [
    ["spring-dawn", "春曉禮盒", "the Spring Awakening gift box"],
    ["winter-blossom", "暮雪禮盒", "the Snowy Twilight gift box"],
    ["orchid", "蝴蝶蘭禮盒", "the Royal Orchid gift box"],
    ["purple-butterfly", "紫斑蝶禮盒", "the Sapphire Wings gift box"],
    ["kyoto", "京都職人手作禮盒", "the Kyoto Artisanal Reserve gift box"],
    ["year-of-plenty", "年年有魚禮盒", "the Abundance & Prosperity gift box"],
    ["blossoming-prosperity", "花開富貴禮盒", "the Prosperity in Bloom gift box"],
  ] as const) sceneLead[`${slug}-gift-box`] = [site(`scene-${slug}-gift-box-olive-sofa-pouch${slug === "purple-butterfly" ? "-v2" /* tab retouched 2026-10-14 */ : ""}.webp`, t(`${zh}與一杯小金魚茶`, `${en[0].toUpperCase()}${en.slice(1)} with a glass of goldfish tea`), 1856, 2304), ...(sceneLead[`${slug}-gift-box`] ?? [])];
  // Further studio views beside the front view: the bags' three-quarter view. No near-duplicates in a product's gallery: the
  // earrings' close photographs repeated the front view, so each earring keeps only its better shot (user 2026-10-02: 「這個位置的圖
  // 不要重複，挑一張品質比較好的保留就好」) — the 2000 px studio front for the pearl, diamond and twin earrings, and the front view for
  // Raw Gold too (2026-10-05: 「比例太大，應該要跟其他金飾視覺上是一樣大」; the close view had replaced it on 2026-10-01).
  const studioExtra: Record<string, { file: string; zh: string; en: string; enAlt: string; placeholder?: boolean }[]> = {
    // the cover is now the set with its dessert-paper folder and gold box on the listing ground (user 2026-10-05: 「豐盛系列的商品大圖用這個去改淺灰背景」);
    // the tray on its own follows (the earlier CV-0120 set view was the same arrangement, so it is not repeated)
    "prosperity-dessert-stand": [{ file: "studio2k-prosperity-dessert-stand-v2.webp", zh: "點心盤", en: "The tray", enAlt: "the three-tier tray on its own" }],
    // the brand's own photograph of the box, straight on, on the same light floor (asset library 2400 px cut-outs, 2026-10-02:
    // 「更多的官網素材可以從這個網站抓」); the generated three-quarter view stays the cover
    ...Object.fromEntries(["purple-butterfly", "year-of-plenty", "winter-blossom", "kyoto", "blossoming-prosperity"].map((s) => [`${s}-gift-box`, [{ file: `studio-${s}-gift-box-official.webp`, zh: "官方商品照", en: "Official photograph", enAlt: "official photograph" }]])),
    "braided-leather-bag-white": [{ file: "studio-braided-leather-bag-white-angle-hd.webp", zh: "斜側面", en: "Three-quarter view", enAlt: "three-quarter view" }],
    "braided-leather-bag-blue": [{ file: "studio-braided-leather-bag-blue-angle-hd.webp", zh: "斜側面", en: "Three-quarter view", enAlt: "three-quarter view" }],
    "braided-leather-bag-pink": [{ file: "studio-braided-leather-bag-pink-angle-hd-v2.webp", zh: "斜側面", en: "Three-quarter view", enAlt: "three-quarter view" }],
  };
  // 茶葉禮盒：依盒內數量，縮圖最後一張放「打開盒子看數量」的開箱圖（使用者 2026-10-06：「像真皮包一樣」；有官方正面圖的，正面圖在前、開箱圖放最後）
  for (const [n, slugs] of [[12, ["reunion-paper", "reunion-paulownia", "spring-dawn", "winter-blossom"]], [18, ["year-of-plenty", "blossoming-prosperity", "spring-blossoms", "orchid", "purple-butterfly", "full-moon-tea"]]] as const) {
    for (const s of slugs) studioExtra[`${s}-gift-box`] = [...(studioExtra[`${s}-gift-box`] ?? []), { file: n === 12 ? "gift-box-unboxed-12-v2.webp" /* 透視校正版（使用者 2026-10-06） */ : `gift-box-unboxed-${n}.webp`, zh: `開箱・${n} 入`, en: `Unboxed · ${n} tea bags`, enAlt: `the box opened to show ${n} gold tea bags in neat rows` }];
  }
  // The six boxes whose cover is regenerated from the brand's photographs (~/Desktop/金魚商品圖/小金魚茶包 Goldfish Shaped Tea Bags) show two
  // beige placeholder views after it until their other photographs are chosen (user 2026-10-07: 「重生商品圖的那張，其他先用米黃色塊取代表示要再挑圖」);
  // the official photograph and the generic unboxed view are off these pages for now. 京都版 has no material in the folder and keeps its views.
  // The second view is the box at an angle on the gradient grey ground, with NO ribbon (user 2026-10-07, with two store photographs:
  // 「參考這兩張實際商品照，推理目前所有禮盒的第二張圖…都不用緞帶」; Nano Banana 2.1 from each box's approved cover); the third is still 缺圖
  // 京都版的第三張：紙盒打開、6 包金色茶包袋 2 欄 3 排（Nano Banana 2.1，照使用者 2026-10-07 的開盒實拍；「生成京都版的第三張商品圖」）
  studioExtra["kyoto-gift-box"] = [...(studioExtra["kyoto-gift-box"] ?? []), { file: "studio-kyoto-gift-box-unboxed-6-v3.webp" /* the user's retouched version (2026-10-13: 「可 發布 demo2」) on the site grey */, zh: "開箱・6 入", en: "Unboxed · 6 tea bags", enAlt: "the paper box opened, its lid folded back, six gold tea bags in two columns" }];
  // The third view is the opened box with the right number of gold pouches — 12 in the long boxes, 18 in the square ones (user 2026-10-07:
  // 「這 2 張分別放入有符合該對應數量的茶包數的禮盒，放在第三張商品圖」; the two unboxed photographs from 2026-10-06).
  for (const [n, slugs] of [[12, ["spring-dawn", "winter-blossom"]], [18, ["orchid", "purple-butterfly", "year-of-plenty", "blossoming-prosperity"]]] as const) {
    for (const s of slugs) studioExtra[`${s}-gift-box`] = [
      // 12 入：從近端短邊斜上方看的角度，「沒有」腰封（使用者 2026-10-07 先說「12 入的商品都參考這個形式生成第二張商品圖」，
      // 之後說「新修的都不需要腰帶」；Nano Banana 2.1 拿腰封版當底、附核准封面，只把腰封拿掉；腰封版留在 git 歷史裡）
      // 18 入：斜角、無緞帶
      n === 12
        ? { file: `studio-${s}-gift-box-end-angle.webp`, zh: "斜角", en: "Angled view", enAlt: "the box closed, seen from its short end at an angle, without its band" }
        : { file: `studio-${s}-gift-box-angle-v2.webp`, zh: "斜角", en: "Angled view", enAlt: "the box closed, seen at an angle, without its ribbon" },
      { file: n === 12 ? "gift-box-unboxed-12-v2.webp" : "gift-box-unboxed-18.webp", zh: `開箱・${n} 入`, en: `Unboxed · ${n} tea bags`, enAlt: `the box opened to show ${n} gold tea bags in neat rows` },
    ];
  }
  // 團圓（美國版 Joyful Reunion）：三張商品圖照 Shopify 的照片重生（docs/reference/reunion-us-shopify-box.jpg：桐木盒、芥末黃亞麻盒蓋、土耳其藍刺繡金魚、
  // 金線 CHARM VILLA、四角淡綠松針、金色拉片、沒有腰封；使用者 2026-10-07：「這款才對」）：封面俯視斜角（studio-listing.json）、斜角近景、開箱 15 入
  // （3 欄 5 排）。之前的藍蓋橘盒三張（台灣的繽紛紙盒）留在 git 歷史裡
  studioExtra["reunion-paper-gift-box"] = (studioExtra["reunion-paper-gift-box"] ?? []).map((v) => v.file === "gift-box-unboxed-12-v2.webp"
    ? { file: "studio-reunion-gift-box-us-closed-angle.webp", zh: "斜角", en: "Angled view", enAlt: "the box closed, seen at an angle" } : v);
  // the unboxed view is off the page (user 2026-10-07: 「15 盒的圖 3 拿掉，包數沒有對」); studio-reunion-gift-box-us-unboxed-15.webp stays in git history
  // 實拍照（使用者 2026-10-14 給的金色盒蓋正面＋開箱 15 入，3 欄 5 排）：背景換成全站灰漸層、norm 0.45（docs/qa/2026-10-14-reunion-photos）；
  // 正面實拍 v4 改用攝影師原檔 ~/Downloads/子村0920/0920-002.tif（4763px，使用者：「這張重做」），畫布 3200×4000。封面 listing-tea-reunion-gift-box-us-v2
  // 由原檔參考重生（Nano Banana 2.1，第 4 次；拉環小、在右短邊中間從盒蓋縫伸出；使用者：「上商品圖」「注意不要太膨脹」「大小比例要跟其他張差不多大」），norm 0.45。
  // 「加入圖庫」：封面 → 正面實拍 → 斜角 → 開箱 15 入。紅色盒蓋的兩張實拍先不上線（使用者：「先不上線」）
  studioExtra["reunion-paper-gift-box"] = [
    { file: "studio-reunion-gift-box-us-front-photo-v5.webp", zh: "正面實拍", en: "Front view", enAlt: "photograph of the closed box from above, its mustard linen lid embroidered with a turquoise goldfish" },
    ...studioExtra["reunion-paper-gift-box"],
    { file: "studio-reunion-gift-box-us-unboxed-15-photo-v4.webp", zh: "開箱・15 入", en: "Unboxed · 15 tea bags", enAlt: "photograph of the opened box with 15 gold tea bags in five rows of three" },
  ];
  // 團圓桐木木盒：三張商品圖照繽紛紙盒的邏輯重生（Nano Banana 2.1，以官網的珊瑚紅亞麻盒蓋＋粉紅刺繡金魚照片當商品參考；使用者 2026-10-07：
  // 「用相同邏輯生成這個商品的 3 張商品圖（都要高清，注意刺繡的細節與英文字換角度時不要跑掉）」）：封面俯視斜角（studio-listing.json v4）、斜角近景、開箱
  studioExtra["reunion-paulownia-gift-box"] = [{ file: "studio-reunion-paulownia-gift-box-closed-angle-v2.webp", zh: "斜角", en: "Angled view", enAlt: "the box closed, seen at an angle" }, ...(studioExtra["reunion-paulownia-gift-box"] ?? [])];
  studioExtra["reunion-paulownia-gift-box"] = studioExtra["reunion-paulownia-gift-box"].map((v) => v.file === "gift-box-unboxed-12-v2.webp"
    ? { file: "studio-reunion-paulownia-gift-box-unboxed-v5.webp" /* v5：照實拍的相機角度與透視重生（使用者 2026-10-07：「粉紅色那一款上有透視錯誤，請再重新生成一張參考實拍」）；v4 把盒蓋改薄 */, zh: "開箱・12 入", en: "Unboxed · 12 tea bags", enAlt: "the box opened to show 12 gold tea bags, the lid in front of it" } : v);
  // 聖誕佳禮（2026-10-13 agent 推理暫定，待客戶確認（確認表 F1–F8））：橘色盒蓋是預設圖庫，照其他 12 入禮盒的順序 封面（studio-listing.json）→ 正面實拍 → 斜角 → 開箱。
  // 開箱用自己的 12 入圖，不在上面 12 入木盒（gift-box-unboxed-12-v2）的迴圈裡；藍綠色盒蓋的 4 張在 tea-gifts.ts 的 lidViews。
  // 客戶 2026-10-14 §1 說是「木盒搭配刺繡布面上蓋」：這些 10-13 生成圖的盒身是否相符，待使用者確認（未重生）
  studioExtra["christmas-gift-box"] = [
    { file: "studio-christmas-gift-box-orange-front-v4.webp", zh: "橘色盒蓋・正面實拍", en: "Orange lid, front view", enAlt: "orange lid, front photograph" },
    { file: "studio-christmas-gift-box-orange-angle-v3.webp", zh: "橘色盒蓋・斜角", en: "Orange lid, angled view", enAlt: "orange lid, angled view" },
    { file: "studio-christmas-gift-box-orange-unboxed-v3.webp", zh: "橘色盒蓋・開箱 12 入", en: "Orange lid, unboxed · 12 tea bags", enAlt: "orange lid, the box opened to show 12 tea bags" },
  ];
  // 聖誕心意禮：原有三張照片保留；使用者 2026-10-15 新增實拍開盒照，顯示單盒內兩包茶包。
  // 四張棚拍依使用者 2026-10-15 糾正統一平順漸層；開盒再依實拍重生清晰細節，盒身展示寬度與正面照一致。
  // 完整 4:5 畫布不可再套 cutout 的 20% padding 二次縮小。
  studioExtra["snowflake-gift-box"] = [
    { file: "studio-snowflake-gift-box-angle-smooth-bg-v5.webp", zh: "斜角", en: "Angled view", enAlt: "one box seen at an angle" },
    { file: "studio-snowflake-gift-box-front-smooth-bg-v5.webp", zh: "正面", en: "Front view", enAlt: "one box seen from the front" },
    { file: "studio-snowflake-gift-box-unboxed-2-hd-v5.webp", zh: "開盒・2 入", en: "Unboxed · 2 tea bags", enAlt: "the box opened to show two individually wrapped Goldfish Tea Bags" },
  ];
  // Photographs a product page leaves out (user 2026-10-01, on the coaster page: 「這 2 張不要」 — the box under branch shadows and the
  // flat lay of every wooden piece on stone).
  const sceneOmit: Record<string, string[]> = {
    "cloud-coaster": [...["CV-0232", "CV-0231"].map((id) => `/media/gallery/${id}.webp`), "/media/site/scene-twin-earring-profile-mustard-sofa.webp"], // 耳環加藍包的那張：真皮包與金飾的情境照全站隱藏（使用者 2026-10-07，美國市場不販售）
    // the three event photographs of the stands (CV-0068 / 0074 / 0081) are off the dessert tray page (user 2026-10-05: 「刪」)
    "prosperity-dessert-stand": ["CV-0068", "CV-0074", "CV-0081"].map((id) => `/media/gallery/${id}.webp`),
    // 白包頁拿掉白、藍兩只包在檯座上的照片（使用者 2026-10-06：「刪」）
    "braided-leather-bag-white": ["/media/gallery/CV-0426.webp"],
    // 藍包頁拿掉米色大衣背影照（使用者 2026-10-06：標叉）
    "braided-leather-bag-blue": ["/media/gallery/CV-0423.webp"],
    // 團圓：橘盒的舊情境照下架（使用者 2026-10-07：「用這張情境圖」）；換成松針盒的沙發照後來又放回商品頁（「放上商品圖的內容頁」）
    "reunion-paper-gift-box": ["/media/gallery/CV-0348.webp", "/media/site/journal-301.webp"],
    // 檜木筷子頁拿掉備長炭上的小鳥筷架照（使用者 2026-10-07：「刪」）
    "wooden-chopsticks": ["/media/gallery/CV-0245.webp"],
  };
  // off every page (user 2026-10-02: 「刪」 — the near-identical flat lays of all the wooden pieces on stone, then the third copy CV-0234)
  const omitEverywhere = ["CV-0231", "CV-0232", "CV-0234"].map((id) => `/media/gallery/${id}.webp`);
  // Not scenes: studio composites and their sources (cut-outs, the plain product shots the composites were made from).
  const studioSources = new Set(["CV-0398", "CV-0400", "CV-0419", "CV-0420", "CV-0399", "CV-0397", "CV-0256"].map((id) => `/media/gallery/${id}.webp`));
  // An explicit order where the photographs would otherwise leave a half-empty row: the bird rest's three portraits run down
  // the information column and its two landscapes close the page as one full row.
  const sceneOrder: Record<string, string[]> = {
    // the white bag's hover shows a person with the bag, like the blue and pink ones (user 2026-10-05: 「hover 也改成人物跟包」)
    // 白包卡片 hover 改用手提行走照（使用者 2026-10-06：「白色包包 商品 hover 用這張」），所以它排第一
    "braided-leather-bag-white": ["/media/site/scene-white-bag-walking-tobacco.webp", "/media/site/scene-white-bag-olive-sofa-woman.webp", "/media/site/scene-white-bag-olive-velvet-chair.webp", "/media/site/scene-white-bag-orange-wall-olive-sofa.webp"],
    // 藍色：新照片排在第一張情境照（也是卡片 hover 圖）後面（使用者 2026-10-06：「這2個放上官網商品內容頁」）
    "braided-leather-bag-blue": ["/media/site/scene-blue-bag-shoulder-oatmeal-coat.webp", "/media/site/scene-blue-bag-shoulder-taupe-blazer-wide.webp", "/media/site/scene-blue-bag-olive-armchair-rattan.webp", "/media/site/scene-twin-earring-profile-mustard-sofa.webp"],
    // 粉紅：手提行走的新照片排在第一張情境照後面（使用者 2026-10-06：「放上官網」）
    "braided-leather-bag-pink": ["/media/gallery/CV-0424.webp", "/media/site/scene-pink-bag-armchair-olive-v2.webp", "/media/site/scene-pink-bag-olive-sofa-tea-tray.webp"], // 扶手椅照與手提行走照左右交換（使用者 2026-10-06）
    // 團圓繽紛紙盒：橄欖綠沙發情境照排第二張（故事區的大圖），卡片 hover 仍用 CV-0348
    // 沙發那張排第一，所以它也是卡片的 hover 圖（使用者 2026-10-07：「hover 換這張」）
    // the hands-and-mug photograph (2026-10-08) listed last, so an unlisted scene never sorts ahead of the sofa photograph that is the hover
    "reunion-paper-gift-box": ["/media/site/scene-reunion-gift-box-us-olive-sofa-pouch.webp", "/media/site/scene-two-people-tea-black-oak-table.webp", "/media/site/scene-hands-speckled-mug-goldfish-tea-warm-light.webp"],
    "bird-chopstick-rest": ["/media/site/scene-bird-rest-gift-box-v2.webp", "/media/site/scene-oak-table-bird-rests.webp", "/media/site/scene-bird-rest-tray-closeup.webp"],
  };
  const isStudioLike = (img: Img) => Boolean(img.cutout) || studioSources.has(img.src) || /^\/media\/(site\/(studio-|featured-|jewelry-)|gift-boxes\/)/.test(img.src);
  // Latest instruction ADDS the real front view in slot 2. Existing cover, angled view and unboxed view remain in order after it.
  // 紫斑蝶：斜角圖（studio-purple-butterfly-gift-box-angle-v2）下架（使用者 2026-10-14：「刪」）；檔案留著
  studioExtra["purple-butterfly-gift-box"] = (studioExtra["purple-butterfly-gift-box"] ?? []).filter((v) => !v.file.startsWith("studio-purple-butterfly-gift-box-angle"));
  const officialFronts: Record<string, string> = {
    "spring-dawn-gift-box": "official-gift-front-spring-dawn-gift-box-blue-cutout-v3.webp",
    "winter-blossom-gift-box": "official-gift-front-winter-blossom-gift-box-cutout-v3.webp",
    "orchid-gift-box": "official-gift-front-orchid-gift-box-gold-cutout-v3.webp",
    "purple-butterfly-gift-box": "official-gift-front-purple-butterfly-gift-box-cutout-v3.webp",
    "year-of-plenty-gift-box": "official-gift-front-year-of-plenty-gift-box-cutout-v3.webp",
    "blossoming-prosperity-gift-box": "official-gift-front-blossoming-prosperity-gift-box-cutout-v3.webp",
  };
  for (const [slug, file] of Object.entries(officialFronts)) studioExtra[slug] = [
    { file, zh: "正面實拍", en: "Official front view", enAlt: "official front photograph of the complete gift box with its ribbon and embroidery" },
    ...(studioExtra[slug] ?? []),
  ];
  const withListing = (p: Product): Product => {
    const file = (studioListing as Record<string, string>)[p.slug];
    const studio = file ? studioImage(file, studioAlt(p.name)) : undefined;
    const sceneId = listingScene[p.slug];
    const lead = [...(p.slug === "bird-chopstick-rest" ? [] : sceneLead[p.slug] ?? []), listingSceneSite[p.slug], ...(sceneAfterLead[p.slug] ?? []), sceneId ? gallery(sceneId, t(`${p.name}・情境照`, `${p.name}, in context`)) : undefined].filter((x): x is Img => Boolean(x));
    // A product without a studio photograph yet (the diamond stud) keeps its own first image as cover and only view.
    const views: ProductView[] = studio
      ? [{ label: t("正面", "Front view"), image: studio }, ...(studioExtra[p.slug] ?? []).map((v) => v.placeholder
        ? { label: t(v.zh, v.en), image: { src: "", alt: t(v.zh, v.enAlt), w: 4, h: 5 }, placeholder: true }
        : { label: t(v.zh, v.en), image: studioImage(v.file, `${p.name}${t("・", ", ")}${t(v.zh, v.enAlt)}`) })]
      : p.views.slice(0, 1);
    const shown = new Set(views.map((v) => v.image.src));
    // the bird rest keeps its own photograph first; the new interior follows it
    const scenes = [...lead, ...p.views.map((v) => v.image), ...(p.story.image ? [p.story.image] : []), ...(p.slug === "bird-chopstick-rest" ? sceneLead[p.slug] ?? [] : []), ...(sceneExtra[p.slug] ?? [])]
      .filter((img, i, list) => !shown.has(img.src) && !isStudioLike(img) && !(sceneOmit[p.slug] ?? []).includes(img.src) && !omitEverywhere.includes(img.src) && list.findIndex((x) => x.src === img.src) === i);
    const order = sceneOrder[p.slug]; if (order) scenes.sort((a, b) => order.indexOf(a.src) - order.indexOf(b.src));
    // Tea gift boxes show exactly three scenes in the ginkgo teaspoon page's layout — the first in the column, the second large beside the
    // story, the third small — chosen so none repeat (user 2026-10-08: 「所有茶葉禮盒的情境照部分都跟…ginkgo-teaspoon-gift-box 版型設計一樣，只用 3 張
    // 情境照，挑不重複的用」): the olive-sofa lead (also the card's hover), the box's own best other scene (the two people at the oak table where
    // it has none), and the hands with the mug. The other scenes stay in sceneExtra, unlisted.
    const three = teaThree[p.slug];
    const chosen = three ? three.map((file) => scenes.find((img) => img.src === `/media/site/${file}`)).filter((x): x is Img => Boolean(x)) : [];
    const shownScenes = three && chosen.length === three.length ? chosen : scenes;
    return { ...p, image: views[0].image, hoverImage: shownScenes[0], views, scenes: shownScenes };
  };
  const twoPeople = "scene-two-people-tea-black-oak-table.webp", mug = "scene-hands-speckled-mug-goldfish-tea-warm-light.webp";
  const teaThree: Record<string, string[]> = { // 多數三張；雪花迷人禮還沒有專屬情境照，只放兩張共用照（hover 用兩人喝茶照）
    "reunion-paper-gift-box": ["scene-reunion-gift-box-us-olive-sofa-pouch.webp", twoPeople, mug],
    "spring-dawn-gift-box": ["scene-spring-dawn-gift-box-blue-pink-sunbeam.webp", "scene-spring-dawn-gift-box-hand-glass-cup-book-walnut.webp", mug], // 藍、粉兩色並列窗光照領頭、也是清單 hover（使用者 2026-10-13：「發布在 demo2 並更新 hover 圖」）
    "winter-blossom-gift-box": ["scene-winter-blossom-gift-box-olive-sofa-pouch.webp", twoPeople, mug],
    "orchid-gift-box": ["scene-orchid-gift-box-gold-pink-sunbeam.webp", "scene-orchid-gift-box-olive-sofa-pouch.webp", "scene-orchid-gift-box-two-friends-tea.webp"], // 兩人對飲照與沙發照左右交換（使用者 2026-10-13：「左右交換」） // 金、粉兩色並列的窗光照領頭、也是清單 hover（使用者 2026-10-13：「hover 換雙封面」）；沙發照退為第二張
    "purple-butterfly-gift-box": ["scene-purple-butterfly-gift-box-olive-sofa-pouch-v2.webp" /* v2: the real beige gold-dot tab on the rim instead of the teal loop (user 2026-10-14: 「這張情境照的拉環也要換」) */, "scene-purple-butterfly-gift-box.webp", mug],
    "kyoto-gift-box": ["scene-kyoto-gift-box-olive-sofa-pouch.webp", twoPeople, mug],
    "year-of-plenty-gift-box": ["scene-year-of-plenty-gift-box-olive-sofa-pouch.webp", "scene-year-of-plenty-cream-table-sun-celadon-cup.webp", mug],
    "blossoming-prosperity-gift-box": ["scene-blossoming-prosperity-gift-box-olive-sofa-pouch.webp", "scene-blossoming-prosperity-gift-box.webp", mug],
    "christmas-gift-box": ["scene-christmas-gift-box-two-boxes-window-light.webp", "scene-christmas-gift-box-burgundy-sunbeam.webp", mug], // 兩色禮盒窗光照（2026-10-13 取代茶包款式錯誤的沙發照：「包裝袋錯誤」）也是 hover 圖
    "snowflake-gift-box": ["scene-snowflake-gift-box-olive-sofa-pouch-gold-seal-v3.webp", mug, twoPeople], // 沙發照領頭、也是清單 hover（使用者 2026-10-13：「用這個做情境圖」→「好」）；兩人照與捧杯照左右交換（「左右交換」）
  };
  const listed: Product[] = [...bagProducts, ...jewelryProducts, ...teaProducts, ...teawareProducts].map(withShopify).map(withListing);
  // A choice may show another listing's studio views while it is chosen (the Reunion box's 粉紅色 = the paulownia box, a hidden
  // listing of its own; user 2026-10-07: 「在團圓頁選『粉紅色』時切換」)
  const bySlug = new Map(listed.map((p) => [p.slug, p]));
  // …or grey blocks while the client's photographs and details are awaited (used by the Reunion box's 粉紅色 and 藍色 until 2026-10-13, when both went off sale; kept for options awaiting photographs)
  const greyViews = (n: number): ProductView[] => Array.from({ length: n }, () => ({ label: t("缺圖", "No image yet"), image: { src: "", alt: t("缺圖", "No image yet"), w: 4, h: 5 }, placeholder: true, tone: "grey" as const }));
  // Pink lids keep their existing cover, add their HD front in slot 2, and retain their existing angle/unboxed views.
  // A lid view the option does not have is left out rather than borrowed from the default lid (2026-10-13: 蝴蝶蘭粉紅色 showed the
  // gold box's cover and angled view); so 蝴蝶蘭粉紅色 shows its real pink front photograph and the shared unboxed view (no lid in it).
  // `lid` (聖誕佳禮的藍綠色) names the lid in the alt text and brings the option's own unboxed view; without it the pink-lid wording and the shared unboxed view stay as before.
  const lidScene = (p: Product, lv: { scene?: string }): ProductView[] => lv.scene ? [{ label: t("情境", "Scene"), image: site(lv.scene, `${p.name}${t("・粉紅色盒蓋・情境", ", pink lid, in a scene")}`, 2784, 3456) }] : [];
  const lidViews = (p: Product, lv: { cover?: string; angle?: string; front?: string; unboxed?: string; lid?: string; scene?: string }): ProductView[] => lv.lid ? [
    ...(lv.cover ? [{ label: t("正面", "Front view"), image: studioImage(lv.cover, `${p.name}${t("・", ", ")}${lv.lid}${t("・封面", ", front view")}`) }] : []),
    ...(lv.front ? [{ label: t("正面實拍", "Front photograph"), image: studioImage(lv.front, `${p.name}${t("・", ", ")}${lv.lid}${t("・正面實拍", ", front photograph")}`) }] : []),
    ...(lv.angle ? [{ label: t("斜角", "Angled view"), image: studioImage(lv.angle, `${p.name}${t("・", ", ")}${lv.lid}${t("・斜角", ", angled view")}`) }] : []),
    ...(lv.unboxed ? [{ label: t("開箱", "Unboxed"), image: studioImage(lv.unboxed, `${p.name}${t("・", ", ")}${lv.lid}${t("・開箱 12 入", ", opened to show 12 tea bags")}`) }] : []),
  ] : [
    ...(lv.cover ? [{ label: t("正面", "Front view"), image: studioImage(lv.cover, `${p.name}${t("・", ", ")}${t("粉紅色盒蓋・封面", "pink lid, front view")}`) }] : []),
    ...(lv.front ? [{ label: t("正面實拍", "Official front view"), image: studioImage(lv.front, `${p.name}${t("・", ", ")}${t("粉紅色盒蓋・正面實拍", "pink lid, official front photograph with its ribbon and embroidery")}`) }] : []),
    ...(lv.angle ? [{ label: t("斜角", "Angled view"), image: studioImage(lv.angle, `${p.name}${t("・", ", ")}${t("粉紅色盒蓋・斜角", "pink lid, the box closed, seen from its short end at an angle")}`) }] : []),
    ...p.views.filter((v) => /開箱|Unboxed/.test(v.label)),
    ...lidScene(p, lv),
  ];
  const products: Product[] = listed.map((p) => p.giftBox?.choices?.some((c) => c.viewsFrom || c.placeholderViews || c.lidViews)
    ? { ...p, giftBox: { ...p.giftBox, choices: p.giftBox.choices.map((c) => c.placeholderViews ? { ...c, views: greyViews(c.placeholderViews) } : c.viewsFrom ? { ...c, views: bySlug.get(c.viewsFrom)?.views } : c.lidViews ? { ...c, views: lidViews(p, c.lidViews) } : c) } } : p);
  const aligned = products.map(p => {
    const source = (shopifyProducts.products as Record<string, ShopifyProduct>)[p.slug];
    if (!source) return p;
    // Match gallery choices against their English identities, independently of the page language.
    // Approved Reunion colors (2026-10-16): champagne Gold, original Yellow, and Red.
    // This is a visual mapping only; Shopify still owns the options and stock.
    const goldViews: ProductView[] | undefined = p.slug === "reunion-paper-gift-box" ? [{
      label: t("金色・斜角", "Gold · Angled view"),
      image: site("studio-reunion-gift-box-gold-angle-v1.png", t("團圓金色刺繡禮盒・斜角", "Joyful Reunion champagne-gold embroidered gift box, angled view")),
    }, {
      label: t("金色・正面", "Gold · Front view"),
      image: site("studio-reunion-gift-box-gold-front-v1.png", t("團圓金色刺繡禮盒・正面", "Joyful Reunion champagne-gold embroidered gift box, front view")),
    }, {
      label: t("金色・另一側斜角", "Gold · Alternate angle"),
      image: site("studio-reunion-gift-box-gold-alternate-v1.png", t("團圓金色刺繡禮盒・另一側斜角", "Joyful Reunion champagne-gold embroidered gift box, alternate angle")),
    }, {
      label: t("開箱・15 入", "Unboxed · 15 tea bags"),
      image: site("studio-reunion-gift-box-us-unboxed-15-photo-v4.webp", t("團圓禮盒・開箱，15 包茶包", "Joyful Reunion gift box opened with 15 tea bags")),
    }] : undefined;
    const visualChoices = p.slug === "reunion-paper-gift-box" ? [
      { label: "Gold", contents: [], views: goldViews },
      // Keep the original yellow-lid photographs when choosing Yellow.
      { label: "Yellow", contents: [], views: p.views },
      { label: "Red", contents: [], views: [{
        label: t("紅色・斜角", "Red · Angled view"),
        image: site("studio-reunion-gift-box-red-angle-v1.png", t("團圓紅色刺繡禮盒・斜角", "Joyful Reunion red embroidered gift box, angled view")),
      }, {
        label: t("紅色・正面", "Red · Front view"),
        image: site("studio-reunion-gift-box-red-front-v1.png", t("團圓紅色刺繡禮盒・正面", "Joyful Reunion red embroidered gift box, front view")),
      }, {
        label: t("紅色・另一側斜角", "Red · Alternate angle"),
        image: site("studio-reunion-gift-box-red-alternate-v1.png", t("團圓紅色刺繡禮盒・另一側斜角", "Joyful Reunion red embroidered gift box, alternate angle")),
      }, {
        // All Reunion lids share this lid-free photograph: five rows of three tea bags.
        label: t("開箱・15 入", "Unboxed · 15 tea bags"),
        image: site("studio-reunion-gift-box-us-unboxed-15-photo-v4.webp", t("團圓禮盒・開箱，15 包茶包", "Joyful Reunion gift box opened with 15 tea bags")),
      }] },
    ] : p.giftBox?.choices;
    return applyShopifyProduct(goldViews ? { ...p, image: goldViews[0].image, views: goldViews } : p, source, lang, visualChoices);
  });
  return { categories: categories.filter((c) => !hiddenCategories.has(c.id)), products: aligned.filter((p) => !hiddenCategories.has(p.category) && !p.hidden), bagProducts, jewelryProducts, teaProducts, teawareProducts };
};

const catalogs: Partial<Record<Locale, ReturnType<typeof buildCatalog>>> = {};
/** The catalogue in one language (built once per language). */
export const getCatalog = (lang: Locale = "zh") => (catalogs[lang] ??= buildCatalog(lang));

// English is unprefixed, Chinese under /zh; called without a language the href is the locale-neutral path (for alternates, the sitemap)
const prefix = (lang?: Locale) => (lang === "zh" ? "/zh" : "");
// Chinese (source) catalogue under the original names, for code that is not locale-aware.
export const categories = getCatalog("zh").categories;
export const products: Product[] = getCatalog("zh").products;
export const getProducts = (lang: Locale = "zh") => getCatalog(lang).products;
export const getCategories = (lang: Locale = "zh") => getCatalog(lang).categories;
export const isSellable = (p: Product) => !p.displayOnly && Boolean(p.price || p.shopify?.variantId);
export const formatPrice = (amount: number, currency = "TWD") => currency === "TWD" ? `NT$ ${amount.toLocaleString("en-US")}` : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
export const productHref = (product: Product | string, lang?: Locale) => `${prefix(lang)}/products/${typeof product === "string" ? product : product.slug}`;
export const categoryHref = (category: string, lang?: Locale) => `${prefix(lang)}/collections/${category}`;
export const findProduct = (slug: string, lang: Locale = "zh") => getProducts(lang).find((p) => p.slug === slug);
export const getCategory = (id: string, lang: Locale = "zh") => getCategories(lang).find((c) => c.id === id);
export const getCategoryProducts = (id: string, lang: Locale = "zh") => id === "all" ? getProducts(lang) : getProducts(lang).filter((p) => p.category === id);
export const bagCatalog = getCatalog("zh").bagProducts;
export const jewelryCatalog = getCatalog("zh").jewelryProducts;
export const teaCatalog = getCatalog("zh").teaProducts;
export const teawareCatalog = getCatalog("zh").teawareProducts;

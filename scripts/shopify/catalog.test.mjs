import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyShopifyProduct } from '../../src/lib/shopify/catalog-data.ts';
const snapshot = JSON.parse(readFileSync(new URL('../../src/data/shopify-products.json', import.meta.url)));
const image = { src: '/approved-visual.webp', alt: 'Approved visual', w: 1200, h: 1500 };
const local = { slug: 'kyoto-gift-box', name: '京都版', english: 'KYOTO', image, views: [{ label: 'Front', image }], scenes: [image], category: 'tea', description: 'old', summary: 'old', facts: [], story: { title: 'old', body: 'old' }, price: { amount: 999, currency: 'USD' }, preOrder: true, preOrderRemaining: 100, giftBox: { pieces: 6, series: 'Classic', contents: [] } };

test('Packaging CMS localizes notices without changing variant identity, prices or approved photos', () => {
  const source = structuredClone(snapshot.products['christmas-gift-box']);
  const product = {...local, slug:'christmas-gift-box'};
  const details = {version:1, notice:{zh:'紙盒顏色隨機出貨',en:'Paper box color is assigned at random'}, imageNote:{zh:'照片僅供參考',en:'Photos are for reference'}};
  for (const lang of ['zh','en']) {
    const original = applyShopifyProduct(product, source, lang);
    const withDetails = {...source,metafields:[...source.metafields,{namespace:'custom',key:'packaging_details',type:'json',value:JSON.stringify(details)}]};
    const result = applyShopifyProduct(product, withDetails, lang);
    assert.equal(result.packagingNote, details.notice[lang]);
    assert.equal(result.imageNote, details.imageNote[lang]);
    assert.deepEqual(result.giftBox.choices, original.giftBox.choices);
    assert.deepEqual(result.price, original.price);
    assert.equal(result.image, original.image);
    assert.equal(original.packagingNote, undefined);
  }
  assert.equal(applyShopifyProduct(local,snapshot.products['kyoto-gift-box'],'zh').packagingNote, undefined);
});

test('Incomplete packaging CMS does not silently show untranslated terms', () => {
  const source = structuredClone(snapshot.products['christmas-gift-box']);
  source.metafields.push({namespace:'custom',key:'packaging_details',type:'json',value:JSON.stringify({version:1,notice:{zh:'隨機'},imageNote:{zh:'照片'}})});
  assert.throws(()=>applyShopifyProduct(local,source,'en'), /Invalid packaging details/);
});

test('Shopify replaces price and stock while preserving approved image objects', () => {
  const source = structuredClone(snapshot.products['kyoto-gift-box']);
  source.variants[0].price = '61.25'; source.availableForSale = false;
  source.variants.forEach(v => { v.availableForSale = false; });
  const p = applyShopifyProduct(local, source, 'en');
  assert.equal(p.image, image); assert.equal(p.views, local.views); assert.equal(p.scenes, local.scenes);
  assert.equal(p.giftBox.choices[0].price, 61.25); assert.equal(p.soldOut, true);
  assert.equal(p.preOrderRemaining, undefined); assert.equal(p.preOrder, true);
});
test('Christmas small gift follows the confirmed Shopify three-box US$60 set without inventing mix variants', () => {
  const p = applyShopifyProduct({ ...local, slug: 'snowflake-gift-box', giftBox: { ...local.giftBox, mixBoxes: 3 } }, snapshot.products['snowflake-gift-box'], 'zh');
  assert.equal(p.price.amount, 60); assert.equal(p.giftBox.pieces, 6); assert.equal(p.giftBox.mixBoxes, undefined);
  assert.equal(p.facts.find(f => f.label === '販售單位').value, '3 盒一組，每盒 2 包，共 6 包');
  assert.ok(p.giftBox.choices.every(c => c.price === 60 && c.contents[0].count === 6));
  assert.equal(p.giftBox.choices.length, 5); assert.equal(p.shopifyData.published, false); assert.equal(p.soldOut, true);
});
test('Option photos match by identity, independently of variant order', () => {
  const pink = [{ label: 'Pink photo', image: { ...image, src: '/approved-pink.webp' } }];
  const source = structuredClone(snapshot.products['spring-dawn-gift-box']); source.variants.reverse();
  const p = applyShopifyProduct({ ...local, giftBox: { ...local.giftBox, choices: [{ label: 'Oriental Beauty Tea / Pink', contents: [], views: pink }] } }, source, 'en');
  assert.equal(p.giftBox.choices.find(c => c.label === 'Third Prize Oriental Beauty Tea / Pink').views, pink);
  assert.deepEqual(p.giftBox.choices.find(c => c.label === 'Third Prize Oriental Beauty Tea / Pink').selection, {tea: 'Third Prize Oriental Beauty Tea', lid: 'Pink'});
  assert.equal(p.giftBox.choices.find(c => c.label === 'Third Prize Oriental Beauty Tea / Blue').views, undefined);
});
test('Every mapped variant has one identity, without fabricated or shared GIDs', () => {
  const ids = Object.values(snapshot.products).flatMap(p => p.variants.map(v => v.id));
  assert.equal(Object.keys(snapshot.products).length, 14); assert.equal(ids.length, 35);
  assert.equal(new Set(ids).size, ids.length); assert.ok(ids.every(id => /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(id)));
});
test('Chinese option labels retain verified pink and Christmas color photographs', () => {
  const pink = [{ label: 'Pink', image: { ...image, src: '/approved-pink.webp' } }];
  const blue = [{ label: 'Stocking', image: { ...image, src: '/approved-stocking.webp' } }];
  const orchid = applyShopifyProduct({ ...local, giftBox: { ...local.giftBox, choices: [{ label: '頭等獎玫瑰烏龍茶／粉紅色', contents: [], views: pink }] } }, snapshot.products['orchid-gift-box'], 'zh');
  assert.equal(orchid.giftBox.choices.find(c => c.label === '頭等獎玫瑰烏龍茶／粉紅色').views, pink);
  const christmas = applyShopifyProduct({ ...local, slug: 'christmas-gift-box', giftBox: { ...local.giftBox, choices: [{ label: 'Tea Assortment / Stocking', contents: [], views: blue }] } }, snapshot.products['christmas-gift-box'], 'zh');
  assert.equal(christmas.giftBox.choices.find(c => c.label === '綜合茶款／聖誕襪').views, blue);
  assert.equal(christmas.giftBox.choices.find(c => c.label === '綜合茶款／拐杖糖').views, undefined);
});
test('Separate Christmas tea and lid selections preserve all six Shopify variant identities in any order', () => {
  const source = structuredClone(snapshot.products['christmas-gift-box']);
  source.variants.reverse();
  const visuals = source.variants.map(v => ({ label: v.title, contents: [], views: [{ label: v.id, image: { ...image, src: `/${v.id.split('/').at(-1)}.webp` } }] }));
  for (const lang of ['en', 'zh']) {
    const product = applyShopifyProduct({ ...local, slug: 'christmas-gift-box' }, source, lang, visuals);
    assert.equal(product.giftBox.choices.length, 6);
    assert.equal(new Set(product.giftBox.choices.map(c => c.selection.tea)).size, 3);
    assert.equal(new Set(product.giftBox.choices.map(c => c.selection.lid)).size, 2);
    for (const choice of product.giftBox.choices) {
      const original = source.variants.find(v => v.id === choice.shopifyVariantId);
      const color = original.selectedOptions.find(o => /color/i.test(o.name)).value;
      const expected = color === 'Blue' ? (lang === 'en' ? 'Stocking' : '聖誕襪') : (lang === 'en' ? 'Candy Cane' : '拐杖糖');
      assert.equal(choice.selection.lid, expected);
      assert.equal(choice.price, Number(original.price));
      assert.equal(choice.availableForSale, original.availableForSale);
      assert.equal(choice.views, visuals.find(v => v.label === original.title).views);
      assert.doesNotMatch(choice.label, /Blue|Orange|藍色|橘色/);
    }
    // Applying live data over the local snapshot must retain the same option photos.
    const live = applyShopifyProduct(product, source, lang);
    assert.deepEqual(live.giftBox.choices, product.giftBox.choices);
  }
  assert.ok(applyShopifyProduct(local, snapshot.products['kyoto-gift-box'], 'en').giftBox.choices.every(c => !c.selection));
  source.variants[0].selectedOptions.find(o => /color/i.test(o.name)).value = 'Unknown lid';
  const unknown = applyShopifyProduct({ ...local, slug: 'christmas-gift-box' }, source, 'en');
  assert.equal(unknown.giftBox.choices[0].selection, undefined);
});
test('Tea note names follow the Shopify competition grade while preserving editorial text', () => {
  const source = structuredClone(snapshot.products['orchid-gift-box']);
  source.metafields = source.metafields.filter(m => m.key !== 'headless_copy_zh_tw');
  const p = applyShopifyProduct({ ...local, teaNotes: { title: 'Tea', items: [{ name: '東方美人茶', text: 'Existing tea description' }] } }, source, 'zh');
  assert.equal(p.teaNotes.items[0].name, '參等獎東方美人茶');
  assert.equal(p.teaNotes.items[0].text, 'Existing tea description');
});
test('Shopify Chinese CMS restores approved copy without changing commerce or images', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../docs/shopify/zh-TW-migration.json', import.meta.url)));
  const copy = manifest.products['kyoto-gift-box'].copy;
  const source = structuredClone(snapshot.products['kyoto-gift-box']);
  source.metafields = [...source.metafields.filter(m => m.key !== 'headless_copy_zh_tw'), { namespace: 'custom', key: 'headless_copy_zh_tw', type: 'json', value: JSON.stringify(copy) }];
  source.translations = [{ key: 'title', value: copy.title }, { key: 'body_html', value: `<p>${copy.description}</p>` }];
  source.variants[0].price = '62.50'; source.variants[0].availableForSale = false;
  const zh = applyShopifyProduct(local, source, 'zh');
  assert.equal(zh.description, copy.description); assert.deepEqual(zh.story, copy.story);
  assert.equal(zh.facts.find(f => f.label === '保存期限').value, copy.facts.find(f => f.label === '保存期限').value);
  assert.deepEqual(zh.brew.steps, copy.brew.steps); assert.deepEqual(zh.teaNotes.items, copy.teaNotes.items);
  assert.equal(zh.image, image); assert.equal(zh.giftBox.choices[0].price, 62.50); assert.equal(zh.giftBox.choices[0].availableForSale, false);
  const en = applyShopifyProduct(local, source, 'en');
  assert.equal(en.name, source.title); assert.notEqual(en.description, copy.description);
  source.metafields.find(m => m.key === 'product_weight').value = '120 g';
  assert.equal(applyShopifyProduct(local, source, 'zh').facts.find(f => f.label === '重量（含盒）').value, '120 g');
});
test('All 14 Chinese migration entries match Shopify IDs and contain no retired pre-order claims', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../docs/shopify/zh-TW-migration.json', import.meta.url)));
  assert.equal(Object.keys(manifest.products).length, 14);
  for (const [slug, p] of Object.entries(manifest.products)) {
    assert.equal(p.productId, snapshot.products[slug].id);
    assert.match(p.copy.description, /[\u4e00-\u9fff]/);
    assert.doesNotMatch(JSON.stringify(p.copy), /預購商品預計|預購於下單|3 盒一組|三盒一組|剩餘 100/);
  }
});

const preorder = JSON.parse(readFileSync(new URL('../../docs/shopify/preorder-policy-2026.json', import.meta.url)));
const withPreorder = (source, policy = preorder.policy) => ({ ...structuredClone(source), metafields: [...source.metafields.filter(m => m.key !== 'preorder_details'), { namespace: 'custom', key: 'preorder_details', type: 'json', value: JSON.stringify(policy) }] });
test('Approved preorder restoration preserves every Shopify price, variant and sale restriction', () => {
  for (const slug of preorder.slugs) {
    const source = snapshot.products[slug];
    for (const lang of ['zh', 'en']) {
      const p = applyShopifyProduct({ ...local, slug }, withPreorder(source), lang);
      assert.equal(p.preOrder, true); assert.equal(p.shopifyData.scheduledPreOrder, true);
      assert.equal(p.preOrderPolicy.shipBy, '2026-11-30');
      assert.deepEqual(p.preOrderPolicy, { shipBy: preorder.policy.shipBy, ...preorder.policy.notice[lang] });
      assert.equal(p.price.amount, Math.min(...source.variants.map(v => Number(v.price))));
      const shown = source.variants;
      assert.equal(p.soldOut, !source.availableForSale || !shown.some(v => v.availableForSale)); assert.equal(p.shopifyData.published, source.published);
      assert.deepEqual(p.shopifyData.variants, shown);
      assert.equal(p.preOrderRemaining, undefined); assert.equal(p.giftBox.mixBoxes, undefined); assert.equal(p.image, image);
    }
  }
});
test('Explicit campaign disable overrides legacy preorder copy without converting regular inventory to preorder', () => {
  const disabled = withPreorder(snapshot.products['purple-butterfly-gift-box'], { version: 1, enabled: false });
  const p = applyShopifyProduct(local, disabled, 'en');
  assert.equal(p.preOrder, false); assert.equal(p.shopifyData.scheduledPreOrder, false); assert.equal(p.preOrderPolicy, undefined);
  const regular = structuredClone(snapshot.products['kyoto-gift-box']);
  regular.metafields = regular.metafields.filter(m => m.key !== 'preorder_details');
  regular.tags = [];
  assert.equal(applyShopifyProduct(local, regular, 'en').preOrder, false);
});
test('An enabled preorder must provide approved terms in both languages', () => {
  const policy = structuredClone(preorder.policy); delete policy.notice.zh;
  assert.throws(() => applyShopifyProduct(local, withPreorder(snapshot.products['kyoto-gift-box'], policy), 'en'), /Invalid preorder terms/);
});


test('Reunion follows current Gold/Yellow/Red identities in both languages without mutating source or assigning old-color photos', () => {
  const source = structuredClone(snapshot.products['reunion-paper-gift-box']);
  source.variants.reverse();
  source.variants[0].availableForSale = true; source.variants[0].quantityAvailable = 7;
  const before = structuredClone(source);
  const oldPhotos = [{label: 'Pink', contents: [], views: [{label: 'Old pink', image}]}, {label: 'Blue', contents: [], views: [{label: 'Old blue', image}]}];
  for (const lang of ['zh', 'en']) {
    const p = applyShopifyProduct({ ...local, slug: 'reunion-paper-gift-box' }, source, lang, oldPhotos);
    assert.deepEqual(p.giftBox.choices.map(c => c.label), lang === 'zh' ? ['紅色', '黃色', '金色'] : ['Red', 'Yellow', 'Gold']);
    assert.deepEqual(p.shopifyData.variants, source.variants);
    assert.deepEqual(p.giftBox.choices.map(c => c.shopifyVariantId), source.variants.map(v => v.id));
    assert.equal(p.giftBox.choices[0].quantityAvailable, 7);
    assert.ok(p.giftBox.choices.every(c => c.views === undefined));
    assert.equal(p.image, image);
  }
  assert.deepEqual(source, before);
});

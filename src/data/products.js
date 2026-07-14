/**
 * products.js
 * Mock product data for Re-Wear Collective.
 *
 * ── Fields ────────────────────────────────────────────────────────────────
 * id            {number}   Unique product identifier
 * title         {string}   Display name shown on cards and modals
 * brandCategory {string}   Sub-label: "Collection • Material"
 * category      {string}   Used by the Home page filter pills:
 *                          'Vintage Denim' | 'Y2K Shirts' | 'Jackets'
 * price         {number}   USD price
 * badge         {string}   Short label shown on the card image (top-left)
 * badgeStyle    {object}   Inline style object { background, color } for the badge
 * image         {string}   Primary product image URL (Unsplash)
 * hoverImage    {string}   Secondary image shown on hover
 * carbonSaved   {string}   CO₂ savings compared to buying new
 * waterSaved    {string}   Litres of water saved
 * treeEquivalent{string}   Equivalent tree-years of carbon offset
 * description   {string}   Thai-language product detail shown in Quick View modal
 * size          {string}   The specific size of this unique vintage item
 * condition     {string}   Condition rating of the item
 * measurements  {string}   Precise dimensions (e.g., chest, length)
 */

export const mockProducts = [
  {
    id: 1,
    title: '1992 Archive Straight-Leg',
    brandCategory: 'Vintage Denim • Reclaimed Wash',
    category: 'Vintage Denim',
    price: 128,
    originalPrice: 150,
    badge: 'RARE FIND',
    badgeStyle: { background: '#FFF3EE', color: '#C57B57' },
    image:
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=700',
    hoverImage:
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&q=80&w=700',
    carbonSaved: '5.4 kg CO₂e',
    waterSaved: '3,800 Liters',
    treeEquivalent: '0.5 Tree Years',
    description:
      'เสื้อกางเกงยีนส์ฟอกวินเทจแท้ทรงกระบอกตรง ผลิตในปี 1992 ได้รับการซ่อมแซมกระเป๋าด้านหลังและทำความสะอาดอย่างเชี่ยวชาญ สวมใส่ได้ยาวนานหลายทศวรรษ',
    size: '30',
    condition: 'Vintage Fade (Repaired)',
    measurements: 'เอว: 30", เป้า: 11", ยาว: 32"',
  },
  {
    id: 2,
    title: 'Midnight Silk Circuit Shirt',
    brandCategory: 'Y2K Archive • Pure Silk',
    category: 'Y2K Shirts',
    price: 84,
    badge: 'SUSTAINABLE SILK',
    badgeStyle: { background: '#DFE4D9', color: '#4A543C' },
    image:
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=700',
    hoverImage:
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&q=80&w=700',
    carbonSaved: '3.1 kg CO₂e',
    waterSaved: '1,200 Liters',
    treeEquivalent: '0.3 Tree Years',
    description:
      'เชิ้ตผ้าไหมแท้ 100% สีกากีเข้ม ลื่น สบายผิว ผสมผสานสไตล์มินิมอลกับแฟชั่นยุค 2000 ได้อย่างลงตัว ผ่านกระบวนการถนอมเส้นใยโบราณ',
    size: 'M',
    condition: 'Excellent',
    measurements: 'อก: 21", ยาว: 27", ไหล่: 18"',
  },
  {
    id: 3,
    title: 'Reconstructed Chore Coat',
    brandCategory: 'Workwear • Upcycled Canvas',
    category: 'Jackets',
    price: 210,
    badge: 'LIMITED RUN',
    badgeStyle: { background: '#F5ECD7', color: '#8B8B88' },
    image:
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=700',
    hoverImage:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=700',
    carbonSaved: '8.7 kg CO₂e',
    waterSaved: '5,500 Liters',
    treeEquivalent: '0.9 Tree Years',
    description:
      'เสื้อโค้ตสไตล์ช่างทำมือ ดัดแปลงจากผ้าใบกันใบเรือเก่าและกางเกงคาร์โก้ทหาร มีความหนา ทนทาน และมีเอกลักษณ์ลวดลายเฉพาะตัวเพียงตัวเดียวในโลก',
    size: 'L',
    condition: 'Distressed (Upcycled)',
    measurements: 'อก: 24", ยาว: 29", ไหล่: 20"',
  },
  {
    id: 4,
    title: 'Solar Flare Baby Tee',
    brandCategory: 'Y2K Archive • 100% Cotton',
    category: 'Y2K Shirts',
    price: 45,
    originalPrice: 60,
    badge: 'LIMITED RUN',
    badgeStyle: { background: '#F5ECD7', color: '#8B8B88' },
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=700',
    hoverImage:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700',
    carbonSaved: '2.4 kg CO₂e',
    waterSaved: '900 Liters',
    treeEquivalent: '0.2 Tree Years',
    description:
      'เสื้อครอปเบบี้ทีสีเทารุ่นพิเศษ สกรีนลายดาวกางเกงวินเทจ น่ารักสไตล์ Y2K ผ้าฝ้ายออร์แกนิก 100% มีความนุ่มยืดหยุ่นและน้ำหนักเบา',
    size: 'S',
    condition: 'Deadstock (Unworn)',
    measurements: 'อก: 16", ยาว: 18"',
  },
  {
    id: 5,
    title: 'Founders Carpenter Overall',
    brandCategory: 'Vintage Denim • Raw Indigo',
    category: 'Vintage Denim',
    price: 155,
    badge: 'RARE FIND',
    badgeStyle: { background: '#FFF3EE', color: '#C57B57' },
    image:
      'https://images.unsplash.com/photo-1519242220831-09410926fbff?auto=format&fit=crop&q=80&w=700',
    hoverImage:
      'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&q=80&w=700',
    carbonSaved: '6.8 kg CO₂e',
    waterSaved: '4,200 Liters',
    treeEquivalent: '0.7 Tree Years',
    description:
      'เอี๊ยมยีนส์สไตล์คาร์เพนเตอร์ ผ้าดิบเข้ม หนาทนทาน กระดุมทองเหลืองแท้ ทรงโอเวอร์ไซส์คลาสสิกที่ใช้งานได้ทุกยุคทุกสมัย',
    size: '32',
    condition: 'Good (Minor wear)',
    measurements: 'เอว: 32", ยาว(ไม่รวมสาย): 30"',
  },
  {
    id: 6,
    title: 'Washed Sail Archive Parka',
    brandCategory: 'Jackets • Waxed Cotton',
    category: 'Jackets',
    price: 195,
    badge: 'LIMITED RUN',
    badgeStyle: { background: '#F5ECD7', color: '#8B8B88' },
    image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=700',
    hoverImage:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=700',
    carbonSaved: '7.9 kg CO₂e',
    waterSaved: '4,900 Liters',
    treeEquivalent: '0.8 Tree Years',
    description:
      'พาร์กาผ้าแคนวาสเคลือบแว็กซ์กันน้ำ สีส้มอิฐฟอกธรรมชาติแบบสนิมวินเทจ ปกป้องคุณจากสายฝนและลมหนาวด้วยเสน่ห์แบบเอาต์ดอร์',
    size: 'L',
    condition: 'Worn-in (Patina)',
    measurements: 'อก: 25", ยาว: 32"',
  },
];

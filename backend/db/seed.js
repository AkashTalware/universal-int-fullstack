require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { getDB, initDB } = require('./database');

// Unsplash image helper — using known furniture & interior photo IDs
const img = (id, w = 900) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=80`;

const IMAGES = {
  // Living room
  sofaHero: img('photo-1555041469-a586c61ea9bc'),
  sofaRoom: img('photo-1493663284031-b7e3aefcae8e'),
  sofaCushion: img('photo-1583847268964-b28dc8f51f92'),
  sofaWide: img('photo-1567016432779-094069958ea5'),
  coffeeHero: img('photo-1533090481720-856c6e3c1fdc'),
  coffeeAngle: img('photo-1538688525198-9b88f6f53126'),
  coffeeRoom: img('photo-1615066390971-03e4e1c36ddf'),
  chairHero: img('photo-1580481077195-c3a82da912c3'),
  chairSide: img('photo-1567538096630-e0c55bd6374c'),
  chairLeather: img('photo-1598300042247-d088f8ab3a91'),
  mediaHero: img('photo-1600585154340-be6161a56a0c'),
  mediaAngle: img('photo-1616047006789-b7af5afb8c20'),
  mediaDetail: img('photo-1595428774223-ef52624120d2'),

  // Entry Way
  consoleHero: img('photo-1595428774223-ef52624120d2'),
  consoleStyle: img('photo-1533090161767-e6ffed986b88'),
  consoleRoom: img('photo-1618221195710-dd6b41faaea6'),
  mirrorHero: img('photo-1618219908412-a29a1bb7b86e'),
  mirrorAngle: img('photo-1558618666-fcd25c85cd64'),
  mirrorRoom: img('photo-1616046229478-9901c5536a45'),
  benchHero: img('photo-1503602642458-232111445657'),
  benchTexture: img('photo-1532323544230-7191fd51bc1b'),
  benchSetting: img('photo-1524758631624-e2822e304c36'),
  coatRackHero: img('photo-1586023492125-27b2c045efd7'),
  coatRackDetail: img('photo-1538688525198-9b88f6f53126'),

  // Dining
  diningTableHero: img('photo-1615066390971-03e4e1c36ddf'),
  diningTableRoom: img('photo-1617806118233-18e1de247200'),
  diningWoodClose: img('photo-1530018607912-eff2daa1bac4'),
  diningChairHero: img('photo-1506439773649-6e0eb8cfb237'),
  diningChairSet: img('photo-1517705008128-361805f42e86'),
  diningChairDetail: img('photo-1598300042247-d088f8ab3a91'),
  sideboardHero: img('photo-1595428774223-ef52624120d2'),
  sideboardRoom: img('photo-1616486338812-3dadae4b4ace'),
  sideboardDetail: img('photo-1538688525198-9b88f6f53126'),
  pendantHero: img('photo-1507473885765-e6ed057f782c'),
  pendantRoom: img('photo-1513506003901-1e6a229e2d15'),
  pendantNight: img('photo-1616486338812-3dadae4b4ace'),

  // Bedroom
  bedHero: img('photo-1540518614846-7eded433c457'),
  bedLight: img('photo-1505693416388-ac5ce068fe85'),
  bedCorner: img('photo-1616594039964-ae9021a400a0'),
  nightstandHero: img('photo-1585412727339-54e4bae3bbf9'),
  nightstandPair: img('photo-1532323544230-7191fd51bc1b'),
  nightstandSlide: img('photo-1595428774223-ef52624120d2'),
  wardrobeHero: img('photo-1558618666-fcd25c85cd64'),
  wardrobeAngle: img('photo-1618219908412-a29a1bb7b86e'),
  wardrobeInside: img('photo-1616046229478-9901c5536a45'),
  dresserHero: img('photo-1538688525198-9b88f6f53126'),
  dresserStyle: img('photo-1595428774223-ef52624120d2'),
  dresserPull: img('photo-1532323544230-7191fd51bc1b'),

  // Home Office
  deskHero: img('photo-1518455027359-f3f8164ba6bd'),
  deskSetup: img('photo-1524758631624-e2822e304c36'),
  deskElevated: img('photo-1497215728101-856f4ea42174'),
  officeChairHero: img('photo-1580481077195-c3a82da912c3'),
  officeChairDesk: img('photo-1505797149-43b0069ec26b'),
  officeChairBack: img('photo-1524758631624-e2822e304c36'),
  studyShelfHero: img('photo-1594671581654-2785ac5ced4e'),
  studyShelfRoom: img('photo-1558618666-fcd25c85cd64'),
  studyShelfJoin: img('photo-1538688525198-9b88f6f53126'),
  riserHero: img('photo-1524758631624-e2822e304c36'),
  riserAngle: img('photo-1518455027359-f3f8164ba6bd'),
  riserSetup: img('photo-1497215728101-856f4ea42174'),

  // Storage
  shelfSystemHero: img('photo-1558618666-fcd25c85cd64'),
  shelfSystemRoom: img('photo-1594671581654-2785ac5ced4e'),
  shelfSystemSteel: img('photo-1538688525198-9b88f6f53126'),
  cubesHero: img('photo-1538688525198-9b88f6f53126'),
  cubesStacked: img('photo-1595428774223-ef52624120d2'),
  cubesWall: img('photo-1558618666-fcd25c85cd64'),
  basketsHero: img('photo-1584589167171-541ce45f1eea'),
  basketsNested: img('photo-1524758631624-e2822e304c36'),
  basketsTexture: img('photo-1532323544230-7191fd51bc1b'),
  towerBookHero: img('photo-1594671581654-2785ac5ced4e'),
  towerBookRoom: img('photo-1558618666-fcd25c85cd64'),
  towerBookGrain: img('photo-1538688525198-9b88f6f53126'),
};

async function seed() {
  await initDB();
  const db = getDB();

  console.log('\n🌱  Starting comprehensive seed with multi-angle galleries...\n');

  // ── Wipe existing data ──
  db.prepare('DELETE FROM inquiries').run();
  db.prepare('DELETE FROM product_dimensions').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM categories').run();
  db.prepare('DELETE FROM admin_users').run();

  // ── Admin user ──────────────────────────────────
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(
    adminUsername,
    hash
  );
  console.log(`✅  Admin user created  →  ${adminUsername} (configured via environment)`);

  // ── Categories ──────────────────────────────────
  const cats = [
    {
      name: 'Entry Way',
      slug: 'entryway',
      description: 'Make a grand first impression with our curated entryway pieces.',
      sort_order: 1,
    },
    {
      name: 'Living Room',
      slug: 'living-room',
      description: 'Transform your living space with premium sofas, tables and accents.',
      sort_order: 2,
    },
    {
      name: 'Dining Room',
      slug: 'dining-room',
      description: 'Elevate every meal with sophisticated dining furniture.',
      sort_order: 3,
    },
    {
      name: 'Bedroom',
      slug: 'bedroom',
      description: 'Create a sanctuary of rest with our bedroom collections.',
      sort_order: 4,
    },
    {
      name: 'Home Office',
      slug: 'home-office',
      description: 'Design a workspace that inspires focus and creativity.',
      sort_order: 5,
    },
    {
      name: 'Storage',
      slug: 'storage',
      description: 'Smart storage solutions that are as beautiful as they are functional.',
      sort_order: 6,
    },
  ];

  const insertCat = db.prepare(
    'INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)'
  );
  const catMap = {};
  for (const c of cats) {
    const { lastInsertRowid } = insertCat.run(c.name, c.slug, c.description, c.sort_order);
    catMap[c.slug] = lastInsertRowid;
    console.log(`✅  Category  →  ${c.name}`);
  }

  // ── Products with 3-4 images each ────────────────
  const products = [
    // ENTRY WAY ─────────────────────────────────────────────────────────
    {
      cat: 'entryway',
      name: 'Sable Console Table',
      slug: 'sable-console-table',
      desc: 'A sleek console table crafted from solid American walnut with hand-finished brushed brass hairpin legs. A statement first impression for any entryway.',
      price: 28500,
      featured: 1,
      images: [IMAGES.consoleHero, IMAGES.consoleStyle, IMAGES.consoleRoom],
      dims: 'W 120 × D 38 × H 82 cm',
      mat: 'Solid Walnut',
      finish: 'Natural Oil + Brushed Brass',
    },
    {
      cat: 'entryway',
      name: 'Arc Hallway Mirror',
      slug: 'arc-hallway-mirror',
      desc: 'A full-length arched mirror with a hand-sanded solid teak frame. The warm wood tones and generous reflection add instant sophistication and light.',
      price: 15000,
      featured: 0,
      images: [IMAGES.mirrorHero, IMAGES.mirrorAngle, IMAGES.mirrorRoom],
      dims: 'W 60 × H 160 cm',
      mat: 'Solid Teak + Mirror Glass',
      finish: 'Natural Teak',
    },
    {
      cat: 'entryway',
      name: 'Haven Entry Bench',
      slug: 'haven-entry-bench',
      desc: 'A practical bench with a grey bouclé upholstered seat, solid oak legs, and concealed storage underneath for footwear and throws.',
      price: 22000,
      featured: 0,
      images: [IMAGES.benchHero, IMAGES.benchTexture, IMAGES.benchSetting],
      dims: 'W 100 × D 38 × H 48 cm',
      mat: 'Solid Oak + Bouclé Fabric',
      finish: 'Natural Oak + Grey Bouclé',
    },
    {
      cat: 'entryway',
      name: 'Slope Coat Rack',
      slug: 'slope-coat-rack',
      desc: 'A minimal angular coat rack with powder-coated steel arms and a weighted solid walnut base. Holds up to 10 heavy coats comfortably.',
      price: 9500,
      featured: 0,
      images: [IMAGES.coatRackHero, IMAGES.coatRackDetail, IMAGES.consoleHero],
      dims: 'W 40 × D 20 × H 180 cm',
      mat: 'Powder-coated Steel + Walnut',
      finish: 'Matte Black + Natural Walnut',
    },

    // LIVING ROOM ────────────────────────────────────────────────────────
    {
      cat: 'living-room',
      name: 'Oslo Sectional Sofa',
      slug: 'oslo-sectional-sofa',
      desc: 'A generously proportioned sectional sofa upholstered in dove-grey bouclé with solid oak legs and cloud-soft deep multi-density foam cushions.',
      price: 185000,
      salePrice: 165000,
      featured: 1,
      images: [IMAGES.sofaHero, IMAGES.sofaRoom, IMAGES.sofaCushion, IMAGES.sofaWide],
      dims: 'W 310 × D 180 × H 85 cm',
      mat: 'Bouclé Fabric + Solid Oak',
      finish: 'Dove Grey + Natural Oak',
    },
    {
      cat: 'living-room',
      name: 'Dune Coffee Table',
      slug: 'dune-coffee-table',
      desc: 'A sculptural coffee table with a genuine honed travertine stone top and slender brushed-steel legs. A centrepiece for the modern living room.',
      price: 42000,
      featured: 1,
      images: [IMAGES.coffeeHero, IMAGES.coffeeAngle, IMAGES.coffeeRoom],
      dims: 'W 110 × D 60 × H 40 cm',
      mat: 'Travertine + Brushed Steel',
      finish: 'Natural Travertine + Silver',
    },
    {
      cat: 'living-room',
      name: 'Lune Accent Chair',
      slug: 'lune-accent-chair',
      desc: 'A statement armchair in full-grain cognac leather with a solid walnut frame and tapered legs. Designed to age with a rich, unique patina.',
      price: 65000,
      featured: 1,
      images: [IMAGES.chairHero, IMAGES.chairSide, IMAGES.chairLeather],
      dims: 'W 70 × D 75 × H 80 cm',
      mat: 'Full-grain Leather + Solid Walnut',
      finish: 'Cognac + Oiled Walnut',
    },
    {
      cat: 'living-room',
      name: 'Ridge TV Console',
      slug: 'ridge-tv-console',
      desc: 'A low-profile TV console with matte walnut veneer and natural cane inset panels. Concealed cable management, soft-close dampers, adjustable shelving.',
      price: 95000,
      featured: 0,
      images: [IMAGES.mediaHero, IMAGES.mediaAngle, IMAGES.mediaDetail],
      dims: 'W 200 × D 45 × H 55 cm',
      mat: 'Walnut Veneer + Cane + Steel',
      finish: 'Matte Walnut',
    },

    // DINING ROOM ────────────────────────────────────────────────────────
    {
      cat: 'dining-room',
      name: 'Slab Dining Table',
      slug: 'slab-dining-table',
      desc: 'A dramatic live-edge dining table crafted from a single slab of mango wood. Each piece is entirely unique. Seats 8 to 10 comfortably.',
      price: 120000,
      featured: 1,
      images: [IMAGES.diningTableHero, IMAGES.diningTableRoom, IMAGES.diningWoodClose],
      dims: 'W 240 × D 100 × H 76 cm',
      mat: 'Live Edge Mango Wood + Matte Black Steel',
      finish: 'Natural Edge + Matte Black',
    },
    {
      cat: 'dining-room',
      name: 'Arc Dining Chair — Set of 4',
      slug: 'arc-dining-chair-set',
      desc: 'A set of four dining chairs with saddle leather seats and solid oak frames. Timeless silhouette with ergonomic lumbar support.',
      price: 88000,
      featured: 0,
      images: [IMAGES.diningChairHero, IMAGES.diningChairSet, IMAGES.diningChairDetail],
      dims: 'W 48 × D 52 × H 85 cm (each)',
      mat: 'Saddle Leather + Solid Oak',
      finish: 'Tan Leather + Oiled Oak',
    },
    {
      cat: 'dining-room',
      name: 'Totem Sideboard',
      slug: 'totem-sideboard',
      desc: 'A sophisticated sideboard in smoked oak veneer with aged brass handles. Four push-to-open doors, adjustable internal shelving, and cord cutouts.',
      price: 75000,
      featured: 0,
      images: [IMAGES.sideboardHero, IMAGES.sideboardRoom, IMAGES.sideboardDetail],
      dims: 'W 180 × D 45 × H 82 cm',
      mat: 'Smoked Oak Veneer + Brass',
      finish: 'Smoked Oak + Aged Brass',
    },
    {
      cat: 'dining-room',
      name: 'Dome Pendant Light',
      slug: 'dome-pendant-light',
      desc: 'A hand-spun polished brass pendant that creates warm, focused light above a dining table. Ceiling canopy and adjustable braided cloth cable included.',
      price: 18500,
      featured: 0,
      images: [IMAGES.pendantHero, IMAGES.pendantRoom, IMAGES.pendantNight],
      dims: 'Ø 45 cm | Cable 150 cm',
      mat: 'Spun Brass',
      finish: 'Polished Brass',
    },

    // BEDROOM ────────────────────────────────────────────────────────────
    {
      cat: 'bedroom',
      name: 'Drift Platform Bed',
      slug: 'drift-platform-bed',
      desc: 'A low-profile platform bed with a hand-tufted linen headboard and solid walnut frame. Floating silhouette with built-in ergonomic slat foundation.',
      price: 145000,
      featured: 1,
      images: [IMAGES.bedHero, IMAGES.bedLight, IMAGES.bedCorner],
      dims: 'Queen: W 170 × D 215 × H 110 cm',
      mat: 'Solid Walnut + Linen Fabric',
      finish: 'Oiled Walnut + Cream Linen',
    },
    {
      cat: 'bedroom',
      name: 'Cove Bedside Table — Pair',
      slug: 'cove-bedside-pair',
      desc: 'A pair of bedside tables with solid oak bodies, cane door panels, and a hidden cable outlet on each for discreet device charging.',
      price: 38000,
      featured: 0,
      images: [IMAGES.nightstandHero, IMAGES.nightstandPair, IMAGES.nightstandSlide],
      dims: 'W 45 × D 38 × H 55 cm (each)',
      mat: 'Solid Oak + Cane Weave',
      finish: 'Natural Oak',
    },
    {
      cat: 'bedroom',
      name: 'Arch Wardrobe',
      slug: 'arch-wardrobe',
      desc: 'A three-door wardrobe with arched mirrored panels and matte white lacquer finish. Interior features double hanging rods, soft-close drawers, and tie racks.',
      price: 220000,
      featured: 0,
      images: [IMAGES.wardrobeHero, IMAGES.wardrobeAngle, IMAGES.wardrobeInside],
      dims: 'W 180 × D 60 × H 220 cm',
      mat: 'MDF + Mirror Glass',
      finish: 'Matte White + Aged Brass Hardware',
    },
    {
      cat: 'bedroom',
      name: 'Loom Dresser',
      slug: 'loom-dresser',
      desc: 'A solid sheesham dresser with six deep drawers on smooth under-mount glides. Aged brass pulls complement the natural figuring of the hardwood.',
      price: 72000,
      featured: 0,
      images: [IMAGES.dresserHero, IMAGES.dresserStyle, IMAGES.dresserPull],
      dims: 'W 120 × D 48 × H 85 cm',
      mat: 'Solid Sheesham Wood',
      finish: 'Natural Sheesham + Aged Brass',
    },

    // HOME OFFICE ────────────────────────────────────────────────────────
    {
      cat: 'home-office',
      name: 'Beam Standing Desk',
      slug: 'beam-standing-desk',
      desc: 'An electric dual-motor height-adjustable desk with a solid bamboo top and powder-coated steel frame. Four programmable memory presets with anti-collision sensors.',
      price: 88000,
      featured: 1,
      images: [IMAGES.deskHero, IMAGES.deskSetup, IMAGES.deskElevated],
      dims: 'W 160 × D 80 × H 72–120 cm',
      mat: 'Solid Bamboo + Steel',
      finish: 'Natural Bamboo + Matte Black',
    },
    {
      cat: 'home-office',
      name: 'Spine Ergonomic Chair',
      slug: 'spine-ergonomic-chair',
      desc: 'Fully ergonomic executive task chair with dynamic lumbar support, 4D adjustable armrests, and breathable German mesh back. Polished aluminium base.',
      price: 58000,
      featured: 0,
      images: [IMAGES.officeChairHero, IMAGES.officeChairDesk, IMAGES.officeChairBack],
      dims: 'W 68 × D 70 × H 100–115 cm',
      mat: 'Premium Mesh + Polished Aluminium',
      finish: 'Charcoal Mesh + Silver',
    },
    {
      cat: 'home-office',
      name: 'Nook Bookcase',
      slug: 'nook-bookcase',
      desc: 'A solid pine bookcase with five adjustable shelves and an architectural steel frame. Includes wall-tether safety anchors.',
      price: 48000,
      featured: 0,
      images: [IMAGES.studyShelfHero, IMAGES.studyShelfRoom, IMAGES.studyShelfJoin],
      dims: 'W 90 × D 35 × H 180 cm',
      mat: 'Solid Pine + Powder-coated Steel',
      finish: 'Natural Pine + Matte Black',
    },
    {
      cat: 'home-office',
      name: 'Arc Monitor Riser',
      slug: 'arc-monitor-riser',
      desc: 'A solid walnut monitor riser with a concealed cable pass-through and natural cork feet. Elevates screens to ergonomic eye-level while storing keyboards beneath.',
      price: 12500,
      featured: 0,
      images: [IMAGES.riserHero, IMAGES.riserAngle, IMAGES.riserSetup],
      dims: 'W 55 × D 22 × H 12 cm',
      mat: 'Solid Walnut + Cork',
      finish: 'Natural Walnut',
    },

    // STORAGE ────────────────────────────────────────────────────────────
    {
      cat: 'storage',
      name: 'Grid Shelving System',
      slug: 'grid-shelving-system',
      desc: 'A modular open shelving system with powder-coated steel uprights and solid oak shelves. Expandable modular design connects side-by-side or stacked.',
      price: 55000,
      featured: 1,
      images: [IMAGES.shelfSystemHero, IMAGES.shelfSystemRoom, IMAGES.shelfSystemSteel],
      dims: 'W 120 × D 30 × H 200 cm (base unit)',
      mat: 'Powder-coated Steel + Solid Oak',
      finish: 'Matte Black + Natural Oak',
    },
    {
      cat: 'storage',
      name: 'Cube Modular Cabinet — Set of 6',
      slug: 'cube-modular-cabinet',
      desc: 'Six modular cube cabinets that stack and rearrange in any layout. Magnetic push-to-open mechanisms with concealed hinges and wall-mounting hardware.',
      price: 38000,
      featured: 0,
      images: [IMAGES.cubesHero, IMAGES.cubesStacked, IMAGES.cubesWall],
      dims: '40 × 40 × 40 cm per cube',
      mat: 'MDF + Lacquer',
      finish: 'Matte Chalk White',
    },
    {
      cat: 'storage',
      name: 'Woven Basket Set of 3',
      slug: 'woven-basket-set',
      desc: 'Three graduated storage baskets handwoven from natural seagrass with supple vegetable-tanned leather carry handles. Nest compactly when not in use.',
      price: 8500,
      featured: 0,
      images: [IMAGES.basketsHero, IMAGES.basketsNested, IMAGES.basketsTexture],
      dims: 'S: Ø30 | M: Ø38 | L: Ø46 cm',
      mat: 'Natural Seagrass + Leather',
      finish: 'Natural Seagrass',
    },
    {
      cat: 'storage',
      name: 'Tower Bookcase',
      slug: 'tower-bookcase',
      desc: 'A tall, narrow solid oak bookcase with five fixed shelves. Slim footprint makes it ideal for compact living rooms, hallways, or reading nooks.',
      price: 42000,
      featured: 0,
      images: [IMAGES.towerBookHero, IMAGES.towerBookRoom, IMAGES.towerBookGrain],
      dims: 'W 50 × D 28 × H 200 cm',
      mat: 'Solid Oak',
      finish: 'Natural Oiled Oak',
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products
      (category_id, name, slug, description, price, sale_price, images, dimensions, material, finish, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDim = db.prepare(`
    INSERT INTO product_dimensions
      (product_id, label, specs, price_delta, is_default, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const DIMENSIONS_SEEDS = {
    'arc-dining-chair-set': [
      {
        label: 'Set of 4 (Standard)',
        specs: 'W 52 × D 56 × H 82 cm (Each)',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: 'Set of 6',
        specs: 'W 52 × D 56 × H 82 cm (Each)',
        price_delta: 38000,
        is_default: 0,
        sort_order: 2,
      },
      {
        label: 'Set of 8',
        specs: 'W 52 × D 56 × H 82 cm (Each)',
        price_delta: 72000,
        is_default: 0,
        sort_order: 3,
      },
    ],
    'oslo-sectional-sofa': [
      {
        label: '3-Seater (W 260 × D 160 cm)',
        specs: 'W 260 × D 160 × H 82 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: '4-Seater Standard (W 310 × D 180 cm)',
        specs: 'W 310 × D 180 × H 82 cm',
        price_delta: 25000,
        is_default: 0,
        sort_order: 2,
      },
      {
        label: 'Grand Modular (W 360 × D 220 cm)',
        specs: 'W 360 × D 220 × H 82 cm',
        price_delta: 55000,
        is_default: 0,
        sort_order: 3,
      },
    ],
    'dune-coffee-table': [
      {
        label: 'Compact (W 90 × D 50 × H 40 cm)',
        specs: 'W 90 × D 50 × H 40 cm',
        price_delta: -6000,
        is_default: 0,
        sort_order: 1,
      },
      {
        label: 'Standard (W 110 × D 60 × H 40 cm)',
        specs: 'W 110 × D 60 × H 40 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 2,
      },
      {
        label: 'Grand (W 130 × D 70 × H 42 cm)',
        specs: 'W 130 × D 70 × H 42 cm',
        price_delta: 12000,
        is_default: 0,
        sort_order: 3,
      },
    ],
    'slab-dining-table': [
      {
        label: '6-Seater (W 200 × D 95 cm)',
        specs: 'W 200 × D 95 × H 76 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: '8-Seater (W 240 × D 100 cm)',
        specs: 'W 240 × D 100 × H 76 cm',
        price_delta: 28000,
        is_default: 0,
        sort_order: 2,
      },
      {
        label: '10-Seater Grand (W 280 × D 105 cm)',
        specs: 'W 280 × D 105 × H 76 cm',
        price_delta: 54000,
        is_default: 0,
        sort_order: 3,
      },
    ],
    'lune-accent-chair': [
      {
        label: 'Standard (W 70 × D 75 × H 80 cm)',
        specs: 'W 70 × D 75 × H 80 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: 'Wide Lounge (W 78 × D 82 × H 80 cm)',
        specs: 'W 78 × D 82 × H 80 cm',
        price_delta: 8000,
        is_default: 0,
        sort_order: 2,
      },
    ],
    'nordic-media-console': [
      {
        label: 'Standard 160 cm (Up to 65")',
        specs: 'W 160 × D 45 × H 52 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: 'Grand 200 cm (Up to 85")',
        specs: 'W 200 × D 45 × H 52 cm',
        price_delta: 16000,
        is_default: 0,
        sort_order: 2,
      },
    ],
    'haven-bed': [
      {
        label: 'Queen (160 × 200 cm)',
        specs: 'W 175 × D 215 × H 105 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: 'King (180 × 200 cm)',
        specs: 'W 195 × D 215 × H 105 cm',
        price_delta: 18000,
        is_default: 0,
        sort_order: 2,
      },
      {
        label: 'Super King (200 × 200 cm)',
        specs: 'W 215 × D 215 × H 105 cm',
        price_delta: 32000,
        is_default: 0,
        sort_order: 3,
      },
    ],
    'koben-work-desk': [
      {
        label: 'Studio (140 × 70 cm)',
        specs: 'W 140 × D 70 × H 75 cm',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
      {
        label: 'Executive (170 × 80 cm)',
        specs: 'W 170 × D 80 × H 75 cm',
        price_delta: 15000,
        is_default: 0,
        sort_order: 2,
      },
    ],
  };

  for (const p of products) {
    const { lastInsertRowid: productId } = insertProduct.run(
      catMap[p.cat],
      p.name,
      p.slug,
      p.desc,
      p.price,
      p.salePrice || null,
      JSON.stringify(p.images || []),
      p.dims || null,
      p.mat || null,
      p.finish || null,
      p.featured || 0
    );

    // Seed dimensions
    const dims = DIMENSIONS_SEEDS[p.slug] || [
      {
        label: p.dims || 'Standard Dimensions',
        specs: p.dims || '',
        price_delta: 0,
        is_default: 1,
        sort_order: 1,
      },
    ];

    for (const d of dims) {
      insertDim.run(
        productId,
        d.label,
        d.specs || null,
        d.price_delta || 0,
        d.is_default ? 1 : 0,
        d.sort_order || 1
      );
    }

    console.log(
      `✅  Product  →  ${p.name} (${(p.images || []).length} photos, ${dims.length} dimension variants)`
    );
  }

  console.log('\n🎉  Seed complete with multi-angle galleries!');
  console.log('─────────────────────────────');
  console.log('  Storefront : http://localhost:3000/shop');
  console.log('  Admin URL  : http://localhost:3000/admin');
  console.log('  Username   : admin');
  console.log('  Password   : admin123');
  console.log('─────────────────────────────\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});

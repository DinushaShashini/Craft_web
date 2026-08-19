require('dotenv').config();

const connectDB = require('../src/config/db');
const env       = require('../src/config/env');
const User      = require('../src/models/User');
const Category  = require('../src/models/Category');
const Product   = require('../src/models/Product');

// ── Categories ────────────────────────────────────────────────
const categoryData = [
  {
    slug:        'keychains',
    name:        'Keychains',
    icon:        '🗝️',
    description: 'Handcrafted resin keychains – ocean, letters, personalized',
    color:       '#2563EB',
    bgColor:     '#EFF6FF',
    sortOrder:   1,
  },
  {
    slug:        'accessories',
    name:        'Accessories',
    icon:        '✏️',
    description: 'Custom glitter pens and wearable handmade accessories',
    color:       '#9333EA',
    bgColor:     '#F5F3FF',
    sortOrder:   2,
  },
  {
    slug:        'gifts',
    name:        'Gifts',
    icon:        '🎁',
    description: 'Unique resin gifts for special occasions',
    color:       '#C9785A',
    bgColor:     '#FFF7ED',
    sortOrder:   3,
  },
  {
    slug:        'bouquets',
    name:        'Craft Bouquets',
    icon:        '💐',
    description: 'Handcrafted decorative bouquets',
    color:       '#B87CB4',
    bgColor:     '#F5EAF5',
    sortOrder:   4,
  },
  {
    slug:        'decor',
    name:        'Home Decor',
    icon:        '🏡',
    description: 'Handmade decorative resin pieces for your home',
    color:       '#7A8E9E',
    bgColor:     '#EAF0F5',
    sortOrder:   5,
  },
];

// ── Default rating object ─────────────────────────────────────
const defaultRating = (avg, count) => ({
  average:      avg,
  count,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: count },
});

// ── Product template factory ──────────────────────────────────
// category is resolved to ObjectId in the seed() function
const productTemplates = [
  {
    name:         'Ocean Round Resin Keychain',
    categorySlug: 'keychains',
    price:        450,
    originalPrice: null,
    description:  'A beautiful round resin keychain featuring a handcrafted ocean scene inside – real seashells, green seaweed, coral pieces, and tiny gold jellyfish charms embedded in vibrant ocean-blue crystal resin. Each one is unique.',
    longDescription: 'These stunning round resin keychains are hand-poured one at a time. Each piece contains real ocean elements: seashells, coral fragments, green sea moss, and delicate gold metallic jellyfish figures – all suspended in crystal-clear blue epoxy resin.',
    images:       ['/images/products/ocean-round-resin-keychain.jpg'],
    tags:         ['resin', 'ocean', 'seashell', 'jellyfish', 'blue', 'round'],
    rating:       defaultRating(4.9, 38),
    stock:        20,
    isBestseller: true,
    featured:     true,
    customizable: false,
    materials:    ['Epoxy Resin', 'Real Seashells', 'Coral', 'Seaweed', 'Gold Metal Charms', 'Gold Keyring'],
    dimensions:   '~3.5 cm diameter',
    weight:       '~20 g',
  },
  {
    name:         'Personalized Ocean Keychain – Name / Drive Safe / Photo',
    categorySlug: 'keychains',
    price:        600,
    originalPrice: null,
    description:  'Rectangular ocean-themed resin keychain personalized with your name, a message like "Drive Safe", or an embedded photo.',
    longDescription: 'This is IMO Craft\'s most popular personalized item. A rectangular resin keychain hand-crafted with a deep ocean blue and teal background filled with real seashells, holographic glitter, and gold jellyfish charms.',
    images:       ['/images/products/personalized-rect-keychain.jpg'],
    tags:         ['personalized', 'name', 'drive safe', 'photo', 'ocean', 'rectangle', 'gift'],
    rating:       defaultRating(5.0, 62),
    stock:        30,
    isBestseller: true,
    featured:     true,
    customizable: true,
    customizationFields: ['name', 'message', 'color'],
    materials:    ['Epoxy Resin', 'Seashells', 'Holographic Glitter', 'Gold Jellyfish Charms', 'Gold Chain & Ring'],
    dimensions:   '~6 cm × 3.5 cm',
    weight:       '~30 g',
  },
  {
    name:         'Round Custom Text Keychain – Event / Institution',
    categorySlug: 'keychains',
    price:        350,
    originalPrice: null,
    description:  'Round navy resin keychain with a gold crescent moon, stars, and custom printed text – perfect for school events and institutional souvenirs.',
    longDescription: 'A navy-blue circular resin keychain featuring a gold crescent moon and star motif with your custom text printed on the face.',
    images:       ['/images/products/moon-stars-round-keychain.jpg'],
    tags:         ['event', 'institution', 'graduation', 'custom text', 'moon', 'stars', 'navy', 'bulk'],
    rating:       defaultRating(4.8, 45),
    stock:        100,
    isBestseller: true,
    featured:     true,
    customizable: true,
    customizationFields: ['text', 'event_name'],
    materials:    ['Epoxy Resin', 'Gold Moon & Star Charms', 'Printed Design', 'Gold Ring'],
    dimensions:   '~4 cm diameter',
    weight:       '~18 g',
  },
  {
    name:         'Ocean Letter Keychain – Initial Letter',
    categorySlug: 'keychains',
    price:        500,
    originalPrice: null,
    description:  'Large letter-shaped resin keychain in an ocean theme. Each letter (A–Z) is filled with real seashells, seaweed, and gold jellyfish charms.',
    longDescription: 'These bold letter-shaped resin keychains make the perfect personalized gift. Available in any letter A–Z.',
    images:       ['/images/products/ocean-letter-keychain.jpg'],
    tags:         ['letter', 'initial', 'ocean', 'seashell', 'alphabet', 'personalized', 'blue'],
    rating:       defaultRating(4.8, 29),
    stock:        26,
    isBestseller: false,
    featured:     true,
    customizable: true,
    customizationFields: ['letter'],
    materials:    ['Epoxy Resin', 'Real Seashells', 'Seaweed', 'Gold Jellyfish Charms', 'Gold Keyring'],
    dimensions:   '~5–6 cm tall (letter size varies)',
    weight:       '~25–35 g',
  },
  {
    name:         'Glitter Letter Keychain – Choose Color & Letter',
    categorySlug: 'keychains',
    price:        400,
    originalPrice: null,
    description:  'Vibrant glitter-filled letter keychains available in purple, sky blue, or hot pink.',
    longDescription: 'These chunky alphabet letter keychains are bursting with glitter and color. Available in all letters A–Z.',
    images:       ['/images/products/glitter-letter-keychain.jpg'],
    tags:         ['letter', 'glitter', 'purple', 'blue', 'pink', 'sparkle', 'alphabet', 'colorful'],
    rating:       defaultRating(4.7, 34),
    stock:        26,
    isBestseller: false,
    isNew:        true,
    featured:     true,
    customizable: true,
    customizationFields: ['letter', 'color'],
    materials:    ['Colored Epoxy Resin', 'Holographic Glitter', 'Metal Keyring'],
    dimensions:   '~5–6 cm tall',
    weight:       '~20–30 g',
  },
  {
    name:         'Resin Ocean Cabochon – Pendant / Charm',
    categorySlug: 'keychains',
    price:        380,
    originalPrice: null,
    description:  'Individual ocean-themed resin cabochon pendants with shells, seaweed, and gold jellyfish inside ocean-blue resin domes.',
    longDescription: 'Hand-poured ocean resin cabochons sold individually as charms or pendants.',
    images:       ['/images/products/ocean-round-resin-keychain.jpg'],
    tags:         ['cabochon', 'pendant', 'charm', 'ocean', 'seashell', 'DIY', 'blue'],
    rating:       defaultRating(4.6, 17),
    stock:        50,
    isBestseller: false,
    isNew:        true,
    featured:     false,
    customizable: false,
    materials:    ['Epoxy Resin', 'Real Seashells', 'Seaweed', 'Gold Metal Figures'],
    dimensions:   '~3 cm diameter, flat back',
    weight:       '~10 g',
  },
  {
    name:         'Personalized Glitter Pen – Custom Name',
    categorySlug: 'accessories',
    price:        350,
    originalPrice: null,
    description:  'A beautiful ballpoint pen with a glitter-filled resin barrel embedded with your name.',
    longDescription: 'These gorgeous glitter pens feature a smooth-writing ballpoint mechanism inside a transparent resin barrel packed with holographic glitter.',
    images:       ['/images/products/personalized-name-pen.jpg'],
    tags:         ['pen', 'glitter', 'personalized', 'name', 'stationery', 'gift', 'purple', 'blue', 'pink'],
    rating:       defaultRating(4.9, 51),
    stock:        50,
    isBestseller: true,
    featured:     true,
    customizable: true,
    customizationFields: ['name', 'color'],
    materials:    ['Transparent Resin', 'Holographic Glitter', 'Ballpoint Pen Refill'],
    dimensions:   '~14 cm length',
    weight:       '~15 g',
  },
  {
    name:         'Resin Photo Frame – Circular Floral',
    categorySlug: 'gifts',
    price:        1500,
    originalPrice: null,
    description:  'A breathtaking circular resin photo frame with real dried flowers, pearls, shells, and greenery preserved in clear resin.',
    longDescription: 'This circular photo frame is a showpiece with a wide border ring cast from crystal-clear epoxy resin.',
    images:       ['/images/products/resin-photo-frame.jpg', '/images/products/glitter-letter-keychain.jpg'],
    tags:         ['photo frame', 'circular', 'floral', 'dried flowers', 'resin', 'personalized', 'gift', 'keepsake'],
    rating:       defaultRating(5.0, 28),
    stock:        10,
    isBestseller: true,
    featured:     true,
    customizable: true,
    customizationFields: ['size', 'special_request'],
    materials:    ['Epoxy Resin', 'Dried Flowers', 'Pearl Beads', 'Seashells', 'Pressed Greenery'],
    dimensions:   '15 cm or 20 cm diameter (choose at checkout)',
    weight:       '~200–350 g',
  },
];

// ── Seed function ─────────────────────────────────────────────
async function seed() {
  await connectDB();

  // 1. Admin user
  if (!env.admin.email || !env.admin.password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const existingAdmin = await User.findOne({ email: env.admin.email.toLowerCase() });
  if (!existingAdmin) {
    await User.create({
      name:     env.admin.name || 'IMO Craft Admin',
      email:    env.admin.email,
      password: env.admin.password,
      role:     'admin',
    });
    console.log(`✅ Admin user created: ${env.admin.email}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${env.admin.email}`);
  }

  // 2. Categories — upsert and collect slug → ObjectId map
  const categoryMap = {}; // { 'keychains': ObjectId, ... }
  for (const cat of categoryData) {
    const saved = await Category.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryMap[cat.slug] = saved._id;
  }
  console.log(`✅ Seeded ${categoryData.length} categories.`);

  // 3. Products — only insert if none exist
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    // Resolve categorySlug → ObjectId for each product
    const productsToInsert = productTemplates.map(({ categorySlug, ...p }) => ({
      ...p,
      category:     categoryMap[categorySlug],
      categorySlug: categorySlug,
    }));

    // Use insertMany with { lean: true } to skip pre-validate hooks
    // (avoids Category DB lookup in pre-validate since we already set categorySlug)
    await Product.insertMany(productsToInsert, { lean: false });
    console.log(`✅ Seeded ${productsToInsert.length} products.`);
  } else {
    console.log(`ℹ️  Skipped products (${existingProducts} already exist).`);
  }

  console.log('\n🎉 Seed complete! IMO Craft database is ready.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

require('dotenv').config();

const connectDB = require('../src/config/db');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

const categories = [
  {
    slug: 'keychains',
    name: 'Keychains',
    icon: '🗝️',
    description: 'Handcrafted resin keychains – ocean, letters, personalized',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    icon: '✏️',
    description: 'Custom glitter pens and wearable handmade accessories',
    color: '#9333EA',
    bgColor: '#F5F3FF',
  },
  {
    slug: 'gifts',
    name: 'Gifts',
    icon: '🎁',
    description: 'Unique resin gifts for special occasions',
    color: '#C9785A',
    bgColor: '#FFF7ED',
  },
  {
    slug: 'bouquets',
    name: 'Craft Bouquets',
    icon: '💐',
    description: 'Handcrafted decorative bouquets',
    color: '#B87CB4',
    bgColor: '#F5EAF5',
  },
  {
    slug: 'decor',
    name: 'Home Decor',
    icon: '🏡',
    description: 'Handmade decorative resin pieces for your home',
    color: '#7A8E9E',
    bgColor: '#EAF0F5',
  },
];

const products = [
  {
    name: 'Ocean Round Resin Keychain',
    category: 'keychains',
    price: 450,
    originalPrice: null,
    description:
      'A beautiful round resin keychain featuring a handcrafted ocean scene inside – real seashells, green seaweed, coral pieces, and tiny gold jellyfish charms embedded in vibrant ocean-blue crystal resin. Each one is unique.',
    longDescription:
      'These stunning round resin keychains are hand-poured one at a time. Each piece contains real ocean elements: seashells, coral fragments, green sea moss, and delicate gold metallic jellyfish figures – all suspended in crystal-clear blue epoxy resin.',
    images: ['/images/products/ocean-round-resin-keychain.jpg'],
    tags: ['resin', 'ocean', 'seashell', 'jellyfish', 'blue', 'round'],
    rating: 4.9,
    reviews: 38,
    stock: 20,
    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: false,
    materials: ['Epoxy Resin', 'Real Seashells', 'Coral', 'Seaweed', 'Gold Metal Charms', 'Gold Keyring'],
    dimensions: '~3.5 cm diameter',
    weight: '~20 g',
  },
  {
    name: 'Personalized Ocean Keychain – Name / Drive Safe / Photo',
    category: 'keychains',
    price: 600,
    originalPrice: null,
    description:
      'Rectangular ocean-themed resin keychain personalized with your name, a message like "Drive Safe", or an embedded photo.',
    longDescription:
      'This is IMO Craft\'s most popular personalized item. A rectangular resin keychain hand-crafted with a deep ocean blue and teal background filled with real seashells, holographic glitter, and gold jellyfish charms.',
    images: ['/images/products/personalized-rect-keychain.jpg'],
    tags: ['personalized', 'name', 'drive safe', 'photo', 'ocean', 'rectangle', 'gift'],
    rating: 5.0,
    reviews: 62,
    stock: 30,
    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,
    materials: ['Epoxy Resin', 'Seashells', 'Holographic Glitter', 'Gold Jellyfish Charms', 'Gold Chain & Ring'],
    dimensions: '~6 cm × 3.5 cm',
    weight: '~30 g',
  },
  {
    name: 'Round Custom Text Keychain – Event / Institution',
    category: 'keychains',
    price: 350,
    originalPrice: null,
    description:
      'Round navy resin keychain with a gold crescent moon, stars, and custom printed text – perfect for school events and institutional souvenirs.',
    longDescription:
      'A navy-blue circular resin keychain featuring a gold crescent moon and star motif with your custom text printed on the face.',
    images: ['/images/products/moon-stars-round-keychain.jpg'],
    tags: ['event', 'institution', 'graduation', 'custom text', 'moon', 'stars', 'navy', 'bulk'],
    rating: 4.8,
    reviews: 45,
    stock: 100,
    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,
    materials: ['Epoxy Resin', 'Gold Moon & Star Charms', 'Printed Design', 'Gold Ring'],
    dimensions: '~4 cm diameter',
    weight: '~18 g',
  },
  {
    name: 'Ocean Letter Keychain – Initial Letter',
    category: 'keychains',
    price: 500,
    originalPrice: null,
    description:
      'Large letter-shaped resin keychain in an ocean theme. Each letter (A–Z) is filled with real seashells, seaweed, and gold jellyfish charms.',
    longDescription:
      'These bold letter-shaped resin keychains make the perfect personalized gift. Available in any letter A–Z.',
    images: ['/images/products/ocean-letter-keychain.jpg'],
    tags: ['letter', 'initial', 'ocean', 'seashell', 'alphabet', 'personalized', 'blue'],
    rating: 4.8,
    reviews: 29,
    stock: 26,
    isBestseller: false,
    isNew: false,
    isFeatured: true,
    customizable: true,
    materials: ['Epoxy Resin', 'Real Seashells', 'Seaweed', 'Gold Jellyfish Charms', 'Gold Keyring'],
    dimensions: '~5–6 cm tall (letter size varies)',
    weight: '~25–35 g',
  },
  {
    name: 'Glitter Letter Keychain – Choose Color & Letter',
    category: 'keychains',
    price: 400,
    originalPrice: null,
    description:
      'Vibrant glitter-filled letter keychains available in purple, sky blue, or hot pink.',
    longDescription:
      'These chunky alphabet letter keychains are bursting with glitter and color. Available in all letters A–Z.',
    images: ['/images/products/glitter-letter-keychain.jpg'],
    tags: ['letter', 'glitter', 'purple', 'blue', 'pink', 'sparkle', 'alphabet', 'colorful'],
    rating: 4.7,
    reviews: 34,
    stock: 26,
    isBestseller: false,
    isNew: true,
    isFeatured: true,
    customizable: true,
    materials: ['Colored Epoxy Resin', 'Holographic Glitter', 'Metal Keyring'],
    dimensions: '~5–6 cm tall',
    weight: '~20–30 g',
  },
  {
    name: 'Resin Ocean Cabochon – Pendant / Charm',
    category: 'keychains',
    price: 380,
    originalPrice: null,
    description:
      'Individual ocean-themed resin cabochon pendants with shells, seaweed, and gold jellyfish inside ocean-blue resin domes.',
    longDescription:
      'Hand-poured ocean resin cabochons sold individually as charms or pendants.',
    images: ['/images/products/ocean-round-resin-keychain.jpg'],
    tags: ['cabochon', 'pendant', 'charm', 'ocean', 'seashell', 'DIY', 'blue'],
    rating: 4.6,
    reviews: 17,
    stock: 50,
    isBestseller: false,
    isNew: true,
    isFeatured: false,
    customizable: false,
    materials: ['Epoxy Resin', 'Real Seashells', 'Seaweed', 'Gold Metal Figures'],
    dimensions: '~3 cm diameter, flat back',
    weight: '~10 g',
  },
  {
    name: 'Personalized Glitter Pen – Custom Name',
    category: 'accessories',
    price: 350,
    originalPrice: null,
    description:
      'A beautiful ballpoint pen with a glitter-filled resin barrel embedded with your name.',
    longDescription:
      'These gorgeous glitter pens feature a smooth-writing ballpoint mechanism inside a transparent resin barrel packed with holographic glitter.',
    images: ['/images/products/personalized-name-pen.jpg'],
    tags: ['pen', 'glitter', 'personalized', 'name', 'stationery', 'gift', 'purple', 'blue', 'pink'],
    rating: 4.9,
    reviews: 51,
    stock: 50,
    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,
    materials: ['Transparent Resin', 'Holographic Glitter', 'Ballpoint Pen Refill'],
    dimensions: '~14 cm length',
    weight: '~15 g',
  },
  {
    name: 'Resin Photo Frame – Circular Floral',
    category: 'gifts',
    price: 1500,
    originalPrice: null,
    description:
      'A breathtaking circular resin photo frame with real dried flowers, pearls, shells, and greenery preserved in clear resin.',
    longDescription:
      'This circular photo frame is a showpiece with a wide border ring cast from crystal-clear epoxy resin.',
    images: ['/images/products/resin-photo-frame.jpg', '/images/products/glitter-letter-keychain.jpg'],
    tags: ['photo frame', 'circular', 'floral', 'dried flowers', 'resin', 'personalized', 'gift', 'keepsake'],
    rating: 5.0,
    reviews: 28,
    stock: 10,
    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,
    materials: ['Epoxy Resin', 'Dried Flowers', 'Pearl Beads', 'Seashells', 'Pressed Greenery'],
    dimensions: '15 cm or 20 cm diameter (choose at checkout)',
    weight: '~200–350 g',
  },
];

async function seed() {
  await connectDB();

  if (!env.admin.email || !env.admin.password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the admin user.');
  }

  const existingAdmin = await User.findOne({ email: env.admin.email.toLowerCase() });
  if (!existingAdmin) {
    await User.create({
      name: env.admin.name,
      email: env.admin.email,
      password: env.admin.password,
      role: 'admin',
    });
    console.log(`Admin user created: ${env.admin.email}`);
  } else {
    console.log(`Admin user already exists: ${env.admin.email}`);
  }

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
  }
  console.log(`Seeded ${categories.length} categories.`);

  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
  } else {
    console.log(`Skipped products (${existingProducts} already in database).`);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

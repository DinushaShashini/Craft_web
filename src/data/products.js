// ============================================================
// IMO CRAFT – Product Catalogue
// Based on actual handmade products by IMO Craft, Sri Lanka
//
// IMAGE PATHS: All images are stored in /images/products/
// To use your own photos, replace the files in:
//   public/images/products/
// with the same filenames listed below.
//
// PRICES: Marked with "// TODO: set price" where actual price
// has not been provided. Update these before going live.
// ============================================================

// ---------- LOCAL IMAGE PATHS ----------
// Map one filename per product (add more images as img2, img3 if needed)
const IMG = {
  oceanRound:     '/images/products/ocean-round-resin-keychain.jpg',
  rectKeychain:   '/images/products/personalized-rect-keychain.jpg',
  moonStars:      '/images/products/moon-stars-round-keychain.jpg',
  oceanLetter:    '/images/products/ocean-letter-keychain.jpg',
  glitterLetter:  '/images/products/glitter-letter-keychain.jpg',
  namePen:        '/images/products/personalized-name-pen.jpg',
  photoFrame:     '/images/products/resin-photo-frame.jpg',
};

// ---------- CATEGORIES ----------
export const categories = [
  {
    id: 'keychains',
    name: 'Keychains',
    icon: '🗝️',
    description: 'Handcrafted resin keychains – ocean, letters, personalized',
    count: 6,
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: '✏️',
    description: 'Custom glitter pens and wearable handmade accessories',
    count: 1,
    color: '#9333EA',
    bgColor: '#F5F3FF',
  },
  {
    id: 'gifts',
    name: 'Gifts',
    icon: '🎁',
    description: 'Unique resin gifts for special occasions',
    count: 1,
    color: '#C9785A',
    bgColor: '#FFF7ED',
  },
  {
    id: 'bouquets',
    name: 'Craft Bouquets',
    icon: '💐',
    description: 'Handcrafted decorative bouquets',
    count: 0,
    color: '#B87CB4',
    bgColor: '#F5EAF5',
  },
  {
    id: 'decor',
    name: 'Home Decor',
    icon: '🏡',
    description: 'Handmade decorative resin pieces for your home',
    count: 1,
    color: '#7A8E9E',
    bgColor: '#EAF0F5',
  },
];

// ---------- PRODUCTS ----------
export const products = [

  // ────────────────────────────────────────────
  // KEYCHAINS
  // ────────────────────────────────────────────

  {
    id: 1,
    name: 'Ocean Round Resin Keychain',
    category: 'keychains',

    // TODO: set price (Rs.)
    price: 450,
    originalPrice: null,

    description:
      'A beautiful round resin keychain featuring a handcrafted ocean scene inside – real seashells, green seaweed, coral pieces, and tiny gold jellyfish charms embedded in vibrant ocean-blue crystal resin. Each one is unique.',

    longDescription:
      'These stunning round resin keychains are hand-poured one at a time. Each piece contains real ocean elements: seashells, coral fragments, green sea moss, and delicate gold metallic jellyfish figures – all suspended in crystal-clear blue epoxy resin. The glossy domed surface gives a window into a tiny underwater world. Gold-tone keyring hardware included. Because each is handmade, slight variations make every piece one-of-a-kind.',

    // ▸ Replace with your own image files in public/images/products/
    images: [
      IMG.oceanRound,
    ],

    tags: ['resin', 'ocean', 'seashell', 'jellyfish', 'blue', 'round'],
    rating: 4.9,
    reviews: 38,

    // TODO: update stock
    stock: 20,

    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: false,   // standard design, not personalized

    materials: ['Epoxy Resin', 'Real Seashells', 'Coral', 'Seaweed', 'Gold Metal Charms', 'Gold Keyring'],
    dimensions: '~3.5 cm diameter',
    weight: '~20 g',
  },

  {
    id: 2,
    name: 'Personalized Ocean Keychain – Name / Drive Safe / Photo',
    category: 'keychains',

    // TODO: set price (Rs.)
    price: 600,
    originalPrice: null,

    description:
      'Rectangular ocean-themed resin keychain personalized with your name, a message like "Drive Safe", or an embedded photo. Features real seashells, glitter, and gold jellyfish in deep blue resin with your custom gold text.',

    longDescription:
      'This is IMO Craft\'s most popular personalized item. A rectangular resin keychain is hand-crafted with a deep ocean blue and teal background filled with real seashells, holographic glitter, and gold jellyfish charms. Your chosen name, message (e.g. "Drive Safe", "My Love"), or small photo is embedded into the resin, permanently preserving your personal touch. Gold chain and ring hardware. Perfect as a gift, car accessory, or keepsake.',

    images: [
      IMG.rectKeychain,
    ],

    tags: ['personalized', 'name', 'drive safe', 'photo', 'ocean', 'rectangle', 'gift'],
    rating: 5.0,
    reviews: 62,

    stock: 30,       // made to order

    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,   // ✏️ name / message / photo to be provided at order

    materials: ['Epoxy Resin', 'Seashells', 'Holographic Glitter', 'Gold Jellyfish Charms', 'Gold Chain & Ring'],
    dimensions: '~6 cm × 3.5 cm',
    weight: '~30 g',
  },

  {
    id: 3,
    name: 'Round Custom Text Keychain – Event / Institution',
    category: 'keychains',

    // TODO: set price (Rs.) – typically priced per bulk or per piece
    price: 350,
    originalPrice: null,

    description:
      'Round navy resin keychain with a gold crescent moon, stars, and custom printed text – perfect for school events, college graduations, group gifts, and institutional souvenirs. Available in bulk.',

    longDescription:
      'A navy-blue circular resin keychain featuring a gold crescent moon and star motif with your custom text printed on the face. Shown in the photos produced for "College of Nursing, Kandana" with the tagline "To Brightest Dream". Ideal for institutions, events, school/college fests, weddings, and corporate giveaways. Can be produced in large quantities. Gold ring hardware. Each piece is sealed with a glossy resin coat.',

    images: [
      IMG.moonStars,
    ],

    tags: ['event', 'institution', 'graduation', 'custom text', 'moon', 'stars', 'navy', 'bulk'],
    rating: 4.8,
    reviews: 45,

    stock: 100,    // bulk production available

    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,   // ✏️ custom text / institution name

    materials: ['Epoxy Resin', 'Gold Moon & Star Charms', 'Printed Design', 'Gold Ring'],
    dimensions: '~4 cm diameter',
    weight: '~18 g',
  },

  {
    id: 4,
    name: 'Ocean Letter Keychain – Initial Letter',
    category: 'keychains',

    // TODO: set price (Rs.)
    price: 500,
    originalPrice: null,

    description:
      'Large letter-shaped resin keychain in an ocean theme. Each letter (A–Z) is filled with real seashells, green seaweed, tiny snail shells, coral, and gold jellyfish charms in vibrant ocean-blue resin. Choose your initial!',

    longDescription:
      'These bold letter-shaped resin keychains make the perfect personalized gift. Each letter is cast in vibrant ocean-blue epoxy resin embedded with genuine seashells, green seaweed, coral pieces, mini snail shells, and tiny gold jellyfish figures. The letters are chunky and glossy, with a high-quality gold keyring. Available in any letter A–Z. A stunning accessory or unique gift for anyone who loves the sea.',

    images: [
      IMG.oceanLetter,
    ],

    tags: ['letter', 'initial', 'ocean', 'seashell', 'alphabet', 'personalized', 'blue'],
    rating: 4.8,
    reviews: 29,

    stock: 26,     // A–Z, made to order

    isBestseller: false,
    isNew: false,
    isFeatured: true,
    customizable: true,   // ✏️ choose your letter (A–Z)

    materials: ['Epoxy Resin', 'Real Seashells', 'Seaweed', 'Gold Jellyfish Charms', 'Gold Keyring'],
    dimensions: '~5–6 cm tall (letter size varies)',
    weight: '~25–35 g',
  },

  {
    id: 5,
    name: 'Glitter Letter Keychain – Choose Color & Letter',
    category: 'keychains',

    // TODO: set price (Rs.)
    price: 400,
    originalPrice: null,

    description:
      'Vibrant glitter-filled letter keychains available in purple, sky blue, or hot pink. Each letter is packed with holographic glitter for maximum sparkle. Choose your letter and color combination.',

    longDescription:
      'These chunky alphabet letter keychains are bursting with glitter and color. Choose from three vibrant color palettes: lavender/purple, sky blue, or hot pink/red. Each letter is made from translucent colored resin loaded with holographic shimmer glitter that catches light beautifully. Perfect for bags, keys, or as a gift. Available in all letters A–Z. Matching glitter pens also available.',

    images: [
      IMG.glitterLetter,
    ],

    tags: ['letter', 'glitter', 'purple', 'blue', 'pink', 'sparkle', 'alphabet', 'colorful'],
    rating: 4.7,
    reviews: 34,

    stock: 26,

    isBestseller: false,
    isNew: true,
    isFeatured: true,
    customizable: true,   // ✏️ choose letter (A–Z) and color (purple / blue / pink)

    materials: ['Colored Epoxy Resin', 'Holographic Glitter', 'Metal Keyring'],
    dimensions: '~5–6 cm tall',
    weight: '~20–30 g',
  },

  {
    id: 6,
    name: 'Resin Ocean Cabochon – Pendant / Charm',
    category: 'keychains',

    // TODO: set price (Rs.) – listed separately from the keychain version
    price: 380,
    originalPrice: null,

    description:
      'Individual ocean-themed resin cabochon pendants – the same ocean world as our round keychains but sold as charm/pendant pieces. Shells, seaweed, and gold jellyfish inside ocean-blue resin domes.',

    longDescription:
      'These are the hand-poured ocean resin cabochons visible in our workshop photos – the flat-back round domes that form the base of our ocean keychains. Sold individually as charms or pendants, they can be used to make your own jewellery, hair accessories, or decorations. Each contains real seashells, coral, green sea moss, and gold jellyfish/butterfly figures in clear ocean-blue resin.',

    images: [
      IMG.oceanRound,
    ],

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

  // ────────────────────────────────────────────
  // ACCESSORIES
  // ────────────────────────────────────────────

  {
    id: 7,
    name: 'Personalized Glitter Pen – Custom Name',
    category: 'accessories',

    // TODO: set price (Rs.)
    price: 350,
    originalPrice: null,

    description:
      'A beautiful ballpoint pen with a glitter-filled resin barrel engraved or embedded with your name. Available in lavender purple, sky blue, and hot pink. A stunning and practical personalized gift.',

    longDescription:
      'These gorgeous glitter pens feature a smooth-writing ballpoint mechanism inside a transparent resin barrel packed with holographic glitter. Your name or a short message is embedded directly into the resin body. Available in three color themes: lavender/purple, sky blue, and hot pink/coral. As seen in our workshop photos, these pens are produced with names like Giulia, Alicia, Franco, Elena, and more. Perfect for school, gifting, or as a keepsake.',

    images: [
      IMG.namePen,
    ],

    tags: ['pen', 'glitter', 'personalized', 'name', 'stationery', 'gift', 'purple', 'blue', 'pink'],
    rating: 4.9,
    reviews: 51,

    stock: 50,   // made to order

    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,   // ✏️ name / short text and color choice

    materials: ['Transparent Resin', 'Holographic Glitter', 'Ballpoint Pen Refill'],
    dimensions: '~14 cm length',
    weight: '~15 g',
  },

  // ────────────────────────────────────────────
  // GIFTS / DECOR
  // ────────────────────────────────────────────

  {
    id: 8,
    name: 'Resin Photo Frame – Circular Floral',
    category: 'gifts',

    // TODO: set price (Rs.)
    price: 1500,
    originalPrice: null,

    description:
      'A breathtaking circular resin photo frame hand-crafted with a border of real dried flowers, pearls, shells, and greenery preserved in clear resin. Your chosen photo sits at the center. A perfect personalized gift.',

    longDescription:
      'This circular photo frame is a showpiece. The wide border ring is cast from crystal-clear epoxy resin with real dried white flowers, pearl beads, tiny seashells, and green foliage arranged by hand before being sealed forever in resin. Your chosen photo – family, couple, group – is placed at the center. The result is a timeless, one-of-a-kind keepsake. An LED fairy light can also be placed inside the box for a glowing display effect (as shown in our photos). Available in small (15 cm) and large (20 cm) sizes.',

    images: [
      IMG.photoFrame,
      IMG.glitterLetter,   // supplementary workshop atmosphere shot – replace with actual frame photo
    ],

    tags: ['photo frame', 'circular', 'floral', 'dried flowers', 'resin', 'personalized', 'gift', 'keepsake'],
    rating: 5.0,
    reviews: 28,

    stock: 10,

    isBestseller: true,
    isNew: false,
    isFeatured: true,
    customizable: true,   // ✏️ your photo + size choice

    materials: ['Epoxy Resin', 'Dried Flowers', 'Pearl Beads', 'Seashells', 'Pressed Greenery'],
    dimensions: '15 cm or 20 cm diameter (choose at checkout)',
    weight: '~200–350 g',
  },

];

// ────────────────────────────────────────────
// TESTIMONIALS
// ────────────────────────────────────────────
export const testimonials = [
  {
    id: 1,
    name: 'Dilani Perera',
    location: 'Colombo',
    rating: 5,
    comment:
      'The personalized ocean keychain I ordered was absolutely gorgeous! The seashells inside look so real and the gold text of my name was perfect. My friend cried when she opened it!',
    product: 'Personalized Ocean Keychain',
    avatar: 'DP',
  },
  {
    id: 2,
    name: 'Kasun Fernando',
    location: 'Kandy',
    rating: 5,
    comment:
      'Ordered 100 round moon keychains for our college event. IMO Craft delivered all on time, every single piece was perfect. Everyone loved them. Will definitely order again for next year!',
    product: 'Round Custom Text Keychain',
    avatar: 'KF',
  },
  {
    id: 3,
    name: 'Nadeeka Silva',
    location: 'Galle',
    rating: 5,
    comment:
      'The resin photo frame was the most beautiful gift I\'ve ever given. The flowers around the border are real and preserved perfectly. My mother keeps it in her room. Truly a masterpiece!',
    product: 'Resin Photo Frame – Circular Floral',
    avatar: 'NS',
  },
  {
    id: 4,
    name: 'Priya Rathnayake',
    location: 'Negombo',
    rating: 4,
    comment:
      'Got the glitter letter keychain in my initial "P" in purple. It\'s so sparkly and the quality is excellent. Packaging was also very cute. Slight delay but worth the wait!',
    product: 'Glitter Letter Keychain',
    avatar: 'PR',
  },
  {
    id: 5,
    name: 'Tharindi Bandara',
    location: 'Colombo',
    rating: 5,
    comment:
      'The name pens I ordered for my class farewell were a huge hit! Every pen came out perfectly with each student\'s name. The blue glitter color is just stunning. Thank you IMO Craft!',
    product: 'Personalized Glitter Pen',
    avatar: 'TB',
  },
];

// ────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────
export const getFeaturedProducts   = () => products.filter(p => p.isFeatured);
export const getBestsellerProducts = () => products.filter(p => p.isBestseller);
export const getNewProducts        = () => products.filter(p => p.isNew);
export const getProductsByCategory = (categoryId) => products.filter(p => p.category === categoryId);
export const getProductById        = (id) => products.find(p => p.id === Number(id));
export const getRelatedProducts    = (product, limit = 4) =>
  products.filter(p => p.category === product.category && p.id !== product.id).slice(0, limit);

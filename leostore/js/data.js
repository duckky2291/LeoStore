/**
 * Leo Fashion Store - Milan • Paris • New York • London
 * Catalog Data & High-End European Luxury Collections
 */

const PRODUCTS_DATA = [
  {
    id: "LEO-001",
    name: "Milan Sartorial Double-Breasted Suit",
    category: "men",
    collection: "runway",
    price: 740,
    originalPrice: 880,
    badge: "Haute Couture",
    rating: 4.9,
    reviewCount: 48,
    isFeatured: true,
    isLookbook: true,
    lookbookCoords: { x: 38, y: 35 },
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["38R / S", "40R / M", "42R / L", "44R / XL"],
    colors: [
      { name: "Midnight Navy", hex: "#151c2e" },
      { name: "Charcoal Slate", hex: "#2b2f38" },
      { name: "Obsidian Black", hex: "#111111" }
    ],
    shortDesc: "Classic Italian 6-button double-breasted suit handcrafted with genuine Loro Piana Super 150s virgin wool for an effortless, sharp silhouette.",
    fabricDetail: "100% Super 150s Wool woven in Biella (Italy), 4.1-inch peak lapel, handmade Milanese lapel buttonhole, breathable Bemberg cupro lining.",
    inStock: 7
  },
  {
    id: "LEO-002",
    name: "Florence Cashmere Wrap Overcoat",
    category: "women",
    collection: "autumn-winter",
    price: 610,
    originalPrice: 710,
    badge: "Bestseller",
    rating: 5.0,
    reviewCount: 62,
    isFeatured: true,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Classic Camel", hex: "#c19a6b" },
      { name: "Champagne Cream", hex: "#eae4d5" },
      { name: "Noir Black", hex: "#181818" }
    ],
    shortDesc: "An iconic full-length belted wrap coat cut from pure Mongolian cashmere, designed to drape fluidly while delivering sublime warmth.",
    fabricDetail: "90% Pure Mongolian Cashmere, 10% Mulberry Silk, proprietary Zibeline ripple finish to eliminate pilling and guarantee an exquisite soft luster.",
    inStock: 5
  },
  {
    id: "LEO-003",
    name: "Monaco Silk Jacquard Evening Gown",
    category: "women",
    collection: "runway",
    price: 980,
    originalPrice: 1120,
    badge: "Runway Exclusive",
    rating: 4.9,
    reviewCount: 31,
    isFeatured: true,
    isLookbook: true,
    lookbookCoords: { x: 55, y: 48 },
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["US 2", "US 4", "US 6", "US 8"],
    colors: [
      { name: "Royal Emerald", hex: "#0f3e2e" },
      { name: "Deep Ruby", hex: "#4a1521" },
      { name: "Champagne Gold", hex: "#cbb17b" }
    ],
    shortDesc: "Monaco gala evening gown featuring an architectural high side slit and delicate metallic gold flora jacquard woven in Lyon, France.",
    fabricDetail: "100% Lyon Silk Jacquard with hand-embroidered Swarovski crystal accents along the sculpted spine line, built-in silk corset.",
    inStock: 3
  },
  {
    id: "LEO-004",
    name: "Parisian Velvet Tuxedo Blazer",
    category: "men",
    collection: "runway",
    price: 560,
    originalPrice: 660,
    badge: "New Arrival",
    rating: 4.8,
    reviewCount: 27,
    isFeatured: true,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["38R / M", "40R / L", "42R / XL"],
    colors: [
      { name: "Burgundy Velvet", hex: "#4a121a" },
      { name: "Midnight Sapphire", hex: "#0c1f38" },
      { name: "Onyx Black", hex: "#111111" }
    ],
    shortDesc: "Refined French cotton-silk velvet tuxedo blazer designed with lustrous pure silk satin shawl lapels for black-tie galas.",
    fabricDetail: "French imported Supima cotton-silk velvet, pure silk satin shawl lapel, handcrafted covered velvet buttons, dual interior cigar pockets.",
    inStock: 9
  },
  {
    id: "LEO-005",
    name: "Tuscan Handcrafted Leather Derby",
    category: "accessories",
    collection: "bespoke",
    price: 390,
    originalPrice: 460,
    badge: "Italian Artisan",
    rating: 5.0,
    reviewCount: 54,
    isFeatured: true,
    isLookbook: true,
    lookbookCoords: { x: 42, y: 88 },
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["US 8", "US 8.5", "US 9.5", "US 10", "US 11"],
    colors: [
      { name: "Patina Cognac", hex: "#7a3e1d" },
      { name: "Espresso Brown", hex: "#3b2219" },
      { name: "Classic Noir", hex: "#161616" }
    ],
    shortDesc: "Hand-lasted by master cobblers in Florence with time-honored Goodyear welted construction and hand-burnished vegetable tanned calfskin.",
    fabricDetail: "Full-Grain French calfskin vegetable-tanned in Santa Croce sull'Arno (Tuscany), 8mm stacked oak bark leather sole with rubber heel insert.",
    inStock: 12
  },
  {
    id: "LEO-006",
    name: "Verona Quilted Lambskin Handbag",
    category: "accessories",
    collection: "runway",
    price: 670,
    originalPrice: 780,
    badge: "VIP Exclusive",
    rating: 4.9,
    reviewCount: 43,
    isFeatured: true,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["Medium (10.2 in)"],
    colors: [
      { name: "Crema Pearl", hex: "#f0ece1" },
      { name: "Obsidian Black", hex: "#151515" },
      { name: "Burgundy Wine", hex: "#521623" }
    ],
    shortDesc: "The quintessential luxury accessory featuring diamond chevron quilting, supple Italian lambskin, and a 24K gold-plated signature Lion clasp.",
    fabricDetail: "Ultra-soft Italian Nappa lambskin, solid forged brass hardware bathed in 24K yellow gold, burgundy leather lined interior with zip pocket.",
    inStock: 4
  },
  {
    id: "LEO-007",
    name: "Geneva Heritage Skeleton Automatic Watch",
    category: "accessories",
    collection: "bespoke",
    price: 1520,
    originalPrice: 1800,
    badge: "Limited Edition",
    rating: 5.0,
    reviewCount: 19,
    isFeatured: false,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["40mm Case"],
    colors: [
      { name: "Rose Gold 18K", hex: "#b76e79" },
      { name: "Silver Steel", hex: "#c0c0c0" }
    ],
    shortDesc: "Swiss-engineered skeleton automatic movement beating at 28,800 vph with 48 hours of power reserve and hand-stitched alligator strap.",
    fabricDetail: "Chronometer-certified Swiss Calibre, dual anti-reflective sapphire crystals front and back, water-resistant to 50 meters (5 ATM).",
    inStock: 2
  },
  {
    id: "LEO-008",
    name: "Venetian Heritage Twill Silk Scarf",
    category: "accessories",
    collection: "autumn-winter",
    price: 145,
    originalPrice: 170,
    badge: "VIP Gift Choice",
    rating: 4.8,
    reviewCount: 39,
    isFeatured: false,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["36 x 36 in (90x90cm)"],
    colors: [
      { name: "Venice Baroque Gold", hex: "#d1a852" },
      { name: "Azure Sapphire", hex: "#23496d" }
    ],
    shortDesc: "Heavy silk twill square scarf showcasing classical Venetian Baroque frescoes, finished by hand with delicate rolled edges.",
    fabricDetail: "100% Grade 6A Mulberry Silk woven in Lake Como (Italy), eco-botanical archival screen printing with vivid, permanent pigment depth.",
    inStock: 15
  },
  {
    id: "LEO-009",
    name: "Amalfi Coast Cashmere Mockneck Knit",
    category: "men",
    collection: "autumn-winter",
    price: 290,
    originalPrice: 340,
    badge: "New Arrival",
    rating: 4.9,
    reviewCount: 35,
    isFeatured: false,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Ivory Cream", hex: "#f3ede2" },
      { name: "Heather Slate", hex: "#5b6571" },
      { name: "Olive Earth", hex: "#4b5320" }
    ],
    shortDesc: "Plush mockneck knit crafted from 2-ply Italian cashmere, providing featherweight warmth that layers effortlessly beneath blazers.",
    fabricDetail: "100% 2-ply Cariaggi Italian Cashmere, reinforced collar ribbing designed to retain perfect architectural shape for decades.",
    inStock: 11
  },
  {
    id: "LEO-010",
    name: "Riviera Pleated Linen Trousers",
    category: "men",
    collection: "bespoke",
    price: 195,
    originalPrice: 230,
    badge: "Best Fit",
    rating: 4.7,
    reviewCount: 22,
    isFeatured: false,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["30W / 32L", "32W / 32L", "34W / 32L", "36W / 34L"],
    colors: [
      { name: "Pure Sand", hex: "#d8c8b0" },
      { name: "Olive Green", hex: "#556b2f" },
      { name: "Chalk White", hex: "#fafafa" }
    ],
    shortDesc: "High-rise Gurkha trousers with double forward pleats and adjustable side-tabs, encapsulating Mediterranean Riviera nonchalance.",
    fabricDetail: "100% Heritage Irish Linen from Belfast, 280g/m weight, silver-finish side adjusters, horn buttons, unhemmed for tailor customization.",
    inStock: 8
  },
  {
    id: "LEO-011",
    name: "Cannes Sunset Pleated Silk Skirt",
    category: "women",
    collection: "runway",
    price: 355,
    originalPrice: 420,
    badge: "Trending",
    rating: 4.9,
    reviewCount: 28,
    isFeatured: false,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["US 2", "US 4", "US 6"],
    colors: [
      { name: "Sunset Gold", hex: "#d4af37" },
      { name: "Champagne Silver", hex: "#e0ded9" }
    ],
    shortDesc: "Permanent accordion pleats hand-pressed using French paper molds, creating hypnotic movement reminiscent of dusk along the French Riviera.",
    fabricDetail: "Mulberry Silk Satin Organza, high-rise contoured waistline, hidden Swiss RiRi side zipper closure, smooth habotai silk lining.",
    inStock: 6
  },
  {
    id: "LEO-012",
    name: "Saint-Tropez 18K Gold Aviator Sunglasses",
    category: "accessories",
    collection: "runway",
    price: 330,
    originalPrice: 380,
    badge: "Runway Exclusive",
    rating: 5.0,
    reviewCount: 40,
    isFeatured: false,
    isLookbook: false,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=85"
    ],
    sizes: ["One Size"],
    colors: [
      { name: "18K Gold & Amber", hex: "#d4af37" },
      { name: "Platinum & Grey", hex: "#9b9b9b" }
    ],
    shortDesc: "Featherweight aerospace-grade Japanese titanium frame dipped in 18K yellow gold, fitted with German Zeiss polarized lenses.",
    fabricDetail: "Japanese Beta-Titanium weighing only 18 grams, 18K gold PVD 5-micron plating, scratch-resistant Carl Zeiss antireflective optics.",
    inStock: 10
  }
];

const LOOKBOOK_ITEMS = [
  {
    id: "LOOK-01",
    title: "The Autumn Runway in Milan",
    subtitle: "A seamless symphony of Italian Sartorial Tailoring and Hand-Burnished Leather Artistry",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85",
    hotspots: [
      {
        productId: "LEO-001",
        name: "Milan Sartorial Suit",
        price: 740,
        top: "55%",
        left: "30%"
      },
      {
        productId: "LEO-008",
        name: "Venetian Silk Scarf",
        price: 145,
        top: "62%",
        left: "58%"
      },
      {
        productId: "LEO-005",
        name: "Tuscan Leather Derby",
        price: 390,
        top: "76%",
        left: "78%"
      }
    ]
  }
];

const PROMO_CODES = {
  "LEOVIP10": { discountPercent: 10, minOrder: 200, desc: "10% off exclusive VIP Privé privileges" },
  "PARIS2026": { discountAmount: 50, minOrder: 400, desc: "$50 off your order of $400 or more" },
  "WELCOMELEO": { discountPercent: 5, minOrder: 0, desc: "5% off your first bespoke order" }
};

/**
 * Predefined User Accounts & Role Permissions
 */
const USERS_DATA = [
  {
    id: "USR-ADMIN-01",
    name: "Leonardo De Luca",
    email: "admin@leostore.com",
    password: "admin123",
    role: "admin",
    badgeLabel: "Super Admin",
    title: "Head of Maison & Creative Director",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "USR-SELLER-01",
    name: "Atelier Sartorial Milan",
    email: "seller@atelier-milan.com",
    password: "seller123",
    role: "seller",
    badgeLabel: "Atelier Partner",
    title: "Lead Bespoke Tailoring Partner",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "USR-CUST-01",
    name: "Alexander Montgomery",
    email: "vip@leostore.com",
    password: "vip123",
    role: "customer",
    badgeLabel: "VIP Privé Gold",
    title: "Privé Circle Patron",
    points: 12500,
    phone: "+1 (415) 889-7721",
    address: "1800 Pacific Heights Blvd, San Francisco, CA 94109",
    measurements: {
      chest: "40 in (102 cm)",
      waist: "33 in (84 cm)",
      shoulder: "18 in (46 cm)",
      sleeve: "25 in (63 cm)",
      height: "5'11\" (180 cm)",
      weight: "163 lbs (74 kg)"
    },
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
  }
];

/**
 * Initial Seed Orders with Lifecycle Statuses
 * Statuses: 'pending' (Awaiting Concierge Confirmation), 'processing' (In Handcrafted Tailoring), 'shipping' (In White-Glove Transit), 'delivered' (Delivered)
 */
const INITIAL_ORDERS = [
  {
    orderId: "LEO-2026-8892",
    customerId: "USR-CUST-01",
    customer: {
      name: "Alexander Montgomery",
      phone: "+1 (415) 889-7721",
      email: "vip@leostore.com",
      address: "1800 Pacific Heights Blvd, San Francisco, CA 94109"
    },
    paymentMethod: "visa",
    status: "processing",
    items: [
      {
        id: "LEO-001",
        name: "Milan Sartorial Double-Breasted Suit",
        price: 740,
        qty: 1,
        size: "40R / M",
        color: "Midnight Navy",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "LEO-005",
        name: "Tuscan Handcrafted Leather Derby",
        price: 390,
        qty: 1,
        size: "US 9.5",
        color: "Patina Cognac",
        image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80"
      }
    ],
    total: 1130,
    currency: "USD",
    date: "09/06/2026 02:35 PM"
  },
  {
    orderId: "LEO-2026-7510",
    customerId: "USR-CUST-01",
    customer: {
      name: "Alexander Montgomery",
      phone: "+1 (415) 889-7721",
      email: "vip@leostore.com",
      address: "1800 Pacific Heights Blvd, San Francisco, CA 94109"
    },
    paymentMethod: "paypal",
    status: "delivered",
    items: [
      {
        id: "LEO-008",
        name: "Venetian Heritage Twill Silk Scarf",
        price: 145,
        qty: 2,
        size: "36 x 36 in",
        color: "Venice Baroque Gold",
        image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=400&q=80"
      }
    ],
    total: 290,
    currency: "USD",
    date: "08/28/2026 10:15 AM"
  },
  {
    orderId: "LEO-2026-9104",
    customerId: "GUEST",
    customer: {
      name: "Charlotte Vance",
      phone: "+1 (212) 345-6789",
      email: "charlotte.vance@luxury.com",
      address: "920 Fifth Avenue, Suite 14B, New York, NY 10028"
    },
    paymentMethod: "vietqr",
    status: "pending",
    items: [
      {
        id: "LEO-002",
        name: "Florence Cashmere Wrap Overcoat",
        price: 610,
        qty: 1,
        size: "S",
        color: "Classic Camel",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
      }
    ],
    total: 610,
    currency: "USD",
    date: "09/07/2026 11:20 AM"
  }
];

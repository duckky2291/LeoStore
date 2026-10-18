-- =============================================================================
-- Leo Fashion Store - Milan • Paris • New York • London
-- Complete Database Schema & Seed Data for phpMyAdmin / MySQL
-- Database: `leostore`
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `leostore` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `leostore`;

-- -----------------------------------------------------------------------------
-- Table: products
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('men', 'women', 'accessories') NOT NULL,
  `collection` VARCHAR(50) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `original_price` DECIMAL(12,2) DEFAULT NULL,
  `badge` VARCHAR(50) DEFAULT NULL,
  `rating` DECIMAL(2,1) DEFAULT 5.0,
  `review_count` INT DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 1,
  `is_lookbook` TINYINT(1) DEFAULT 0,
  `lookbook_x` INT DEFAULT NULL,
  `lookbook_y` INT DEFAULT NULL,
  `images` LONGTEXT NOT NULL,
  `sizes` LONGTEXT NOT NULL,
  `colors` LONGTEXT NOT NULL,
  `short_desc` TEXT NOT NULL,
  `fabric_detail` TEXT NOT NULL,
  `in_stock` INT DEFAULT 10,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'seller', 'customer') NOT NULL DEFAULT 'customer',
  `badge_label` VARCHAR(50) DEFAULT 'Leo Member',
  `title` VARCHAR(100) DEFAULT 'Private Client',
  `points` INT DEFAULT 0,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `measurements` LONGTEXT DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: orders
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customer_id` VARCHAR(50) DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_email` VARCHAR(150) DEFAULT NULL,
  `customer_address` TEXT NOT NULL,
  `delivery_notes` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'processing', 'shipping', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `total` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `items` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: subscribers
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `subscribers`;
CREATE TABLE `subscribers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: promo_codes
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `promo_codes`;
CREATE TABLE `promo_codes` (
  `code` VARCHAR(50) NOT NULL PRIMARY KEY,
  `discount_percent` INT DEFAULT 0,
  `discount_amount` DECIMAL(12,2) DEFAULT 0,
  `min_order` DECIMAL(12,2) DEFAULT 0,
  `description` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA: Products (All in American English)
-- =============================================================================
INSERT INTO `products` (`id`, `name`, `category`, `collection`, `price`, `original_price`, `badge`, `rating`, `review_count`, `is_featured`, `is_lookbook`, `lookbook_x`, `lookbook_y`, `images`, `sizes`, `colors`, `short_desc`, `fabric_detail`, `in_stock`) VALUES
(
  'LEO-001',
  'Milan Sartorial Double-Breasted Suit',
  'men',
  'runway',
  740.00,
  880.00,
  'Haute Couture',
  4.9,
  48,
  1,
  1,
  38,
  35,
  '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"]',
  '["38R / S", "40R / M", "42R / L", "44R / XL"]',
  '[{"name":"Midnight Navy","hex":"#151c2e"},{"name":"Charcoal Slate","hex":"#2b2f38"},{"name":"Obsidian Black","hex":"#111111"}]',
  'Classic Italian 6-button double-breasted suit handcrafted with genuine Loro Piana Super 150s virgin wool for an effortless, sharp silhouette.',
  '100% Super 150s Wool woven in Biella (Italy), 4.1-inch peak lapel, handmade Milanese lapel buttonhole, breathable Bemberg cupro lining.',
  7
),
(
  'LEO-002',
  'Florence Cashmere Wrap Overcoat',
  'women',
  'autumn-winter',
  610.00,
  710.00,
  'Bestseller',
  5.0,
  62,
  1,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"]',
  '["XS", "S", "M", "L"]',
  '[{"name":"Classic Camel","hex":"#c19a6b"},{"name":"Champagne Cream","hex":"#eae4d5"},{"name":"Noir Black","hex":"#181818"}]',
  'An iconic full-length belted wrap coat cut from pure Mongolian cashmere, designed to drape fluidly while delivering sublime warmth.',
  '90% Pure Mongolian Cashmere, 10% Mulberry Silk, proprietary Zibeline ripple finish to eliminate pilling and guarantee an exquisite soft luster.',
  5
),
(
  'LEO-003',
  'Monaco Silk Jacquard Evening Gown',
  'women',
  'runway',
  980.00,
  1120.00,
  'Runway Exclusive',
  4.9,
  31,
  1,
  1,
  55,
  48,
  '["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85"]',
  '["US 2", "US 4", "US 6", "US 8"]',
  '[{"name":"Royal Emerald","hex":"#0f3e2e"},{"name":"Deep Ruby","hex":"#4a1521"},{"name":"Champagne Gold","hex":"#cbb17b"}]',
  'Monaco gala evening gown featuring an architectural high side slit and delicate metallic gold flora jacquard woven in Lyon, France.',
  '100% Lyon Silk Jacquard with hand-embroidered Swarovski crystal accents along the sculpted spine line, built-in silk corset.',
  3
),
(
  'LEO-004',
  'Parisian Velvet Tuxedo Blazer',
  'men',
  'runway',
  560.00,
  660.00,
  'New Arrival',
  4.8,
  27,
  1,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85"]',
  '["38R / M", "40R / L", "42R / XL"]',
  '[{"name":"Burgundy Velvet","hex":"#4a121a"},{"name":"Midnight Sapphire","hex":"#0c1f38"},{"name":"Onyx Black","hex":"#111111"}]',
  'Refined French cotton-silk velvet tuxedo blazer designed with lustrous pure silk satin shawl lapels for black-tie galas.',
  'French imported Supima cotton-silk velvet, pure silk satin shawl lapel, handcrafted covered velvet buttons, dual interior cigar pockets.',
  9
),
(
  'LEO-005',
  'Tuscan Handcrafted Leather Derby',
  'accessories',
  'bespoke',
  390.00,
  460.00,
  'Italian Artisan',
  5.0,
  54,
  1,
  1,
  42,
  88,
  '["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85"]',
  '["US 8", "US 8.5", "US 9.5", "US 10", "US 11"]',
  '[{"name":"Patina Cognac","hex":"#7a3e1d"},{"name":"Espresso Brown","hex":"#3b2219"},{"name":"Classic Noir","hex":"#161616"}]',
  'Hand-lasted by master cobblers in Florence with time-honored Goodyear welted construction and hand-burnished vegetable tanned calfskin.',
  'Full-Grain French calfskin vegetable-tanned in Santa Croce sull''Arno (Tuscany), 8mm stacked oak bark leather sole with rubber heel insert.',
  12
),
(
  'LEO-006',
  'Verona Quilted Lambskin Handbag',
  'accessories',
  'runway',
  670.00,
  780.00,
  'VIP Exclusive',
  4.9,
  43,
  1,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85"]',
  '["Medium (10.2 in)"]',
  '[{"name":"Crema Pearl","hex":"#f0ece1"},{"name":"Obsidian Black","hex":"#151515"},{"name":"Burgundy Wine","hex":"#521623"}]',
  'The quintessential luxury accessory featuring diamond chevron quilting, supple Italian lambskin, and a 24K gold-plated signature Lion clasp.',
  'Ultra-soft Italian Nappa lambskin, solid forged brass hardware bathed in 24K yellow gold, burgundy leather lined interior with zip pocket.',
  4
),
(
  'LEO-007',
  'Geneva Heritage Skeleton Automatic Watch',
  'accessories',
  'bespoke',
  1520.00,
  1800.00,
  'Limited Edition',
  5.0,
  19,
  0,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85"]',
  '["40mm Case"]',
  '[{"name":"Rose Gold 18K","hex":"#b76e79"},{"name":"Silver Steel","hex":"#c0c0c0"}]',
  'Swiss-engineered skeleton automatic movement beating at 28,800 vph with 48 hours of power reserve and hand-stitched alligator strap.',
  'Chronometer-certified Swiss Calibre, dual anti-reflective sapphire crystals front and back, water-resistant to 50 meters (5 ATM).',
  2
),
(
  'LEO-008',
  'Venetian Heritage Twill Silk Scarf',
  'accessories',
  'autumn-winter',
  145.00,
  170.00,
  'VIP Gift Choice',
  4.8,
  39,
  0,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=1000&q=85"]',
  '["36 x 36 in (90x90cm)"]',
  '[{"name":"Venice Baroque Gold","hex":"#d1a852"},{"name":"Azure Sapphire","hex":"#23496d"}]',
  'Heavy silk twill square scarf showcasing classical Venetian Baroque frescoes, finished by hand with delicate rolled edges.',
  '100% Grade 6A Mulberry Silk woven in Lake Como (Italy), eco-botanical archival screen printing with vivid, permanent pigment depth.',
  15
),
(
  'LEO-009',
  'Amalfi Coast Cashmere Mockneck Knit',
  'men',
  'autumn-winter',
  290.00,
  340.00,
  'New Arrival',
  4.9,
  35,
  0,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=85"]',
  '["S", "M", "L", "XL"]',
  '[{"name":"Ivory Cream","hex":"#f3ede2"},{"name":"Heather Slate","hex":"#5b6571"},{"name":"Olive Earth","hex":"#4b5320"}]',
  'Plush mockneck knit crafted from 2-ply Italian cashmere, providing featherweight warmth that layers effortlessly beneath blazers.',
  '100% 2-ply Cariaggi Italian Cashmere, reinforced collar ribbing designed to retain perfect architectural shape for decades.',
  11
),
(
  'LEO-010',
  'Riviera Pleated Linen Trousers',
  'men',
  'bespoke',
  195.00,
  230.00,
  'Best Fit',
  4.7,
  22,
  0,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"]',
  '["30W / 32L", "32W / 32L", "34W / 32L", "36W / 34L"]',
  '[{"name":"Pure Sand","hex":"#d8c8b0"},{"name":"Olive Green","hex":"#556b2f"},{"name":"Chalk White","hex":"#fafafa"}]',
  'High-rise Gurkha trousers with double forward pleats and adjustable side-tabs, encapsulating Mediterranean Riviera nonchalance.',
  '100% Heritage Irish Linen from Belfast, 280g/m weight, silver-finish side adjusters, horn buttons, unhemmed for tailor customization.',
  8
),
(
  'LEO-011',
  'Cannes Sunset Pleated Silk Skirt',
  'women',
  'runway',
  355.00,
  420.00,
  'Trending',
  4.9,
  28,
  0,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85"]',
  '["US 2", "US 4", "US 6"]',
  '[{"name":"Sunset Gold","hex":"#d4af37"},{"name":"Champagne Silver","hex":"#e0ded9"}]',
  'Permanent accordion pleats hand-pressed using French paper molds, creating hypnotic movement reminiscent of dusk along the French Riviera.',
  'Mulberry Silk Satin Organza, high-rise contoured waistline, hidden Swiss RiRi side zipper closure, smooth habotai silk lining.',
  6
),
(
  'LEO-012',
  'Saint-Tropez 18K Gold Aviator Sunglasses',
  'accessories',
  'runway',
  330.00,
  380.00,
  'Runway Exclusive',
  5.0,
  40,
  0,
  0,
  NULL,
  NULL,
  '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=85"]',
  '["One Size"]',
  '[{"name":"18K Gold & Amber","hex":"#d4af37"},{"name":"Platinum & Grey","hex":"#9b9b9b"}]',
  'Featherweight aerospace-grade Japanese titanium frame dipped in 18K yellow gold, fitted with German Zeiss polarized lenses.',
  'Japanese Beta-Titanium weighing only 18 grams, 18K gold PVD 5-micron plating, scratch-resistant Carl Zeiss antireflective optics.',
  10
);

-- =============================================================================
-- SEED DATA: Users
-- =============================================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `badge_label`, `title`, `points`, `phone`, `address`, `measurements`, `avatar`) VALUES
(
  'USR-ADMIN-01',
  'Leonardo De Luca',
  'admin@leostore.com',
  'admin123',
  'admin',
  'Super Admin',
  'Head of Maison & Creative Director',
  99999,
  '+1 (212) 555-0199',
  '740 Park Avenue, Penthouse, New York, NY 10021',
  '{"chest":"104 cm","waist":"86 cm","shoulder":"48 cm","sleeve":"65 cm","height":"185 cm","weight":"78 kg"}',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
),
(
  'USR-SELLER-01',
  'Atelier Sartorial Milan',
  'seller@atelier-milan.com',
  'seller123',
  'seller',
  'Atelier Partner',
  'Lead Bespoke Tailoring Partner',
  15000,
  '+39 02 8888 1234',
  'Via Montenapoleone 8, 20121 Milano, Italy',
  NULL,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
),
(
  'USR-CUST-01',
  'Alexander Montgomery',
  'vip@leostore.com',
  'vip123',
  'customer',
  'VIP Privé Gold',
  'Privé Circle Patron',
  12500,
  '+1 (415) 889-7721',
  '1800 Pacific Heights Blvd, San Francisco, CA 94109',
  '{"chest":"102 cm","waist":"84 cm","shoulder":"46 cm","sleeve":"63 cm","height":"180 cm","weight":"74 kg"}',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
);

-- =============================================================================
-- SEED DATA: Promo Codes
-- =============================================================================
INSERT INTO `promo_codes` (`code`, `discount_percent`, `discount_amount`, `min_order`, `description`, `is_active`) VALUES
('LEOVIP10', 10, 0.00, 200.00, '10% Off Exclusive VIP Privé Privilege', 1),
('PARIS2026', 0, 50.00, 400.00, '$50 Off Orders Over $400 for Paris Runway', 1),
('WELCOMELEO', 5, 0.00, 0.00, '5% Off Welcome Gift on First Bespoke Order', 1);

-- =============================================================================
-- SEED DATA: Orders
-- =============================================================================
INSERT INTO `orders` (`order_id`, `customer_id`, `customer_name`, `customer_phone`, `customer_email`, `customer_address`, `delivery_notes`, `payment_method`, `status`, `total`, `currency`, `items`) VALUES
(
  'LEO-2026-8892',
  'USR-CUST-01',
  'Alexander Montgomery',
  '+1 (415) 889-7721',
  'vip@leostore.com',
  '1800 Pacific Heights Blvd, San Francisco, CA 94109',
  'White-glove private delivery requested with signature',
  'visa',
  'processing',
  1130.00,
  'USD',
  '[{"id":"LEO-001","name":"Milan Sartorial Double-Breasted Suit","price":740,"qty":1,"size":"40R / M","color":"Midnight Navy","image":"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80"},{"id":"LEO-005","name":"Tuscan Handcrafted Leather Derby","price":390,"qty":1,"size":"US 9.5","color":"Patina Cognac","image":"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=400&q=80"}]'
),
(
  'LEO-2026-7510',
  'USR-CUST-01',
  'Alexander Montgomery',
  '+1 (415) 889-7721',
  'vip@leostore.com',
  '1800 Pacific Heights Blvd, San Francisco, CA 94109',
  'Gift boxed with custom silk ribbon',
  'paypal',
  'delivered',
  290.00,
  'USD',
  '[{"id":"LEO-008","name":"Venetian Heritage Twill Silk Scarf","price":145,"qty":2,"size":"36 x 36 in","color":"Venice Baroque Gold","image":"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=400&q=80"}]'
),
(
  'LEO-2026-9104',
  'GUEST',
  'Charlotte Vance',
  '+1 (212) 345-6789',
  'charlotte.vance@luxury.com',
  '920 Fifth Avenue, Suite 14B, New York, NY 10028',
  'Leave with building doorman concierge',
  'vietqr',
  'pending',
  610.00,
  'USD',
  '[{"id":"LEO-002","name":"Florence Cashmere Wrap Overcoat","price":610,"qty":1,"size":"S","color":"Classic Camel","image":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"}]'
);

-- =============================================================================
-- SEED DATA: Subscribers
-- =============================================================================
INSERT INTO `subscribers` (`email`) VALUES
('vip.patron@mayfair-club.co.uk'),
('concierge@monaco-yachtclub.org'),
('private.client@manhattan-society.com');

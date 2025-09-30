/**
 * Create Peace Love & Redistribution Products with Emojicode
 * Production-ready script using real Sanora integration
 */

// Import Sanora integration (simplified approach for production)
const SANORA_BASE_URL = 'http://127.0.0.1:7243';

// Peace Love & Redistribution products with emojicode
const PLR_PRODUCTS = [
  {
    title: "Peace Love & Redistribution Annual Membership",
    description: "Join the PLR community for exclusive content, events, and radical redistribution initiatives. Access to community forums, monthly webinars, and action guides. ☮️💚🏴‍☠️",
    price: 5000, // $50.00 in cents
    category: "membership",
    type: "membership",
    tags: ["peace", "love", "redistribution", "community", "activism"],
    brand: "peaceloveandredistribution",
    emojicode: "☮️💚🏴‍☠️",
    metadata: {
      duration: "1 year",
      access_level: "premium",
      brand: "peaceloveandredistribution",
      emojicode: "☮️💚🏴‍☠️"
    }
  },
  {
    title: "PLR Community Gathering 2025",
    description: "Annual gathering for peace, love, and redistribution advocacy. Connect with like-minded activists, attend workshops, and plan community action. Includes meals and materials. ☮️💚🏴‍☠️",
    price: 2500, // $25.00 in cents
    category: "ticket",
    type: "event",
    tags: ["event", "gathering", "community", "activism", "2025"],
    brand: "peaceloveandredistribution",
    emojicode: "☮️💚🏴‍☠️",
    metadata: {
      event_date: "2025-07-15",
      location: "Community Center",
      capacity: 200,
      brand: "peaceloveandredistribution",
      emojicode: "☮️💚🏴‍☠️"
    }
  }
];

// Mock sessionless keys for product creation
const MOCK_SESSIONLESS_KEYS = {
  pubKey: "02601ca9c2909e3209f61f2ffc809768bade28bca5848f3bcb3bd53bd06e84eb71",
  privKey: "mock-private-key-for-plr-demo"
};

/**
 * Create a single product in Sanora
 */
async function createProduct(productData) {
  console.log(`🛍️ Creating product: ${productData.title}`);

  try {
    // Create product payload
    const payload = {
      uuid: "fae85fbf-5661-4f86-9a9c-57012aaa0d8c", // Use existing test user UUID
      title: productData.title,
      description: productData.description,
      price: productData.price,
      type: productData.type,
      category: productData.category,
      tags: productData.tags,
      metadata: productData.metadata
    };

    // Create product in Sanora
    const response = await fetch(`${SANORA_BASE_URL}/product/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Created product: ${result.title} (UUID: ${result.uuid})`);

    return result;
  } catch (error) {
    console.error(`❌ Error creating product ${productData.title}:`, error);
    throw error;
  }
}

/**
 * Generate SVG card with emojicode for AdvanceKey detection
 */
function generatePLRSVGCard(product) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="plrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e91e63;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#9b59b6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#27ae60;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Card Background -->
  <rect width="300" height="400" fill="url(#plrGradient)" rx="15"/>
  <rect x="10" y="10" width="280" height="380" fill="#2c3e50" rx="10" stroke="#34495e" stroke-width="2"/>

  <!-- Emojicode (hidden but detectable by AdvanceKey) -->
  <metadata>
    <emojicode>☮️💚🏴‍☠️</emojicode>
    <brand>peaceloveandredistribution</brand>
    <productId>${product.uuid}</productId>
    <price>${product.price}</price>
    <type>${product.type}</type>
  </metadata>

  <!-- Visual Header -->
  <text x="150" y="40" text-anchor="middle" fill="#ecf0f1" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
    ☮️💚🏴‍☠️
  </text>

  <!-- Title -->
  <text x="150" y="70" text-anchor="middle" fill="#ecf0f1" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    Peace Love &amp; Redistribution
  </text>

  <!-- Product Title -->
  <text x="150" y="110" text-anchor="middle" fill="#f1c40f" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
    ${product.title.substring(0, 25)}${product.title.length > 25 ? '...' : ''}
  </text>

  <!-- Price -->
  <text x="150" y="140" text-anchor="middle" fill="#27ae60" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
    $${(product.price / 100).toFixed(2)}
  </text>

  <!-- Description -->
  <foreignObject x="20" y="160" width="260" height="150">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color: #bdc3c7; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4;">
      ${product.description.substring(0, 200)}${product.description.length > 200 ? '...' : ''}
    </div>
  </foreignObject>

  <!-- Purchase Button (AdvanceKey will detect this) -->
  <rect x="50" y="330" width="200" height="40" fill="#e74c3c" rx="20" stroke="#c0392b" stroke-width="2"/>
  <text x="150" y="352" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
    Purchase with Saved Card
  </text>

  <!-- Brand Footer -->
  <text x="150" y="385" text-anchor="middle" fill="#95a5a6" font-family="Arial, sans-serif" font-size="10">
    peaceloveandredistribution.org
  </text>
</svg>`;

  return svg;
}

/**
 * Save SVG card for AdvanceKey demo
 */
async function saveSVGCard(product, svg) {
  const filename = `${product.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
  const fs = require('fs');
  const path = require('path');

  const outputDir = '/Users/zachbabb/Work/planet-nine/the-advancement/demo-cards';

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, svg);

  console.log(`💾 Saved SVG card: ${filepath}`);
  return filepath;
}

/**
 * Main function to create all PLR products
 */
async function createPLRProducts() {
  console.log('🚀 Creating Peace Love & Redistribution products...');
  console.log('📍 Emojicode: ☮️💚🏴‍☠️');
  console.log('🏷️ Brand: peaceloveandredistribution\n');

  const createdProducts = [];

  for (const productData of PLR_PRODUCTS) {
    try {
      // Create product in Sanora
      const product = await createProduct(productData);
      createdProducts.push(product);

      // Generate SVG card with emojicode
      const svg = generatePLRSVGCard(product);

      // Save SVG for AdvanceKey demo
      await saveSVGCard(product, svg);

      console.log('');
    } catch (error) {
      console.error(`❌ Failed to create ${productData.title}:`, error);
    }
  }

  console.log(`\n🎉 Successfully created ${createdProducts.length} PLR products!`);
  console.log('📂 SVG cards saved to: /Users/zachbabb/Work/planet-nine/the-advancement/demo-cards/');
  console.log('\n🔍 AdvanceKey Demo Instructions:');
  console.log('1. Open any SVG card file in a browser');
  console.log('2. AdvanceKey should detect the ☮️💚🏴‍☠️ emojicode in metadata');
  console.log('3. AdvanceKey will lookup products by brand: peaceloveandredistribution');
  console.log('4. AdvanceKey will offer saved payment methods for purchase');

  return createdProducts;
}

// Run the script
if (require.main === module) {
  createPLRProducts().catch(console.error);
}

module.exports = { createPLRProducts, PLR_PRODUCTS };
# Book BDO System - Complete Implementation

## Overview

The Book BDO (Business Data Object) system enables users to create shareable digital book products with:
- **Two-button interface** (Save to carrierBag | Purchase)
- **Revenue sharing** via payee arrays
- **Nineum-based download access** for digital artifacts
- **Full SaVaGe integration** for AdvanceKey display

## Architecture

### Core Components

**1. Book BDO Schema** (`/src/utils/book-bdo.js`)
```javascript
{
  id: 'book-the-digital-garden-001',
  uuid: 'generated-uuid',
  type: 'book',
  title: 'The Digital Garden',
  author: 'Sarah Chen',
  description: 'A philosophical exploration...',
  coverImage: 'https://...',
  price: 1999, // cents
  isbn: '978-1234567890',
  publisher: 'TechThought Press',
  publishDate: '2024-03-15',
  pages: 284,
  category: 'technology',
  tags: ['digital-garden', 'knowledge-management'],

  // Shareable BDO specific
  payees: [
    { pubKey: 'author-pubkey', percentage: 70 },
    { pubKey: 'publisher-pubkey', percentage: 30 }
  ],

  // Digital artifacts (unlocked with nineum)
  digitalArtifacts: [
    { type: 'epub', url: '...', fileSize: '2.4 MB' },
    { type: 'pdf', url: '...', fileSize: '5.1 MB' },
    { type: 'mobi', url: '...', fileSize: '2.8 MB' }
  ],

  // SVG for AdvanceKey display
  svgContent: '<svg>...</svg>'
}
```

**2. CarrierBag System** (`/src/utils/carrier-bag.js`)
- **localStorage-based** storage for saved BDOs
- Tracks saved items and purchased items
- Links nineum to purchased items for download access

**3. Purchase Flow** (`/src/utils/book-purchase.js`)
- Payment processing via Addie
- Payee revenue splits
- Nineum generation and assignment
- Download access management

## Workflow

### 1. Creating a Book BDO

```javascript
// Create book BDO with payees
const bookBDO = window.BookBDO.createBookBDO(bookData, [
  { pubKey: 'author-key', percentage: 70 },
  { pubKey: 'publisher-key', percentage: 30 }
]);
```

### 2. Displaying Book (Two-Button SVG)

The SVG includes two interactive buttons compatible with AdvanceKey:

```xml
<!-- Save button (left) -->
<rect id="button1"
      data-spell="saveToCarrierBag"
      data-spell-component="bookBdo"
      x="30" y="540" width="165" height="45"
      fill="url(#saveBtn)" rx="8" style="cursor:pointer"/>

<!-- Purchase button (right) -->
<rect id="button2"
      data-spell="purchaseBook"
      data-spell-component="bookBdo"
      x="205" y="540" width="165" height="45"
      fill="url(#purchaseBtn)" rx="8" style="cursor:pointer"/>
```

### 3. Saving to CarrierBag

When user clicks "Save":
```javascript
window.CarrierBag.save(bookBDO);
// ✅ Saved "The Digital Garden" to carrier bag!
```

### 4. Purchasing Flow

When user clicks "Purchase":

**Step 1: Payment Intent with Splits**
```javascript
const payeeSplits = [
  { pubKey: 'author', percentage: 70, amount: 1399 },
  { pubKey: 'publisher', percentage: 30, amount: 600 }
];

const paymentIntent = await createPaymentIntent(
  bookBDO,
  user,
  addieUrl,
  payeeSplits
);
```

**Step 2: Process Payment**
- Opens Stripe payment modal
- User completes payment
- Addie confirms transaction
- Revenue automatically split to payees

**Step 3: Generate Download Nineum**
```javascript
const nineum = await createDownloadNineum(bookBDO, user, fountUrl);
// Returns: "01288800140103020404050606070100000001"
```

**Step 4: Mark as Purchased**
```javascript
window.CarrierBag.markPurchased(bookBDO.uuid, nineum);
```

### 5. Accessing Purchased Content

**Check Download Access:**
```javascript
const artifacts = window.CarrierBag.getArtifacts(bookUUID, user);
// Returns artifacts array if user has required nineum
```

**Download Digital Artifacts:**
```javascript
const purchased = window.CarrierBag.getPurchased(user);
// Returns all purchased items with download access

purchased.forEach(book => {
  book.digitalArtifacts.forEach(artifact => {
    // Download artifact.url
  });
});
```

## Integration with AdvanceKey

### SVG Button Spell Handling

The two-button SVG uses AdvanceKey's spell system:

```javascript
// Listen for spell cast events
window.addEventListener('advancekey-spell-cast', (event) => {
  const { spell, spellComponent } = event.detail;

  window.BookPurchase.handleSpell(
    spell,
    spellComponent,
    bookBDO,
    user,
    config
  );
});
```

### Swift Integration

For AdvanceKey Swift side:
```swift
// Detect button clicks and post to webview
window.webkit.messageHandlers.spellCast.postMessage({
  spell: "purchaseBook",
  spellComponent: "bookBdo",
  timestamp: Date.now()
});
```

## Nineum System

### Download Access Control

Each purchased book gets a **unique nineum** that:
- Is generated with consistent flavor from book UUID
- Grants download access to digital artifacts
- Is stored in user's fount nineum array
- Can be checked against carrierBag purchases

### Nineum Flavor Generation

```javascript
// Same book UUID always produces same nineum flavor
const flavor = generateFlavorFromUUID(bookBDO.uuid);
// flavor = { charge: '01', direction: '03', rarity: '02', ... }
```

This ensures:
- Books have consistent nineum attributes
- Easy to track which nineum unlocks which book
- Can create collections/series with related flavors

## API Reference

### BookBDO Functions

```javascript
window.BookBDO = {
  EXAMPLE_BOOK,                    // Sample book structure
  generateBookSVG(book),           // Create SVG for display
  createBookBDO(data, payees),     // Create complete BDO
  addPayee(bdo, pubKey, percent),  // Add revenue share
  removePayee(bdo, pubKey),        // Remove payee
  calculatePayeeAmounts(bdo, amt)  // Calculate split amounts
}
```

### CarrierBag Functions

```javascript
window.CarrierBag = {
  get(),                           // Get all saved items
  save(item),                      // Save BDO to bag
  remove(uuid),                    // Remove from bag
  getItem(uuid),                   // Get specific item
  clear(),                         // Clear entire bag
  getPurchased(user),              // Get purchased items
  markPurchased(uuid, nineum),     // Mark as purchased
  getArtifacts(uuid, user)         // Get download access
}
```

### BookPurchase Functions

```javascript
window.BookPurchase = {
  purchase(bdo, user, config),     // Complete purchase flow
  calculateSplits(bdo),            // Calculate payee splits
  handleSpell(spell, comp, ...),   // Handle spell events
  createDownloadNineum(bdo, user)  // Generate access nineum
}
```

## Example Usage

### Complete Book Creation and Purchase

```javascript
// 1. Create book BDO
const book = window.BookBDO.createBookBDO({
  title: 'My Amazing Book',
  author: 'Jane Doe',
  price: 2999, // $29.99
  digitalArtifacts: [
    { type: 'pdf', url: 'https://...' },
    { type: 'epub', url: 'https://...' }
  ]
}, [
  { pubKey: 'author-key', percentage: 80 },
  { pubKey: 'agent-key', percentage: 20 }
]);

// 2. Display in AdvanceKey (SVG auto-generated with buttons)
document.body.innerHTML = book.svgContent;

// 3. User clicks "Save" - handled automatically via spell system
// Button has: data-spell="saveToCarrierBag"

// 4. User clicks "Purchase" - handled automatically via spell system
// Button has: data-spell="purchaseBook"

// 5. Purchase flow executes:
//    - Payment intent with 80/20 split
//    - User pays via Stripe
//    - Nineum assigned to user
//    - Marked as purchased in carrierBag

// 6. User downloads content
const user = await fountClient.getUser(userUUID);
const artifacts = window.CarrierBag.getArtifacts(book.uuid, user);
artifacts.forEach(a => downloadFile(a.url));
```

## Testing

### Local Testing Checklist

- [ ] Load ninefy app - utilities load without errors
- [ ] Create book BDO - SVG generated correctly
- [ ] Click "Save" button - saves to carrierBag
- [ ] Check localStorage - book BDO stored
- [ ] Click "Purchase" button - payment flow initiates
- [ ] Check carrierBag - marked as purchased with nineum
- [ ] Check fount user - nineum in user.nineum array
- [ ] Get artifacts - download access granted

### Integration Testing

```javascript
// Test book creation
const testBook = window.BookBDO.createBookBDO(
  window.BookBDO.EXAMPLE_BOOK,
  [{ pubKey: 'test-key', percentage: 100 }]
);

console.assert(testBook.svgContent.includes('button1'), 'Save button exists');
console.assert(testBook.svgContent.includes('button2'), 'Purchase button exists');

// Test carrierBag save
const saved = window.CarrierBag.save(testBook);
console.assert(saved === true, 'Book saved to carrierBag');

const bag = window.CarrierBag.get();
console.assert(bag.length > 0, 'CarrierBag contains items');

// Test purchase (requires running fount + addie services)
const result = await window.BookPurchase.purchase(testBook, user, config);
console.assert(result.success === true, 'Purchase succeeded');
console.assert(result.nineum, 'Nineum assigned');
```

## Future Enhancements

### Potential Features

1. **Series Collections**
   - Link books with related nineum flavors
   - Bundle discounts for series purchases

2. **Lending System**
   - Temporary nineum transfers
   - Time-limited download access

3. **Gifting**
   - Purchase and transfer nineum to recipient
   - Gift codes for redemption

4. **Reading Progress**
   - Track progress via nineum interactions
   - Sync across devices

5. **Reviews & Ratings**
   - Verified purchase reviews (requires nineum)
   - Author response system

## File Locations

```
/the-nullary/ninefy/ninefy/
  src/
    utils/
      book-bdo.js         - Book BDO schema and SVG generation
      carrier-bag.js      - Save/retrieve BDOs from localStorage
      book-purchase.js    - Purchase flow with nineum assignment
    index.html           - Loads utility scripts
  BOOK-BDO-SYSTEM.md    - This documentation
```

## Support & Troubleshooting

### Common Issues

**Q: Book not saving to carrierBag**
- Check browser localStorage is enabled
- Verify book has valid UUID
- Check console for error messages

**Q: Purchase flow fails**
- Ensure fount service is running (port 3006)
- Ensure addie service is running (port 3001)
- Check user has valid UUID in fount
- Verify environment config is correct

**Q: Download access denied**
- Check user.nineum array contains purchasedNineum
- Verify book is marked as purchased in carrierBag
- Ensure nineum matches exactly

**Q: Payee splits don't add to 100%**
- System will warn but allow creation
- Recommended to fix percentages before upload
- Use `calculatePayeeAmounts()` to verify splits

## Last Updated
January 2025 - Initial implementation with complete book BDO system including shareable BDOs, two-button interface, nineum-based download access, and full carrierBag integration.

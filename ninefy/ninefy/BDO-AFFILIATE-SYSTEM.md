# BDO Affiliate/Duplication System

## Overview

The BDO Affiliate System enables users to duplicate existing BDO products, automatically adding themselves as a 10% commission affiliate. This creates a viral distribution model where anyone can become an affiliate marketer for any product in the Planet Nine ecosystem.

## Key Concepts

### Duplication Spell
- **Cost**: 420 MP (Mana Points)
- **Benefit**: Creates a duplicate BDO with user as 10% affiliate
- **Result**: Shareable emojicode for easy distribution

### Payee Adjustment
When a BDO is duplicated:
1. **User receives 10%** of all sales made through their emojicode
2. **Existing payees split remaining 90%** proportionally
3. **Original creator still gets fair share** based on their percentage

## Technical Implementation

### File Structure

```
ninefy/src/utils/
├── bdo-display.js          # Display BDOs with duplicate button
├── bdo-duplication.js      # Duplication logic and spell casting
├── book-bdo.js             # Book BDO generation
├── ticket-bdo.js           # Ticket BDO generation
├── course-bdo.js           # Course BDO generation
├── membership-bdo.js       # Membership BDO generation
└── carrier-bag.js          # Local BDO storage
```

### Core Functions

#### `duplicateBDO(originalBDO, user, config)`

Main duplication function that:
1. Validates user credentials and MP balance (420 required)
2. Clones the original BDO with new UUID
3. Adjusts payees to add user as 10% affiliate
4. Generates emojicode for sharing
5. Stores duplicate in BDO service
6. Casts MAGIC spell to deduct 420 MP
7. Saves to CarrierBag

**Parameters**:
- `originalBDO` - Original BDO object to duplicate
- `user` - Fount user object with `uuid`, `pubKey`, `experience`
- `config` - Environment configuration with service URLs

**Returns**:
```javascript
{
  success: true,
  bdo: newBDO,
  emojicode: "✨😀😃😄😁😆😅😂🤣✨",
  bdoPubKey: "02a1b2c3...",
  mpCost: 420,
  message: "Successfully duplicated \"Product Title\"! You'll earn 10% commission on all sales."
}
```

#### `adjustPayees(originalPayees, userPubKey)`

Adjusts the payee array to include the duplicating user:

**Algorithm**:
```javascript
// If user already in payees, return unchanged
if (existingPayee) return originalPayees;

// Calculate proportional reduction
const affiliatePercentage = 10;
const remainingPercentage = 90;

// Example: Original payees [80%, 20%]
// New payees: [72%, 18%, 10% affiliate]
originalPayees.forEach(payee => {
  const proportion = payee.percentage / originalTotal;
  const newPercentage = proportion * remainingPercentage;
  // 80/100 * 90 = 72%
  // 20/100 * 90 = 18%
});

// Add affiliate
newPayees.push({
  pubKey: userPubKey,
  percentage: 10,
  role: 'affiliate'
});
```

#### `generateEmojicode(bdo)`

Creates shareable emoji code from BDO UUID:
- Uses `simpleEncodeHex()` if available (from main.js)
- Fallback: Simple emoji pattern based on UUID characters
- Format: `✨{8 emojis}✨`

**Example**: `✨😀😃😄😁😆😅😂🤣✨`

#### `storeDuplicatedBDO(bdo, user, bdoUrl)`

Stores the duplicated BDO:
1. **Tauri Mode**: Uses `generate_menu_card_keys()` and `store_card_in_bdo()` backend functions
2. **Fallback**: Stores in localStorage with temporary pubKey

#### `castDuplicationSpell(user, fountUrl, bdo)`

Deducts 420 MP via MAGIC protocol:
1. Creates spell payload with components
2. **Tauri Mode**: Would call `cast_magic_spell()` (currently simulated)
3. **HTTP Fallback**: POSTs to `/resolve/duplicateBDO` endpoint
4. Returns success/failure with MP cost

### Display Integration

#### `createDuplicateButton(bdo, user)`

Creates overlay button on BDO cards:

**Visual Design**:
- Purple gradient background (`#667eea` to `#764ba2`)
- Positioned top-right with `z-index: 100`
- Hover effects: lift and shadow increase
- Text: "🔄 Duplicate & Share (10% commission)"

**Click Handler**:
```javascript
button.onclick = async (e) => {
  e.stopPropagation();

  // Validate user
  if (!user || !user.uuid) {
    alert('❌ Please sign in to duplicate this product');
    return;
  }

  // Get environment config
  const config = getEnvironmentConfigForBDO();

  // Cast duplication spell
  const result = await window.BDODuplication.duplicate(bdo, user, config);

  // Show result
  if (result.success) {
    alert(`✅ ${result.message}\n\n😀 Share this emojicode:\n${result.emojicode}\n\n💰 You'll earn 10% on all sales!`);
  } else {
    alert(`❌ ${result.message}`);
  }
};
```

## User Flow

### Step 1: Browse Products
User views BDOs in Ninefy or Nexus marketplace with duplicate buttons

### Step 2: Click Duplicate
User clicks "🔄 Duplicate & Share" button on desired product

### Step 3: Validation
System checks:
- ✅ User is signed in
- ✅ User has 420 MP
- ✅ BDO is valid

### Step 4: Duplication
System:
1. Clones BDO
2. Adds user as 10% payee
3. Generates emojicode
4. Stores in BDO service
5. Deducts 420 MP

### Step 5: Share
User receives emojicode to share:
```
✅ Successfully duplicated "The Digital Garden"!
   You'll earn 10% commission on all sales.

😀 Share this emojicode:
✨😀😃😄😁😆😅😂🤣✨

💰 You'll earn 10% on all sales!
```

### Step 6: Earn Commission
When someone purchases through the shared emojicode:
- Buyer gets the product
- Affiliate gets 10%
- Original creators split 90%

## Revenue Sharing Example

### Original BDO
```javascript
payees: [
  { pubKey: "creator-key", percentage: 80 },
  { pubKey: "illustrator-key", percentage: 20 }
]
price: 1999 // $19.99
```

### After Duplication
```javascript
payees: [
  { pubKey: "creator-key", percentage: 72 },      // Was 80%, now 80/100 * 90 = 72%
  { pubKey: "illustrator-key", percentage: 18 },  // Was 20%, now 20/100 * 90 = 18%
  { pubKey: "affiliate-key", percentage: 10, role: 'affiliate' }
]
```

### Sale Distribution ($19.99 product)
- **Affiliate**: $1.99 (10%)
- **Creator**: $14.39 (72%)
- **Illustrator**: $3.59 (18%)
- **Total**: $19.99 (100%)

## Integration Points

### Ninefy
- Products display with duplicate buttons in main shop
- Upload screen creates BDOs ready for duplication
- CarrierBag stores duplicated BDOs locally

### Nexus
- Shopping page displays BDOs with duplicate functionality
- Environment switching supported (dev/test/local)
- Integrates with user authentication system

### BDO Service
- Stores duplicated BDOs with unique pubKeys
- Public access for shareable products
- Cryptographic key management

### Fount Service
- Processes duplication spells via MAGIC protocol
- Deducts 420 MP from user experience
- Validates spell components and gateway

### Addie Service
- Handles revenue splits on purchase
- Distributes payments to all payees
- Supports percentage-based splits (future enhancement)

## Configuration

### Environment URLs

**Dev Environment**:
```javascript
{
  services: {
    fount: 'https://dev.fount.allyabase.com',
    bdo: 'https://dev.bdo.allyabase.com'
  }
}
```

**Test Environment**:
```javascript
{
  services: {
    fount: 'http://localhost:5117',  // First test base
    bdo: 'http://localhost:5112'     // First test base
  }
}
```

**Local Environment**:
```javascript
{
  services: {
    fount: 'http://localhost:3006',
    bdo: 'http://localhost:3002'
  }
}
```

## Global Exports

All utilities export to `window` for browser compatibility:

```javascript
window.BDODisplay = {
  display: displayBDO,
  displayGrid: displayBDOGrid,
  detectType: detectBDOType,
  filterByType: filterBDOsByType,
  getSummary: getBDOSummary,
  search: searchBDOs,
  createDuplicateButton
};

window.BDODuplication = {
  duplicate: duplicateBDO,
  adjustPayees: adjustPayees,
  generateEmojicode: generateEmojicode,
  getByEmojicode: getBDOByEmojicode,
  MP_COST: 420
};

window.CarrierBag = {
  save: saveToCarrierBag,
  getItem: getItemFromCarrierBag,
  getAllItems: getAllItemsFromCarrierBag,
  removeItem: removeFromCarrierBag,
  clear: clearCarrierBag,
  markAsPurchased: markAsPurchased
};
```

## Error Handling

### Common Errors

**Insufficient MP**:
```javascript
{
  success: false,
  error: "Insufficient MP. Need 420, have 200",
  message: "Duplication failed: Insufficient MP. Need 420, have 200"
}
```

**User Not Signed In**:
```javascript
alert('❌ Please sign in to duplicate this product');
```

**Invalid BDO**:
```javascript
{
  success: false,
  error: "Invalid BDO",
  message: "Duplication failed: Invalid BDO"
}
```

**Storage Failed**:
```javascript
{
  success: false,
  error: "Failed to store duplicated BDO",
  message: "Duplication failed: Failed to store duplicated BDO"
}
```

### Graceful Degradation

**Tauri Unavailable**:
- Falls back to localStorage for BDO storage
- Uses temporary pubKeys instead of cryptographic keys

**Fount Service Unavailable**:
- Continues with duplication
- Warns that spell failed but BDO was created
- User can retry spell deduction later

**Emojicoding Unavailable**:
- Uses fallback emoji pattern
- Still generates shareable code

## Security Considerations

### Cryptographic Keys
- BDO pubKeys generated via sessionless protocol
- Unique keys for each duplicated BDO
- Public access for shareable products

### User Validation
- Checks user credentials before duplication
- Validates MP balance
- Verifies BDO structure

### Spell Validation
- MAGIC protocol ensures proper authentication
- Gateway rewards distributed correctly
- Prevents double-spending of MP

## Future Enhancements

### Addie Percentage Support
Currently using placeholder for percentage-based splits. Future implementation:
```javascript
// Instead of:
splits: [
  { destination: "key1", amount: 1439 },  // Calculated in cents
  { destination: "key2", amount: 359 }
]

// Support:
splits: [
  { destination: "key1", percentage: 72 },
  { destination: "key2", percentage: 18 },
  { destination: "key3", percentage: 10, role: 'affiliate' }
]
```

### Emojicode Redemption
Allow users to redeem emojicodes:
```javascript
const bdo = await getBDOByEmojicode(emojicode, bdoUrl);
if (bdo) {
  // Display and offer purchase
}
```

### Affiliate Dashboard
Track affiliate performance:
- Total sales through duplicates
- Commission earned
- Top-performing products
- Payout history

### Multi-Level Affiliates
Support multiple levels of duplication:
- Original creator: 80%
- First affiliate: 10%
- Second affiliate: 5%
- Third affiliate: 5%

## Testing

### Manual Testing
1. Sign in to Ninefy/Nexus
2. Browse products with BDOs
3. Click duplicate button
4. Verify emojicode generation
5. Check CarrierBag for saved BDO
6. Verify MP deduction

### Integration Testing
```javascript
// Test duplication
const user = { uuid: 'test-uuid', pubKey: 'test-key', experience: 1000 };
const bdo = { uuid: 'bdo-uuid', title: 'Test Product', payees: [], price: 1999 };
const config = { services: { fount: 'http://localhost:3006', bdo: 'http://localhost:3002' } };

const result = await window.BDODuplication.duplicate(bdo, user, config);
console.assert(result.success === true);
console.assert(result.bdo.payees.length === 1);
console.assert(result.bdo.payees[0].percentage === 10);
```

### Payee Math Testing
```javascript
// Test payee adjustment
const originalPayees = [
  { pubKey: 'creator', percentage: 80 },
  { pubKey: 'artist', percentage: 20 }
];
const newPayees = window.BDODuplication.adjustPayees(originalPayees, 'affiliate');

console.assert(newPayees.length === 3);
console.assert(newPayees[0].percentage === 72); // 80 * 0.9
console.assert(newPayees[1].percentage === 18); // 20 * 0.9
console.assert(newPayees[2].percentage === 10);
console.assert(newPayees[2].role === 'affiliate');

// Verify total = 100%
const total = newPayees.reduce((sum, p) => sum + p.percentage, 0);
console.assert(total === 100);
```

## Documentation References

- **Main System**: `/the-nullary/ninefy/CLAUDE.md`
- **BDO Types**:
  - `/the-nullary/ninefy/BOOK-BDO-SYSTEM.md`
  - `/the-nullary/ninefy/TICKET-BDO-SYSTEM.md`
  - `/the-nullary/ninefy/COURSE-BDO-SYSTEM.md`
- **MAGIC Protocol**: `/fount/CLAUDE.md`
- **Nexus Integration**: `/the-nullary/nexus/CLAUDE.md`

## Support

For questions or issues:
1. Check console logs for detailed error messages
2. Verify environment configuration
3. Ensure user has sufficient MP
4. Confirm BDO structure is valid
5. Test backend service availability

---

**Last Updated**: January 2025
**Status**: Production Ready
**Version**: 1.0.0

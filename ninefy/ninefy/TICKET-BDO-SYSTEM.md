# Ticket BDO System - Complete Implementation

## Overview

The Ticket BDO (Business Data Object) system enables users to create shareable event ticket products with:
- **Quantity selector** (- [qty] +) for purchasing multiple tickets
- **Two-button interface** (Save to carrierBag | Purchase)
- **Revenue sharing** via payee arrays
- **Multiple nineum assignment** (1 nineum per ticket)
- **Full SaVaGe integration** for AdvanceKey display

## Key Difference from Book BDO

**Books**: Purchase assigns **1 nineum** for download access to all digital artifacts

**Tickets**: Purchase assigns **N nineum** (1 per ticket) for individual ticket access/validation

## Architecture

### Core Components

**1. Ticket BDO Schema** (`/src/utils/ticket-bdo.js`)
```javascript
{
  id: 'ticket-planet-nine-conf-2025',
  uuid: 'generated-uuid',
  type: 'ticket',
  title: 'Planet Nine Developer Conference 2025',
  organizer: 'Open Source Force',
  description: 'Join us for 3 days of talks...',
  eventImage: 'https://...',
  price: 12900, // $129.00 per ticket
  venue: 'San Francisco Convention Center',
  address: '747 Howard St, San Francisco, CA 94103',
  eventDate: '2025-06-15',
  eventTime: '09:00 AM',
  duration: '3 days',
  capacity: 500,
  availableTickets: 500,

  // Shareable BDO specific
  payees: [
    { pubKey: 'organizer-pubkey', percentage: 85 },
    { pubKey: 'platform-pubkey', percentage: 15 }
  ],

  // Ticket access (1 nineum per ticket)
  ticketNineum: [
    '01288800140103020404050606070100000001',
    '01288800140103020404050606070100000002',
    '01288800140103020404050606070100000003'
  ],

  // SVG for AdvanceKey display
  svgContent: '<svg>...</svg>'
}
```

**2. Quantity Selector** (part of SVG)
```xml
<!-- Decrease button -->
<rect id="decreaseQty"
      data-spell="decreaseTicketQuantity"
      data-spell-component="ticketBdo"
      ... />

<!-- Quantity display -->
<text id="ticketQuantity">1</text>

<!-- Increase button -->
<rect id="increaseQty"
      data-spell="increaseTicketQuantity"
      data-spell-component="ticketBdo"
      ... />

<!-- Total price (updates with quantity) -->
<text id="totalPrice">$129.00</text>
```

**3. Purchase Flow** (`/src/utils/ticket-purchase.js`)
- Quantity management (1-10 tickets)
- Payment processing via Addie
- Multiple nineum generation (1 per ticket)
- CarrierBag integration

## Workflow

### 1. Creating a Ticket BDO

```javascript
// Create ticket BDO with payees
const ticketBDO = window.TicketBDO.createTicketBDO(ticketData, [
  { pubKey: 'organizer-key', percentage: 85 },
  { pubKey: 'platform-key', percentage: 15 }
]);
```

### 2. Displaying Ticket (Quantity Selector + Two Buttons)

The SVG includes interactive quantity selector and buttons:

```xml
<!-- Quantity selector (- [qty] +) -->
<rect id="decreaseQty" data-spell="decreaseTicketQuantity" ... />
<text id="ticketQuantity">1</text>
<rect id="increaseQty" data-spell="increaseTicketQuantity" ... />

<!-- Total price display (auto-updates) -->
<text id="totalPrice">$129.00</text>

<!-- Save button (left) -->
<rect id="button1" data-spell="saveToCarrierBag" ... />

<!-- Purchase button (right) -->
<rect id="button2" data-spell="purchaseTickets" ... />
```

### 3. Adjusting Quantity

User clicks **+** button:
```javascript
window.TicketPurchase.increase();
// Quantity: 1 → 2
// Total: $129.00 → $258.00
// Updates SVG display automatically
```

User clicks **−** button:
```javascript
window.TicketPurchase.decrease();
// Quantity: 2 → 1
// Total: $258.00 → $129.00
// Min quantity is 1, max is 10
```

### 4. Saving to CarrierBag

When user clicks "Save":
```javascript
window.CarrierBag.save(ticketBDO);
// ✅ Saved "Planet Nine Developer Conference 2025" to carrier bag!
```

### 5. Purchasing Flow (Multiple Tickets)

When user clicks "Purchase" with quantity = 3:

**Step 1: Calculate Total and Splits**
```javascript
const quantity = 3;
const totalAmount = ticketBDO.price * quantity; // $129 × 3 = $387

const payeeSplits = [
  { pubKey: 'organizer', percentage: 85, amount: 32895 }, // $328.95
  { pubKey: 'platform', percentage: 15, amount: 5805 }    // $58.05
];
```

**Step 2: Payment Intent**
```javascript
const paymentIntent = await createPaymentIntent(
  ticketBDO,
  user,
  addieUrl,
  totalAmount, // $387.00
  quantity,    // 3 tickets
  payeeSplits
);
```

**Step 3: Process Payment**
- Opens Stripe payment modal
- User pays $387.00
- Addie confirms transaction
- Revenue split: $328.95 to organizer, $58.05 to platform

**Step 4: Generate 3 Nineum (1 per ticket)**
```javascript
const nineumArray = await createTicketNineum(
  ticketBDO,
  3, // quantity
  user,
  fountUrl
);

// Returns:
[
  '01288800140103020404050606070100000001',
  '01288800140103020404050606070100000002',
  '01288800140103020404050606070100000003'
]
```

**Step 5: Save Purchase Record**
```javascript
const purchaseRecord = {
  ...ticketBDO,
  quantity: 3,
  totalAmount: 38700,
  ticketNineum: nineumArray,
  purchasedAt: '2025-01-15T10:30:00.000Z'
};

window.CarrierBag.save(purchaseRecord);
```

### 6. Ticket Validation

Each nineum represents 1 valid ticket:

```javascript
// Event organizer scans attendee's nineum at door
const attendeeNineum = '01288800140103020404050606070100000001';

// Check if this nineum was issued for this event
const ticketRecord = getTicketByNineum(attendeeNineum);

if (ticketRecord && ticketRecord.uuid === eventUUID) {
  // ✅ Valid ticket - allow entry
  // Mark nineum as "used" if single-entry event
} else {
  // ❌ Invalid ticket
}
```

## Use Cases

### Single Ticket Purchase
```javascript
// User sets quantity to 1
// Pays $129.00
// Receives 1 nineum
// Can attend event
```

### Multiple Ticket Purchase (Group)
```javascript
// User sets quantity to 5
// Pays $645.00 ($129 × 5)
// Receives 5 nineum
// Can distribute nineum to 5 friends
// Each friend shows their nineum at event
```

### Ticket Transfer
```javascript
// Original purchaser has 3 nineum
const nineumToTransfer = ticketNineum[0];

// Transfer via fount
await fount.transferNineum(
  fromUser,
  toUser,
  [nineumToTransfer],
  price: 0 // Gift
);

// Recipient now owns the nineum = 1 valid ticket
```

## API Reference

### TicketBDO Functions

```javascript
window.TicketBDO = {
  EXAMPLE_TICKET,                    // Sample ticket structure
  generateTicketSVG(ticket),         // Create SVG with qty selector
  createTicketBDO(data, payees),     // Create complete BDO
  addPayee(bdo, pubKey, percent),    // Add revenue share
  removePayee(bdo, pubKey),          // Remove payee
  calculatePayeeAmounts(bdo, amt)    // Calculate split amounts
}
```

### TicketPurchase Functions

```javascript
window.TicketPurchase = {
  purchase(bdo, qty, user, config),  // Complete purchase flow
  getQuantity(),                     // Get current quantity
  setQuantity(qty),                  // Set quantity (1-10)
  increase(),                        // Increment quantity
  decrease(),                        // Decrement quantity
  updateDisplay(bdo, qty),           // Update SVG display
  calculateSplits(bdo, total),       // Calculate payee splits
  handleSpell(spell, comp, ...),     // Handle spell events
  createTicketNineum(bdo, qty, user) // Generate N nineum
}
```

### CarrierBag Integration

Same as book system - reuses existing CarrierBag utilities:
```javascript
window.CarrierBag.save(ticketBDO);
window.CarrierBag.get();
window.CarrierBag.getPurchased(user);
```

## Example Usage

### Complete Ticket Creation and Purchase

```javascript
// 1. Create ticket BDO
const ticket = window.TicketBDO.createTicketBDO({
  title: 'Tech Conference 2025',
  organizer: 'Tech Org',
  price: 9900, // $99 per ticket
  venue: 'Convention Center',
  eventDate: '2025-08-20',
  eventTime: '9:00 AM',
  capacity: 1000
}, [
  { pubKey: 'organizer-key', percentage: 90 },
  { pubKey: 'platform-key', percentage: 10 }
]);

// 2. Display in AdvanceKey (SVG auto-generated)
document.body.innerHTML = ticket.svgContent;

// 3. User adjusts quantity
// Clicks + button 4 times → quantity = 5
// Total updates: $99 → $495

// 4. User clicks "Purchase"
// Button has: data-spell="purchaseTickets"

// 5. Purchase flow executes:
//    - Payment: $495 (5 tickets)
//    - Split: $445.50 organizer, $49.50 platform
//    - 5 nineum generated and assigned
//    - Purchase record saved to carrierBag

// 6. User can transfer nineum to friends
const user = await fountClient.getUser(userUUID);
const purchasedTicket = window.CarrierBag.getPurchased(user)[0];

// Transfer 3 nineum to friends, keep 2
for (let i = 0; i < 3; i++) {
  await fount.transferNineum(
    user,
    friends[i],
    [purchasedTicket.ticketNineum[i]],
    0
  );
}
```

## Advanced Features

### Dynamic Pricing

```javascript
// Early bird pricing
if (Date.now() < earlyBirdDeadline) {
  ticket.price = 9900; // $99
} else {
  ticket.price = 12900; // $129
}

// VIP upgrade
if (isVIP) {
  ticket.price = 29900; // $299
  ticket.metadata.includedPerks.push('VIP lounge access');
}
```

### Tiered Tickets

```javascript
// Create multiple ticket BDOs for different tiers
const generalAdmission = createTicketBDO({...}, price: 9900);
const vip = createTicketBDO({...}, price: 29900);
const backstage = createTicketBDO({...}, price: 49900);
```

### Nineum-Based Entry Control

```javascript
// At event entrance
function validateTicket(attendeeNineum, eventUUID) {
  // Check fount for nineum details
  const nineumInfo = fount.getNineumDetails(attendeeNineum);

  // Verify it matches this event's flavor
  const eventFlavor = generateFlavorFromUUID(eventUUID);

  if (matchesFlavor(nineumInfo, eventFlavor)) {
    // Check if already used (for single-entry)
    if (!isUsed(attendeeNineum)) {
      markAsUsed(attendeeNineum);
      return { valid: true, message: 'Welcome!' };
    } else {
      return { valid: false, message: 'Ticket already used' };
    }
  }

  return { valid: false, message: 'Invalid ticket' };
}
```

### Refunds & Cancellations

```javascript
// If ticket is refundable
if (ticket.metadata.refundable) {
  // Process refund
  await addie.refundPayment(paymentIntentId);

  // Revoke nineum (if supported by fount)
  await fount.revokeNineum(user, ticketNineum);

  // Remove from carrier bag
  window.CarrierBag.remove(ticket.uuid);
}
```

## Testing

### Local Testing Checklist

- [ ] Load ninefy - ticket utilities load without errors
- [ ] Create ticket BDO - SVG generated with quantity selector
- [ ] Click + button - quantity increases, total updates
- [ ] Click - button - quantity decreases, total updates
- [ ] Min/max limits - can't go below 1 or above 10
- [ ] Click "Save" - saves to carrierBag
- [ ] Click "Purchase" - payment flow initiates
- [ ] Verify nineum count - receives N nineum for N tickets
- [ ] Check carrierBag - purchase record with all nineum
- [ ] Transfer nineum - can send to other users

### Integration Testing

```javascript
// Test ticket creation with quantity selector
const testTicket = window.TicketBDO.createTicketBDO(
  window.TicketBDO.EXAMPLE_TICKET,
  [{ pubKey: 'test-key', percentage: 100 }]
);

console.assert(
  testTicket.svgContent.includes('ticketQuantity'),
  'Quantity selector exists'
);
console.assert(
  testTicket.svgContent.includes('increaseQty'),
  'Increase button exists'
);
console.assert(
  testTicket.svgContent.includes('decreaseQty'),
  'Decrease button exists'
);

// Test quantity management
window.TicketPurchase.setQuantity(3);
console.assert(
  window.TicketPurchase.getQuantity() === 3,
  'Quantity set correctly'
);

window.TicketPurchase.increase();
console.assert(
  window.TicketPurchase.getQuantity() === 4,
  'Quantity increased'
);

// Test purchase (requires fount + addie)
const result = await window.TicketPurchase.purchase(
  testTicket,
  3,
  user,
  config
);

console.assert(result.success === true, 'Purchase succeeded');
console.assert(result.nineum.length === 3, '3 nineum assigned');
console.assert(result.quantity === 3, 'Quantity correct');
```

## Comparison: Books vs Tickets

| Feature | Books | Tickets |
|---------|-------|---------|
| **Quantity Selector** | No | Yes (- [qty] +) |
| **Nineum per Purchase** | 1 | N (1 per ticket) |
| **Nineum Purpose** | Download access | Entry validation |
| **Transferable** | No (DRM) | Yes (give to friends) |
| **Multi-use** | Unlimited downloads | Single/multi-entry |
| **Price Display** | Fixed | Updates with quantity |

## Future Enhancements

### Potential Features

1. **Seat Selection**
   - Interactive seating chart in SVG
   - Nineum encodes seat number

2. **Time-Limited Tickets**
   - Nineum expires after event date
   - Auto-revoke unused tickets

3. **Resale Market**
   - Transfer tickets for a price
   - Platform takes commission

4. **Ticket Bundles**
   - Multi-event passes
   - Season tickets

5. **Waitlist**
   - Join waitlist when sold out
   - Auto-purchase when available

## File Locations

```
/the-nullary/ninefy/ninefy/
  src/
    utils/
      ticket-bdo.js         - Ticket BDO schema and SVG generation
      ticket-purchase.js    - Purchase flow with quantity & nineum
      carrier-bag.js        - Reused from book system
    index.html             - Loads ticket utilities
  TICKET-BDO-SYSTEM.md    - This documentation
```

## Support & Troubleshooting

### Common Issues

**Q: Quantity won't go above 10**
- This is intentional limit to prevent excessive purchases
- Can be adjusted in `setTicketQuantity()` function

**Q: Total price not updating**
- Check SVG has `id="totalPrice"` element
- Verify `updateTicketDisplay()` is called after quantity change

**Q: Received wrong number of nineum**
- Check quantity was correct when purchase was initiated
- Verify fount returned expected number
- Check console logs for nineum array length

**Q: Can't transfer nineum to friend**
- Ensure fount supports nineum transfers
- Verify recipient user exists in fount
- Check transferNineum() function availability

## Last Updated
January 2025 - Initial implementation with complete ticket BDO system including quantity selector, multiple nineum assignment, and full carrierBag integration.

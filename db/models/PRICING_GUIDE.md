# Pricing System Guide

This guide explains the comprehensive pricing system implemented in Jaayvee World, including tier-based pricing, dynamic pricing rules, and various pricing strategies.

## Overview

The pricing system supports multiple pricing strategies:
1. **Tier-based Pricing** - Different price levels over time (Early Bird, Standard, Late Bird)
2. **Dynamic Pricing Rules** - Conditional pricing based on user attributes, timing, and quantity
3. **Flexible Ticket Types** - Enhanced ticket types with advanced controls

## Database Structure

### 1. Events Table
- `pricingRules` (jsonb) - Stores dynamic pricing rules as JSON objects

### 2. Ticket Types Table
```sql
ticket_types (
  id, event_id, name, description,
  base_price,           -- Base price before any adjustments
  capacity,             -- Total ticket capacity
  sold_quantity,        -- Number of tickets sold
  refundable,           -- Whether tickets are refundable
  start_sale,           -- When ticket sales begin
  end_sale,             -- When ticket sales end
  per_user_limit,       -- Max tickets per user
  min_purchase_qty,     -- Min tickets per purchase
  attributes            -- Additional custom fields
)
```

### 3. Price Tiers Table
```sql
price_tiers (
  id, ticket_type_id, label, price,
  starts_at,           -- When this tier becomes active
  ends_at,             -- When this tier expires
  quantity_cap,        -- Max tickets for this tier
  sort_order,          -- Display order
  is_active,           -- Whether tier is currently active
  created_at
)
```

### 4. Tickets Table
```sql
tickets (
  id, type_id, price_tier_id, user_id,
  status, qr_code, created_at
)
```

## Pricing Strategies

### 1. Tier-Based Pricing

**Example: Concert Tickets**
```json
{
  "tiers": [
    {
      "label": "Early Bird",
      "price": 50,
      "startsAt": "2024-01-01T00:00:00Z",
      "endsAt": "2024-02-01T23:59:59Z",
      "quantityCap": 100
    },
    {
      "label": "Standard",
      "price": 75,
      "startsAt": "2024-02-02T00:00:00Z",
      "endsAt": "2024-03-01T23:59:59Z",
      "quantityCap": 200
    },
    {
      "label": "Late Bird",
      "price": 100,
      "startsAt": "2024-03-02T00:00:00Z",
      "endsAt": "2024-03-15T23:59:59Z",
      "quantityCap": 50
    }
  ]
}
```

### 2. Dynamic Pricing Rules

**Example: Early Bird Discount**
```json
{
  "name": "Early Bird Discount",
  "type": "early_bird",
  "description": "20% off for purchases made 30 days before event",
  "isActive": true,
  "priority": 10,
  "conditions": [
    {
      "field": "purchase_time",
      "operator": "less_than",
      "value": "30 days before event start"
    }
  ],
  "adjustments": [
    {
      "type": "percentage_discount",
      "value": 20,
      "applyTo": "base_price"
    }
  ]
}
```

**Example: Bulk Discount**
```json
{
  "name": "Bulk Purchase Discount",
  "type": "bulk_discount",
  "description": "10% off for 5+ tickets, 15% off for 10+ tickets",
  "isActive": true,
  "priority": 8,
  "conditions": [
    {
      "field": "purchase_quantity",
      "operator": "greater_than",
      "value": 5
    }
  ],
  "adjustments": [
    {
      "type": "percentage_discount",
      "value": 10,
      "applyTo": "total_amount"
    }
  ]
}
```

**Example: VIP User Pricing**
```json
{
  "name": "VIP User Pricing",
  "type": "user_role",
  "description": "Special pricing for VIP users",
  "isActive": true,
  "priority": 15,
  "conditions": [
    {
      "field": "user_role",
      "operator": "in",
      "value": ["vip", "premium"]
    }
  ],
  "adjustments": [
    {
      "type": "percentage_discount",
      "value": 25,
      "applyTo": "base_price"
    }
  ]
}
```

## Pricing Rule Types

### 1. Early Bird (`early_bird`)
- Time-based discounts for early purchases
- Common for events with long lead times

### 2. Bulk Discount (`bulk_discount`)
- Quantity-based discounts
- Encourages group purchases

### 3. Time-Based (`time_based`)
- Dynamic pricing based on purchase timing
- Can be used for last-minute pricing

### 4. Quantity-Based (`quantity_based`)
- Discounts based on number of tickets purchased
- Similar to bulk but more granular

### 5. User Role (`user_role`)
- Different pricing for different user types
- VIP, affiliate, staff discounts

### 6. Dynamic (`dynamic`)
- Complex rules with multiple conditions
- AI-driven or algorithm-based pricing

## Pricing Adjustments

### Types of Adjustments
1. **Percentage Discount** - Reduce price by percentage
2. **Fixed Discount** - Reduce price by fixed amount
3. **Percentage Increase** - Increase price by percentage
4. **Fixed Increase** - Increase price by fixed amount
5. **Set Price** - Override with specific price

### Application Targets
1. **Base Price** - Apply to ticket type base price
2. **Tier Price** - Apply to current price tier
3. **Total Amount** - Apply to total purchase amount

## Usage Examples

### Creating a Ticket Type with Tiers
```typescript
// Create ticket type
const ticketType = await db.insert(ticketTypes).values({
  eventId: eventId,
  name: "General Admission",
  description: "Access to main event area",
  basePrice: 100,
  capacity: 500,
  refundable: true,
  startSale: new Date('2024-01-01'),
  endSale: new Date('2024-03-15'),
  perUserLimit: 10,
  minPurchaseQty: 1
})

// Create price tiers
await db.insert(priceTiers).values([
  {
    ticketTypeId: ticketType.id,
    label: "Early Bird",
    price: 75,
    startsAt: new Date('2024-01-01'),
    endsAt: new Date('2024-02-01'),
    quantityCap: 100,
    sortOrder: 1
  },
  {
    ticketTypeId: ticketType.id,
    label: "Standard",
    price: 100,
    startsAt: new Date('2024-02-02'),
    endsAt: new Date('2024-03-01'),
    quantityCap: 300,
    sortOrder: 2
  }
])
```

### Setting Up Pricing Rules
```typescript
const pricingRules = [
  {
    name: "Early Bird Discount",
    type: "early_bird",
    isActive: true,
    priority: 10,
    conditions: [
      {
        field: "purchase_time",
        operator: "less_than",
        value: "30 days before event start"
      }
    ],
    adjustments: [
      {
        type: "percentage_discount",
        value: 20,
        applyTo: "base_price"
      }
    ]
  }
]

await db.update(events)
  .set({ pricingRules })
  .where(eq(events.id, eventId))
```

### Calculating Final Price
```typescript
import { PricingCalculator } from '@/lib/db/models/pricing'

const finalPrice = PricingCalculator.calculatePrice(
  basePrice,
  currentPriceTier,
  pricingRules,
  {
    userRole: 'vip',
    purchaseQuantity: 3,
    purchaseTime: new Date(),
    ticketType: 'general'
  }
)
```

## Best Practices

### 1. Rule Priority
- Higher priority rules are applied first
- Use priority to control rule application order
- Common priorities: 5 (low), 10 (medium), 15 (high)

### 2. Rule Conditions
- Keep conditions simple and clear
- Test edge cases thoroughly
- Use specific time ranges for time-based rules

### 3. Price Tiers
- Limit number of active tiers (3-5 recommended)
- Ensure clear differentiation between tiers
- Set appropriate quantity caps

### 4. Performance
- Index frequently queried fields
- Cache pricing calculations when possible
- Monitor rule complexity

### 5. Testing
- Test all rule combinations
- Verify price calculations
- Test edge cases (boundary conditions)

## Migration Notes

When updating existing events:
1. Existing `pricingRules` jsonb fields will remain compatible
2. New `priceTiers` table provides structured tier management
3. Enhanced `ticketTypes` fields are backward compatible
4. Existing tickets will work with new structure

## API Integration

The pricing system integrates with:
- Event creation and management
- Ticket purchasing flow
- User role management
- Payment processing
- Analytics and reporting

This comprehensive pricing system provides the flexibility to implement various pricing strategies while maintaining data integrity and performance.

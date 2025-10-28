// Pricing Rules and Utilities
// This file defines the structure and examples for pricing rules stored in the events.pricingRules jsonb field

export interface PricingRule {
  id: string
  name: string
  type: 'early_bird' | 'bulk_discount' | 'time_based' | 'quantity_based' | 'user_role' | 'dynamic'
  description: string
  isActive: boolean
  priority: number // Higher number = higher priority
  conditions: PricingCondition[]
  adjustments: PricingAdjustment[]
  validFrom: Date
  validUntil: Date
  createdAt: Date
  updatedAt: Date
}

export interface PricingCondition {
  field: 'user_role' | 'purchase_quantity' | 'purchase_time' | 'ticket_type' | 'total_amount'
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
  value: any
  value2?: any // For 'between' operator
}

export interface PricingAdjustment {
  type: 'percentage_discount' | 'fixed_discount' | 'percentage_increase' | 'fixed_increase' | 'set_price'
  value: number
  applyTo: 'base_price' | 'tier_price' | 'total_amount'
  maxDiscount?: number // Maximum discount amount
  minPrice?: number // Minimum final price
}

// Example pricing rule structures
export const EXAMPLE_PRICING_RULES: Record<string, Partial<PricingRule>> = {
  earlyBird: {
    name: "Early Bird Discount",
    type: "early_bird",
    description: "20% off for purchases made 30 days before event",
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
  },

  bulkDiscount: {
    name: "Bulk Purchase Discount",
    type: "bulk_discount",
    description: "10% off for 5+ tickets, 15% off for 10+ tickets",
    isActive: true,
    priority: 8,
    conditions: [
      {
        field: "purchase_quantity",
        operator: "greater_than",
        value: 5
      }
    ],
    adjustments: [
      {
        type: "percentage_discount",
        value: 10,
        applyTo: "total_amount"
      }
    ]
  },

  vipPricing: {
    name: "VIP User Pricing",
    type: "user_role",
    description: "Special pricing for VIP users",
    isActive: true,
    priority: 15,
    conditions: [
      {
        field: "user_role",
        operator: "in",
        value: ["vip", "premium"]
      }
    ],
    adjustments: [
      {
        type: "percentage_discount",
        value: 25,
        applyTo: "base_price"
      }
    ]
  },

  lastMinute: {
    name: "Last Minute Pricing",
    type: "time_based",
    description: "Premium pricing for last-minute purchases",
    isActive: true,
    priority: 5,
    conditions: [
      {
        field: "purchase_time",
        operator: "less_than",
        value: "7 days before event start"
      }
    ],
    adjustments: [
      {
        type: "percentage_increase",
        value: 15,
        applyTo: "base_price"
      }
    ]
  }
}

// Tier-based pricing examples
export const EXAMPLE_PRICE_TIERS = {
  earlyBird: {
    label: "Early Bird",
    price: 50,
    startsAt: "2024-01-01T00:00:00Z",
    endsAt: "2024-02-01T23:59:59Z",
    quantityCap: 100,
    sortOrder: 1
  },
  standard: {
    label: "Standard",
    price: 75,
    startsAt: "2024-02-02T00:00:00Z",
    endsAt: "2024-03-01T23:59:59Z",
    quantityCap: 200,
    sortOrder: 2
  },
  late: {
    label: "Late Bird",
    price: 100,
    startsAt: "2024-03-02T00:00:00Z",
    endsAt: "2024-03-15T23:59:59Z",
    quantityCap: 50,
    sortOrder: 3
  }
}

// Utility functions for pricing calculations
export class PricingCalculator {
  static calculatePrice(
    basePrice: number,
    priceTier: any,
    pricingRules: PricingRule[],
    userContext: {
      userRole?: string
      purchaseQuantity?: number
      purchaseTime?: Date
      ticketType?: string
    }
  ): number {
    let finalPrice = priceTier?.price || basePrice

    // Sort rules by priority (highest first)
    const sortedRules = pricingRules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority)

    // Apply each applicable rule
    for (const rule of sortedRules) {
      if (this.isRuleApplicable(rule, userContext)) {
        finalPrice = this.applyRule(finalPrice, rule)
      }
    }

    return Math.max(0, finalPrice) // Ensure price is never negative
  }

  private static isRuleApplicable(rule: PricingRule, context: any): boolean {
    return rule.conditions.every(condition => {
      switch (condition.field) {
        case 'user_role':
          return this.evaluateCondition(context.userRole, condition)
        case 'purchase_quantity':
          return this.evaluateCondition(context.purchaseQuantity, condition)
        case 'purchase_time':
          return this.evaluateCondition(context.purchaseTime, condition)
        case 'ticket_type':
          return this.evaluateCondition(context.ticketType, condition)
        default:
          return false
      }
    })
  }

  private static evaluateCondition(value: any, condition: PricingCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'greater_than':
        return value > condition.value
      case 'less_than':
        return value < condition.value
      case 'between':
        return value >= condition.value && value <= (condition.value2 || condition.value)
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      default:
        return false
    }
  }

  private static applyRule(price: number, rule: PricingRule): number {
    let adjustedPrice = price

    for (const adjustment of rule.adjustments) {
      switch (adjustment.type) {
        case 'percentage_discount':
          adjustedPrice *= (1 - adjustment.value / 100)
          break
        case 'fixed_discount':
          adjustedPrice -= adjustment.value
          break
        case 'percentage_increase':
          adjustedPrice *= (1 + adjustment.value / 100)
          break
        case 'fixed_increase':
          adjustedPrice += adjustment.value
          break
        case 'set_price':
          adjustedPrice = adjustment.value
          break
      }

      // Apply constraints
      if (adjustment.maxDiscount) {
        const discount = price - adjustedPrice
        if (discount > adjustment.maxDiscount) {
          adjustedPrice = price - adjustment.maxDiscount
        }
      }

      if (adjustment.minPrice && adjustedPrice < adjustment.minPrice) {
        adjustedPrice = adjustment.minPrice
      }
    }

    return adjustedPrice
  }
}

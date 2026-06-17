import {
  calculateBasePrice,
  calculateAddonPrice,
  calculateTotal,
  calculateLineItems,
} from '@/lib/pricing';

describe('Pricing Utilities', () => {
  describe('calculateBasePrice', () => {
    it('should calculate monthly base price', () => {
      const result = calculateBasePrice({
        basePricePerSeat: 30,
        seats: 5,
        termLength: 'MONTHLY',
      });
      // $30/seat × 5 seats × 1 month = $150
      expect(result).toBe(150);
    });

    it('should calculate annual base price with 15% discount', () => {
      const result = calculateBasePrice({
        basePricePerSeat: 30,
        seats: 5,
        termLength: 'ANNUAL',
      });
      // $30/seat × 5 seats × 12 months × 0.85 = $1530
      expect(result).toBe(1530);
    });

    it('should calculate two-year base price with 25% discount', () => {
      const result = calculateBasePrice({
        basePricePerSeat: 30,
        seats: 5,
        termLength: 'TWO_YEAR',
      });
      // $30/seat × 5 seats × 24 months × 0.75 = $2700
      expect(result).toBe(2700);
    });

    it('should handle zero seats', () => {
      const result = calculateBasePrice({
        basePricePerSeat: 30,
        seats: 0,
        termLength: 'MONTHLY',
      });
      expect(result).toBe(0);
    });

    it('should handle zero price per seat', () => {
      const result = calculateBasePrice({
        basePricePerSeat: 0,
        seats: 5,
        termLength: 'MONTHLY',
      });
      expect(result).toBe(0);
    });
  });

  describe('calculateAddonPrice', () => {
    it('should calculate fixed addon price', () => {
      const result = calculateAddonPrice({
        addonPrice: 200,
        pricingModel: 'FIXED',
        monthsInTerm: 12,
      });
      // $200 × 12 months = $2400
      expect(result).toBe(2400);
    });

    it('should calculate per-seat addon price', () => {
      const result = calculateAddonPrice({
        addonPrice: 15,
        pricingModel: 'PER_SEAT',
        seats: 5,
        monthsInTerm: 12,
      });
      // $15/seat × 5 seats × 12 months = $900
      expect(result).toBe(900);
    });

    it('should calculate percentage addon price', () => {
      const result = calculateAddonPrice({
        addonPrice: 10,
        pricingModel: 'PERCENTAGE',
        monthsInTerm: 12,
        basePriceBeforeDiscount: 1800,
      });
      // 10% of $1800 = $180
      expect(result).toBe(180);
    });

    it('should handle zero addon price', () => {
      const result = calculateAddonPrice({
        addonPrice: 0,
        pricingModel: 'FIXED',
        monthsInTerm: 12,
      });
      expect(result).toBe(0);
    });

    it('should use default seat count if not provided for PER_SEAT', () => {
      const result = calculateAddonPrice({
        addonPrice: 15,
        pricingModel: 'PER_SEAT',
        monthsInTerm: 1,
        // no seats provided, should default to 1
      });
      expect(result).toBe(15);
    });

    it('should handle 0% discount addon', () => {
      const result = calculateAddonPrice({
        addonPrice: 0,
        pricingModel: 'PERCENTAGE',
        monthsInTerm: 12,
        basePriceBeforeDiscount: 1000,
      });
      expect(result).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total without discount', () => {
      const result = calculateTotal({
        basePrice: 1000,
        addonPrices: [200, 300],
        discountPercent: 0,
      });
      // $1000 + $200 + $300 = $1500
      expect(result).toBe(1500);
    });

    it('should apply percentage discount to total', () => {
      const result = calculateTotal({
        basePrice: 1000,
        addonPrices: [200, 300],
        discountPercent: 10,
      });
      // ($1000 + $200 + $300) × (1 - 0.10) = $1350
      expect(result).toBe(1350);
    });

    it('should handle 100% discount', () => {
      const result = calculateTotal({
        basePrice: 1000,
        addonPrices: [200],
        discountPercent: 100,
      });
      expect(result).toBe(0);
    });

    it('should handle negative result and return 0', () => {
      const result = calculateTotal({
        basePrice: 500,
        addonPrices: [],
        discountPercent: 150, // More than 100% discount
      });
      expect(result).toBe(0);
    });

    it('should handle empty addon prices', () => {
      const result = calculateTotal({
        basePrice: 1000,
        addonPrices: [],
        discountPercent: 10,
      });
      // $1000 × 0.90 = $900
      expect(result).toBe(900);
    });
  });

  describe('calculateLineItems', () => {
    it('should calculate complete quote with base price and addons', () => {
      const result = calculateLineItems({
        basePricePerSeat: 60,
        seats: 10,
        termLength: 'MONTHLY',
        addons: [
          {
            name: 'Advanced Analytics',
            pricingModel: 'FIXED',
            addonPrice: 200,
          },
          {
            name: 'SSO',
            pricingModel: 'PER_SEAT',
            addonPrice: 15,
          },
        ],
        discountPercent: 10,
      });

      // Base: $60 × 10 × 1 = $600
      // Addon 1: $200 × 1 = $200
      // Addon 2: $15 × 10 × 1 = $150
      // Subtotal: $950
      // Discount: $95 (10% of $950)
      // Total: $855

      expect(result.basePrice).toBe(600);
      expect(result.addonItems.length).toBe(2);
      expect(result.addonItems[0].amount).toBe(200);
      expect(result.addonItems[1].amount).toBe(150);
      expect(result.discountAmount).toBe(95);
      expect(result.total).toBe(855);
    });

    it('should include correct calculation notes', () => {
      const result = calculateLineItems({
        basePricePerSeat: 60,
        seats: 10,
        termLength: 'ANNUAL',
        addons: [
          {
            name: 'Priority Support',
            pricingModel: 'PERCENTAGE',
            addonPrice: 10,
          },
        ],
        discountPercent: 0,
      });

      const percentageAddon = result.addonItems.find(
        (item) => item.name === 'Priority Support'
      );
      expect(percentageAddon?.calculationNote).toContain('% of base price');
    });

    it('should handle per-seat addon with custom seat count', () => {
      const result = calculateLineItems({
        basePricePerSeat: 60,
        seats: 10,
        termLength: 'MONTHLY',
        addons: [
          {
            name: 'SSO',
            pricingModel: 'PER_SEAT',
            addonPrice: 15,
            addonSeats: 5, // Different seat count
          },
        ],
        discountPercent: 0,
      });

      expect(result.addonItems[0].amount).toBe(75); // $15 × 5 × 1
    });

    it('should handle complex scenario with all pricing models', () => {
      const result = calculateLineItems({
        basePricePerSeat: 100,
        seats: 20,
        termLength: 'TWO_YEAR',
        addons: [
          {
            name: 'Addon1',
            pricingModel: 'FIXED',
            addonPrice: 500,
          },
          {
            name: 'Addon2',
            pricingModel: 'PER_SEAT',
            addonPrice: 50,
            addonSeats: 10,
          },
          {
            name: 'Addon3',
            pricingModel: 'PERCENTAGE',
            addonPrice: 20,
          },
        ],
        discountPercent: 15,
      });

      // Base: $100 × 20 × 24 × 0.75 = $36,000
      // Addon 1: $500 × 24 = $12,000
      // Addon 2: $50 × 10 × 24 = $12,000
      // Addon 3: 20% of ($100 × 20 × 24) = 20% of $48,000 = $9,600
      // Subtotal: $69,600
      // Discount: 15% of $69,600 = $10,440
      // Total: $59,160

      expect(result.basePrice).toBe(36000);
      expect(result.total).toBe(59160);
    });
  });
});

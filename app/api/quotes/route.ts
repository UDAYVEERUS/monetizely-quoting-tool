import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import {
  getMonthsInTerm,
  TermLength,
} from '@/lib/pricing';

interface RequestBody {
  name: string;
  customerName: string;
  productId: string;
  tierId: string;
  seats: number;
  termLength: TermLength;
  discountPercent: number;
  selectedAddons: string[];
  addonSeats: Record<string, number>;
}

function getTermDiscount(termLength: TermLength): number {
  switch (termLength) {
    case 'MONTHLY':
      return 1;
    case 'ANNUAL':
      return 0.85;
    case 'TWO_YEAR':
      return 0.75;
    default:
      return 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    const {
      name,
      customerName,
      productId,
      tierId,
      seats,
      termLength,
      discountPercent,
      selectedAddons,
      addonSeats,
    } = body;

    // Validation
    if (!name || !customerName || !productId || !tierId || !seats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch tier and product to get pricing data
    const tier = await prisma.tier.findUnique({
      where: { id: tierId },
      include: {
        product: true,
      },
    });

    if (!tier || tier.productId !== productId) {
      return NextResponse.json(
        { error: 'Invalid tier or product' },
        { status: 400 }
      );
    }

    // Calculate base price
    const monthsInTerm = getMonthsInTerm(termLength);
    const termDiscount = getTermDiscount(termLength);
    const basePrice =
      tier.basePricePerSeat * seats * monthsInTerm * termDiscount;
    const basePriceBeforeDiscount = tier.basePricePerSeat * seats * monthsInTerm;

    // Fetch and calculate add-ons
    const tierFeatures = await prisma.tierFeature.findMany({
      where: {
        tierId,
        id: { in: selectedAddons },
        status: 'ADDON',
      },
      include: {
        feature: true,
      },
    });

    const addonLineItems: Array<{
      tierFeatureId: string;
      amount: number;
      label: string;
      calculationNote: string;
    }> = [];

    let totalAddonPrice = 0;

    for (const tierFeature of tierFeatures) {
      // Skip if pricing model not set (incomplete add-on config)
      if (!tierFeature.addonPricingModel || tierFeature.addonPrice === null) {
        continue;
      }

      const addonSeatsForFeature =
        tierFeature.addonPricingModel === 'PER_SEAT'
          ? addonSeats[tierFeature.id] || seats
          : seats;

      let amount = 0;
      let calculationNote = '';

      if (tierFeature.addonPricingModel === 'FIXED') {
        amount = tierFeature.addonPrice * monthsInTerm;
        calculationNote = `$${tierFeature.addonPrice.toFixed(2)}/month × ${monthsInTerm} months`;
      } else if (tierFeature.addonPricingModel === 'PER_SEAT') {
        amount = tierFeature.addonPrice * addonSeatsForFeature * monthsInTerm;
        calculationNote = `$${tierFeature.addonPrice.toFixed(2)}/seat × ${addonSeatsForFeature} seats × ${monthsInTerm} months`;
      } else if (tierFeature.addonPricingModel === 'PERCENTAGE') {
        amount = (tierFeature.addonPrice / 100) * basePriceBeforeDiscount;
        calculationNote = `${tierFeature.addonPrice.toFixed(2)}% of base price`;
      }

      addonLineItems.push({
        tierFeatureId: tierFeature.id,
        amount,
        label: tierFeature.feature.name,
        calculationNote,
      });

      totalAddonPrice += amount;
    }

    // Calculate total
    const subtotal = basePrice + totalAddonPrice;
    const discountAmount = (discountPercent / 100) * subtotal;
    const totalPrice = Math.max(0, subtotal - discountAmount);

    // Create quote with line items and addons
    const quote = await prisma.quote.create({
      data: {
        name,
        customerName,
        productId,
        tierId,
        seats,
        termLength,
        discountPercent,
        totalPrice,
        lineItems: {
          create: [
            {
              label: 'Base Price',
              calculationNote: `$${tier.basePricePerSeat.toFixed(2)}/seat × ${seats} seats`,
              amount: basePrice,
            },
            ...addonLineItems.map((item) => ({
              label: `Add-on: ${item.label}`,
              calculationNote: item.calculationNote,
              amount: item.amount,
            })),
            ...(discountAmount > 0
              ? [
                  {
                    label: 'Discount',
                    calculationNote: `${discountPercent.toFixed(2)}% off`,
                    amount: -discountAmount,
                  },
                ]
              : []),
          ],
        },
        addons: {
          create: addonLineItems.map((item) => ({
            tierFeatureId: item.tierFeatureId,
            amount: item.amount,
          })),
        },
      },
      include: {
        product: true,
        tier: true,
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

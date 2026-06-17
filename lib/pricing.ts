export type TermLength = 'MONTHLY' | 'ANNUAL' | 'TWO_YEAR';
export type AddonPricingModel = 'FIXED' | 'PER_SEAT' | 'PERCENTAGE';

interface BasePriceParams {
  basePricePerSeat: number;
  seats: number;
  termLength: TermLength;
}

interface AddonPriceParams {
  addonPrice: number;
  pricingModel: AddonPricingModel;
  seats?: number;
  monthsInTerm: number;
  basePriceBeforeDiscount?: number;
}

interface TotalPriceParams {
  basePrice: number;
  addonPrices: number[];
  discountPercent: number;
}

export function getMonthsInTerm(termLength: TermLength): number {
  switch (termLength) {
    case 'MONTHLY':
      return 1;
    case 'ANNUAL':
      return 12;
    case 'TWO_YEAR':
      return 24;
    default:
      return 1;
  }
}

function getTermDiscount(termLength: TermLength): number {
  switch (termLength) {
    case 'MONTHLY':
      return 1;
    case 'ANNUAL':
      return 0.85; // 15% discount
    case 'TWO_YEAR':
      return 0.75; // 25% discount
    default:
      return 1;
  }
}

export function calculateBasePrice({
  basePricePerSeat,
  seats,
  termLength,
}: BasePriceParams): number {
  const monthsInTerm = getMonthsInTerm(termLength);
  const termDiscount = getTermDiscount(termLength);
  return basePricePerSeat * seats * monthsInTerm * termDiscount;
}

export function calculateAddonPrice({
  addonPrice,
  pricingModel,
  seats = 1,
  monthsInTerm,
  basePriceBeforeDiscount = 0,
}: AddonPriceParams): number {
  if (addonPrice === 0) {
    return 0;
  }

  switch (pricingModel) {
    case 'FIXED':
      return addonPrice * monthsInTerm;
    case 'PER_SEAT':
      return addonPrice * seats * monthsInTerm;
    case 'PERCENTAGE':
      return (addonPrice / 100) * basePriceBeforeDiscount;
    default:
      return 0;
  }
}

export function calculateTotal({
  basePrice,
  addonPrices,
  discountPercent,
}: TotalPriceParams): number {
  const subtotal = basePrice + addonPrices.reduce((sum, price) => sum + price, 0);
  const discountAmount = (discountPercent / 100) * subtotal;
  return Math.max(0, subtotal - discountAmount);
}

export function calculateLineItems(params: {
  basePricePerSeat: number;
  seats: number;
  termLength: TermLength;
  addons: Array<{
    name: string;
    pricingModel: AddonPricingModel;
    addonPrice: number;
    addonSeats?: number;
  }>;
  discountPercent: number;
}): {
  basePrice: number;
  addonItems: Array<{
    name: string;
    amount: number;
    calculationNote: string;
  }>;
  discountAmount: number;
  total: number;
} {
  const { basePricePerSeat, seats, termLength, addons, discountPercent } = params;

  const monthsInTerm = getMonthsInTerm(termLength);
  const basePrice = calculateBasePrice({
    basePricePerSeat,
    seats,
    termLength,
  });

  const basePriceBeforeDiscount = basePricePerSeat * seats * monthsInTerm;

  const addonItems = addons.map((addon) => {
    const amount = calculateAddonPrice({
      addonPrice: addon.addonPrice,
      pricingModel: addon.pricingModel,
      seats: addon.addonSeats || seats,
      monthsInTerm,
      basePriceBeforeDiscount,
    });

    let calculationNote = '';
    switch (addon.pricingModel) {
      case 'FIXED':
        calculationNote = `$${addon.addonPrice.toFixed(2)}/month × ${monthsInTerm} months`;
        break;
      case 'PER_SEAT':
        calculationNote = `$${addon.addonPrice.toFixed(
          2
        )}/seat × ${addon.addonSeats || seats} seats × ${monthsInTerm} months`;
        break;
      case 'PERCENTAGE':
        calculationNote = `${addon.addonPrice.toFixed(2)}% of base price`;
        break;
    }

    return {
      name: addon.name,
      amount,
      calculationNote,
    };
  });

  const subtotal = basePrice + addonItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (discountPercent / 100) * subtotal;
  const total = Math.max(0, subtotal - discountAmount);

  return {
    basePrice,
    addonItems,
    discountAmount,
    total,
  };
}

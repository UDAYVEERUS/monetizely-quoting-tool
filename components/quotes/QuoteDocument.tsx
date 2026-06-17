import { formatCurrency, formatDateLong } from '@/lib/utils';
import type { Quote, QuoteLineItem } from '@prisma/client';

interface QuoteWithRelations extends Quote {
  product: { id: string; name: string };
  tier: { id: string; name: string };
  lineItems: QuoteLineItem[];
  addons: Array<{
    id: string;
    amount: number;
    tierFeature: {
      feature: { name: string };
    };
  }>;
}

interface QuoteDocumentProps {
  quote: QuoteWithRelations;
}

const termLabels = {
  MONTHLY: 'Monthly',
  ANNUAL: 'Annual (15% discount)',
  TWO_YEAR: 'Two-Year (25% discount)',
};

export function QuoteDocument({ quote }: QuoteDocumentProps) {
  const baseLineItem = quote.lineItems.find((li) => li.label === 'Base Price');
  const discountLineItem = quote.lineItems.find((li) => li.label === 'Discount');
  const addonLineItems = quote.lineItems.filter((li) =>
    li.label.startsWith('Add-on:')
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900">QUOTE</h1>
        <p className="text-xl text-gray-700 mt-2">{quote.name}</p>
      </div>

      {/* Customer & Date Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">For</p>
          <p className="text-lg font-semibold text-gray-900">{quote.customerName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatDateLong(quote.createdAt)}
          </p>
        </div>
      </div>

      {/* Product & Plan Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
              Product
            </p>
            <p className="text-lg font-bold text-gray-900">{quote.product.name}</p>
            <p className="text-sm text-gray-600 mt-1">Tier: {quote.tier.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
              Configuration
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{quote.seats}</span> Seats
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{termLabels[quote.termLength as keyof typeof termLabels]}</span> Term
            </p>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">LINE ITEMS</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Description
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Calculation
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {baseLineItem && (
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-semibold">
                    {baseLineItem.label}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {baseLineItem.calculationNote}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    {formatCurrency(baseLineItem.amount)}
                  </td>
                </tr>
              )}

              {addonLineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">
                    {item.label}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {item.calculationNote}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}

              {discountLineItem && (
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td colSpan={2} className="py-3 px-4 text-gray-900 font-semibold">
                    Discount ({quote.discountPercent}%)
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 font-semibold">
                    {formatCurrency(discountLineItem.amount)}
                  </td>
                </tr>
              )}

              {/* Total Row */}
              <tr className="border-t-2 border-gray-900 bg-gray-900 text-white">
                <td colSpan={2} className="py-4 px-4 text-white font-bold text-lg">
                  TOTAL
                </td>
                <td className="py-4 px-4 text-white text-right font-bold text-xl">
                  {formatCurrency(quote.totalPrice)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 pt-6 text-center text-gray-600 text-sm">
        <p>This quote is valid for 30 days. Please contact us for any questions.</p>
        <p className="mt-2">
          Quote ID: <span className="font-mono font-semibold">{quote.shareToken}</span>
        </p>
      </div>
    </div>
  );
}

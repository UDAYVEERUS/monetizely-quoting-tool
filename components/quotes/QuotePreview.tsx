import { formatCurrency, formatDateLong } from '@/lib/utils';
import { TermLength } from '@/lib/pricing';

interface QuotePreviewProps {
  quoteName: string;
  customerName: string;
  product?: { id: string; name: string };
  tier?: { id: string; name: string; basePricePerSeat: number };
  seats: number;
  termLength: TermLength;
  lineItems: {
    basePrice: number;
    addonItems: Array<{
      name: string;
      amount: number;
      calculationNote: string;
    }>;
    discountAmount: number;
    total: number;
  };
}

export function QuotePreview({
  quoteName,
  customerName,
  product,
  tier,
  seats,
  termLength,
  lineItems,
}: QuotePreviewProps) {
  const termLabels = {
    MONTHLY: 'Monthly',
    ANNUAL: 'Annual',
    TWO_YEAR: 'Two-Year',
  };

  return (
    <div className="max-w-3xl bg-white border border-gray-300 p-8">
      <div className="border-b border-gray-300 pb-6 mb-6">
        <h3 className="text-2xl font-bold text-gray-900">QUOTE</h3>
        <p className="mt-1 text-gray-600">{quoteName}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-sm font-semibold text-gray-700">FOR</p>
          <p className="text-lg text-gray-900">{customerName}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">DATE</p>
          <p className="text-lg text-gray-900">{formatDateLong(new Date())}</p>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-6 mb-8 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700 mb-4">PRODUCT & PLAN</p>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Product:</span> {product?.name || '—'}
          </p>
          <p>
            <span className="font-semibold">Tier:</span> {tier?.name || '—'}
          </p>
          <p>
            <span className="font-semibold">Term:</span> {termLabels[termLength]}
          </p>
          <p>
            <span className="font-semibold">Seats:</span> {seats}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-4">LINE ITEMS</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-2 font-semibold text-gray-900">
                  Description
                </th>
                <th className="text-left py-2 px-2 font-semibold text-gray-900">
                  Calculation
                </th>
                <th className="text-right py-2 px-2 font-semibold text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-2">Base Price</td>
                <td className="py-2 px-2 text-gray-600">
                  ${tier?.basePricePerSeat.toFixed(2)}/seat × {seats} seats ×{' '}
                  {termLength === 'MONTHLY' ? '1 month' : ''}
                  {termLength === 'ANNUAL' ? '12 months × 0.85 (15% discount)' : ''}
                  {termLength === 'TWO_YEAR' ? '24 months × 0.75 (25% discount)' : ''}
                </td>
                <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                  {formatCurrency(lineItems.basePrice)}
                </td>
              </tr>

              {lineItems.addonItems.map((addon, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-2">Add-on: {addon.name}</td>
                  <td className="py-2 px-2 text-gray-600">{addon.calculationNote}</td>
                  <td className="py-2 px-2 text-right text-gray-900 font-semibold">
                    {formatCurrency(addon.amount)}
                  </td>
                </tr>
              ))}

              {lineItems.discountAmount > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-2">Discount</td>
                  <td className="py-2 px-2 text-gray-600">—</td>
                  <td className="py-2 px-2 text-right text-red-600 font-semibold">
                    -{formatCurrency(lineItems.discountAmount)}
                  </td>
                </tr>
              )}

              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td colSpan={2} className="py-3 px-2 font-bold text-gray-900">
                  TOTAL
                </td>
                <td className="py-3 px-2 text-right font-bold text-gray-900 text-lg">
                  {formatCurrency(lineItems.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

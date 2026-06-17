import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    include: {
      product: true,
      tier: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <Link href="/quotes/new" className="btn">
          + New Quote
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No quotes yet. Create one to get started!</p>
          <Link href="/quotes/new" className="btn mt-4">
            Create First Quote
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Quote Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {quote.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {quote.customerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {quote.product.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(quote.totalPrice)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {formatDate(quote.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link
                      href={`/quotes/${quote.shareToken}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

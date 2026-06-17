'use client';

import Link from 'next/link';
import { QuoteBuilder } from '@/components/quotes/QuoteBuilder';

export default function NewQuotePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/quotes" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Quotes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
      </div>

      <QuoteBuilder />
    </div>
  );
}

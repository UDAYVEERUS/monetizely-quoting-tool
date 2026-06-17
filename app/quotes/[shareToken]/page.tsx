'use client';

import { useEffect, useState } from 'react';
import { QuoteDocument } from '@/components/quotes/QuoteDocument';

export default function ShareableQuotePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const { shareToken } = await params;
        const response = await fetch(`/api/quotes/${shareToken}`);

        if (!response.ok) {
          throw new Error('Quote not found');
        }

        const data = await response.json();
        setQuote(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quote');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [params]);

  if (loading) {
    return <div className="text-center py-12">Loading quote...</div>;
  }

  if (error || !quote) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Quote Not Found</h1>
        <p className="mt-2 text-gray-600">
          The quote you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-right">
        <button
          onClick={() => window.print()}
          className="btn"
        >
          Print / Save as PDF
        </button>
      </div>

      <QuoteDocument quote={quote} />
    </div>
  );
}

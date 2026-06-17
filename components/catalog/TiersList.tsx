'use client';

import { Tier } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TiersListProps {
  productId: string;
  tiers: Tier[];
}

export function TiersList({ productId, tiers }: TiersListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;

    setDeletingId(tierId);
    try {
      const response = await fetch(
        `/api/products/${productId}/tiers/${tierId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete');
      router.refresh();
    } catch (error) {
      alert('Failed to delete tier');
      setDeletingId(null);
    }
  };

  if (tiers.length === 0) {
    return (
      <p className="text-gray-600">
        No tiers created yet.{' '}
        <Link href={`/catalog/${productId}/tiers/new`} className="text-blue-600 hover:text-blue-700">
          Create one now
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tiers.map((tier) => (
        <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900">{tier.name}</h3>
          <p className="mt-2 text-lg font-bold text-blue-600">
            ${tier.basePricePerSeat.toFixed(2)}/seat/month
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href={`/catalog/${productId}/tiers/${tier.id}/edit`}
              className="btn-sm text-sm bg-gray-100 text-gray-900 px-2 py-1 rounded hover:bg-gray-200"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(tier.id)}
              disabled={deletingId === tier.id}
              className="btn-sm text-sm bg-red-100 text-red-900 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50"
            >
              {deletingId === tier.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

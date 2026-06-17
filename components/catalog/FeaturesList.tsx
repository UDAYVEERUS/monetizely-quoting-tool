'use client';

import { Feature } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FeaturesListProps {
  productId: string;
  features: Feature[];
}

export function FeaturesList({ productId, features }: FeaturesListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    setDeletingId(featureId);
    try {
      const response = await fetch(
        `/api/products/${productId}/features/${featureId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete');
      router.refresh();
    } catch (error) {
      alert('Failed to delete feature');
      setDeletingId(null);
    }
  };

  if (features.length === 0) {
    return (
      <p className="text-gray-600">
        No features created yet.{' '}
        <Link href={`/catalog/${productId}/features/new`} className="text-blue-600 hover:text-blue-700">
          Create one now
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <div key={feature.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
          <div>
            <h3 className="font-semibold text-gray-900">{feature.name}</h3>
            {feature.description && (
              <p className="text-sm text-gray-600">{feature.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/catalog/${productId}/features/${feature.id}/edit`}
              className="btn-sm text-sm bg-gray-100 text-gray-900 px-2 py-1 rounded hover:bg-gray-200"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(feature.id)}
              disabled={deletingId === feature.id}
              className="btn-sm text-sm bg-red-100 text-red-900 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50"
            >
              {deletingId === feature.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

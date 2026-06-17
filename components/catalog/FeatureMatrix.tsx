'use client';

import { useEffect, useState } from 'react';

interface TierFeatureStatus {
  id: string;
  status: 'INCLUDED' | 'ADDON' | 'NOT_AVAILABLE';
  addonPricingModel?: string;
  addonPrice?: number;
}

interface MatrixData {
  tiers: Array<{ id: string; name: string }>;
  features: Array<{ id: string; name: string }>;
  tierFeatures: TierFeatureStatus[];
}

export function FeatureMatrix({ productId }: { productId: string }) {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMatrixData();
  }, [productId]);

  const fetchMatrixData = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/feature-matrix`);
      if (!res.ok) throw new Error('Failed to fetch matrix data');
      const matrixData = await res.json();
      setData(matrixData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    tierId: string,
    featureId: string,
    newStatus: string
  ) => {
    if (!data) return;

    const tierFeature = data.tierFeatures.find(
      (tf: any) => tf.tierId === tierId && tf.featureId === featureId
    );

    if (!tierFeature) return;

    setEditingId(tierFeature.id);
    setIsSaving(true);

    try {
      const res = await fetch(
        `/api/products/${productId}/tier-features/${tierFeature.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');
      await fetchMatrixData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
      setEditingId(null);
    }
  };

  const handlePricingChange = async (
    tierFeatureId: string,
    field: string,
    value: any
  ) => {
    setEditingId(tierFeatureId);
    setIsSaving(true);

    try {
      const res = await fetch(
        `/api/products/${productId}/tier-features/${tierFeatureId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');
      await fetchMatrixData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
      setEditingId(null);
    }
  };

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data || data.tiers.length === 0 || data.features.length === 0) {
    return <div className="text-gray-600">No tiers or features to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Feature</th>
            {data.tiers.map((tier) => (
              <th
                key={tier.id}
                className="border border-gray-300 px-4 py-2 text-center font-semibold"
              >
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.features.map((feature) => (
            <tr key={feature.id}>
              <td className="border border-gray-300 px-4 py-2 font-medium">{feature.name}</td>
              {data.tiers.map((tier) => {
                const tierFeature = data.tierFeatures.find(
                  (tf: any) => tf.tierId === tier.id && tf.featureId === feature.id
                );

                return (
                  <td
                    key={`${tier.id}-${feature.id}`}
                    className="border border-gray-300 px-4 py-2"
                  >
                    <div className="space-y-2">
                      <select
                        value={tierFeature?.status || 'NOT_AVAILABLE'}
                        onChange={(e) =>
                          handleStatusChange(tier.id, feature.id, e.target.value)
                        }
                        disabled={isSaving || editingId === tierFeature?.id}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="INCLUDED">Included</option>
                        <option value="ADDON">Add-on</option>
                        <option value="NOT_AVAILABLE">Not Available</option>
                      </select>

                      {tierFeature?.status === 'ADDON' && (
                        <>
                          <select
                            value={tierFeature?.addonPricingModel || 'FIXED'}
                            onChange={(e) =>
                              handlePricingChange(
                                tierFeature.id,
                                'addonPricingModel',
                                e.target.value
                              )
                            }
                            disabled={isSaving}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          >
                            <option value="FIXED">Fixed</option>
                            <option value="PER_SEAT">Per Seat</option>
                            <option value="PERCENTAGE">Percentage</option>
                          </select>

                          <input
                            type="number"
                            step="0.01"
                            value={tierFeature?.addonPrice || ''}
                            onChange={(e) =>
                              handlePricingChange(
                                tierFeature.id,
                                'addonPrice',
                                parseFloat(e.target.value)
                              )
                            }
                            disabled={isSaving}
                            placeholder="Price"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewTierPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    basePricePerSeat: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}/tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          basePricePerSeat: parseFloat(formData.basePricePerSeat),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tier');
      }

      router.push(`/catalog/${productId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href={`/catalog/${productId}`} className="text-sm text-blue-600">
        ← Back to Product
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Add New Tier</h1>

      <div className="max-w-2xl card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Tier Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g., Starter"
            />
          </div>

          <div className="form-group">
            <label htmlFor="basePricePerSeat" className="form-label">
              Base Price Per Seat/Month *
            </label>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">$</span>
              <input
                type="number"
                id="basePricePerSeat"
                name="basePricePerSeat"
                value={formData.basePricePerSeat}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Tier'}
            </button>
            <Link href={`/catalog/${productId}`} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

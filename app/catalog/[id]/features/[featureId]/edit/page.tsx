'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditFeaturePage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const featureId = params.featureId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    // Fetch feature data
    const fetchFeature = async () => {
      try {
        const response = await fetch(
          `/api/products/${productId}/features/${featureId}`
        );
        if (!response.ok) throw new Error('Failed to fetch feature');
        const feature = await response.json();
        setFormData({
          name: feature.name,
          description: feature.description || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature');
      }
    };

    if (productId && featureId) {
      fetchFeature();
    }
  }, [productId, featureId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const response = await fetch(
        `/api/products/${productId}/features/${featureId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update feature');
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

      <h1 className="text-3xl font-bold text-gray-900">Edit Feature</h1>

      <div className="max-w-2xl card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Feature Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="form-input"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Feature'}
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

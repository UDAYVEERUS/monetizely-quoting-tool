'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuotePreview } from './QuotePreview';
import { calculateLineItems, TermLength, AddonPricingModel } from '@/lib/pricing';

interface Product {
  id: string;
  name: string;
}

interface Tier {
  id: string;
  name: string;
  basePricePerSeat: number;
}

interface TierFeature {
  id: string;
  featureId: string;
  feature: {
    id: string;
    name: string;
    description?: string;
  };
  status: string;
  addonPricingModel?: string;
  addonPrice?: number;
}

interface FormData {
  quoteName: string;
  customerName: string;
  productId: string;
  tierId: string;
  seats: string;
  termLength: TermLength;
  discountPercent: string;
  selectedAddons: Set<string>;
  addonSeats: Record<string, string>;
}

export function QuoteBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [tierFeatures, setTierFeatures] = useState<TierFeature[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [loadingAddons, setLoadingAddons] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    quoteName: '',
    customerName: '',
    productId: '',
    tierId: '',
    seats: '1',
    termLength: 'MONTHLY',
    discountPercent: '0',
    selectedAddons: new Set(),
    addonSeats: {},
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      fetchTiers(formData.productId);
    }
  }, [formData.productId]);

  useEffect(() => {
    if (formData.tierId && formData.productId) {
      fetchTierFeatures(formData.productId, formData.tierId);
    }
  }, [formData.tierId, formData.productId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }
  };

  const fetchTiers = async (productId: string) => {
    setLoadingTiers(true);
    try {
      const res = await fetch(`/api/products/${productId}/tiers/list`);
      if (!res.ok) throw new Error('Failed to fetch tiers');
      const data = await res.json();
      setTiers(data);
      setFormData((prev) => ({ ...prev, tierId: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tiers');
    } finally {
      setLoadingTiers(false);
    }
  };

  const fetchTierFeatures = async (productId: string, tierId: string) => {
    setLoadingAddons(true);
    try {
      const res = await fetch(
        `/api/products/${productId}/tiers/${tierId}/features`
      );
      if (!res.ok) throw new Error('Failed to fetch tier features');
      const data = await res.json();
      setTierFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load add-ons');
    } finally {
      setLoadingAddons(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddonChange = (addonId: string) => {
    setFormData((prev) => {
      const newSelectedAddons = new Set(prev.selectedAddons);
      if (newSelectedAddons.has(addonId)) {
        newSelectedAddons.delete(addonId);
      } else {
        newSelectedAddons.add(addonId);
      }
      return { ...prev, selectedAddons: newSelectedAddons };
    });
  };

  const handleAddonSeatsChange = (addonId: string, seats: string) => {
    setFormData((prev) => ({
      ...prev,
      addonSeats: {
        ...prev.addonSeats,
        [addonId]: seats,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (step < 5) {
      setStep(step + 1);
      return;
    }

    // Final submission
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.quoteName,
          customerName: formData.customerName,
          productId: formData.productId,
          tierId: formData.tierId,
          seats: parseInt(formData.seats),
          termLength: formData.termLength,
          discountPercent: parseFloat(formData.discountPercent),
          selectedAddons: Array.from(formData.selectedAddons),
          addonSeats: formData.addonSeats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quote');
      }

      const quote = await response.json();
      router.push(`/quotes/${quote.shareToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const selectedTier = tiers.find((t) => t.id === formData.tierId);

  let preview = null;
  if (selectedTier) {
    const selectedTierFeatures = tierFeatures.filter((tf) =>
      formData.selectedAddons.has(tf.id)
    );

    const addons = selectedTierFeatures.map((tf) => ({
      name: tf.feature.name,
      pricingModel: tf.addonPricingModel as AddonPricingModel,
      addonPrice: tf.addonPrice || 0,
      addonSeats: tf.addonPricingModel === 'PER_SEAT'
        ? parseInt(formData.addonSeats[tf.id] || formData.seats)
        : undefined,
    }));

    preview = calculateLineItems({
      basePricePerSeat: selectedTier.basePricePerSeat,
      seats: parseInt(formData.seats),
      termLength: formData.termLength,
      addons,
      discountPercent: parseFloat(formData.discountPercent),
    });
  }

  return (
    <div className="card max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

            <div className="form-group">
              <label htmlFor="quoteName" className="form-label">
                Quote Name *
              </label>
              <input
                type="text"
                id="quoteName"
                name="quoteName"
                value={formData.quoteName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., Acme Corp - Q3 2026 Proposal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., Acme Corporation"
              />
            </div>
          </div>
        )}

        {/* Step 2: Product Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Product & Tier Selection</h2>

            <div className="form-group">
              <label htmlFor="productId" className="form-label">
                Product *
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.productId && (
              <>
                <div className="form-group">
                  <label htmlFor="tierId" className="form-label">
                    Tier *
                  </label>
                  {loadingTiers ? (
                    <div className="text-gray-600">Loading tiers...</div>
                  ) : (
                    <select
                      id="tierId"
                      name="tierId"
                      value={formData.tierId}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select a tier...</option>
                      {tiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.name} - ${tier.basePricePerSeat}/seat/month
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="seats" className="form-label">
                      Number of Seats *
                    </label>
                    <input
                      type="number"
                      id="seats"
                      name="seats"
                      value={formData.seats}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="termLength" className="form-label">
                      Term Length *
                    </label>
                    <select
                      id="termLength"
                      name="termLength"
                      value={formData.termLength}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUAL">Annual (15% discount)</option>
                      <option value="TWO_YEAR">Two-Year (25% discount)</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Add-ons */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Add-ons</h2>

            {loadingAddons ? (
              <div className="text-gray-600">Loading add-ons...</div>
            ) : tierFeatures.length === 0 ? (
              <p className="text-gray-600">No add-ons available for this tier.</p>
            ) : (
              <div className="space-y-4">
                {tierFeatures
                  .filter((tf) => tf.status === 'ADDON' && tf.addonPricingModel && tf.addonPrice !== null)
                  .map((addon) => (
                    <div
                      key={addon.id}
                      className="border border-gray-300 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={addon.id}
                          checked={formData.selectedAddons.has(addon.id)}
                          onChange={() => handleAddonChange(addon.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={addon.id} className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">
                            {addon.feature.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {addon.addonPricingModel === 'FIXED' &&
                              `$${addon.addonPrice?.toFixed(2)}/month`}
                            {addon.addonPricingModel === 'PER_SEAT' &&
                              `$${addon.addonPrice?.toFixed(2)}/seat/month`}
                            {addon.addonPricingModel === 'PERCENTAGE' &&
                              `${addon.addonPrice?.toFixed(2)}% of base price`}
                          </div>
                        </label>
                      </div>

                      {formData.selectedAddons.has(addon.id) &&
                        addon.addonPricingModel === 'PER_SEAT' && (
                          <div className="mt-3 ml-7">
                            <label
                              htmlFor={`${addon.id}-seats`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Number of Seats
                            </label>
                            <input
                              type="number"
                              id={`${addon.id}-seats`}
                              value={formData.addonSeats[addon.id] || formData.seats}
                              onChange={(e) =>
                                handleAddonSeatsChange(addon.id, e.target.value)
                              }
                              min="1"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                            />
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Discount */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Discount</h2>

            <div className="form-group">
              <label htmlFor="discountPercent" className="form-label">
                Overall Discount (%)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="discountPercent"
                  name="discountPercent"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                />
                <span className="ml-2 text-gray-600">%</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Leave as 0 for no discount. This is applied after calculating all add-ons.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && preview && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Quote Preview</h2>
            <QuotePreview
              quoteName={formData.quoteName}
              customerName={formData.customerName}
              product={selectedProduct}
              tier={selectedTier}
              seats={parseInt(formData.seats)}
              termLength={formData.termLength}
              lineItems={preview}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setStep(Math.max(1, step - 1));
            }}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="btn"
          >
            {step === 5 ? (isLoading ? 'Saving...' : 'Save Quote') : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}

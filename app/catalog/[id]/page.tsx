import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FeatureMatrix } from '@/components/catalog/FeatureMatrix';
import { TiersList } from '@/components/catalog/TiersList';
import { FeaturesList } from '@/components/catalog/FeaturesList';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { createdAt: 'asc' } },
      features: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!product) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Product not found</h1>
        <Link href="/catalog" className="btn">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/catalog" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Catalog
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-gray-600">{product.description}</p>
        )}
      </div>

      <div className="space-y-8">
        {/* Tiers Section */}
        <section className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pricing Tiers</h2>
            <Link
              href={`/catalog/${product.id}/tiers/new`}
              className="btn-sm bg-blue-600 text-white px-3 py-2"
            >
              + Add Tier
            </Link>
          </div>
          <TiersList productId={product.id} tiers={product.tiers} />
        </section>

        {/* Features Section */}
        <section className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Features</h2>
            <Link
              href={`/catalog/${product.id}/features/new`}
              className="btn-sm bg-blue-600 text-white px-3 py-2"
            >
              + Add Feature
            </Link>
          </div>
          <FeaturesList productId={product.id} features={product.features} />
        </section>

        {/* Feature Matrix Section */}
        {product.tiers.length > 0 && product.features.length > 0 && (
          <section className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Matrix</h2>
            <FeatureMatrix productId={product.id} />
          </section>
        )}

        {(product.tiers.length === 0 || product.features.length === 0) && (
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Add at least one tier and one feature to see the feature matrix.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

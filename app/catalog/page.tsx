import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link href="/catalog/new" className="btn">
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No products yet. Create one to get started!</p>
          <Link href="/catalog/new" className="btn mt-4">
            Create First Product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/catalog/${product.id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
              {product.description && (
                <p className="mt-2 text-gray-600 text-sm">{product.description}</p>
              )}
              <p className="mt-4 text-sm text-blue-600">View details →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

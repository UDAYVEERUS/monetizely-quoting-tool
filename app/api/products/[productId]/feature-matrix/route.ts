import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        tiers: { orderBy: { createdAt: 'asc' } },
        features: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const tierFeatures = await prisma.tierFeature.findMany({
      where: {
        tier: { productId: productId },
      },
    });

    return NextResponse.json({
      tiers: product.tiers.map((t) => ({ id: t.id, name: t.name })),
      features: product.features.map((f) => ({ id: f.id, name: f.name })),
      tierFeatures: tierFeatures.map((tf) => ({
        id: tf.id,
        tierId: tf.tierId,
        featureId: tf.featureId,
        status: tf.status,
        addonPricingModel: tf.addonPricingModel,
        addonPrice: tf.addonPrice,
      })),
    });
  } catch (error) {
    console.error('Error fetching feature matrix:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature matrix' },
      { status: 500 }
    );
  }
}

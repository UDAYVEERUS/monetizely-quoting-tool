import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const { name, basePricePerSeat } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tier name is required' }, { status: 400 });
    }

    if (typeof basePricePerSeat !== 'number' || basePricePerSeat < 0) {
      return NextResponse.json(
        { error: 'Base price must be a non-negative number' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const tier = await prisma.tier.create({
      data: {
        name: name.trim(),
        basePricePerSeat,
        productId: productId,
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error('Error creating tier:', error);
    return NextResponse.json(
      { error: 'Failed to create tier' },
      { status: 500 }
    );
  }
}

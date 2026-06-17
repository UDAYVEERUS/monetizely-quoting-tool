import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const { name, description } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feature name is required' },
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

    const feature = await prisma.feature.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        productId: productId,
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json(
      { error: 'Failed to create feature' },
      { status: 500 }
    );
  }
}

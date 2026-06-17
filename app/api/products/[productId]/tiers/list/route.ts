import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const tiers = await prisma.tier.findMany({
      where: { productId: productId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tiers' },
      { status: 500 }
    );
  }
}

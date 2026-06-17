import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; tierId: string }> }
) {
  const { tierId } = await params;
  try {
    const tierFeatures = await prisma.tierFeature.findMany({
      where: { tierId: tierId },
      include: {
        feature: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(tierFeatures);
  } catch (error) {
    console.error('Error fetching tier features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier features' },
      { status: 500 }
    );
  }
}

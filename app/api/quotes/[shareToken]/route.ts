import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;

  try {
    const quote = await prisma.quote.findUnique({
      where: { shareToken },
      include: {
        product: true,
        tier: true,
        lineItems: {
          orderBy: { createdAt: 'asc' },
        },
        addons: {
          include: {
            tierFeature: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

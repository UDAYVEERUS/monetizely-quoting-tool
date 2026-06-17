import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; tierId: string }> }
) {
  const { tierId } = await params;

  try {
    const tier = await prisma.tier.findUnique({
      where: { id: tierId },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    return NextResponse.json(tier);
  } catch (error) {
    console.error('Error fetching tier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; tierId: string }> }
) {
  const { tierId } = await params;

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

    const tier = await prisma.tier.update({
      where: { id: tierId },
      data: {
        name: name.trim(),
        basePricePerSeat,
      },
    });

    return NextResponse.json(tier);
  } catch (error) {
    console.error('Error updating tier:', error);
    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; tierId: string }> }
) {
  const { tierId } = await params;

  try {
    await prisma.tier.delete({
      where: { id: tierId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tier:', error);
    return NextResponse.json(
      { error: 'Failed to delete tier' },
      { status: 500 }
    );
  }
}

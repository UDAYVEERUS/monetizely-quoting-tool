import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; featureId: string }> }
) {
  const { featureId } = await params;

  try {
    const feature = await prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error fetching feature:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; featureId: string }> }
) {
  const { featureId } = await params;

  try {
    const { name, description } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feature name is required' },
        { status: 400 }
      );
    }

    const feature = await prisma.feature.update({
      where: { id: featureId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error updating feature:', error);
    return NextResponse.json(
      { error: 'Failed to update feature' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; featureId: string }> }
) {
  const { featureId } = await params;

  try {
    await prisma.feature.delete({
      where: { id: featureId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature' },
      { status: 500 }
    );
  }
}

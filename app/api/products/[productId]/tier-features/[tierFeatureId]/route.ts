import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; tierFeatureId: string }> }
) {
  const { productId, tierFeatureId } = await params;
  try {
    const body = await request.json();
    const { status, addonPricingModel, addonPrice } = body;

    // Validate status if provided
    if (status && !['INCLUDED', 'ADDON', 'NOT_AVAILABLE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate pricing model if provided
    if (
      addonPricingModel &&
      !['FIXED', 'PER_SEAT', 'PERCENTAGE'].includes(addonPricingModel)
    ) {
      return NextResponse.json(
        { error: 'Invalid pricing model' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (addonPrice !== undefined && (typeof addonPrice !== 'number' || addonPrice < 0)) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    // Verify tier-feature exists and belongs to the product
    const tierFeature = await prisma.tierFeature.findUnique({
      where: { id: tierFeatureId },
      include: { tier: true },
    });

    if (!tierFeature || tierFeature.tier.productId !== productId) {
      return NextResponse.json(
        { error: 'Tier feature not found' },
        { status: 404 }
      );
    }

    // When status changes from ADDON to something else, clear pricing fields
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status !== 'ADDON') {
        updateData.addonPricingModel = null;
        updateData.addonPrice = null;
      }
    }
    if (addonPricingModel !== undefined) updateData.addonPricingModel = addonPricingModel;
    if (addonPrice !== undefined) updateData.addonPrice = addonPrice;

    const updated = await prisma.tierFeature.update({
      where: { id: tierFeatureId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating tier feature:', error);
    return NextResponse.json(
      { error: 'Failed to update tier feature' },
      { status: 500 }
    );
  }
}

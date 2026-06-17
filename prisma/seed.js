const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.quote.deleteMany({});
  await prisma.quoteAddon.deleteMany({});
  await prisma.quoteLineItem.deleteMany({});
  await prisma.tierFeature.deleteMany({});
  await prisma.feature.deleteMany({});
  await prisma.tier.deleteMany({});
  await prisma.product.deleteMany({});

  // Create CloudBase CRM product
  const product = await prisma.product.create({
    data: {
      name: 'CloudBase CRM',
      description: 'A comprehensive cloud-based CRM solution for businesses of all sizes',
    },
  });

  // Create tiers
  const starterTier = await prisma.tier.create({
    data: {
      name: 'Starter',
      basePricePerSeat: 30,
      productId: product.id,
    },
  });

  const growthTier = await prisma.tier.create({
    data: {
      name: 'Growth',
      basePricePerSeat: 60,
      productId: product.id,
    },
  });

  const enterpriseTier = await prisma.tier.create({
    data: {
      name: 'Enterprise',
      basePricePerSeat: 100,
      productId: product.id,
    },
  });

  // Create features
  const basicReporting = await prisma.feature.create({
    data: {
      name: 'Basic Reporting',
      description: 'Standard reporting capabilities',
      productId: product.id,
    },
  });

  const advancedAnalytics = await prisma.feature.create({
    data: {
      name: 'Advanced Analytics',
      description: 'Advanced analytics and insights',
      productId: product.id,
    },
  });

  const sso = await prisma.feature.create({
    data: {
      name: 'Single Sign-On (SSO)',
      description: 'Enterprise SSO support',
      productId: product.id,
    },
  });

  const prioritySupport = await prisma.feature.create({
    data: {
      name: 'Priority Support',
      description: '24/7 priority support',
      productId: product.id,
    },
  });

  // Create tier-feature relationships
  // Basic Reporting: Included in all tiers
  await prisma.tierFeature.create({
    data: {
      tierId: starterTier.id,
      featureId: basicReporting.id,
      status: 'INCLUDED',
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: growthTier.id,
      featureId: basicReporting.id,
      status: 'INCLUDED',
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: enterpriseTier.id,
      featureId: basicReporting.id,
      status: 'INCLUDED',
    },
  });

  // Advanced Analytics: Not available on Starter, Add-on on Growth ($200/mo fixed), Included on Enterprise
  await prisma.tierFeature.create({
    data: {
      tierId: starterTier.id,
      featureId: advancedAnalytics.id,
      status: 'NOT_AVAILABLE',
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: growthTier.id,
      featureId: advancedAnalytics.id,
      status: 'ADDON',
      addonPricingModel: 'FIXED',
      addonPrice: 200,
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: enterpriseTier.id,
      featureId: advancedAnalytics.id,
      status: 'INCLUDED',
    },
  });

  // SSO: Not available on Starter, Add-on on Growth ($15/seat/mo per-seat), Included on Enterprise
  await prisma.tierFeature.create({
    data: {
      tierId: starterTier.id,
      featureId: sso.id,
      status: 'NOT_AVAILABLE',
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: growthTier.id,
      featureId: sso.id,
      status: 'ADDON',
      addonPricingModel: 'PER_SEAT',
      addonPrice: 15,
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: enterpriseTier.id,
      featureId: sso.id,
      status: 'INCLUDED',
    },
  });

  // Priority Support: Not available on Starter, Add-on on Growth (10% of base, percentage), Add-on on Enterprise ($500/mo fixed)
  await prisma.tierFeature.create({
    data: {
      tierId: starterTier.id,
      featureId: prioritySupport.id,
      status: 'NOT_AVAILABLE',
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: growthTier.id,
      featureId: prioritySupport.id,
      status: 'ADDON',
      addonPricingModel: 'PERCENTAGE',
      addonPrice: 10,
    },
  });

  await prisma.tierFeature.create({
    data: {
      tierId: enterpriseTier.id,
      featureId: prioritySupport.id,
      status: 'ADDON',
      addonPricingModel: 'FIXED',
      addonPrice: 500,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

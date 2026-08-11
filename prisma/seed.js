const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Seed Default Subscription Plans (Monthly + Yearly)
  await prisma.subscriptionPlan.upsert({
    where: { id: "starter-plan-uuid" },
    update: {},
    create: {
      id: "starter-plan-uuid",
      name: "Starter",
      description: "For small agencies starting out",
      monthlyPrice: 99,
      yearlyPrice: 1188, // $99 * 12
      maxSeats: 5,
      maxListings: 150,
      maxStorageGB: 20,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: "pro-plan-uuid" },
    update: {},
    create: {
      id: "pro-plan-uuid",
      name: "Professional",
      description: "For growing real estate agencies",
      monthlyPrice: 349,
      yearlyPrice: 4188, // $349 * 12
      maxSeats: 25,
      maxListings: 1500,
      maxStorageGB: 250,
      hasDealsCommission: true,
      hasCustomRoles: true,
      hasPortalSyndication: true,
      hasApiAccess: true,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: "enterprise-plan-uuid" },
    update: {},
    create: {
      id: "enterprise-plan-uuid",
      name: "Enterprise",
      description: "For large enterprise networks",
      monthlyPrice: 899,
      yearlyPrice: 10788, // $899 * 12
      maxSeats: 999,
      maxListings: 99999,
      maxStorageGB: 2000,
      hasDealsCommission: true,
      hasCustomRoles: true,
      hasPortalSyndication: true,
      hasWhiteLabel: true,
      hasApiAccess: true,
      hasAuditLogSSO: true,
      hasAdvancedAnalytics: true,
    },
  });

  // 2. Seed Super Admin User
  const adminEmail = "admin@freehold.app";
  const hashedPassword = await bcrypt.hash("Admin@123456", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: "Ismail Qureshi",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  // 3. Seed Vocabularies
  console.log("🌱 Seeding Vocabularies...");

  // Property Types
  const types = [
    { name: "Residential", slug: "residential" },
    { name: "Commercial", slug: "commercial" },
    { name: "Agricultural", slug: "agricultural" },
    { name: "Industrial", slug: "industrial", status: "INACTIVE" },
  ];

  for (const t of types) {
    await prisma.propertyType.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  const residentialType = await prisma.propertyType.findUnique({ where: { slug: "residential" } });
  const commercialType = await prisma.propertyType.findUnique({ where: { slug: "commercial" } });

  // Categories
  const categories = [
    { name: "Apartment", slug: "apartment", propertyTypeId: residentialType.id },
    { name: "House", slug: "house", propertyTypeId: residentialType.id },
    { name: "Plot", slug: "plot", propertyTypeId: residentialType.id },
    { name: "Office", slug: "office", propertyTypeId: commercialType.id },
    { name: "Shop", slug: "shop", propertyTypeId: commercialType.id },
  ];

  for (const c of categories) {
    await prisma.propertyCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // Listing Statuses
  const statuses = [
    { name: "Available", slug: "available", colorCode: "#22C55E" },
    { name: "Sold", slug: "sold", colorCode: "#EF4444" },
    { name: "Rented", slug: "rented", colorCode: "#3B82F6" },
    { name: "Off-Market", slug: "off-market", colorCode: "#6B7280" },
  ];

  for (const s of statuses) {
    await prisma.listingStatus.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  // Amenities
  const amenities = [
    { name: "Swimming Pool", slug: "swimming-pool" },
    { name: "Gym", slug: "gym" },
    { name: "Backup Generator", slug: "backup-generator" },
    { name: "Security Staff", slug: "security-staff" },
    { name: "Elevator", slug: "elevator" },
  ];

  for (const a of amenities) {
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }

  // Lead Sources
  const sources = [
    { name: "Zameen.com", slug: "zameen-com" },
    { name: "Graana", slug: "graana" },
    { name: "Facebook", slug: "facebook" },
    { name: "Walk-in", slug: "walk-in" },
    { name: "Referral", slug: "referral" },
  ];

  for (const src of sources) {
    await prisma.leadSource.upsert({
      where: { slug: src.slug },
      update: {},
      create: src,
    });
  }

  console.log(`✅ Super Admin Seeded: ${superAdmin.email}`);
  console.log("✅ Vocabularies Seeded");
  console.log("🎉 Seeding Completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
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

  console.log(`✅ Super Admin Seeded: ${superAdmin.email}`);
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
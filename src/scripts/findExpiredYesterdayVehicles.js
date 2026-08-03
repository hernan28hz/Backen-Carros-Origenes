require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const now = new Date();
    const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { soatExpiry: { gte: yesterday, lt: tomorrow } },
          { tecnomecanicaExpiry: { gte: yesterday, lt: tomorrow } },
          { vehicleTaxExpiry: { gte: yesterday, lt: tomorrow } },
        ],
        createdBy: {
          contactEmail: { not: null },
          contactEmailVerified: true,
        },
      },
      include: { createdBy: true },
      take: 5,
    });

    console.log(JSON.stringify(
      vehicles.map(v => ({
        id: v.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        soat: v.soatExpiry,
        tecnomecanica: v.tecnomecanicaExpiry,
        vehicleTax: v.vehicleTaxExpiry,
        email: v.createdBy?.contactEmail || null,
      })),
      null,
      2
    ));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();

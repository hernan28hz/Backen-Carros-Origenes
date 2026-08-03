require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const now = new Date();
    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { soatExpiry: { lt: now } },
          { tecnomecanicaExpiry: { lt: now } },
          { vehicleTaxExpiry: { lt: now } },
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

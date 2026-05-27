const prisma = require("../config/prisma");
const { sendComplianceAlert } = require("../utils/mailer");

const DOCUMENTS = [
  {
    field: "soatExpiry",
    documentType: "SOAT",
    label: "SOAT",
  },
  {
    field: "tecnomecanicaExpiry",
    documentType: "TECNOMECANICA",
    label: "Tecnomecanica",
  },
  {
    field: "vehicleTaxExpiry",
    documentType: "IMPUESTO_VEHICULAR",
    label: "Impuesto Vehicular",
  },
];

const ALERTS_BY_DAY_DIFFERENCE = {
  5: {
    alertType: "FIVE_DAYS_BEFORE",
    status: "Proximo a vencer",
    titlePrefix: "esta proximo a vencer",
  },
  1: {
    alertType: "ONE_DAY_BEFORE",
    status: "Proximo a vencer",
    titlePrefix: "vence manana",
  },
  "-1": {
    alertType: "ONE_DAY_AFTER",
    status: "Vencido",
    titlePrefix: "ha vencido",
  },
};

function startComplianceNotificationScheduler() {
  setTimeout(() => {
    runComplianceNotificationCheck().catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Error checking compliance notifications:", error.message);
    });
  }, 15000);

  return setInterval(() => {
    runComplianceNotificationCheck().catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Error checking compliance notifications:", error.message);
    });
  }, 24 * 60 * 60 * 1000);
}

function getUtcDayStart(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getDayDifference(expiryDate, today = new Date()) {
  const expiryUtc = getUtcDayStart(expiryDate);
  const todayUtc = getUtcDayStart(today);
  return Math.round((expiryUtc - todayUtc) / 86400000);
}

function getVehicleLabel(vehicle) {
  return `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`;
}

async function runComplianceNotificationCheck() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { soatExpiry: { not: null } },
        { tecnomecanicaExpiry: { not: null } },
        { vehicleTaxExpiry: { not: null } },
      ],
      createdBy: {
        contactEmail: { not: null },
        contactEmailVerified: true,
      },
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          contactEmail: true,
          contactEmailVerified: true,
        },
      },
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  let sentCount = 0;

  for (const vehicle of vehicles) {
    for (const documentInfo of DOCUMENTS) {
      const expiryDate = vehicle[documentInfo.field];
      if (!expiryDate) continue;

      const dayDifference = getDayDifference(expiryDate);
      const alertConfig = ALERTS_BY_DAY_DIFFERENCE[String(dayDifference)];
      if (!alertConfig) continue;

      const alreadySent = await prisma.vehicleComplianceNotification.findUnique({
        where: {
          vehicleId_userId_documentType_alertType_expiryDate: {
            vehicleId: vehicle.id,
            userId: vehicle.createdBy.id,
            documentType: documentInfo.documentType,
            alertType: alertConfig.alertType,
            expiryDate,
          },
        },
        select: { id: true },
      });

      if (alreadySent) continue;

      try {
        await sendComplianceAlert(vehicle.createdBy.contactEmail, {
          plate: vehicle.plate,
          vehicleLabel: getVehicleLabel(vehicle),
          documentLabel: documentInfo.label,
          expiryDate,
          status: alertConfig.status,
          title: `El ${documentInfo.label} de tu vehiculo ${alertConfig.titlePrefix}`,
          photoUrl: vehicle.photos[0]?.url || null,
        });

        await prisma.vehicleComplianceNotification.create({
          data: {
            vehicleId: vehicle.id,
            userId: vehicle.createdBy.id,
            documentType: documentInfo.documentType,
            alertType: alertConfig.alertType,
            expiryDate,
          },
        });

        sentCount += 1;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`No se pudo enviar alerta ${documentInfo.documentType} para ${vehicle.plate}:`, error.message);
      }
    }
  }

  return { sentCount };
}

module.exports = {
  runComplianceNotificationCheck,
  startComplianceNotificationScheduler,
};

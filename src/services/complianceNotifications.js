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
  const enabledValue = process.env.COMPLIANCE_NOTIFICATIONS_ENABLED;
  const enabled = enabledValue !== "false";

  if (!enabled) {
    return null;
  }

  if (process.env.COMPLIANCE_RUN_ON_STARTUP === "true") {
    const startupDelayMs = Number(process.env.COMPLIANCE_STARTUP_DELAY_MS || 5 * 60 * 1000);
    const startupTimer = setTimeout(runScheduledComplianceCheck, startupDelayMs);
    startupTimer.unref?.();
  }

  const interval = setInterval(() => {
    runScheduledComplianceCheck();
  }, 24 * 60 * 60 * 1000);
  interval.unref?.();
  return interval;
}

function runScheduledComplianceCheck() {
  runComplianceNotificationCheck().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Error checking compliance notifications:", error.message);
  });
}

function getUtcDayStart(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getUtcDayRange(dayDifference, today = new Date()) {
  const start = new Date(getUtcDayStart(today) + dayDifference * 86400000);
  const end = new Date(start.getTime() + 86400000);
  return { start, end };
}

function getDayDifference(expiryDate, today = new Date()) {
  const expiryUtc = getUtcDayStart(expiryDate);
  const todayUtc = getUtcDayStart(today);
  return Math.round((expiryUtc - todayUtc) / 86400000);
}

function getVehicleLabel(vehicle) {
  return `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`;
}

function buildExpiryWhere(today = new Date()) {
  const targetRanges = Object.keys(ALERTS_BY_DAY_DIFFERENCE).map((dayDifference) =>
    getUtcDayRange(Number(dayDifference), today)
  );

  return DOCUMENTS.flatMap((documentInfo) =>
    targetRanges.map((range) => ({
      [documentInfo.field]: {
        gte: range.start,
        lt: range.end,
      },
    }))
  );
}

function getNotificationKey(notification) {
  return [
    notification.vehicleId,
    notification.userId,
    notification.documentType,
    notification.alertType,
    notification.expiryDate.toISOString(),
  ].join("|");
}

async function runComplianceNotificationCheck() {
  const today = new Date();
  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: buildExpiryWhere(today),
      createdBy: {
        contactEmail: { not: null },
        contactEmailVerified: true,
      },
    },
    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
      soatExpiry: true,
      tecnomecanicaExpiry: true,
      vehicleTaxExpiry: true,
      createdBy: {
        select: {
          id: true,
          contactEmail: true,
        },
      },
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          url: true,
        },
      },
    },
  });

  const candidates = [];

  for (const vehicle of vehicles) {
    for (const documentInfo of DOCUMENTS) {
      const expiryDate = vehicle[documentInfo.field];
      if (!expiryDate) continue;

      const dayDifference = getDayDifference(expiryDate, today);
      const alertConfig = ALERTS_BY_DAY_DIFFERENCE[String(dayDifference)];
      if (!alertConfig) continue;

      candidates.push({
        vehicle,
        documentInfo,
        alertConfig,
        vehicleId: vehicle.id,
        userId: vehicle.createdBy.id,
        documentType: documentInfo.documentType,
        alertType: alertConfig.alertType,
        expiryDate,
      });
    }
  }

  if (!candidates.length) {
    return { sentCount: 0 };
  }

  const existingNotifications = await prisma.vehicleComplianceNotification.findMany({
    where: {
      OR: candidates.map((candidate) => ({
        vehicleId: candidate.vehicleId,
        userId: candidate.userId,
        documentType: candidate.documentType,
        alertType: candidate.alertType,
        expiryDate: candidate.expiryDate,
      })),
    },
    select: {
      vehicleId: true,
      userId: true,
      documentType: true,
      alertType: true,
      expiryDate: true,
    },
  });
  const existingNotificationKeys = new Set(existingNotifications.map(getNotificationKey));
  let sentCount = 0;

  for (const candidate of candidates) {
    if (existingNotificationKeys.has(getNotificationKey(candidate))) {
      continue;
    }

    const { vehicle, documentInfo, alertConfig, expiryDate } = candidate;

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
      existingNotificationKeys.add(getNotificationKey(candidate));

      sentCount += 1;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`No se pudo enviar alerta ${documentInfo.documentType} para ${vehicle.plate}:`, error.message);
    }
  }

  return { sentCount };
}

module.exports = {
  runComplianceNotificationCheck,
  startComplianceNotificationScheduler,
};

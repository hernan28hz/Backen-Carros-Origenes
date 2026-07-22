const prisma = require("../config/prisma");

function normalizeAuditValue(value) {
  if (value === undefined) return null;
  if (value === null) return null;

  try {
    return JSON.stringify(value);
  } catch (_error) {
    return String(value);
  }
}

async function createAuditLog({ userId, action, entity, entityId, oldValue, newValue, metadata }, client = prisma) {
  return client.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      oldValue: normalizeAuditValue(oldValue),
      newValue: normalizeAuditValue(newValue),
      metadata: normalizeAuditValue(metadata),
    },
  });
}

module.exports = {
  createAuditLog,
};

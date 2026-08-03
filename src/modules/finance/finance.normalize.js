const TYPE_ALIASES = {
  "INGRESO POR FLETE": "FLETE",
  FLETE: "FLETE",
  "INGRESO POR ALQUILER": "ALQUILER",
  ALQUILER: "ALQUILER",
  "GASTO GENERAL": "GASTO_GENERAL",
  GASTO_GENERAL: "GASTO_GENERAL",
  "COMPRA DE VEHICULO": "COMPRA_VEHICULO",
  COMPRA_VEHICULO: "COMPRA_VEHICULO",
  "VENTA DE VEHICULO": "VENTA_VEHICULO",
  VENTA_VEHICULO: "VENTA_VEHICULO",
  MANTENIMIENTO: "MANTENIMIENTO",
  INGRESO: "INGRESO",
  EGRESO: "EGRESO",
  COSTO_OPERATIVO: "COSTO_OPERATIVO",
};

const MONEY_FIELDS = ["amount", "costPerKm", "averageFreight", "operatorExpenses", "associatedCosts"];

function pickValue(value) {
  if (Array.isArray(value)) return pickValue(value[0]);
  if (value && typeof value === "object" && "value" in value) return pickValue(value.value);
  return value;
}

function normalizeText(value) {
  const picked = pickValue(value);
  if (picked === undefined || picked === null) return undefined;
  return String(picked).trim();
}

function normalizeType(value) {
  const normalized = String(normalizeText(value) || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return TYPE_ALIASES[normalized] || normalized;
}

function normalizeMoney(value) {
  const normalized = normalizeText(value);
  if (!normalized) return undefined;
  return normalized.replace(/\./g, "").replace(",", ".");
}

function normalizeFinanceBody(req, _res, next) {
  req.body = Object.fromEntries(
    Object.entries(req.body || {}).map(([key, value]) => {
      if (key === "type") return [key, normalizeType(value)];
      if (MONEY_FIELDS.includes(key)) return [key, normalizeMoney(value)];
      return [key, pickValue(value)];
    })
  );

  next();
}

module.exports = {
  normalizeFinanceBody,
  normalizeMoney,
  normalizeType,
  pickValue,
};

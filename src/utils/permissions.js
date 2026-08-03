const ROLES = {
  ADMIN: "ADMIN",
  DIRECTOR: "DIRECTOR",
  GERENTE: "GERENTE",
};
const { isPrimaryAdmin } = require("./adminAccess");

const FINANCE_RECORD_TYPES = [
  "INGRESO",
  "EGRESO",
  "FLETE",
  "ALQUILER",
  "GASTO_GENERAL",
  "COMPRA_VEHICULO",
  "VENTA_VEHICULO",
  "COSTO_OPERATIVO",
  "MANTENIMIENTO",
];

const VEHICLE_WRITE_ROLES = [ROLES.ADMIN];
const VEHICLE_READ_ROLES = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.GERENTE];

function canManageFinance(user) {
  return user?.role === ROLES.GERENTE || isPrimaryAdmin(user);
}

module.exports = {
  ROLES,
  FINANCE_RECORD_TYPES,
  VEHICLE_READ_ROLES,
  VEHICLE_WRITE_ROLES,
  canManageFinance,
};

const PRIMARY_ADMIN_ID = "adminWlogit01";
const PRIMARY_ADMIN_EMAIL = "admin01@grupowlogist.com";
const LEGACY_PRIMARY_ADMIN_ID = "admin-origenes-001";
const LEGACY_PRIMARY_ADMIN_EMAIL = "admin@origenesfleet.com";

function isPrimaryAdmin(user) {
  const email = String(user?.email || "").toLowerCase();
  return Boolean(
    user &&
      [PRIMARY_ADMIN_ID, LEGACY_PRIMARY_ADMIN_ID].includes(user.id) &&
      [PRIMARY_ADMIN_EMAIL, LEGACY_PRIMARY_ADMIN_EMAIL, "admin@grupowlogist.com"].includes(email)
  );
}

module.exports = {
  PRIMARY_ADMIN_ID,
  PRIMARY_ADMIN_EMAIL,
  isPrimaryAdmin,
};

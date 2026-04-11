const PRIMARY_ADMIN_ID = "admin-origenes-001";
const PRIMARY_ADMIN_EMAIL = "admin@origenesfleet.com";

function isPrimaryAdmin(user) {
  return Boolean(user && user.id === PRIMARY_ADMIN_ID && user.email === PRIMARY_ADMIN_EMAIL);
}

module.exports = {
  PRIMARY_ADMIN_ID,
  PRIMARY_ADMIN_EMAIL,
  isPrimaryAdmin,
};

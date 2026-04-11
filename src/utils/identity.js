function normalizeIdentifier(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (raw.includes("@")) {
    return raw.toLowerCase();
  }

  return raw.replace(/[\s.-]/g, "");
}

function isValidIdentifier(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;

  if (raw.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
  }

  const normalized = normalizeIdentifier(raw);
  return /^[0-9]{5,20}$/.test(normalized);
}

module.exports = {
  normalizeIdentifier,
  isValidIdentifier,
};

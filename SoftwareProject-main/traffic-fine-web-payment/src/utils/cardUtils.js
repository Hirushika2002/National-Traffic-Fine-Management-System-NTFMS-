export function formatCardNumber(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiryDate(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isExpiryInFuture(expiryDate) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiryDate);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiry = new Date(year, month, 1);
  return expiry.getTime() > Date.now();
}

export function formatCvv(rawValue) {
  return rawValue.replace(/\D/g, '').slice(0, 4);
}

export function formatPhone(rawValue) {
  return rawValue.replace(/[^\d+]/g, '').slice(0, 12);
}

export const formatCurrency = (amount) =>
  `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN') : '—';

export const getDaysToExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
};

export const getExpiryBadgeColor = (days) => {
  if (days === null) return 'gray';
  if (days < 0) return 'red';
  if (days < 30) return 'yellow';
  return 'green';
};

export const getExpiryLabel = (days) => {
  if (days === null) return '—';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  return `${days}d`;
};

export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const truncate = (str, n = 30) =>
  str && str.length > n ? str.slice(0, n) + '…' : str;

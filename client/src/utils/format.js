export const formatCurrency = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(n));
};

export const formatPriceRange = (range) => {
  if (!range) return '-';
  const { min = 0, max = 0 } = range;
  if (!min && !max) return 'Hubungi kami';
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

export const formatDate = (d, opts = { dateStyle: 'long' }) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('id-ID', opts).format(new Date(d));
};

export const formatDateShort = (d) => formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (d, time) => {
  if (!d) return '-';
  const datePart = formatDate(d, { dateStyle: 'long' });
  return time ? `${datePart}, ${time}` : datePart;
};

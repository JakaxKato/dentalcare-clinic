const labels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const StatusBadge = ({ status }) => {
  const cls = `badge-${status}` in {} ? '' : '';
  void cls;
  const className =
    status === 'pending'
      ? 'badge-pending'
      : status === 'confirmed'
      ? 'badge-confirmed'
      : status === 'completed'
      ? 'badge-completed'
      : status === 'cancelled'
      ? 'badge-cancelled'
      : 'badge bg-slate-100 text-slate-700';
  return <span className={className}>{labels[status] || status}</span>;
};

export default StatusBadge;

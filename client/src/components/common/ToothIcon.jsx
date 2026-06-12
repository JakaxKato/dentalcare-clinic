const ToothIcon = ({ className = 'w-5 h-5', strokeWidth = 1.8, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 5.5c-1.6-2-4.4-2.6-6.4-1.2-2 1.4-2.4 4.2-1.3 6.6.5 1 .8 2.1.9 3.2l.5 4.3c.1 1.2 1.1 2.1 2.3 2.1 1 0 1.9-.7 2.2-1.7l.9-3.1c.2-.7.8-1.2 1.5-1.2h.8c.7 0 1.3.5 1.5 1.2l.9 3.1c.3 1 1.2 1.7 2.2 1.7 1.2 0 2.2-.9 2.3-2.1l.5-4.3c.1-1.1.4-2.2.9-3.2 1.1-2.4.7-5.2-1.3-6.6-2-1.4-4.8-.8-6.4 1.2z" />
  </svg>
);

export default ToothIcon;

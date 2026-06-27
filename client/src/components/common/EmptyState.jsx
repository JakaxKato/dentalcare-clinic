import { Inbox } from 'lucide-react';
import { isValidElement } from 'react';

const EmptyState = ({ icon, title = 'Belum ada data', description, action }) => {
  let renderedIcon;
  if (icon == null) {
    renderedIcon = <Inbox className="w-12 h-12 text-stone-400" />;
  } else if (isValidElement(icon)) {
    renderedIcon = icon;
  } else if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && '$$typeof' in icon)
  ) {
    const Icon = icon;
    renderedIcon = <Icon className="w-12 h-12 text-stone-400" />;
  } else {
    renderedIcon = <span className="text-5xl">{icon}</span>;
  }

  return (
    <div className="text-center py-16 px-6">
      <div className="mb-4 flex justify-center">{renderedIcon}</div>
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      {description && <p className="text-stone-500 mt-1">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;

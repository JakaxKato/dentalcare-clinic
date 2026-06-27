const Loader = ({ fullScreen = false, label }) => {
  const Spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      {label && <span className="text-sm text-stone-600">{label}</span>}
    </div>
  );
  if (fullScreen) {
    return <div className="min-h-[60vh] flex items-center justify-center">{Spinner}</div>;
  }
  return <div className="py-10 flex justify-center">{Spinner}</div>;
};

export default Loader;

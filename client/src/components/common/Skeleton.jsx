const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

export const CardGridSkeleton = ({ count = 3 }) => (
  <div
    className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    role="status"
    aria-label="Memuat data"
  >
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="card overflow-hidden">
        <Skeleton className="h-44 w-full rounded-none" />
        <div className="space-y-3 p-5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-5 h-10 w-32" />
        </div>
      </div>
    ))}
    <span className="sr-only">Memuat data...</span>
  </div>
);

export const DashboardSkeleton = ({ cards = 3 }) => (
  <div className="space-y-6" role="status" aria-label="Memuat dashboard">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
    <div className={`grid gap-4 ${cards === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="card flex items-center gap-4 p-5">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="card space-y-4 p-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
    <span className="sr-only">Memuat dashboard...</span>
  </div>
);

export const FormSkeleton = () => (
  <div className="max-w-4xl space-y-6" role="status" aria-label="Memuat formulir">
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="card space-y-4 p-5">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    ))}
    <span className="sr-only">Memuat formulir...</span>
  </div>
);

export default Skeleton;

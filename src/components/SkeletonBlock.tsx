type Props = {
  variant?: "table" | "card";
  rows?: number;
  columns?: number;
  title?: string;
};

const gridColumns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
};

export function SkeletonBlock({
  variant = "table",
  rows = 5,
  columns = 5,
  title = "Loading...",
}: Props) {
  return (
    <div className="bg-white p-4 rounded shadow animate-pulse space-y-4">
      <div className="h-6 w-1/3 bg-gray-200 rounded">
        <span className="sr-only">{title}</span>
      </div>

      {variant === "table" ? (
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={`grid ${gridColumns[columns] ?? "grid-cols-5"} gap-4`}
            >
              {Array.from({ length: columns }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 rounded shadow bg-gray-100 space-y-2">
              <div className="h-4 w-3/4 bg-gray-300 rounded" />
              <div className="h-3 w-1/2 bg-gray-300 rounded" />
              <div className="h-2 w-full bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

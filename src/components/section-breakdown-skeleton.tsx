import { Skeleton } from "./ui/skeleton";

export function SectionBreakdownLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
        {/* Title skeleton */}
        <div className="mb-4">
          <Skeleton className="h-5 w-40 bg-gradient-to-r from-white/[0.1] to-white/[0.05]" />
        </div>

        {/* Topics list skeleton */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {/* Generate multiple skeleton items to simulate the loading list */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-3 bg-white/[0.02] rounded-lg animate-pulse"
            >
              {/* Timestamp button skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-6 w-12 bg-gradient-to-r from-blue-600/20 to-blue-600/10 rounded" />
              </div>

              {/* Topic text skeleton */}
              <div className="flex-1 space-y-1">
                <Skeleton
                  className={`h-4 bg-gradient-to-r from-white/[0.08] to-white/[0.02] ${
                    index % 3 === 0
                      ? "w-full"
                      : index % 3 === 1
                        ? "w-5/6"
                        : "w-4/5"
                  }`}
                />
                {/* Some items have longer descriptions, so add a second line occasionally */}
                {index % 4 === 0 && (
                  <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-white/[0.06] to-white/[0.01]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

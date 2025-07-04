
export const HiringStagesLoadingSkeleton = () => {
  return (
    <div className="bg-background border-b border-border">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                <div className="h-6 bg-muted/50 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

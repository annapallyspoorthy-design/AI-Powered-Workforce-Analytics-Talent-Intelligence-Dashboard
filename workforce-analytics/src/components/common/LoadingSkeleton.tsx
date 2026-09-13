import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; height?: string }> = ({
  count = 3,
  height = 'h-16',
}) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} rounded-xl bg-slate-800/60 border border-slate-700/40 animate-pulse`}
        />
      ))}
    </div>
  );
};

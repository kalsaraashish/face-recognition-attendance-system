import React from 'react';

export const SkeletonRow = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse hover:bg-transparent">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="px-6 py-4">
          <div className="h-4 rounded bg-slate-200 w-3/4"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;

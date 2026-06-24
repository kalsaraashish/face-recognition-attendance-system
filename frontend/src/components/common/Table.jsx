import React from 'react';
import SkeletonRow from './SkeletonRow';
import EmptyState from './EmptyState';

export const Table = ({
  headers = [],
  loading = false,
  empty = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There is currently no information to show.',
  emptyActionLabel,
  onEmptyAction,
  children,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <SkeletonRow key={idx} cols={headers.length} />
            ))
          ) : empty ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  actionLabel={emptyActionLabel}
                  onAction={onEmptyAction}
                />
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

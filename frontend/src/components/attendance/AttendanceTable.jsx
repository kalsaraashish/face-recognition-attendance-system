import React from 'react';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { Check, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const AttendanceTable = ({
  records = [],
  onStatusToggle,
  markingLoadingId = null,
}) => {
  const { user } = useAuth();
  const canMark = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[600px] text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enrollment No
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student Name
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Marked At
            </th>
            {canMark && onStatusToggle && (
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td colSpan={canMark && onStatusToggle ? 5 : 4} className="px-6 py-10 text-center text-slate-500">
                No attendance records found.
              </td>
            </tr>
          ) : (
            records.map((rec) => {
              const isPresent = rec.status === 'PRESENT';
              const isLoading = markingLoadingId === rec.student_id;
              
              return (
                <tr key={rec.id || rec.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {rec.enrollment_no}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {rec.student_name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={rec.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {rec.marked_at ? formatDate(rec.marked_at, 'dd MMM yyyy hh:mm a') : 'Not marked yet'}
                  </td>
                  {canMark && onStatusToggle && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onStatusToggle(rec.student_id, isPresent ? 'ABSENT' : 'PRESENT')}
                        disabled={isLoading}
                        className={`inline-flex items-center space-x-1 rounded-lg px-3 py-1.5 text-xs font-medium border shadow-sm transition-colors ${
                          isPresent
                            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {isLoading ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-current"></span>
                        ) : isPresent ? (
                          <>
                            <X className="h-3.5 w-3.5" />
                            <span>Mark Absent</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Mark Present</span>
                          </>
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;

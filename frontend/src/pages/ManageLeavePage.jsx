import React, { useState, useEffect } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { Calendar, CheckCircle, XCircle, Clock, Check, X, ShieldAlert } from 'lucide-react';
import { listLeaves, reviewLeave } from '../api/leaveApi';

export const ManageLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Review states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'APPROVED' or 'REJECTED'
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await listLeaves();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to fetch leave requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReviewClick = (leave, type) => {
    setSelectedLeave(leave);
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave || !confirmType) return;

    setActionLoading(true);
    try {
      await reviewLeave(selectedLeave.id, confirmType);
      setConfirmOpen(false);
      setSelectedLeave(null);
      setConfirmType(null);
      fetchLeaves();
    } catch (err) {
      console.error('Failed to review leave request', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 mr-1 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 mr-1 text-rose-600" />;
      default:
        return <Clock className="h-4 w-4 mr-1 text-amber-600" />;
    }
  };

  const calculateDays = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Requests Management</h1>
        <p className="text-sm text-slate-500">Review and approve/reject leave applications submitted by students</p>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Leave Requests Registered"
          description="There are currently no leave requests in the system."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Applied At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {leaves.map((leave) => (
                  <tr key={leave.id} className={`hover:bg-slate-50 transition-colors ${leave.status === 'PENDING' ? 'bg-blue-50/10' : ''}`}>
                    <td className="px-6 py-4">
                      {leave.student ? (
                        <div>
                          <p className="font-semibold text-slate-900">
                            {leave.student.first_name} {leave.student.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{leave.student.enrollment_no}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unknown student</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center space-x-1">
                        <span>{new Date(leave.start_date).toLocaleDateString()}</span>
                        <span className="text-slate-400">→</span>
                        <span>{new Date(leave.end_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {calculateDays(leave.start_date, leave.end_date)} {calculateDays(leave.start_date, leave.end_date) === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="px-6 py-4 max-w-xs break-words" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(leave.applied_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === 'PENDING' ? (
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            title="Approve Leave"
                            onClick={() => handleReviewClick(leave, 'APPROVED')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            title="Reject Leave"
                            onClick={() => handleReviewClick(leave, 'REJECTED')}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium">
                          Reviewed by {leave.reviewer?.name || 'Admin'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedLeave(null);
          setConfirmType(null);
        }}
        onConfirm={handleConfirmReview}
        title={confirmType === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
        message={`Are you sure you want to ${confirmType === 'APPROVED' ? 'approve' : 'reject'} the leave request for ${
          selectedLeave?.student ? `${selectedLeave.student.first_name} ${selectedLeave.student.last_name}` : 'this student'
        }?`}
        confirmText={confirmType === 'APPROVED' ? 'Approve' : 'Reject'}
        confirmVariant={confirmType === 'APPROVED' ? 'primary' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManageLeavePage;

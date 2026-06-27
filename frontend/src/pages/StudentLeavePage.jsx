import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { Plus, Calendar, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { applyLeave, getMyLeaves } from '../api/leaveApi';
import { isRequired } from '../utils/validators';

export const StudentLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await getMyLeaves();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to fetch my leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const validate = () => {
    const tempErrors = {};
    if (!isRequired(startDate)) tempErrors.startDate = 'Start date is required';
    if (!isRequired(endDate)) tempErrors.endDate = 'End date is required';
    if (!isRequired(reason)) {
      tempErrors.reason = 'Reason is required';
    } else if (reason.length < 5) {
      tempErrors.reason = 'Reason must be at least 5 characters long';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      tempErrors.endDate = 'End date cannot be earlier than start date';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await applyLeave({
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      setIsFormOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setErrors({});
      fetchLeaves();
    } catch (err) {
      console.error('Failed to submit leave request', err);
      if (err.response?.data?.detail) {
        setErrors({ form: err.response.data.detail });
      } else {
        setErrors({ form: 'An error occurred. Please try again.' });
      }
    } finally {
      setSubmitting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Leave Requests</h1>
          <p className="text-sm text-slate-500">Apply for leaves and track your approval status</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setIsFormOpen(true)}
        >
          Apply for Leave
        </Button>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Leave Requests Found"
          description="You have not submitted any leave requests yet. Click the button above to request leave."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Applied At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center space-x-1">
                        <span>{new Date(leave.start_date).toLocaleDateString()}</span>
                        <span className="text-slate-400">→</span>
                        <span>{new Date(leave.end_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {calculateDays(leave.start_date, leave.end_date)} {calculateDays(leave.start_date, leave.end_date) === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={leave.reason}>
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
                    <td className="px-6 py-4 text-slate-500">
                      {leave.reviewer ? (
                        <div>
                          <p className="font-medium text-slate-800">{leave.reviewer.name}</p>
                          <p className="text-xs text-slate-400">{leave.reviewed_at ? new Date(leave.reviewed_at).toLocaleDateString() : ''}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Pending review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setErrors({});
        }}
        title="Apply for Leave"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          {errors.form && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
            />
            <Input
              label="End Date *"
              type="date"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.endDate}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Reason *
            </label>
            <textarea
              name="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for leave (minimum 5 characters)..."
              className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {errors.reason && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.reason}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false);
                setErrors({});
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentLeavePage;

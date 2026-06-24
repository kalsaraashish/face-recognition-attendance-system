import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { listDepartments } from '../../api/departmentApi';
import { listSubjects } from '../../api/subjectApi';
import { SEMESTERS } from '../../utils/constants';

export const SessionForm = ({
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentTimeString = (offsetMinutes = 0) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + offsetMinutes);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}:00`;
  };

  const [formData, setFormData] = useState({
    department_id: '',
    semester: '1',
    subject_id: '',
    session_date: getTodayDateString(),
    start_time: getCurrentTimeString(0).slice(0, 5), // "HH:MM"
    end_time: getCurrentTimeString(60).slice(0, 5), // Default 1 hour later
  });

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      setLoadingDepts(true);
      try {
        const depts = await listDepartments();
        setDepartments(depts);
        if (depts.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: String(depts[0].id) }));
        }
      } catch (err) {
        console.error('Failed to fetch departments in SessionForm', err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  // Fetch subjects whenever department or semester changes
  useEffect(() => {
    const fetchSubs = async () => {
      if (!formData.department_id || !formData.semester) return;
      setLoadingSubjects(true);
      try {
        const subs = await listSubjects({
          department_id: Number(formData.department_id),
          semester: Number(formData.semester),
        });
        setSubjects(subs);
        if (subs.length > 0) {
          setFormData((prev) => ({ ...prev, subject_id: String(subs[0].id) }));
        } else {
          setFormData((prev) => ({ ...prev, subject_id: '' }));
        }
      } catch (err) {
        console.error('Failed to fetch subjects in SessionForm', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubs();
  }, [formData.department_id, formData.semester]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.department_id) tempErrors.department_id = 'Department is required';
    if (!formData.semester) tempErrors.semester = 'Semester is required';
    if (!formData.subject_id) tempErrors.subject_id = 'Subject is required';
    if (!formData.session_date) tempErrors.session_date = 'Session date is required';
    if (!formData.start_time) tempErrors.start_time = 'Start time is required';
    if (!formData.end_time) tempErrors.end_time = 'End time is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      department_id: Number(formData.department_id),
      semester: Number(formData.semester),
      subject_id: Number(formData.subject_id),
      session_date: formData.session_date,
      // Format time as HH:MM:SS for backend
      start_time: `${formData.start_time}:00`,
      end_time: `${formData.end_time}:00`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Department *
          </label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            disabled={loadingDepts}
          >
            {loadingDepts ? (
              <option>Loading...</option>
            ) : departments.length === 0 ? (
              <option value="">No departments</option>
            ) : (
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Semester *
          </label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          >
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          Subject *
        </label>
        <select
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
          className={`border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${
            errors.subject_id ? 'border-red-500' : 'border-slate-200'
          }`}
          disabled={loadingSubjects || subjects.length === 0}
        >
          {loadingSubjects ? (
            <option>Loading subjects...</option>
          ) : subjects.length === 0 ? (
            <option value="">No subjects found for this Department + Semester</option>
          ) : (
            subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subject_code} - {sub.subject_name}
              </option>
            ))
          )}
        </select>
        {errors.subject_id && (
          <p className="mt-1 text-xs font-medium text-red-500">{errors.subject_id}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
          Session Date *
        </label>
        <input
          type="date"
          name="session_date"
          value={formData.session_date}
          onChange={handleChange}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Start Time *
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            End Time *
          </label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={subjects.length === 0}
        >
          Create Session
        </Button>
      </div>
    </form>
  );
};

export default SessionForm;

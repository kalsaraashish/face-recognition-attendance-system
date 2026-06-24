import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { listDepartments } from '../../api/departmentApi';
import { isRequired, isValidEmail, isValidPhone } from '../../utils/validators';
import { SEMESTERS } from '../../utils/constants';

export const StudentForm = ({
  student,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    enrollment_no: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    department_id: '',
    semester: '1',
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Load departments dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      setLoadingDepts(true);
      try {
        const depts = await listDepartments();
        setDepartments(depts);
        if (depts.length > 0 && !formData.department_id) {
          setFormData((prev) => ({ ...prev, department_id: String(depts[0].id) }));
        }
      } catch (err) {
        console.error('Failed to load departments in StudentForm', err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  // Pre-fill data if editing
  useEffect(() => {
    if (student) {
      setFormData({
        enrollment_no: student.enrollment_no || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        mobile: student.mobile || '',
        department_id: String(student.department_id || ''),
        semester: String(student.semester || '1'),
        status: student.status !== undefined ? student.status : true,
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error when editing field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!isRequired(formData.enrollment_no)) tempErrors.enrollment_no = 'Enrollment number is required';
    if (!isRequired(formData.first_name)) tempErrors.first_name = 'First name is required';
    if (!isRequired(formData.last_name)) tempErrors.last_name = 'Last name is required';
    if (!isRequired(formData.email)) {
      tempErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      tempErrors.email = 'Email address is invalid';
    }
    if (formData.mobile && !isValidPhone(formData.mobile)) {
      tempErrors.mobile = 'Mobile phone number is invalid';
    }
    if (!isRequired(formData.department_id)) tempErrors.department_id = 'Department is required';
    if (!isRequired(formData.semester)) tempErrors.semester = 'Semester is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      department_id: Number(formData.department_id),
      semester: Number(formData.semester),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Enrollment Number *"
        name="enrollment_no"
        value={formData.enrollment_no}
        onChange={handleChange}
        error={errors.enrollment_no}
        disabled={!!student} // Usually enrollment no is read-only on edit
        placeholder="e.g. MCA2024001"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name *"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          error={errors.first_name}
          placeholder="First name"
        />
        <Input
          label="Last Name *"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          error={errors.last_name}
          placeholder="Last name"
        />
      </div>

      <Input
        label="Email Address *"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="student@example.edu"
      />

      <Input
        label="Mobile Number (Optional)"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        error={errors.mobile}
        placeholder="e.g. 9876543210"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Department *
          </label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className={`border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${
              errors.department_id ? 'border-red-500' : 'border-slate-200'
            }`}
            disabled={loadingDepts}
          >
            {loadingDepts ? (
              <option>Loading departments...</option>
            ) : departments.length === 0 ? (
              <option value="">No departments available</option>
            ) : (
              departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))
            )}
          </select>
          {errors.department_id && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.department_id}
            </p>
          )}
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

      {student && (
        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={formData.status}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Active Student
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {student ? 'Save Changes' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;

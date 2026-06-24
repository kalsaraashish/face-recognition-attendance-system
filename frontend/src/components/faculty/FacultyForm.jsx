import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { listDepartments } from '../../api/departmentApi';
import { isRequired, isValidEmail, isValidPhone } from '../../utils/validators';

export const FacultyForm = ({
  faculty,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    faculty_code: '',
    name: '',
    email: '',
    mobile: '',
    department_id: '',
    password: '',
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
        console.error('Failed to load departments in FacultyForm', err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  // Pre-fill data if editing
  useEffect(() => {
    if (faculty) {
      setFormData({
        faculty_code: faculty.faculty_code || '',
        name: faculty.name || '',
        email: faculty.email || '',
        mobile: faculty.mobile || '',
        department_id: String(faculty.department_id || ''),
        password: '', // Hidden/not editable during edit
        status: faculty.status !== undefined ? faculty.status : true,
      });
    }
  }, [faculty]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!isRequired(formData.faculty_code)) tempErrors.faculty_code = 'Faculty code is required';
    if (!isRequired(formData.name)) tempErrors.name = 'Full name is required';
    if (!isRequired(formData.email)) {
      tempErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      tempErrors.email = 'Email address is invalid';
    }
    if (formData.mobile && !isValidPhone(formData.mobile)) {
      tempErrors.mobile = 'Mobile number is invalid';
    }
    if (!isRequired(formData.department_id)) tempErrors.department_id = 'Department is required';
    
    // Password required only for creation
    if (!faculty && !isRequired(formData.password)) {
      tempErrors.password = 'Password is required for new accounts';
    } else if (!faculty && formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const payload = {
      ...formData,
      department_id: Number(formData.department_id),
    };
    // Don't send password if editing
    if (faculty) {
      delete payload.password;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Faculty Code *"
        name="faculty_code"
        value={formData.faculty_code}
        onChange={handleChange}
        error={errors.faculty_code}
        disabled={!!faculty}
        placeholder="e.g. FAC001"
      />

      <Input
        label="Full Name *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Dr. Name Here"
      />

      <Input
        label="Email Address *"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="faculty@college.edu"
      />

      <Input
        label="Mobile Number (Optional)"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        error={errors.mobile}
        placeholder="e.g. 9123456780"
      />

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

      {!faculty && (
        <Input
          label="Password *"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter login password"
        />
      )}

      {faculty && (
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
            Active Faculty Member
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {faculty ? 'Save Changes' : 'Add Faculty'}
        </Button>
      </div>
    </form>
  );
};

export default FacultyForm;

import React, { useState, useEffect, useCallback } from 'react';
import useSubjects from '../hooks/useSubjects';
import useDepartments from '../hooks/useDepartments';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, SlidersHorizontal, Pencil, Trash2 } from 'lucide-react';
import { isRequired } from '../utils/validators';
import { SEMESTERS } from '../utils/constants';

export const SubjectsPage = () => {
  const {
    subjects,
    loading,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();

  const { departments, fetchDepartments } = useDepartments();

  // Filters
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');

  // Modals / Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null); // editing target
  
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formSemester, setFormSemester] = useState('1');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const loadSubjects = useCallback(() => {
    const filters = {
      department_id: departmentId ? Number(departmentId) : undefined,
      semester: semester ? Number(semester) : undefined,
    };
    fetchSubjects(filters);
  }, [departmentId, semester, fetchSubjects]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Sync inputs on edit selection or modal load
  useEffect(() => {
    if (selectedSub) {
      setSubjectCode(selectedSub.subject_code || '');
      setSubjectName(selectedSub.subject_name || '');
      setFormDeptId(String(selectedSub.department_id || ''));
      setFormSemester(String(selectedSub.semester || '1'));
    } else {
      setSubjectCode('');
      setSubjectName('');
      if (departments.length > 0) {
        setFormDeptId(String(departments[0].id));
      } else {
        setFormDeptId('');
      }
      setFormSemester('1');
    }
    setErrors({});
  }, [selectedSub, departments]);

  const validate = () => {
    const tempErrors = {};
    if (!isRequired(subjectCode)) tempErrors.subject_code = 'Subject code is required';
    if (!isRequired(subjectName)) tempErrors.subject_name = 'Subject name is required';
    if (!isRequired(formDeptId)) tempErrors.department_id = 'Department selection is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        subject_code: subjectCode,
        subject_name: subjectName,
        department_id: Number(formDeptId),
        semester: Number(formSemester),
      };

      if (selectedSub) {
        await updateSubject(selectedSub.id, payload);
      } else {
        await createSubject(payload);
      }
      setIsFormOpen(false);
      setSelectedSub(null);
      loadSubjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSubject(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      loadSubjects();
    } catch (err) {
      console.error(err);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (sub) => {
    setSelectedSub(sub);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (sub) => {
    setDeleteTarget(sub);
    setIsDeleteOpen(true);
  };

  const tableHeaders = [
    '#',
    'Subject Code',
    'Subject Name',
    'Department',
    'Semester',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Subjects Directory
        </h2>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedSub(null);
            setIsFormOpen(true);
          }}
          className="shadow-md shadow-blue-500/10"
        >
          <Plus className="mr-2 h-4.5 w-4.5" />
          Add Subject
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter */}
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Table Card */}
      <Table
        headers={tableHeaders}
        loading={loading && subjects.length === 0}
        empty={subjects.length === 0}
        emptyTitle="No subjects found"
        emptyDescription="Try choosing a different department or semester filter."
        emptyActionLabel="Create Subject"
        onEmptyAction={() => setIsFormOpen(true)}
      >
        {subjects.map((sub, idx) => (
          <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 text-slate-500 font-medium">{idx + 1}</td>
            <td className="px-6 py-4 font-semibold text-slate-750">{sub.subject_code}</td>
            <td className="px-6 py-4 font-bold text-slate-900">{sub.subject_name}</td>
            <td className="px-6 py-4 text-slate-655">{sub.department?.name || '-'}</td>
            <td className="px-6 py-4 text-slate-655">Semester {sub.semester}</td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => handleEditClick(sub)}
                  title="Edit Subject"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(sub)}
                  title="Delete Subject"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSub(null);
        }}
        title={selectedSub ? 'Edit Subject Details' : 'Add New Subject'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Subject Code *"
            value={subjectCode}
            onChange={(e) => {
              setSubjectCode(e.target.value);
              if (errors.subject_code) setErrors((prev) => ({ ...prev, subject_code: null }));
            }}
            error={errors.subject_code}
            placeholder="e.g. CSE-302, MBA-101"
            disabled={submitting || !!selectedSub}
          />

          <Input
            label="Subject Name *"
            value={subjectName}
            onChange={(e) => {
              setSubjectName(e.target.value);
              if (errors.subject_name) setErrors((prev) => ({ ...prev, subject_name: null }));
            }}
            error={errors.subject_name}
            placeholder="e.g. Distributed Computing"
            disabled={submitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Department *
              </label>
              <select
                value={formDeptId}
                onChange={(e) => {
                  setFormDeptId(e.target.value);
                  if (errors.department_id) setErrors((prev) => ({ ...prev, department_id: null }));
                }}
                className={`border border-slate-205 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full ${
                  errors.department_id ? 'border-red-500' : 'border-slate-205'
                }`}
                disabled={submitting}
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.department_id}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Semester *
              </label>
              <select
                value={formSemester}
                onChange={(e) => setFormSemester(e.target.value)}
                className="border border-slate-205 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full"
                disabled={submitting}
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false);
                setSelectedSub(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedSub ? 'Save Changes' : 'Add Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject?"
        message={`Are you sure you want to delete subject "${deleteTarget?.subject_name || ''}" (${
          deleteTarget?.subject_code || ''
        })? This action is destructive and cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default SubjectsPage;

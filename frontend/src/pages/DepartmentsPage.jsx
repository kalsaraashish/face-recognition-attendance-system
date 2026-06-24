import React, { useState, useEffect } from 'react';
import useDepartments from '../hooks/useDepartments';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { Plus, Pencil, Trash2, Building } from 'lucide-react';
import { isRequired } from '../utils/validators';

export const DepartmentsPage = () => {
  const {
    departments,
    loading,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();

  // Modals / Dialogs States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null); // editing target
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Sync inputs on edit selection
  useEffect(() => {
    if (selectedDept) {
      setName(selectedDept.name || '');
      setDescription(selectedDept.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrors({});
  }, [selectedDept]);

  const validate = () => {
    const tempErrors = {};
    if (!isRequired(name)) tempErrors.name = 'Department name is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { name, description };
      if (selectedDept) {
        await updateDepartment(selectedDept.id, payload);
      } else {
        await createDepartment(payload);
      }
      setIsFormOpen(false);
      setSelectedDept(null);
      fetchDepartments();
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
      await deleteDepartment(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (dept) => {
    setDeleteTarget(dept);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Departments Directory
        </h2>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedDept(null);
            setIsFormOpen(true);
          }}
          className="shadow-md shadow-blue-500/10"
        >
          <Plus className="mr-2 h-4.5 w-4.5" />
          Add Department
        </Button>
      </div>

      {/* Main Grid View */}
      {loading && departments.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="h-10 w-10 text-blue-600" />
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <EmptyState
            title="No departments registered"
            description="Start building your academic profile by adding a department first."
            actionLabel="Add Department"
            onAction={() => setIsFormOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Building className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800 truncate">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-3 min-h-[48px]">
                    {dept.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-100 pt-4 mt-6">
                <button
                  onClick={() => handleEditClick(dept)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteClick(dept)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors border border-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDept(null);
        }}
        title={selectedDept ? 'Edit Department Details' : 'Add New Department'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Department Name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            error={errors.name}
            placeholder="e.g. MCA, CSE, MBA"
            disabled={submitting}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full h-24 resize-none bg-white text-slate-800"
              placeholder="Provide a brief description of the department..."
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsFormOpen(false);
                setSelectedDept(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {selectedDept ? 'Save Changes' : 'Add Department'}
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
        title="Delete Department?"
        message={`Are you sure you want to delete department "${deleteTarget?.name || ''}"? This will also wipe associated student configurations and classes.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default DepartmentsPage;

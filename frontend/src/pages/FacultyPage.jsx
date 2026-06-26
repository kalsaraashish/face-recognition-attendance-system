import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useFaculty from '../hooks/useFaculty';
import useDepartments from '../hooks/useDepartments';
import Table from '../components/common/Table';
import FacultyForm from '../components/faculty/FacultyForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { Plus, SlidersHorizontal, Pencil, Trash2, Camera } from 'lucide-react';
import FaceRegisterModal from '../components/face/FaceRegisterModal';

export const FacultyPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    faculties,
    total,
    page,
    totalPages,
    loading,
    fetchFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  } = useFaculty();

  const { departments, fetchDepartments } = useDepartments();

  // Filters
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');

  // Modals / Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null); // editing target
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Face Registration Modal States
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [faceFaculty, setFaceFaculty] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const loadFaculty = useCallback(() => {
    const filters = {
      page,
      per_page: 15,
      search: search || undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      status: status !== '' ? status === 'true' : undefined,
    };
    fetchFaculty(filters);
  }, [page, search, departmentId, status, fetchFaculty]);

  useEffect(() => {
    loadFaculty();
  }, [loadFaculty]);

  const handlePageChange = (newPage) => {
    const filters = {
      page: newPage,
      per_page: 15,
      search: search || undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      status: status !== '' ? status === 'true' : undefined,
    };
    fetchFaculty(filters);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedFaculty) {
        await updateFaculty(selectedFaculty.id, formData);
      } else {
        await createFaculty(formData);
      }
      setIsFormOpen(false);
      setSelectedFaculty(null);
      loadFaculty();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteFaculty(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      loadFaculty();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (fac) => {
    setSelectedFaculty(fac);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (fac) => {
    setDeleteTarget(fac);
    setIsDeleteOpen(true);
  };

  const handleFaceRegisterClick = (fac) => {
    setFaceFaculty(fac);
    setIsFaceModalOpen(true);
  };

  const tableHeaders = [
    '#',
    'Faculty Code',
    'Name',
    'Department',
    'Email',
    'Mobile',
    'Status',
    'Face',
    ...(isAdmin ? ['Actions'] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Faculty Directory
          </h2>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
            {total} Total
          </span>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => {
              setSelectedFaculty(null);
              setIsFormOpen(true);
            }}
            className="shadow-md shadow-blue-500/10"
          >
            <Plus className="mr-2 h-4.5 w-4.5" />
            Add Faculty
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <SearchInput
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search faculty name/code..."
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-slate-400">
              <SlidersHorizontal className="h-4.5 w-4.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
            </div>

            {/* Department */}
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Table
        headers={tableHeaders}
        loading={loading && faculties.length === 0}
        empty={faculties.length === 0}
        emptyTitle="No faculty members found"
        emptyDescription="We couldn't find any instructors matching those filter criteria."
        emptyActionLabel={isAdmin ? 'Add Faculty' : null}
        onEmptyAction={() => setIsFormOpen(true)}
      >
        {faculties.map((fac, idx) => (
          <tr key={fac.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 text-slate-500 font-medium">
              {(page - 1) * 15 + idx + 1}
            </td>
            <td className="px-6 py-4 font-semibold text-slate-750">
              {fac.faculty_code}
            </td>
            <td className="px-6 py-4 font-bold text-slate-900">
              {fac.name}
            </td>
            <td className="px-6 py-4 text-slate-600">
              {fac.department?.name || '-'}
            </td>
            <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
              {fac.email}
            </td>
            <td className="px-6 py-4 text-slate-600">
              {fac.mobile || '-'}
            </td>
            <td className="px-6 py-4">
              <Badge status={fac.status} />
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  fac.has_face_registered
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {fac.has_face_registered ? 'Registered ✓' : 'Not Registered'}
              </span>
            </td>
            {isAdmin && (
              <td className="px-6 py-4 text-right">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => handleEditClick(fac)}
                    title="Edit Faculty"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleFaceRegisterClick(fac)}
                    title="Register Face"
                    className={`rounded-lg p-1.5 transition-colors ${
                      fac.has_face_registered
                        ? 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold'
                    }`}
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(fac)}
                    title="Delete Faculty"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </Table>

      {/* Pagination Controls */}
      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedFaculty(null);
        }}
        title={selectedFaculty ? 'Edit Faculty Details' : 'Add New Faculty Member'}
        size="md"
      >
        <FacultyForm
          faculty={selectedFaculty}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedFaculty(null);
          }}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Faculty?"
        message={`Are you sure you want to delete faculty member "${deleteTarget?.name || ''}" (${
          deleteTarget?.faculty_code || ''
        })? This will also disable their linked login access.`}
        loading={deleteLoading}
      />
      {/* Face Registration Modal */}
      {faceFaculty && (
        <FaceRegisterModal
          isOpen={isFaceModalOpen}
          onClose={() => {
            setIsFaceModalOpen(false);
            setFaceFaculty(null);
          }}
          faculty={faceFaculty}
          type="faculty"
          onRegisterSuccess={loadFaculty}
        />
      )}
    </div>
  );
};

export default FacultyPage;

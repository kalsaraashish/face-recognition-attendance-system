import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useStudents from '../hooks/useStudents';
import useDepartments from '../hooks/useDepartments';
import Table from '../components/common/Table';
import StudentRow from '../components/students/StudentRow';
import StudentForm from '../components/students/StudentForm';
import FaceRegisterModal from '../components/face/FaceRegisterModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { SEMESTERS } from '../utils/constants';

export const StudentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const canManage = isAdmin || user?.role === 'FACULTY';

  const {
    students,
    total,
    page,
    totalPages,
    loading,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();

  const { departments, fetchDepartments } = useDepartments();

  // Filter States
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');
  const [status, setStatus] = useState(''); // active/inactive toggle or empty for all

  // Modals / Dialogs States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // editing student
  
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [faceStudent, setFaceStudent] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load initial lists
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const loadStudents = useCallback(() => {
    const filters = {
      page,
      per_page: 15,
      search: search || undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      semester: semester ? Number(semester) : undefined,
      status: status !== '' ? status === 'true' : undefined,
    };
    fetchStudents(filters);
  }, [page, search, departmentId, semester, status, fetchStudents]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handlePageChange = (newPage) => {
    const filters = {
      page: newPage,
      per_page: 15,
      search: search || undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      semester: semester ? Number(semester) : undefined,
      status: status !== '' ? status === 'true' : undefined,
    };
    fetchStudents(filters);
  };

  // Form submit (Add/Edit)
  const handleFormSubmit = async (formData) => {
    try {
      if (selectedStudent) {
        await updateStudent(selectedStudent.id, formData);
      } else {
        await createStudent(formData);
      }
      setIsFormOpen(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStudent(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      loadStudents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleFaceRegisterClick = (student) => {
    setFaceStudent(student);
    setIsFaceModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
    setIsDeleteOpen(true);
  };

  const tableHeaders = [
    '#',
    'Enrollment No',
    'Name',
    'Department',
    'Semester',
    'Status',
    'Face',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Students Directory
          </h2>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
            {total} Total
          </span>
        </div>
        {canManage && (
          <Button
            variant="primary"
            onClick={() => {
              setSelectedStudent(null);
              setIsFormOpen(true);
            }}
            className="shadow-md shadow-blue-500/10"
          >
            <Plus className="mr-2 h-4.5 w-4.5" />
            Add Student
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <SearchInput
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search enrollment/name..."
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

            {/* Semester */}
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
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
        loading={loading && students.length === 0}
        empty={students.length === 0}
        emptyTitle="No students found"
        emptyDescription="We couldn't find any students matching those filter criteria."
        emptyActionLabel={canManage ? 'Add a Student' : null}
        onEmptyAction={() => setIsFormOpen(true)}
      >
        {students.map((student, idx) => (
          <StudentRow
            key={student.id}
            index={(page - 1) * 15 + idx + 1}
            student={student}
            onEdit={handleEditClick}
            onFaceRegister={handleFaceRegisterClick}
            onDelete={handleDeleteClick}
          />
        ))}
      </Table>

      {/* Pagination Controls */}
      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? 'Edit Student Details' : 'Add New Student'}
        size="md"
      >
        <StudentForm
          student={selectedStudent}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedStudent(null);
          }}
          loading={loading}
        />
      </Modal>

      {/* Face Registration Modal */}
      {faceStudent && (
        <FaceRegisterModal
          isOpen={isFaceModalOpen}
          onClose={() => {
            setIsFaceModalOpen(false);
            setFaceStudent(null);
          }}
          student={faceStudent}
          onRegisterSuccess={loadStudents}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Student?"
        message={`Are you sure you want to delete student "${deleteTarget?.full_name || ''}" (${
          deleteTarget?.enrollment_no || ''
        })? This action will permanently wipe their registration details and cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentsPage;

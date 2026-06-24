import { useState, useCallback } from 'react';
import * as studentApi from '../api/studentApi';
import toast from 'react-hot-toast';

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApi.listStudents(filters);
      setStudents(data.students);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = async (studentData) => {
    setLoading(true);
    try {
      const newStudent = await studentApi.createStudent(studentData);
      toast.success('Student created successfully');
      return newStudent;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create student');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, studentData) => {
    setLoading(true);
    try {
      const updated = await studentApi.updateStudent(id, studentData);
      toast.success('Student updated successfully');
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update student');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    setLoading(true);
    try {
      await studentApi.deleteStudent(id);
      toast.success('Student deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete student');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};

export default useStudents;

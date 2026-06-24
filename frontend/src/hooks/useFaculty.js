import { useState, useCallback } from 'react';
import * as facultyApi from '../api/facultyApi';
import toast from 'react-hot-toast';

export const useFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFaculty = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await facultyApi.listFaculty(filters);
      setFaculties(data.faculties);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFaculty = async (facultyData) => {
    setLoading(true);
    try {
      const newFaculty = await facultyApi.createFaculty(facultyData);
      toast.success('Faculty created successfully');
      return newFaculty;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create faculty');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFaculty = async (id, facultyData) => {
    setLoading(true);
    try {
      const updated = await facultyApi.updateFaculty(id, facultyData);
      toast.success('Faculty updated successfully');
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update faculty');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFaculty = async (id) => {
    setLoading(true);
    try {
      await facultyApi.deleteFaculty(id);
      toast.success('Faculty deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete faculty');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    faculties,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  };
};

export default useFaculty;

import { useState, useCallback } from 'react';
import * as deptApi from '../api/departmentApi';
import toast from 'react-hot-toast';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deptApi.listDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDepartment = async (deptData) => {
    setLoading(true);
    try {
      const newDept = await deptApi.createDepartment(deptData);
      toast.success('Department created successfully');
      return newDept;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id, deptData) => {
    setLoading(true);
    try {
      const updated = await deptApi.updateDepartment(id, deptData);
      toast.success('Department updated successfully');
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    setLoading(true);
    try {
      await deptApi.deleteDepartment(id);
      toast.success('Department deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};

export default useDepartments;

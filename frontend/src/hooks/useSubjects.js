import { useState, useCallback } from 'react';
import * as subjectApi from '../api/subjectApi';
import toast from 'react-hot-toast';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjects = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await subjectApi.listSubjects(filters);
      setSubjects(data);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubject = async (subjectData) => {
    setLoading(true);
    try {
      const newSub = await subjectApi.createSubject(subjectData);
      toast.success('Subject created successfully');
      return newSub;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create subject');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (id, subjectData) => {
    setLoading(true);
    try {
      const updated = await subjectApi.updateSubject(id, subjectData);
      toast.success('Subject updated successfully');
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update subject');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id) => {
    setLoading(true);
    try {
      await subjectApi.deleteSubject(id);
      toast.success('Subject deleted successfully');
    } catch (err) {
      const isConstraintError = !err.response || err.response.status === 500;
      const msg = isConstraintError 
        ? 'Cannot delete subject. It is linked to active attendance sessions.' 
        : (err.response?.data?.detail || 'Failed to delete subject');
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};

export default useSubjects;

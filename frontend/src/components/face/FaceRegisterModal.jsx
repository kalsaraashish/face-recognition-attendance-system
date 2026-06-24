import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { registerFace } from '../../api/faceApi';
import { Upload, X, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const FaceRegisterModal = ({ isOpen, onClose, student, onRegisterSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { total_uploaded, registered, results: [] }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to max 10 files
    if (selectedFiles.length + files.length > 10) {
      toast.error('You can upload up to 10 images for face registration.');
      return;
    }
    
    // Add unique key to track file previews
    const newFiles = files.map((file) => {
      file.preview = URL.createObjectURL(file);
      return file;
    });
    
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least 1 image to upload');
      return;
    }

    setLoading(true);
    setResults(null);
    const toastId = toast.loading('Uploading face images...');
    
    try {
      const res = await registerFace(student.id, selectedFiles);
      setResults(res);
      toast.success(`Registered ${res.registered} of ${res.total_uploaded} images!`, { id: toastId });
      setSelectedFiles([]);
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Failed to register face encodings';
      toast.error(detail, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clear state
    selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
    setResults(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Register Face: ${student?.full_name || ''}`} size="lg">
      <div className="space-y-5">
        {/* Info Banner */}
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
          <p className="font-semibold mb-1">Face Registration Guidelines:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Upload 1 to 10 photos of the student.</li>
            <li>Photos should be clear, well-lit, and focus on the face.</li>
            <li>Each image must contain exactly **one** face.</li>
            <li>Supported formats: JPEG, JPG, PNG. Max size: 10MB per file.</li>
          </ul>
        </div>

        {/* Form controls */}
        {!results && (
          <div className="space-y-4">
            {/* File Drag and Drop Zone */}
            <div className="flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-8 bg-slate-50 hover:bg-slate-100 transition-colors relative">
              <div className="text-center space-y-1">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <div className="flex text-sm text-slate-600">
                  <label
                    htmlFor="images-upload"
                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload photos</span>
                    <input
                      id="images-upload"
                      name="images"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/jpg"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG up to 10MB (Max 10 images)</p>
              </div>
            </div>

            {/* Selected File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Selected Images ({selectedFiles.length})
                </h4>
                <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 bg-white overflow-hidden group shadow-sm">
                      <img src={file.preview} alt="preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 rounded-full bg-slate-900/60 p-1 text-white hover:bg-red-500 transition-colors"
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Screen */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Successfully registered {results.registered} out of {results.total_uploaded} uploaded photos.
              </span>
            </div>

            {/* Individual File Results */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Upload Details
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden max-h-48 overflow-y-auto">
                {results.results.map((res, index) => (
                  <div key={index} className="flex items-center justify-between p-3">
                    <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
                      {res.filename}
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      {res.status === 'success' ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-700">Registered</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-red-700" title={res.reason}>
                            Failed ({res.reason || 'No face found'})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4 mt-6">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {results ? 'Close' : 'Cancel'}
          </Button>
          {!results && (
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={loading}
              disabled={selectedFiles.length === 0}
            >
              Upload and Register
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FaceRegisterModal;

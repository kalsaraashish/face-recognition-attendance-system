import React, { useRef, useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import { Camera, VideoOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { markFacultyAttendanceByFace } from '../../api/attendanceApi';

export const FacultyCameraCheckIn = ({ onSuccess, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', message: '', time: '' }

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch (err) {
      console.error('Error starting camera: ', err);
      setCameraError('Permission denied or camera not found. Camera access is required.');
      toast.error('Unable to open web camera');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setResult(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error('Failed to process image frame');
          setLoading(false);
          return;
        }

        try {
          const res = await markFacultyAttendanceByFace(blob);
          
          setResult({
            type: 'success',
            message: 'Attendance Marked!',
            time: new Date(res.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });

          toast.success(`Check-in successful: ${res.faculty_name}`);
          
          // Allow showing the success state briefly before calling onSuccess callback
          setTimeout(() => {
            if (onSuccess) onSuccess(res);
          }, 1500);
        } catch (error) {
          console.error(error);
          const detail = error.response?.data?.detail || 'Verification failed';
          const status = error.response?.status;

          if (status === 409) {
            setResult({
              type: 'success', // Already marked today is essentially success
              message: detail || 'Already marked present today',
              time: 'Today',
            });
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 1500);
          } else {
            setResult({
              type: 'error',
              message: detail || 'Face not recognized. Align and try again.',
            });
            toast.error(detail || 'Verification error');
          }
        } finally {
          setLoading(false);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className="space-y-5">
      {/* Visual Camera Canvas Box */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-inner flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover transform -scale-x-100 ${!isActive ? 'hidden' : ''}`}
        />
        {!isActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <VideoOff className="h-12 w-12 text-slate-500 mb-3 animate-pulse" />
            {cameraError ? (
              <p className="text-sm text-red-400 font-medium max-w-sm">{cameraError}</p>
            ) : (
              <p className="text-sm font-medium">Starting camera...</p>
            )}
          </div>
        )}

        {/* Scan lines during verification */}
        {isActive && loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-bounce"></div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Result banner if verify failed/succeeded */}
      {result && (
        <div
          className={`rounded-xl border p-4 shadow-sm transition-all duration-300 animate-in slide-in-from-bottom-2 ${
            result.type === 'success'
              ? 'border-green-200 bg-green-50/50 text-green-800'
              : 'border-red-200 bg-red-50/50 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {result.type === 'success' ? (
              <CheckCircle className="h-5.5 w-5.5 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="h-5.5 w-5.5 text-red-500 shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold">{result.message}</p>
              {result.time && <p className="text-xs text-slate-500 mt-0.5">Checked in at {result.time}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-6">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <div className="flex space-x-2">
          {!isActive && (
            <Button variant="primary" onClick={startCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Retry Camera
            </Button>
          )}
          {isActive && (
            <Button
              variant="primary"
              onClick={handleCapture}
              loading={loading}
              className="shadow-md shadow-blue-500/10"
            >
              Verify & Check In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyCameraCheckIn;

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import { Camera, VideoOff, RefreshCw, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export const CameraCapture = ({ sessionId, onMatchSuccess, sessionInfo }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Slide-in result card state
  const [result, setResult] = useState(null); // { type: 'success'|'error'|'warning', message: '', student: {} }
  const [recentMarks, setRecentMarks] = useState([]);

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
      setCameraError('Permission denied or camera not found. Face attendance requires camera access.');
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
    // Cleanup stream on unmount
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capture = () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;
    setLoading(true);
    setResult(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Matches coordinates
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

        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('image', blob, 'capture.jpg');

        try {
          const res = await api.post('/attendance/mark/face', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const record = res.data;
          
          // Show slide-in success result
          setResult({
            type: 'success',
            message: 'PRESENT ✓',
            student: {
              name: record.student_name,
              enrollment: record.enrollment_no,
              time: new Date(record.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          });

          // Add to scrollable recent mark list
          setRecentMarks((prev) => [
            {
              id: record.id || Date.now(),
              name: record.student_name,
              enrollment: record.enrollment_no,
              time: new Date(record.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...prev.slice(0, 4), // Keep last 5
          ]);

          if (onMatchSuccess) onMatchSuccess(record);
          toast.success(`Marked Present: ${record.student_name}`);
        } catch (error) {
          const detail = error.response?.data?.detail;
          const status = error.response?.status;

          if (status === 409) {
            // Already marked
            setResult({
              type: 'warning',
              message: detail || 'Already marked present',
              student: null,
            });
            toast.error(detail || 'Already marked present');
          } else if (status === 404) {
            // Not recognized
            setResult({
              type: 'error',
              message: 'Face Not Recognized',
              student: null,
            });
            toast.error('Face Not Recognized');
          } else {
            // Validation or processing errors (422, etc.)
            setResult({
              type: 'error',
              message: detail || 'Face scanning failed',
              student: null,
            });
            toast.error(detail || 'Scanning error');
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
    <div className="space-y-6">
      {/* Step 2 Shell container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Camera Feed */}
        <div className="lg:col-span-2 space-y-4">
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
                  <p className="text-sm font-medium">Camera is offline. Click start to begin scanner feed.</p>
                )}
              </div>
            )}

            {/* Scanning active light line indicator */}
            {isActive && loading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-bounce"></div>
            )}

            {/* Hidden canvas for extraction */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-slate-800">
                {sessionInfo?.subject?.subject_name || 'Camera Feed'}
              </h4>
              <p className="text-xs text-slate-500">
                {sessionInfo?.department?.name} | Semester {sessionInfo?.semester}
              </p>
            </div>

            <div className="flex space-x-2">
              {isActive ? (
                <>
                  <Button variant="secondary" onClick={stopCamera}>
                    Stop Camera
                  </Button>
                  <Button variant="primary" onClick={capture} loading={loading}>
                    Capture & Mark
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={startCamera}>
                  <Camera className="mr-2 h-4.5 w-4.5" />
                  Start Camera
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Slide-in Result card & Recents */}
        <div className="space-y-6">
          {/* Scan Results Card */}
          {result && (
            <div
              className={`rounded-xl border p-5 shadow-sm transition-all duration-300 animate-in slide-in-from-right-4 ${
                result.type === 'success'
                  ? 'border-green-200 bg-green-50/50 text-green-800'
                  : result.type === 'warning'
                  ? 'border-amber-200 bg-amber-50/50 text-amber-800'
                  : 'border-red-200 bg-red-50/50 text-red-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                {result.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                ) : result.type === 'warning' ? (
                  <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-bold tracking-wide uppercase">
                    {result.message}
                  </h4>
                  {result.student ? (
                    <div className="mt-2 text-slate-800">
                      <p className="font-semibold text-base">{result.student.name}</p>
                      <p className="text-xs text-slate-500 font-medium">Enrollment: {result.student.enrollment}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">Checked in at {result.student.time}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 mt-1">{result.type === 'warning' ? 'This student attendance has already been logged.' : 'Please align face in camera frame and capture again.'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recent Marks List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
              Recent Captures ({recentMarks.length})
            </h4>
            
            {recentMarks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Captured check-ins will list here.
              </p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {recentMarks.map((mark) => (
                  <div
                    key={mark.id}
                    className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
                  >
                    <div className="overflow-hidden mr-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {mark.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {mark.enrollment}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                      {mark.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;

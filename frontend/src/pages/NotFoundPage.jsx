import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { CameraOff } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 font-sans">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-6">
        <CameraOff className="h-10 w-10 text-blue-500 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-805">
        404
      </h1>
      <h2 className="text-xl font-bold text-slate-700 mt-2 tracking-tight">
        Page Not Found
      </h2>
      <p className="mt-2 text-sm text-slate-500 max-w-sm font-medium">
        Sorry, the page you are looking for doesn't exist or has been relocated to another route.
      </p>
      <Button
        variant="primary"
        onClick={() => navigate('/dashboard')}
        className="mt-8 font-semibold shadow-md shadow-blue-500/10 px-6 py-2.5"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFoundPage;

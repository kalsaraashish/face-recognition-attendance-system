import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  message = 'An unexpected error occurred while loading data.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight">
        Failed to load data
      </h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

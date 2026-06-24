import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      className = '',
      icon: Icon,
      rightElement,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-lg shadow-sm">
          {Icon && (
            <div className="pointer-events-none absolute left-3 text-slate-400">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full ${
              Icon ? 'pl-10' : 'pl-3'
            } ${rightElement ? 'pr-10' : 'pr-3'} ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
            }`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 block text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

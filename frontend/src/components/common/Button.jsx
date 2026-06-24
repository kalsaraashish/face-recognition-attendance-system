import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border border-transparent shadow-sm disabled:bg-blue-400',
    secondary: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 disabled:bg-slate-50 disabled:text-slate-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 border border-transparent shadow-sm disabled:bg-red-400',
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      className={`${baseStyle} ${currentVariant} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4 text-current" />}
      {children}
    </button>
  );
};

export default Button;

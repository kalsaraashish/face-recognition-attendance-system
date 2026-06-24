import React from 'react';

export const Badge = ({ status }) => {
  const getBadgeStyle = (stat) => {
    const s = String(stat).toUpperCase();
    switch (s) {
      case 'PRESENT':
        return 'bg-green-100 text-green-700';
      case 'ABSENT':
        return 'bg-red-100 text-red-700';
      case 'ACTIVE':
      case 'TRUE':
        return 'bg-emerald-100 text-emerald-700';
      case 'INACTIVE':
      case 'FALSE':
        return 'bg-slate-100 text-slate-500';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700';
      case 'FACULTY':
        return 'bg-indigo-100 text-indigo-700';
      case 'STUDENT':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getBadgeLabel = (stat) => {
    const s = String(stat).toUpperCase();
    if (s === 'TRUE') return 'Active';
    if (s === 'FALSE') return 'Inactive';
    return s;
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getBadgeStyle(
        status
      )}`}
    >
      {getBadgeLabel(status)}
    </span>
  );
};

export default Badge;

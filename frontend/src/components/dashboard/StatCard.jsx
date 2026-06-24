import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  trend, // e.g., { type: 'up' | 'down', value: '12%' }
}) => {
  const colorMaps = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
    green: {
      bg: 'bg-green-50 text-green-600',
      border: 'border-green-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600',
      border: 'border-teal-100',
    },
    red: {
      bg: 'bg-red-50 text-red-600',
      border: 'border-red-100',
    },
  };

  const selectedColor = colorMaps[color] || colorMaps.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1">
            {trend.type === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={`text-xs font-semibold ${
                trend.type === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.value}
            </span>
            <span className="text-xs text-slate-400">vs last week</span>
          </div>
        )}
      </div>

      <div className={`p-4 rounded-2xl ${selectedColor.bg} border ${selectedColor.border} shadow-sm`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
    </div>
  );
};

export default StatCard;

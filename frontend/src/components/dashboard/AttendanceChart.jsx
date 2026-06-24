import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// TODO: No weekly attendance chart data endpoint in backend - using dummy data
// Replace with real API when available
const DUMMY_WEEKLY_DATA = [
  { name: 'Mon', attendance: 82 },
  { name: 'Tue', attendance: 88 },
  { name: 'Wed', attendance: 85 },
  { name: 'Thu', attendance: 90 },
  { name: 'Fri', attendance: 78 },
  { name: 'Sat', attendance: 65 },
  { name: 'Sun', attendance: 0 },
];

export const WeeklyOverviewChart = ({ data = DUMMY_WEEKLY_DATA }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-800 tracking-tight mb-4">
        Weekly Attendance Overview
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
            />
            <Bar dataKey="attendance" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AttendanceBreakdownChart = ({ present = 0, absent = 0 }) => {
  const data = [
    { name: 'Present', value: present, color: '#10B981' },
    { name: 'Absent', value: absent, color: '#EF4444' },
  ];

  const total = present + absent;
  const presentPct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-slate-800 tracking-tight mb-4">
          Attendance Breakdown
        </h3>
        <div className="relative h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{presentPct}%</span>
            <span className="text-xs text-slate-400 font-medium">Present Today</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-6 mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center space-x-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-slate-700">Present ({present})</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-3 w-3 rounded-full bg-red-500"></span>
          <span className="text-xs font-semibold text-slate-700">Absent ({absent})</span>
        </div>
      </div>
    </div>
  );
};

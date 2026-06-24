import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { Pencil, Camera, Trash2, Eye } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export const StudentRow = ({
  student,
  index,
  onEdit,
  onFaceRegister,
  onDelete,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-slate-500 font-medium">{index}</td>
      <td className="px-6 py-4 text-slate-700 font-semibold">{student.enrollment_no}</td>
      <td className="px-6 py-4 font-medium text-slate-900">
        <Link
          to={`/students/${student.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {student.full_name || `${student.first_name} ${student.last_name}`}
        </Link>
      </td>
      <td className="px-6 py-4 text-slate-600">{student.department?.name || '-'}</td>
      <td className="px-6 py-4 text-slate-600">Semester {student.semester}</td>
      <td className="px-6 py-4">
        <Badge status={student.status} />
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            student.has_face_registered
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {student.has_face_registered ? 'Registered ✓' : 'Not Registered'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center space-x-2.5">
          <Link
            to={`/students/${student.id}`}
            title="View Details"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Eye className="h-4.5 w-4.5" />
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(student)}
                title="Edit Student"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
              >
                <Pencil className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => onFaceRegister(student)}
                title="Register Face"
                className={`rounded-lg p-1.5 transition-colors ${
                  student.has_face_registered
                    ? 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold'
                }`}
              >
                <Camera className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => onDelete(student)}
                title="Delete Student"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default StudentRow;

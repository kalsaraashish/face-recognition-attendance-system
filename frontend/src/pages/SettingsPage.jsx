import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { changePassword } from '../api/authApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { KeyRound, ShieldAlert, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validate = () => {
    const tempErrors = {};
    if (!currentPassword) tempErrors.current_password = 'Current password is required';
    if (!newPassword) {
      tempErrors.new_password = 'New password is required';
    } else if (newPassword.length < 6) {
      tempErrors.new_password = 'Password must be at least 6 characters';
    }
    if (confirmPassword !== newPassword) {
      tempErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const toastId = toast.loading('Updating password...');
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      toast.success('Password updated successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Failed to update password. Please check credentials.';
      toast.error(detail, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Account Settings
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Manage profiles, password credentials, and system details
        </p>
      </div>

      {/* Profile summary card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-2xl font-black text-blue-600 shadow-inner">
          {getInitials()}
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            {user?.name}
          </h3>
          <p className="text-sm font-semibold text-slate-500">
            {user?.email}
          </p>
          <div className="pt-2">
            <Badge status={user?.role} />
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium text-center md:text-right mt-2 md:mt-0">
          Status: <span className="text-green-600 font-bold">Active Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Change Password Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">
              Update Password
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.current_password) setErrors((prev) => ({ ...prev, current_password: null }));
              }}
              error={errors.current_password}
              placeholder="••••••••"
              disabled={loading}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.new_password) setErrors((prev) => ({ ...prev, new_password: null }));
              }}
              error={errors.new_password}
              placeholder="At least 6 characters"
              disabled={loading}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm_password) setErrors((prev) => ({ ...prev, confirm_password: null }));
              }}
              error={errors.confirm_password}
              placeholder="Confirm new password"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4 font-semibold"
              loading={loading}
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* System Information (Admin and potentially Faculty) */}
        <div className="space-y-6">
          {/* Admin System info card */}
          {isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Cpu className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">
                  System Information
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-655 font-medium">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">API Gateway URL:</span>
                  <code className="text-[11px] bg-slate-50 px-2 py-0.5 rounded font-mono text-slate-800">
                    {import.meta.env.VITE_API_BASE_URL}
                  </code>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Application Name:</span>
                  <span className="text-slate-800 font-bold">
                    {import.meta.env.VITE_APP_NAME}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Frontend Environment:</span>
                  <span className="text-slate-800 uppercase">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">System Build Version:</span>
                  <span className="text-slate-800">v1.0.0-Vite</span>
                </div>
              </div>
            </div>
          )}

          {/* System Safety and Security Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-800">
                Security Policy
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 font-medium">
              This application manages face scan biometrics and student attendance databases securely. All active tokens automatically expire after 30 minutes of idle time. Please ensure you sign out when accessing logs from public workstations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

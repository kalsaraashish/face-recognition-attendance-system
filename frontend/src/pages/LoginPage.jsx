import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Camera, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { isRequired, isValidEmail } from '../utils/validators';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
    } else if (name === 'password') {
      setPassword(value);
      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
    }
    setApiError(null);
  };

  const validate = () => {
    const tempErrors = {};
    if (!isRequired(email)) {
      tempErrors.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!isRequired(password)) {
      tempErrors.password = 'Password is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail || 'Invalid email or password. Please try again.';
      setApiError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left panel: branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-brand-900 via-blue-900 to-brand-800 p-12 text-white">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg ring-4 ring-white/10">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FaceAttend</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-[1.1] max-w-lg">
            AI-Powered Attendance Management
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Streamline class and lecture logs instantly using real-time facial recognition and smart metrics.
          </p>
        </div>

        <div className="text-xs text-blue-300 font-medium">
          © {new Date().getFullYear()} FaceAttend Inc. All rights reserved.
        </div>
      </div>

      {/* Right panel: Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mx-auto mb-4 shadow-md">
              <Camera className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Sign in to manage classes and students
            </p>
          </div>

          {apiError && (
            <div className="rounded-lg bg-red-50 border border-red-150 p-4 text-xs font-semibold text-red-600 animate-shake">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              placeholder="name@attendance.com"
              disabled={loading}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              placeholder="••••••••"
              disabled={loading}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 shadow-md shadow-blue-500/10 text-sm font-semibold mt-6"
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

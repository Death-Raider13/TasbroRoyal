import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const userData = await login(data.email, data.password);
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'lecturer') {
        navigate('/lecturer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="text-gray-600 text-sm mt-1">Enter your credentials to access your account</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r animate-shake">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          {...register('password', { required: 'Password is required' })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Enter your password"
        />
        {errors.password && (
          <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}

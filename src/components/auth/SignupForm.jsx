import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function SignupForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore(state => state.signup);
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const userData = {
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        university: data.university,
        department: data.department,
        ...(data.role === 'lecturer' && {
          approved: false,
          applicationStatus: 'pending',
          qualifications: data.qualifications,
          expertise: data.expertise.split(',').map(e => e.trim()),
          totalEarnings: 0,
          pendingWithdrawal: 0
        })
      };

      await signup(data.email, data.password, userData);
      
      if (data.role === 'lecturer') {
        alert('Your application has been submitted. Wait for admin approval.');
      }
      
      navigate(data.role === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
        <p className="text-gray-600 text-sm mt-1">Join thousands of engineering students and lecturers</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r animate-shake">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            {...register('displayName', { required: 'Name is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="John Doe"
          />
          {errors.displayName && (
            <span className="text-red-500 text-xs mt-1 block">{errors.displayName.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="john@example.com"
          />
          {errors.email && (
            <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            {...register('phoneNumber', { required: 'Phone is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="08012345678"
          />
          {errors.phoneNumber && (
            <span className="text-red-500 text-xs mt-1 block">{errors.phoneNumber.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
          <select
            {...register('role', { required: 'Role is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
          {errors.role && (
            <span className="text-red-500 text-xs mt-1 block">{errors.role.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
          <input
            type="text"
            {...register('university', { required: 'University is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="University of Lagos"
          />
          {errors.university && (
            <span className="text-red-500 text-xs mt-1 block">{errors.university.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
          <input
            type="text"
            {...register('department', { required: 'Department is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Mechanical Engineering"
          />
          {errors.department && (
            <span className="text-red-500 text-xs mt-1 block">{errors.department.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Min. 6 characters"
          />
          {errors.password && (
            <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm password',
              validate: value => value === password || 'Passwords do not match'
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message}</span>
          )}
        </div>
      </div>

      {watch('role') === 'lecturer' && (
        <div className="border-t border-gray-200 pt-5 mt-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecturer Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Qualifications</label>
              <textarea
                {...register('qualifications', { required: 'Qualifications required for lecturers' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows="3"
                placeholder="E.g., PhD in Mechanical Engineering, University of Lagos"
              />
              {errors.qualifications && (
                <span className="text-red-500 text-xs mt-1 block">{errors.qualifications.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Areas of Expertise (comma-separated)</label>
              <input
                type="text"
                {...register('expertise', { required: 'Expertise required for lecturers' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="E.g., Thermodynamics, Fluid Mechanics, Heat Transfer"
              />
              {errors.expertise && (
                <span className="text-red-500 text-xs mt-1 block">{errors.expertise.message}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
}

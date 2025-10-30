import { motion } from 'framer-motion';

// Basic loading spinner
export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p 
          className="mt-4 text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Course card skeleton
export const CourseCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-t-xl bg-[length:200%_100%] animate-shimmer"></div>
    <div className="card-body space-y-4">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 bg-[length:200%_100%] animate-shimmer"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6 bg-[length:200%_100%] animate-shimmer"></div>
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4 bg-[length:200%_100%] animate-shimmer"></div>
      </div>
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 bg-[length:200%_100%] animate-shimmer"></div>
      <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 bg-[length:200%_100%] animate-shimmer"></div>
    </div>
    
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card">
          <div className="card-body">
            <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-16 mb-4 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-20 mb-2 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 bg-[length:200%_100%] animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg bg-[length:200%_100%] animate-shimmer"></div>
      ))}
    </div>
  </div>
);

// Course list skeleton
export const CourseListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <CourseCardSkeleton key={i} />
    ))}
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
    {/* Profile header */}
    <div className="flex items-center space-x-6">
      <div className="w-24 h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full bg-[length:200%_100%] animate-shimmer"></div>
      <div className="space-y-3">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-48 bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 bg-[length:200%_100%] animate-shimmer"></div>
      </div>
    </div>
    
    {/* Profile content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg bg-[length:200%_100%] animate-shimmer"></div>
        ))}
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50">
        <tr>
          {[...Array(columns)].map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {[...Array(rows)].map((_, rowIndex) => (
          <tr key={rowIndex}>
            {[...Array(columns)].map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Text skeleton
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

// Button skeleton
export const ButtonSkeleton = ({ className = '' }) => (
  <div className={`h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg bg-[length:200%_100%] animate-shimmer ${className}`}></div>
);

// Page skeleton wrapper
export const PageSkeleton = ({ children, title = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-64 bg-[length:200%_100%] animate-shimmer mb-2"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-96 bg-[length:200%_100%] animate-shimmer"></div>
      </div>
      {children}
    </div>
  </div>
);

export default {
  LoadingSpinner,
  CourseCardSkeleton,
  DashboardSkeleton,
  CourseListSkeleton,
  ProfileSkeleton,
  TableSkeleton,
  TextSkeleton,
  ButtonSkeleton,
  PageSkeleton
};

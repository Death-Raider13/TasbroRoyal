# Performance Optimization Guide for NaijaEdu Platform

## 1. Code Splitting and Lazy Loading

### Route-Level Code Splitting
```jsx
// Update App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseView = lazy(() => import('./pages/CourseView'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const LecturerDashboard = lazy(() => import('./pages/LecturerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CourseCreator = lazy(() => import('./pages/CourseCreator'));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseView />} />
              {/* Other routes */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
```

### Component-Level Lazy Loading
```jsx
// Create LazyImage component
import { useState, useRef, useEffect } from 'react';

const LazyImage = ({ src, alt, className, placeholder, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder || <div className="w-8 h-8 text-gray-400">📷</div>}
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};
```

## 2. Bundle Optimization

### Update Vite Configuration
```js
// Update vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      // Bundle analyzer
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    build: {
      // Code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            ui: ['@heroicons/react', 'lucide-react'],
            forms: ['react-hook-form'],
            router: ['react-router-dom'],
          },
        },
      },
      // Optimize chunks
      chunkSizeWarningLimit: 1000,
      // Enable source maps for production debugging
      sourcemap: true,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
      ],
    },
    define: {
      // Environment variables
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      // ... other env vars
    }
  };
});
```

## 3. Image Optimization

### Responsive Images Component
```jsx
// Create ResponsiveImage component
const ResponsiveImage = ({ 
  src, 
  alt, 
  sizes = "100vw",
  className,
  priority = false 
}) => {
  // Generate responsive image URLs (using Cloudinary)
  const generateSrcSet = (baseSrc) => {
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map(width => {
        const optimizedSrc = baseSrc.replace(
          '/upload/',
          `/upload/w_${width},f_auto,q_auto/`
        );
        return `${optimizedSrc} ${width}w`;
      })
      .join(', ');
  };

  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
};
```

### WebP Support with Fallback
```jsx
const OptimizedImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageFormat, setImageFormat] = useState('webp');

  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    if (!checkWebPSupport()) {
      setImageFormat('jpg');
    }

    // Generate optimized URL
    const optimizedSrc = src.replace(
      '/upload/',
      `/upload/f_${imageFormat},q_auto,w_auto,dpr_auto/`
    );
    setImageSrc(optimizedSrc);
  }, [src]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setImageSrc(src)} // Fallback to original
    />
  );
};
```

## 4. Caching Strategies

### Service Worker for Caching
```js
// Create public/sw.js
const CACHE_NAME = 'naijaedu-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

### Register Service Worker
```js
// Add to main.jsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

## 5. Database Query Optimization

### Firestore Query Optimization
```js
// Update firestore.js
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

// Implement pagination
export const getCoursesPaginated = async (lastDoc = null, pageSize = 12) => {
  try {
    let q = query(
      collection(db, 'courses'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      courses,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Implement search with indexing
export const searchCourses = async (searchTerm, category = null) => {
  try {
    let q = query(
      collection(db, 'courses'),
      where('status', '==', 'approved')
    );

    if (category && category !== 'All') {
      q = query(q, where('category', '==', category));
    }

    // Note: For full-text search, consider using Algolia or Elasticsearch
    const snapshot = await getDocs(q);
    const courses = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return courses;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
};
```

## 6. Performance Monitoring

### Web Vitals Tracking
```js
// Create utils/webVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  // Send to your analytics service
  console.log('Web Vital:', metric);
  
  // Example: Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
};

export const trackWebVitals = () => {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
};
```

## 7. Loading States and Skeleton Screens

### Skeleton Components
```jsx
// Create components/ui/Skeleton.jsx
export const CourseSkeleton = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gray-300 rounded-t-xl"></div>
    <div className="card-body">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
      ))}
    </div>
  </div>
);
```

## Performance Targets

### Core Web Vitals Goals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size Goals
- **Initial Bundle**: < 200KB gzipped
- **Total Bundle**: < 1MB gzipped
- **Individual Chunks**: < 100KB gzipped

## Implementation Timeline

**Week 1: Critical Performance**
- Implement lazy loading for routes
- Add image optimization
- Set up bundle analysis

**Week 2: Advanced Optimization**
- Implement service worker
- Add database query optimization
- Set up performance monitoring

**Week 3: Fine-tuning**
- Add skeleton screens
- Optimize remaining components
- Performance testing and tweaking

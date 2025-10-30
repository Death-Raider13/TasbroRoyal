import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  blurDataURL,
  priority = false,
  sizes = "100vw",
  quality = 75,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip observer if priority image

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized image URL (for Cloudinary)
  const getOptimizedUrl = (originalUrl, width = 800) => {
    if (!originalUrl || !originalUrl.includes('cloudinary')) {
      return originalUrl;
    }

    // Insert Cloudinary transformations
    return originalUrl.replace(
      '/upload/',
      `/upload/w_${width},f_auto,q_${quality},dpr_auto/`
    );
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (originalUrl) => {
    if (!originalUrl || !originalUrl.includes('cloudinary')) {
      return undefined;
    }

    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map(width => `${getOptimizedUrl(originalUrl, width)} ${width}w`)
      .join(', ');
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const optimizedSrc = getOptimizedUrl(src);
  const srcSet = generateSrcSet(src);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading placeholder */}
      {!isLoaded && !hasError && !blurDataURL && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder || (
            <div className="w-8 h-8 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <motion.img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          {...props}
        />
      )}
    </div>
  );
};

// Optimized image component with WebP support
export const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  width,
  height,
  priority = false 
}) => {
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

    // Generate optimized URL with format
    if (src && src.includes('cloudinary')) {
      const optimizedSrc = src.replace(
        '/upload/',
        `/upload/f_${imageFormat},q_auto${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},dpr_auto/`
      );
      setImageSrc(optimizedSrc);
    }
  }, [src, imageFormat, width, height]);

  return (
    <LazyImage
      src={imageSrc}
      alt={alt}
      className={className}
      priority={priority}
      onError={() => setImageSrc(src)} // Fallback to original
    />
  );
};

// Avatar component with lazy loading
export const LazyAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        {fallback || (
          <span className="text-gray-500 font-medium text-sm">
            {alt ? alt.charAt(0).toUpperCase() : '?'}
          </span>
        )}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full ${className}`}
      onError={() => setHasError(true)}
      priority={size === 'xs' || size === 'sm'} // Small avatars load immediately
    />
  );
};

// Course thumbnail component
export const CourseThumbnail = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = 'aspect-video' 
}) => {
  return (
    <div className={`${aspectRatio} ${className}`}>
      <LazyImage
        src={src}
        alt={alt}
        className="w-full h-full rounded-lg"
        placeholder={
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
            <div className="text-blue-400">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2H11z" />
              </svg>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default LazyImage;

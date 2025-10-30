import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // Security headers for development
    server: {
      https: false, // Set to true if you want HTTPS in development
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN', // Changed from DENY to allow iframe embedding
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(self), microphone=(self), display-capture=(self), geolocation=()'
      }
    },
    // Build optimizations
    build: {
      // Code splitting for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
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
    // Only expose safe environment variables (VITE_ prefix)
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
      'import.meta.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY),
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET),
      'import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY': JSON.stringify(env.VITE_IMAGEKIT_PUBLIC_KEY),
      'import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT': JSON.stringify(env.VITE_IMAGEKIT_URL_ENDPOINT),
      'import.meta.env.VITE_AGORA_APP_ID': JSON.stringify(env.VITE_AGORA_APP_ID),
    }
  }
})

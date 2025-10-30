# SEO Optimization Guide for NaijaEdu Platform

## 1. Meta Tags and HTML Head Optimization

### Update index.html
```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Meta Tags -->
    <title>NaijaEdu - Nigerian Engineering Education Platform | Learn from Top Lecturers</title>
    <meta name="title" content="NaijaEdu - Nigerian Engineering Education Platform | Learn from Top Lecturers" />
    <meta name="description" content="Master engineering excellence with world-class courses from Nigerian university lecturers. Mechanical, Civil, Electrical, Computer Engineering courses with certificates." />
    <meta name="keywords" content="Nigerian engineering education, online courses, university lecturers, mechanical engineering, civil engineering, electrical engineering, computer engineering, engineering certificates" />
    <meta name="author" content="NaijaEdu" />
    <meta name="robots" content="index, follow" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://naijaedu.com/" />
    <meta property="og:title" content="NaijaEdu - Nigerian Engineering Education Platform" />
    <meta property="og:description" content="Master engineering excellence with world-class courses from Nigerian university lecturers." />
    <meta property="og:image" content="https://naijaedu.com/og-image.jpg" />
    <meta property="og:site_name" content="NaijaEdu" />
    <meta property="og:locale" content="en_NG" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://naijaedu.com/" />
    <meta property="twitter:title" content="NaijaEdu - Nigerian Engineering Education Platform" />
    <meta property="twitter:description" content="Master engineering excellence with world-class courses from Nigerian university lecturers." />
    <meta property="twitter:image" content="https://naijaedu.com/twitter-image.jpg" />
    <meta property="twitter:creator" content="@naijaedu" />
    
    <!-- Favicon and Icons -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://naijaedu.com/" />
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://firebaseapp.com" />
    <link rel="preconnect" href="https://cloudinary.com" />
    
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//js.paystack.co" />
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "NaijaEdu",
      "description": "Nigerian Engineering Education Platform",
      "url": "https://naijaedu.com",
      "logo": "https://naijaedu.com/logo.png",
      "sameAs": [
        "https://twitter.com/naijaedu",
        "https://linkedin.com/company/naijaedu",
        "https://facebook.com/naijaedu"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+234-XXX-XXX-XXXX",
        "contactType": "Customer Service",
        "availableLanguage": "English"
      }
    }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    <script src="https://js.paystack.co/v1/inline.js"></script>
</body>
</html>
```

## 2. Dynamic Meta Tags Component

### Create SEO Component
```jsx
// Create components/seo/SEOHead.jsx
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title = "NaijaEdu - Nigerian Engineering Education Platform",
  description = "Master engineering excellence with world-class courses from Nigerian university lecturers.",
  keywords = "Nigerian engineering education, online courses, university lecturers",
  image = "https://naijaedu.com/og-image.jpg",
  url = "https://naijaedu.com",
  type = "website",
  author = "NaijaEdu",
  publishedTime,
  modifiedTime,
  structuredData
}) => {
  const fullTitle = title.includes('NaijaEdu') ? title : `${title} | NaijaEdu`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NaijaEdu" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
```

### Course Page SEO
```jsx
// Update CourseView.jsx
import SEOHead from '../components/seo/SEOHead';

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  
  // ... existing code
  
  const courseStructuredData = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "NaijaEdu",
      "url": "https://naijaedu.com"
    },
    "instructor": {
      "@type": "Person",
      "name": course.lecturerName
    },
    "courseCode": course.id,
    "educationalLevel": "University",
    "about": course.category,
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "NGN",
      "availability": "https://schema.org/InStock"
    },
    "image": course.thumbnailURL,
    "url": `https://naijaedu.com/courses/${course.id}`,
    "aggregateRating": course.rating > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": course.rating,
      "ratingCount": course.totalReviews || 1
    } : undefined
  } : null;
  
  return (
    <>
      {course && (
        <SEOHead
          title={`${course.title} - ${course.category}`}
          description={`${course.description.substring(0, 160)}...`}
          keywords={`${course.category}, ${course.title}, Nigerian engineering, online course, ${course.lecturerName}`}
          image={course.thumbnailURL}
          url={`https://naijaedu.com/courses/${course.id}`}
          type="article"
          structuredData={courseStructuredData}
        />
      )}
      {/* Rest of component */}
    </>
  );
};
```

## 3. URL Structure Optimization

### Update Router Configuration
```jsx
// Update App.jsx with SEO-friendly routes
<Routes>
  {/* SEO-friendly course routes */}
  <Route path="/courses" element={<Courses />} />
  <Route path="/courses/:category" element={<Courses />} />
  <Route path="/course/:courseId/:courseSlug" element={<CourseView />} />
  
  {/* Category pages */}
  <Route path="/mechanical-engineering" element={<CategoryPage category="Mechanical Engineering" />} />
  <Route path="/civil-engineering" element={<CategoryPage category="Civil Engineering" />} />
  <Route path="/electrical-engineering" element={<CategoryPage category="Electrical Engineering" />} />
  <Route path="/computer-engineering" element={<CategoryPage category="Computer Engineering" />} />
  
  {/* Static pages for SEO */}
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/terms-of-service" element={<TermsOfService />} />
  <Route path="/help" element={<Help />} />
  
  {/* Blog for content marketing */}
  <Route path="/blog" element={<Blog />} />
  <Route path="/blog/:slug" element={<BlogPost />} />
</Routes>
```

### URL Helper Functions
```js
// Create utils/seo.js
export const generateCourseSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const generateCourseUrl = (courseId, title) => {
  const slug = generateCourseSlug(title);
  return `/course/${courseId}/${slug}`;
};

export const generateBreadcrumbs = (path, course = null) => {
  const breadcrumbs = [
    { name: 'Home', href: '/' }
  ];
  
  if (path.includes('/courses')) {
    breadcrumbs.push({ name: 'Courses', href: '/courses' });
    
    if (course) {
      breadcrumbs.push({ 
        name: course.category, 
        href: `/courses/${course.category.toLowerCase().replace(' ', '-')}` 
      });
      breadcrumbs.push({ 
        name: course.title, 
        href: generateCourseUrl(course.id, course.title),
        current: true 
      });
    }
  }
  
  return breadcrumbs;
};
```

## 4. Sitemap Generation

### Create Sitemap Generator
```js
// Create scripts/generateSitemap.js
import fs from 'fs';
import { getCourses } from '../src/services/firestore.js';

const generateSitemap = async () => {
  const baseUrl = 'https://naijaedu.com';
  const currentDate = new Date().toISOString();
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/courses', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/mechanical-engineering', priority: '0.8', changefreq: 'weekly' },
    { url: '/civil-engineering', priority: '0.8', changefreq: 'weekly' },
    { url: '/electrical-engineering', priority: '0.8', changefreq: 'weekly' },
    { url: '/computer-engineering', priority: '0.8', changefreq: 'weekly' },
  ];
  
  // Dynamic course pages
  const courses = await getCourses({ status: 'approved' });
  const coursePages = courses.map(course => ({
    url: `/course/${course.id}/${generateCourseSlug(course.title)}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: course.updatedAt || course.createdAt
  }));
  
  const allPages = [...staticPages, ...coursePages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;
  
  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('Sitemap generated successfully!');
};

generateSitemap().catch(console.error);
```

### Create robots.txt
```txt
# Create public/robots.txt
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /student/dashboard
Disallow: /lecturer/dashboard
Disallow: /api/

# Sitemap
Sitemap: https://naijaedu.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1
```

## 5. Content Marketing and Blog

### Blog Structure
```jsx
// Create pages/Blog.jsx
import SEOHead from '../components/seo/SEOHead';

const Blog = () => {
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "NaijaEdu Engineering Blog",
    "description": "Latest insights, tutorials, and news in Nigerian engineering education",
    "url": "https://naijaedu.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "NaijaEdu",
      "logo": "https://naijaedu.com/logo.png"
    }
  };
  
  return (
    <>
      <SEOHead
        title="Engineering Blog - Latest Insights and Tutorials"
        description="Stay updated with the latest engineering insights, tutorials, career advice, and industry news from Nigerian engineering experts."
        keywords="engineering blog, Nigerian engineering, tutorials, career advice, industry news"
        url="https://naijaedu.com/blog"
        structuredData={blogStructuredData}
      />
      {/* Blog content */}
    </>
  );
};
```

## 6. Local SEO for Nigerian Market

### Location-based Content
```jsx
// Add location-specific pages
const LocationPage = ({ city, state }) => {
  const locationStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `NaijaEdu - Engineering Courses in ${city}`,
    "description": `Top engineering courses and training available for students in ${city}, ${state}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city,
      "addressRegion": state,
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "6.5244", // Lagos coordinates as example
      "longitude": "3.3792"
    }
  };
  
  return (
    <>
      <SEOHead
        title={`Engineering Courses in ${city}, ${state} - NaijaEdu`}
        description={`Find the best engineering courses and training programs in ${city}, ${state}. Learn from top Nigerian university lecturers.`}
        keywords={`engineering courses ${city}, ${state} engineering training, Nigerian engineering education`}
        structuredData={locationStructuredData}
      />
      {/* Location-specific content */}
    </>
  );
};
```

## 7. Performance and Technical SEO

### Add Web App Manifest
```json
// Create public/site.webmanifest
{
  "name": "NaijaEdu - Nigerian Engineering Education Platform",
  "short_name": "NaijaEdu",
  "description": "Master engineering excellence with world-class courses from Nigerian university lecturers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add Security Headers
```js
// Add to vite.config.js
export default defineConfig({
  // ... existing config
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
});
```

## Implementation Priority

**Week 1: Foundation**
- Update HTML head with meta tags
- Implement SEO component
- Create robots.txt and sitemap

**Week 2: Content Optimization**
- Add structured data to all pages
- Optimize URL structure
- Create location-based pages

**Week 3: Advanced SEO**
- Implement blog functionality
- Add breadcrumbs
- Set up analytics and search console

## SEO Monitoring Tools

1. **Google Search Console** - Monitor search performance
2. **Google Analytics 4** - Track user behavior
3. **Lighthouse** - Technical SEO audits
4. **SEMrush/Ahrefs** - Keyword research and competitor analysis
5. **Schema Markup Validator** - Test structured data

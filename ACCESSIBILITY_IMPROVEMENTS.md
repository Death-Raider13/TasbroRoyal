# Accessibility Improvements for NaijaEdu Platform

## 1. ARIA Labels and Semantic HTML

### Navigation Components
```jsx
// Update Navbar.jsx
<nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
  <button
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
    aria-label="Toggle mobile menu"
    aria-expanded={isMenuOpen}
    aria-controls="mobile-menu"
  >
    {isMenuOpen ? (
      <XMarkIcon className="w-6 h-6 text-gray-600" aria-hidden="true" />
    ) : (
      <Bars3Icon className="w-6 h-6 text-gray-600" aria-hidden="true" />
    )}
  </button>
</nav>
```

### Form Elements
```jsx
// Update form inputs with proper labels
<div className="form-group">
  <label htmlFor="course-search" className="form-label">
    Search Courses
  </label>
  <input
    id="course-search"
    type="text"
    placeholder="Search courses, lecturers, topics..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="form-input"
    aria-describedby="search-help"
  />
  <div id="search-help" className="sr-only">
    Search through available engineering courses by title, instructor, or topic
  </div>
</div>
```

### Image Alt Text
```jsx
// Update all images with descriptive alt text
<img
  src={course.thumbnailURL}
  alt={`Course thumbnail for ${course.title} by ${course.lecturerName}`}
  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
/>

// For decorative images
<img
  src="hero-image.jpg"
  alt=""
  role="presentation"
  className="hero-image"
/>
```

## 2. Keyboard Navigation

### Focus Management
```jsx
// Add focus trap for modals
import { useRef, useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current.focus();
        }
      }
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
      ref={modalRef}
    >
      {children}
    </div>
  );
};
```

## 3. Screen Reader Support

### Skip Links
```jsx
// Add to App.jsx
<div className="sr-only">
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
  <a href="#navigation" className="skip-link">
    Skip to navigation
  </a>
</div>
```

### Screen Reader Only Content
```css
/* Add to index.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## 4. Color Contrast and Visual Accessibility

### High Contrast Mode Support
```css
/* Add to index.css */
@media (prefers-contrast: high) {
  :root {
    --primary-600: #0056b3;
    --gray-600: #212529;
    --gray-900: #000000;
  }
  
  .btn-primary {
    border: 2px solid #000;
  }
  
  .card {
    border: 2px solid #000;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 5. Form Validation and Error Handling

### Accessible Error Messages
```jsx
const FormField = ({ label, error, children, ...props }) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  
  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
      </label>
      {React.cloneElement(children, {
        id: fieldId,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? errorId : undefined,
        ...props
      })}
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
```

## Implementation Priority

1. **High Priority (Week 1)**
   - Add ARIA labels to navigation and interactive elements
   - Implement proper alt text for all images
   - Add keyboard navigation support
   - Create skip links

2. **Medium Priority (Week 2)**
   - Implement focus management for modals
   - Add screen reader support
   - Improve form accessibility

3. **Low Priority (Week 3)**
   - Add high contrast mode support
   - Implement reduced motion preferences
   - Comprehensive accessibility testing

## Testing Tools

1. **Automated Testing**
   - axe-core browser extension
   - WAVE Web Accessibility Evaluator
   - Lighthouse accessibility audit

2. **Manual Testing**
   - Screen reader testing (NVDA, JAWS, VoiceOver)
   - Keyboard-only navigation
   - High contrast mode testing

3. **User Testing**
   - Test with actual users with disabilities
   - Gather feedback from accessibility community
